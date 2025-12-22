import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Users } from '@/user/entities/user.entity';
import { MatchTicket } from './entities/match-ticket.entity';
import { MatchSession } from './entities/match-session.entity';
import { ChatRoom } from '@/chat/entities/chatroom.entity';
import { ChatRoomUser } from '@/chat/entities/chatroom-user.entity';
import { TicketStatus } from './enums/ticket-status.enum';
import { SessionStatus } from './enums/session-status.enum';
import { CallSession } from './entities/call-session.entity';
import { CallParticipant } from './entities/call-participant.entity';
import { CallStatus } from './enums/call-status.enum';
import { PointLedger } from './entities/point-ledger.entity';

type BillingType = 'FREE' | 'POINTS';

@Injectable()
export class MatchService {
  private readonly WAIT_SECONDS = 30;
  private readonly POINT_COST_PER_TRY = 300;

  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,

    @InjectRepository(MatchTicket)
    private readonly ticketRepository: Repository<MatchTicket>,

    @InjectRepository(MatchSession)
    private readonly sessionRepository: Repository<MatchSession>,

    @InjectRepository(ChatRoom)
    private readonly chatRoomRepository: Repository<ChatRoom>,

    @InjectRepository(ChatRoomUser)
    private readonly chatRoomUserRepository: Repository<ChatRoomUser>,
  ) { }

  // 랜덤 채팅 시작
  async startRandomChat(userId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userRepository = queryRunner.manager.getRepository(Users);
      const matchTicketRepository = queryRunner.manager.getRepository(MatchTicket);

      //유저 확인
      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('대상 유저가 존재하지 않습니다.');
      }
      //이미 대기 상태인 매칭 티켓이 있는지
      const existingWaitingTicket = await matchTicketRepository.findOne({
        where: { userId, status: TicketStatus.WAITING },
      });
      // 있으면 conflict exception
      if (existingWaitingTicket) throw new ConflictException('이미 매칭중인 유저입니다.');

      // queryrunner랑 userid 넘겨서 무료 횟수로 하는건지 point 사용하는건지 받아옴.
      const allowanceResult = await this.consumeRandomChatAllowance(queryRunner, userId);

      // 현재시간, 만료시간 설정(매칭 티켓 수명 관리)
      const now = new Date();
      const expiresAt = new Date(now.getTime() + this.WAIT_SECONDS * 1000);
      // 티켓에 유저의 지역정보, 받아온 billingType,cost 포함해서 생성. status는 WAITING으로.
      const newTicket = matchTicketRepository.create({
        userId,
        region: user.region,
        status: TicketStatus.WAITING,
        createdAt: now,
        expiresAt,
        billingType: allowanceResult.billingType,
        cost: allowanceResult.cost,
        refunded: false,
        roomId: null,
        matchSessionId: null,
      });
      // 티켓 저장.
      const savedTicket = await matchTicketRepository.save(newTicket);
      // 매치 결과
      const matchResult = await this.tryMatchAndPersistLink(savedTicket.id, queryRunner);
      await queryRunner.commitTransaction();
      if (!matchResult.matched) {
        return {
          status: 'WAITING',
          ticketId: savedTicket.id,
          expiresAt: savedTicket.expiresAt,
          billingType: savedTicket.billingType,
          cost: savedTicket.cost,
          message: '매칭 대기 중입니다.',
        };
      }
      return {
        status: 'MATCHED',
        ticketId: savedTicket.id,
        matchSessionId: matchResult.matchSessionId,
        roomId: matchResult.roomId,
        opponentUserId: matchResult.opponentUserId,
        billingType: savedTicket.billingType,
        cost: savedTicket.cost,
        message: '매칭이 완료되었습니다.',
      };
    } catch (error) {
      try {
        await queryRunner.rollbackTransaction();
      } catch { }

      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('서버 에러가 발생했습니다.');
    } finally {
      try {
        await queryRunner.release();
      } catch { }
    }
  }
  // 티켓 상태 확인(매칭됐는지)
  async getTicketStatus(userId: number, ticketId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const matchTicketRepository = queryRunner.manager.getRepository(MatchTicket);
      const ticket = await matchTicketRepository.findOne({ where: { id: ticketId } });
      if (!ticket) throw new NotFoundException('티켓이 존재하지 않습니다.');
      if (ticket.userId !== userId) throw new ForbiddenException('권한이 없습니다.');
      const now = new Date();
      // 만료 처리
      if (ticket.status === TicketStatus.WAITING && ticket.expiresAt <= now) {
        await this.expireTicketAndRefundIfNeeded(queryRunner, ticket.id);
        await queryRunner.commitTransaction();
        return {
          status: 'EXPIRED',
          ticketId: ticket.id,
          message: '매칭 대기 시간이 초과되었습니다.',
        };
      }
      //MATCHED면: 티켓에 저장된 roomId/matchSessionId를 그대로 반환 (정상 동작)
      if (ticket.status === TicketStatus.MATCHED) {
        await queryRunner.commitTransaction();
        return {
          status: 'MATCHED',
          ticketId: ticket.id,
          matchSessionId: ticket.matchSessionId,
          roomId: ticket.roomId,
          message: '매칭이 완료되었습니다.',
        };
      }
      await queryRunner.commitTransaction();
      return {
        status: ticket.status,
        ticketId: ticket.id,
        expiresAt: ticket.expiresAt,
        message:
          ticket.status === TicketStatus.WAITING
            ? '매칭 대기 중입니다.'
            : '상태를 확인했습니다.',
      };
    } catch (error) {
      try {
        await queryRunner.rollbackTransaction();
      } catch { }
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('서버 에러가 발생했습니다.');
    } finally {
      try {
        await queryRunner.release();
      } catch { }
    }
  }

  async cancelTicket(userId: number, ticketId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const matchTicketRepository = queryRunner.manager.getRepository(MatchTicket);
      const ticket = await matchTicketRepository.findOne({ where: { id: ticketId } });
      if (!ticket) throw new NotFoundException('티켓이 존재하지 않습니다.');
      if (ticket.userId !== userId) throw new ForbiddenException('권한이 없습니다.');
      if (ticket.status !== TicketStatus.WAITING) {
        throw new BadRequestException('대기중인 티켓만 취소할 수 있습니다.');
      }
      const cancelUpdateResult = await matchTicketRepository
        .createQueryBuilder()
        .update(MatchTicket)
        .set({ status: TicketStatus.CANCELED })
        .where('id = :id', { id: ticketId })
        .andWhere('status = :waiting', { waiting: TicketStatus.WAITING })
        .execute();
      if (!cancelUpdateResult.affected) {
        throw new BadRequestException('티켓 취소에 실패했습니다.');
      }
      await this.refundIfNeeded(queryRunner, ticketId, 'CANCELED');
      await queryRunner.commitTransaction();
      return { message: '매칭 대기를 취소했습니다.' };
    } catch (error) {
      try {
        await queryRunner.rollbackTransaction();
      } catch { }
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('서버 에러가 발생했습니다.');
    } finally {
      try {
        await queryRunner.release();
      } catch { }
    }
  }
  //주기적으로 티켓 만료시키는 함수
  async expireTicketsBatch(limit = 200) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const matchTicketRepository = queryRunner.manager.getRepository(MatchTicket);
      const now = new Date();
      // waiting 상태인데, 만료시간 지난거. id만 limit만큼. 다가져와라.
      const targetTickets = await matchTicketRepository
        .createQueryBuilder('ticket')
        .where('ticket.status = :waiting', { waiting: TicketStatus.WAITING })
        .andWhere('ticket.expiresAt <= :now', { now })
        .select(['ticket.id'])
        .limit(limit)
        .getMany();

      for (const targetTicket of targetTickets) {
        await this.expireTicketAndRefundIfNeeded(queryRunner, targetTicket.id);
      }

      await queryRunner.commitTransaction();
      return { expired: targetTickets.length };
    } catch (error) {
      try {
        await queryRunner.rollbackTransaction();
      } catch { }

      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('서버 에러가 발생했습니다.');
    } finally {
      try {
        await queryRunner.release();
      } catch { }
    }
  }

  // 매치 시도해서 결과 가져옴
  private async tryMatchAndPersistLink(myTicketId: string, queryRunner: QueryRunner) {
    const matchTicketRepository = queryRunner.manager.getRepository(MatchTicket);
    const matchSessionRepository = queryRunner.manager.getRepository(MatchSession);
    const chatRoomRepository = queryRunner.manager.getRepository(ChatRoom);
    const chatRoomUserRepository = queryRunner.manager.getRepository(ChatRoomUser);

    const now = new Date();

    // 내 티켓을 다시 가져와서 최신 상태 기반으로 진행
    const myTicket = await matchTicketRepository.findOne({ where: { id: myTicketId } });
    if (!myTicket) {
      throw new InternalServerErrorException('티켓 생성에 실패했습니다.');
    }
    if (myTicket.status !== TicketStatus.WAITING) {
      return { matched: false as const };
    }
    if (myTicket.expiresAt <= now) {
      return { matched: false as const };
    }

    const opponentTicket = await matchTicketRepository
      .createQueryBuilder('ticket')
      //비관적 락.
      .setLock('pessimistic_write')
      // status가 waiting이고.
      .where('ticket.status = :status', { status: TicketStatus.WAITING })
      // region이 같은 region이고.
      .andWhere('ticket.region = :region', { region: myTicket.region })
      // ticket 유저id가 내 티켓 userId와 다르고.
      .andWhere('ticket.userId != :me', { me: myTicket.userId })
      // 만료되지 않았고.
      .andWhere('ticket.expiresAt > :now', { now })
      // 오래된순
      .orderBy('ticket.createdAt', 'ASC')
      //하나만
      .getOne();
    // 상대가 없으면 실패
    if (!opponentTicket) {
      return { matched: false as const };
    }

    // 일단 방을 만듬.
    const roomId = uuidv4();
    const createdRoom = chatRoomRepository.create({ id: roomId });
    await chatRoomRepository.save(createdRoom);
    // 세션을 만듬.
    const sessionId = uuidv4();
    const createdSession = matchSessionRepository.create({
      id: sessionId,
      userAId: myTicket.userId,
      userBId: opponentTicket.userId,
      region: myTicket.region,
      roomId,
      status: SessionStatus.ACTIVE,
      startedAt: now,
    });
    const savedSession = await matchSessionRepository.save(createdSession);

    // 내 티켓 업데이트.
    const myTicketUpdateResult = await matchTicketRepository
      .createQueryBuilder()
      .update(MatchTicket)
      //status를 MATCHED로, roomId는 방금만든 roomId, sessionId는 방금 만든 sessionId
      .set({
        status: TicketStatus.MATCHED,
        roomId,
        matchSessionId: sessionId
      })
      //
      .where('id = :id', { id: myTicket.id })
      .andWhere('status = :waiting', { waiting: TicketStatus.WAITING })
      .andWhere('expiresAt > :now', { now })
      .execute();
    // 매치된 상대 업데이트(내 티켓 업데이트와 동일한 session, room 사용)
    const opponentTicketUpdateResult = await matchTicketRepository
      .createQueryBuilder()
      .update(MatchTicket)
      .set({
        status: TicketStatus.MATCHED,
        roomId,
        matchSessionId: savedSession.id,
      })
      .where('id = :id', { id: opponentTicket.id })
      .andWhere('status = :waiting', { waiting: TicketStatus.WAITING })
      .andWhere('expiresAt > :now', { now })
      .execute();
    //둘 중 하나라도 실패했으면
    if (!myTicketUpdateResult.affected || !opponentTicketUpdateResult.affected) {
      // 여기서 방/세션을 롤백해야 하나? -> 트랜잭션이라 커밋 전이면 자동 롤백됨.
      return { matched: false as const };
    }
    // chatroom에 나 넣고
    const chatRoomUserForRequester = chatRoomUserRepository.create({
      roomId,
      userId: myTicket.userId,
    });
    // chatroom에 상대 넣고
    const chatRoomUserForOpponent = chatRoomUserRepository.create({
      roomId,
      userId: opponentTicket.userId,
    });
    await chatRoomUserRepository.save([chatRoomUserForRequester, chatRoomUserForOpponent]);
    return {
      matched: true as const,
      matchSessionId: savedSession.id,
      roomId,
      opponentUserId: opponentTicket.userId,
    };
  }
  // 무료 횟수 차감/ 포인트 차감 로직 (랜덤 채팅에서)
  private async consumeRandomChatAllowance(queryRunner: QueryRunner, userId: number) {
    const userRepository = queryRunner.manager.getRepository(Users);
    // 무료 횟수가 있다면 감소시키고
    const freeAttemptUpdateResult = await userRepository
      .createQueryBuilder()
      .update(Users)
      .set({ dailyChatCount: () => 'dailyChatCount - 1' })
      .where('id = :userId', { userId })
      .andWhere('dailyChatCount > 0')
      .execute();
    // affected가 있고, 0보다 크면 billingType: FREE, cost 0 반환
    if (freeAttemptUpdateResult.affected && freeAttemptUpdateResult.affected > 0) {
      //무료 횟수에서 차감되는 것 반환
      return { billingType: 'FREE' as BillingType, cost: 0 };
    }
    // cost = 하드코딩가격(300)
    const cost = this.POINT_COST_PER_TRY;
    // 결제 시도
    const paidAttemptUpdateResult = await userRepository
      .createQueryBuilder()
      .update(Users)
      .set({ points: () => `points - ${cost}` })
      .where('id = :id', { id: userId })
      .andWhere('points >= :cost', { cost })
      .execute();
    // affected가 있고, 0보다 크면 billingType: points와 cost(300)반환
    if (paidAttemptUpdateResult.affected && paidAttemptUpdateResult.affected > 0) {
      return { billingType: 'POINTS' as BillingType, cost };
    }
    throw new BadRequestException('무료 횟수가 소진되었고, 포인트도 부족합니다.');
  }

  //티켓 만료 시 환불 필요하면 환불
  private async expireTicketAndRefundIfNeeded(queryRunner: QueryRunner, ticketId: string) {
    const matchTicketRepository = queryRunner.manager.getRepository(MatchTicket);
    //
    const expireUpdateResult = await matchTicketRepository
      .createQueryBuilder()
      .update(MatchTicket)
      .set({ status: TicketStatus.EXPIRED })
      .where('id = :id', { id: ticketId })
      .andWhere('status = :waiting', { waiting: TicketStatus.WAITING })
      .execute();

    if (expireUpdateResult.affected && expireUpdateResult.affected > 0) {
      await this.refundIfNeeded(queryRunner, ticketId, 'EXPIRED');
    }
  }
  //환불 필요하면 환불
  private async refundIfNeeded(
    queryRunner: QueryRunner,
    ticketId: string,
    reason: 'EXPIRED' | 'CANCELED',
  ) {
    const matchTicketRepository = queryRunner.manager.getRepository(MatchTicket);
    const userRepository = queryRunner.manager.getRepository(Users);

    const ticket = await matchTicketRepository.findOne({ where: { id: ticketId } });
    if (!ticket) {
      return { message: "해당 티켓이 존재하지 않습니다" }
    }
    //refunded가 true이면 return
    if (ticket.refunded) {
      return { message: "환불 처리된 티켓입니다." }
    }

    const billingType = ticket.billingType as BillingType;
    const cost = ticket.cost;

    let shouldRefund = false;

    if (billingType === 'FREE') {
      shouldRefund = true;
    } else if (billingType === 'POINTS') {
      shouldRefund = reason === 'EXPIRED';
    }

    if (!shouldRefund) {
      await matchTicketRepository
        .createQueryBuilder()
        .update(MatchTicket)
        .set({ refunded: true })
        .where('id = :id', { id: ticketId })
        .andWhere('refunded = :f', { f: false })
        .execute();
      return;
    }

    const markRefundedUpdateResult = await matchTicketRepository
      .createQueryBuilder()
      .update(MatchTicket)
      .set({ refunded: true })
      .where('id = :id', { id: ticketId })
      .andWhere('refunded = :f', { f: false })
      .execute();

    if (!markRefundedUpdateResult.affected) return;

    // 무료 횟수 사용 환불일 경우
    if (billingType === 'FREE') {
      await userRepository
        .createQueryBuilder()
        .update(Users)
        .set({ dailyChatCount: () => 'dailyChatCount + 1' })
        .where('id = :id', { id: ticket.userId })
        .execute();
      return;
    }
    // point 환불일 경우
    if (billingType === 'POINTS' && cost > 0) {
      await userRepository
        .createQueryBuilder()
        .update(Users)
        .set({ points: () => `points + ${cost}` })
        .where('id = :id', { id: ticket.userId })
        .execute();
    }
  }



  private readonly HEARTBEAT_TIMEOUT_SEC = 15;
  private readonly BILLING_UNIT_SEC = 60;
  private readonly RATE_PER_UNIT = 10;
  private readonly EARN_RATE = 0.3;
  private readonly RINGING_TIMEOUT_SEC = 60;

  private secondsBetween(a: Date, b: Date) {
    return Math.max(0, Math.floor((b.getTime() - a.getTime()) / 1000));
  }

  private calcTotalCostWithUpfront(elapsedSec: number) {
    const extraUnits = Math.floor(elapsedSec / this.BILLING_UNIT_SEC);
    return (1 + extraUnits) * this.RATE_PER_UNIT;
  }

  private calcRemainingSecondsByPoints(points: number) {
    const minutes = Math.floor(points / this.RATE_PER_UNIT);
    return minutes * 60;
  }

  private async assertMatchSessionParticipant(
    queryRunner: QueryRunner,
    matchSessionId: string,
    userId: number,
  ) {
    const matchSessionRepo = queryRunner.manager.getRepository(MatchSession);

    const matchSession = await matchSessionRepo.findOne({
      where: { id: matchSessionId },
    });
    if (!matchSession) throw new NotFoundException('매칭 세션이 존재하지 않습니다.');
    if (matchSession.status !== SessionStatus.ACTIVE) {
      throw new BadRequestException('활성화된 매칭 세션이 아닙니다.');
    }

    const isA = matchSession.userAId === userId;
    const isB = matchSession.userBId === userId;
    if (!isA && !isB) throw new ForbiddenException('해당 매칭 세션의 당사자가 아닙니다.');

    const opponentUserId = isA ? matchSession.userBId : matchSession.userAId;

    return { matchSession, opponentUserId };
  }


  async createCall(userId: number, matchSessionId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const matchSessionRepo = queryRunner.manager.getRepository(MatchSession);
      const callSessionRepo = queryRunner.manager.getRepository(CallSession);
      const callParticipantRepo = queryRunner.manager.getRepository(CallParticipant);
      //비관적 락 설정
      const matchSession = await matchSessionRepo.findOne({
        where: { id: matchSessionId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!matchSession) {
        throw new NotFoundException('매칭 세션이 존재하지 않습니다.');
      }
      if (matchSession.status !== SessionStatus.ACTIVE) {
        throw new BadRequestException('활성화된 매칭 세션이 아닙니다.');
      }
      const isA = matchSession.userAId === userId;
      const isB = matchSession.userBId === userId;
      if (!isA && !isB) {
        throw new ForbiddenException('해당 매칭 세션의 당사자가 아닙니다.');
      }
      const opponentUserId = isA ? matchSession.userBId : matchSession.userAId;

      // 동일 matchSession에서 활성 통화 중복 방지
      const existingActiveCall = await callSessionRepo
        .createQueryBuilder('call')
        .setLock('pessimistic_write')
        .where('call.matchSessionId = :matchSessionId', { matchSessionId })
        .andWhere('call.status IN (:...statuses)', {
          statuses: [CallStatus.RINGING, CallStatus.ONGOING],
        })
        .getOne();

      if (existingActiveCall) {
        throw new ConflictException('이미 진행 중이거나 요청 중인 통화가 있습니다.');
      }
      const now = new Date();
      const callSession = callSessionRepo.create({
        matchSessionId,
        callerId: userId,
        calleeId: opponentUserId,
        status: CallStatus.RINGING,
        startedAt: null,
        endedAt: null,
        lastBilledAt: null,
        heldTotal: 0,
        capturedTotal: 0,
        earnedTotal: 0,
        settledAt: null,
        // (엔티티에 createdAt이 있다면 now 넣어도 됨)
      });

      const saved = await callSessionRepo.save(callSession);

      await callParticipantRepo.save([
        callParticipantRepo.create({
          callSessionId: saved.id,
          userId,
          state: 'JOINED',
          lastSeenAt: now,
        }),
        callParticipantRepo.create({
          callSessionId: saved.id,
          userId: opponentUserId,
          state: 'INVITED',
          lastSeenAt: null,
        }),
      ]);

      await queryRunner.commitTransaction();
      return {
        status: CallStatus.RINGING,
        callSessionId: saved.id,
        matchSessionId,
        opponentUserId,
        message: '통화 요청이 생성되었습니다.',
      };
    } catch (error) {
      try { await queryRunner.rollbackTransaction(); } catch { }
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('서버 에러가 발생했습니다.');
    } finally {
      try { await queryRunner.release(); } catch { }
    }
  }

  async getActiveCall(userId: number, matchSessionId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const callSessionRepo = queryRunner.manager.getRepository(CallSession);
      const participantRepo = queryRunner.manager.getRepository(CallParticipant);
      const userRepo = queryRunner.manager.getRepository(Users);

      const { opponentUserId } = await this.assertMatchSessionParticipant(queryRunner, matchSessionId, userId);

      const call = await callSessionRepo
        .createQueryBuilder('call')
        .where('call.matchSessionId = :matchSessionId', { matchSessionId })
        .andWhere('call.status IN (:...statuses)', {
          statuses: [CallStatus.RINGING, CallStatus.ONGOING],
        })
        .orderBy('call.startedAt', 'DESC')
        .addOrderBy('call.id', 'DESC')
        .getOne();

      if (!call) {
        await queryRunner.commitTransaction();
        return { active: false, message: '활성 통화가 없습니다.' };
      }

      const myP = await participantRepo.findOne({ where: { callSessionId: call.id, userId } });
      const oppP = await participantRepo.findOne({ where: { callSessionId: call.id, userId: opponentUserId } });

      const now = new Date();
      const peerAlive =
        oppP?.state === 'JOINED' &&
        !!oppP.lastSeenAt &&
        this.secondsBetween(new Date(oppP.lastSeenAt), now) <= this.HEARTBEAT_TIMEOUT_SEC;


      const caller = await userRepo.findOne({ where: { id: call.callerId } });
      const remainingSecondsByPoints = caller ? this.calcRemainingSecondsByPoints(caller.points) : null;

      await queryRunner.commitTransaction();

      return {
        active: true,
        callSessionId: call.id,
        status: call.status,
        matchSessionId,
        callerId: call.callerId,
        calleeId: call.calleeId,
        myState: myP?.state ?? null,
        peerState: oppP?.state ?? null,
        peerAlive,
        heldTotal: call.heldTotal,
        remainingSecondsByPoints,
        message: '활성 통화 상태를 조회했습니다.',
      };
    } catch (error) {
      try { await queryRunner.rollbackTransaction(); } catch { }
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('서버 에러가 발생했습니다.');
    } finally {
      try { await queryRunner.release(); } catch { }
    }
  }
  async acceptCall(userId: number, callSessionId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const callSessionRepo = queryRunner.manager.getRepository(CallSession);
      const participantRepo = queryRunner.manager.getRepository(CallParticipant);
      const userRepo = queryRunner.manager.getRepository(Users);
      const ledgerRepo = queryRunner.manager.getRepository(PointLedger);

      const call = await callSessionRepo.findOne({
        where: { id: callSessionId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!call) throw new NotFoundException('통화 세션이 존재하지 않습니다.');
      if (call.callerId !== userId && call.calleeId !== userId) {
        throw new ForbiddenException('해당 통화 세션의 당사자가 아닙니다.');
      }
      if (call.status !== CallStatus.RINGING) {
        throw new ConflictException('수락할 수 없는 통화 상태입니다.');
      }

      // callee가 아니면 금지
      if (userId !== call.calleeId) {
        throw new ForbiddenException('수락 권한이 없습니다.');
      }

      const now = new Date();

      // 수락자 JOINED
      const me = await participantRepo.findOne({ where: { callSessionId, userId } });
      if (!me) throw new NotFoundException('참가자 정보가 없습니다.');
      me.state = 'JOINED';
      me.lastSeenAt = now;
      await participantRepo.save(me);

      // 시작 즉시 10포인트 선차감(hold)
      const upfront = this.RATE_PER_UNIT; // 10
      const caller = await userRepo.findOne({
        where: { id: call.callerId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!caller) throw new NotFoundException('caller가 존재하지 않습니다.');

      if (caller.points < upfront) {
        throw new BadRequestException('포인트가 부족하여 통화를 시작할 수 없습니다.');
      }

      caller.points -= upfront;
      caller.escrowPoints += upfront;
      await userRepo.save(caller);

      await ledgerRepo.insert({
        userId: caller.id,
        type: 'CALL_HOLD',
        amount: upfront,
        callSessionId,
        idempotencyKey: `CALL_HOLD:${callSessionId}:UPFRONT`,
      });

      call.status = CallStatus.ONGOING;
      call.startedAt = now;
      call.lastBilledAt = now;
      call.heldTotal = (call.heldTotal ?? 0) + upfront;
      await callSessionRepo.save(call);

      const remainingSecondsByPoints = this.calcRemainingSecondsByPoints(caller.points);

      await queryRunner.commitTransaction();

      return {
        message: '통화를 수락했습니다.',
        data: {
          callSessionId,
          status: call.status,
          upfrontCharged: upfront,
          remainingSecondsByPoints,
        },
      };
    } catch (error) {
      try { await queryRunner.rollbackTransaction(); } catch { }
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('서버 에러가 발생했습니다.');
    } finally {
      try { await queryRunner.release(); } catch { }
    }
  }

  async declineCall(userId: number, callSessionId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const callSessionRepo = queryRunner.manager.getRepository(CallSession);
      const participantRepo = queryRunner.manager.getRepository(CallParticipant);

      const call = await callSessionRepo.findOne({
        where: { id: callSessionId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!call) throw new NotFoundException('통화 세션이 존재하지 않습니다.');
      if (call.callerId !== userId && call.calleeId !== userId) {
        throw new ForbiddenException('해당 통화 세션의 당사자가 아닙니다.');
      }
      if (call.status !== CallStatus.RINGING) {
        throw new BadRequestException('요청 중인 통화만 거절할 수 있습니다.');
      }

      //  거절은 callee만
      if (userId !== call.calleeId) {
        throw new ForbiddenException('거절 권한이 없습니다.');
      }

      const now = new Date();

      const me = await participantRepo.findOne({ where: { callSessionId, userId } });
      if (me) {
        me.state = 'LEFT';
        me.lastSeenAt = now;
        await participantRepo.save(me);
      }

      call.status = CallStatus.DECLINED;
      call.endedAt = now;
      await callSessionRepo.save(call);

      await queryRunner.commitTransaction();
      return { message: '통화를 거절했습니다.' };
    } catch (error) {
      try { await queryRunner.rollbackTransaction(); } catch { }
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('서버 에러가 발생했습니다.');
    } finally {
      try { await queryRunner.release(); } catch { }
    }
  }

  async heartbeat(userId: number, callSessionId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const callSessionRepo = queryRunner.manager.getRepository(CallSession);
      const participantRepo = queryRunner.manager.getRepository(CallParticipant);
      const userRepo = queryRunner.manager.getRepository(Users);
      const ledgerRepo = queryRunner.manager.getRepository(PointLedger);

      const call = await callSessionRepo.findOne({
        where: { id: callSessionId },
        lock: { mode: 'pessimistic_write' }, // 과금/hold 동시성 방지 핵심
      });
      if (!call) throw new NotFoundException('통화 세션이 존재하지 않습니다.');
      if (call.callerId !== userId && call.calleeId !== userId) {
        throw new ForbiddenException('해당 통화 세션의 당사자가 아닙니다.');
      }
      if (call.status !== CallStatus.ONGOING || !call.startedAt) {
        throw new ConflictException('통화 진행 중이 아닙니다.');
      }

      const now = new Date();

      // 내 lastSeen 갱신
      const me = await participantRepo.findOne({ where: { callSessionId, userId } });
      if (!me) throw new NotFoundException('참가자 정보가 없습니다.');
      if (me.state !== 'JOINED') me.state = 'JOINED';
      me.lastSeenAt = now;
      await participantRepo.save(me);

      // 상대 alive 확인
      const opponentUserId = call.callerId === userId ? call.calleeId : call.callerId;
      const opp = await participantRepo.findOne({ where: { callSessionId, userId: opponentUserId } });

      const peerAlive =
        opp?.state === 'JOINED' &&
        !!opp.lastSeenAt &&
        this.secondsBetween(new Date(opp.lastSeenAt), now) <= this.HEARTBEAT_TIMEOUT_SEC;

      // 둘 다 살아있지 않으면 hold 증액 안 함
      if (!peerAlive) {
        const caller = await userRepo.findOne({ where: { id: call.callerId } });
        const remainingSecondsByPoints = caller ? this.calcRemainingSecondsByPoints(caller.points) : null;

        await queryRunner.commitTransaction();
        return {
          message: 'heartbeat ok (peer not alive)',
          data: {
            peerAlive: false,
            status: call.status,
            heldTotal: call.heldTotal,
            remainingSecondsByPoints,
          },
        };
      }

      // 과금 계산(선결제 포함)
      const elapsedSec = this.secondsBetween(call.startedAt, now);
      const totalCostSoFar = this.calcTotalCostWithUpfront(elapsedSec);

      const heldTotal = call.heldTotal ?? 0;
      const needMoreHold = Math.max(0, totalCostSoFar - heldTotal);

      // caller만 hold 증액
      let remainingSecondsByPoints: number | null = null;

      // caller 조회(잔여시간 반환 목적 포함)
      const caller = await userRepo.findOne({
        where: { id: call.callerId },
        lock: { mode: 'pessimistic_write' }, // points/escrow 변경 가능성 때문에 락
      });
      if (!caller) throw new NotFoundException('caller가 존재하지 않습니다.');

      if (needMoreHold > 0) {
        // hold 증액은 caller heartbeat에서만 수행(불필요한 이중 실행 방지)
        if (userId === call.callerId) {
          if (caller.points < needMoreHold) {
            // 포인트 부족 → 통화 종료 + 정산
            call.status = CallStatus.ENDED;
            call.endedAt = now;
            await callSessionRepo.save(call);

            await queryRunner.commitTransaction();
            await this.settleCall(callSessionId);
            throw new BadRequestException('포인트가 부족하여 통화가 종료되었습니다.');
          }

          caller.points -= needMoreHold;
          caller.escrowPoints += needMoreHold;
          await userRepo.save(caller);

          await ledgerRepo.insert({
            userId: caller.id,
            type: 'CALL_HOLD',
            amount: needMoreHold,
            callSessionId,
            idempotencyKey: `CALL_HOLD:${callSessionId}:${totalCostSoFar}`, // 총비용 기준 멱등
          });

          call.heldTotal = heldTotal + needMoreHold;
          await callSessionRepo.save(call);
        }
      }

      remainingSecondsByPoints = this.calcRemainingSecondsByPoints(caller.points);

      await queryRunner.commitTransaction();
      return {
        message: 'heartbeat ok',
        data: {
          peerAlive: true,
          status: call.status,
          elapsedSec,
          totalCostSoFar,
          heldTotal: call.heldTotal ?? heldTotal,
          remainingSecondsByPoints,
        },
      };
    } catch (error) {
      try { await queryRunner.rollbackTransaction(); } catch { }
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('서버 에러가 발생했습니다.');
    } finally {
      try { await queryRunner.release(); } catch { }
    }
  }

  async endCall(userId: number, callSessionId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const callSessionRepo = queryRunner.manager.getRepository(CallSession);

      const call = await callSessionRepo.findOne({
        where: { id: callSessionId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!call) throw new NotFoundException('통화 세션이 존재하지 않습니다.');
      if (call.callerId !== userId && call.calleeId !== userId) {
        throw new ForbiddenException('해당 통화 세션의 당사자가 아닙니다.');
      }
      if (call.status !== CallStatus.ONGOING) {
        throw new BadRequestException('진행 중인 통화만 종료할 수 있습니다.');
      }

      call.status = CallStatus.ENDED;
      call.endedAt = new Date();
      await callSessionRepo.save(call);

      await queryRunner.commitTransaction();

      await this.settleCall(callSessionId);

      return { message: '통화를 종료했습니다.', data: { callSessionId } };
    } catch (error) {
      try { await queryRunner.rollbackTransaction(); } catch { }
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('서버 에러가 발생했습니다.');
    } finally {
      try { await queryRunner.release(); } catch { }
    }
  }

  async settleCall(callSessionId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const callSessionRepo = queryRunner.manager.getRepository(CallSession);
      const userRepo = queryRunner.manager.getRepository(Users);
      const ledgerRepo = queryRunner.manager.getRepository(PointLedger);

      const call = await callSessionRepo.findOne({
        where: { id: callSessionId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!call) throw new NotFoundException('통화 세션이 존재하지 않습니다.');

      // 재정산 방지
      if (call.settledAt) {
        await queryRunner.commitTransaction();
        return { message: 'already settled', data: { settledAt: call.settledAt } };
      }

      if (!call.startedAt) {
        call.settledAt = new Date();
        await callSessionRepo.save(call);
        await queryRunner.commitTransaction();
        return { message: 'settled (no startedAt)', data: { captured: 0, refund: 0, earn: 0 } };
      }

      const endAt = call.endedAt ?? new Date();
      const elapsedSec = this.secondsBetween(call.startedAt, endAt);

      const totalCost = this.calcTotalCostWithUpfront(elapsedSec); // 선결제 포함 총 비용
      const heldTotal = call.heldTotal ?? 0;

      // 실제 확정 차감 = min(총 비용, heldTotal)
      const captured = Math.min(totalCost, heldTotal);
      const refund = Math.max(0, heldTotal - captured);

      // 받는 사람에게 30% 적립(마지막에만 계산)
      const earn = Math.floor(captured * this.EARN_RATE);

      const caller = await userRepo.findOne({
        where: { id: call.callerId },
        lock: { mode: 'pessimistic_write' },
      });
      const callee = await userRepo.findOne({
        where: { id: call.calleeId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!caller || !callee) throw new NotFoundException('유저가 존재하지 않습니다.');

      // escrow에서 captured는 "소비 확정"이므로 단순 차감
      // refund는 escrow에서 빼고 points로 반환
      if (caller.escrowPoints < heldTotal) {
        throw new ConflictException('에스크로 포인트가 부족합니다(데이터 불일치).');
      }

      // escrow에서 heldTotal 전체를 일단 제거하고(정산 완료),
      // refund는 points로 돌려줌, captured는 소모로 확정
      caller.escrowPoints -= heldTotal;
      if (refund > 0) caller.points += refund;

      if (earn > 0) callee.points += earn;

      await userRepo.save([caller, callee]);

      // ledger에 기록함
      await ledgerRepo.insert({
        userId: caller.id,
        type: 'CALL_CAPTURE',
        amount: captured,
        callSessionId,
        idempotencyKey: `CALL_CAPTURE:${callSessionId}`,
      });

      if (refund > 0) {
        await ledgerRepo.insert({
          userId: caller.id,
          type: 'CALL_REFUND',
          amount: refund,
          callSessionId,
          idempotencyKey: `CALL_REFUND:${callSessionId}`,
        });
      }

      if (earn > 0) {
        await ledgerRepo.insert({
          userId: callee.id,
          type: 'CALL_EARN',
          amount: earn,
          callSessionId,
          idempotencyKey: `CALL_EARN:${callSessionId}`,
        });
      }

      call.capturedTotal = captured;
      call.earnedTotal = earn;
      call.settledAt = new Date();
      await callSessionRepo.save(call);

      await queryRunner.commitTransaction();

      return {
        message: 'settled',
        data: {
          elapsedSec,
          totalCost,
          captured,
          refund,
          earn,
          settledAt: call.settledAt,
        },
      };
    } catch (error) {
      try { await queryRunner.rollbackTransaction(); } catch { }
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('서버 에러가 발생했습니다.');
    } finally {
      try { await queryRunner.release(); } catch { }
    }
  }


  async expireRingingCallsBatch(limit = 200) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const callSessionRepo = queryRunner.manager.getRepository(CallSession);
      const now = new Date();
      const deadline = new Date(now.getTime() - this.RINGING_TIMEOUT_SEC * 1000);

      const targets = await callSessionRepo
        .createQueryBuilder('call')
        .where('call.status = :status', { status: CallStatus.RINGING })
        .andWhere('call.createdAt <= :deadline', { deadline })
        .select(['call.id'])
        .limit(limit)
        .getMany();

      for (const t of targets) {
        await callSessionRepo
          .createQueryBuilder()
          .update(CallSession)
          .set({ status: CallStatus.TIMEOUT, endedAt: now })
          .where('id = :id', { id: t.id })
          .andWhere('status = :ringing', { ringing: CallStatus.RINGING })
          .execute();
      }

      await queryRunner.commitTransaction();
      return { expired: targets.length };
    } catch (error) {
      try { await queryRunner.rollbackTransaction(); } catch { }
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('서버 에러가 발생했습니다.');
    } finally {
      try { await queryRunner.release(); } catch { }
    }
  }

}
