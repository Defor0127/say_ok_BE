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

type BillingType = 'FREE' | 'ALLOWANCE';

@Injectable()
export class MatchService {
  private readonly WAIT_SECONDS = 30;

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
        gender:user.gender,
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
      //  트랜잭션이라 커밋 전이면 자동 롤백됨.
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
  // 무료 횟수 차감 (랜덤 채팅에서)
  private async consumeRandomChatAllowance(queryRunner: QueryRunner, userId: number) {
    const userRepository = queryRunner.manager.getRepository(Users);
    // 무료 횟수가 있다면 감소시키고
    const freeAttemptUpdateResult = await userRepository
      .createQueryBuilder()
      .update(Users)
      .set({ dailyChatAllowance: () => 'dailyChatAllowance - 1' })
      .where('id = :userId', { userId })
      .andWhere('dailyChatAllowance > 0')
      .execute();
    // affected가 있고, 0보다 크면 billingType: FREE, cost 0 반환
    if (freeAttemptUpdateResult.affected && freeAttemptUpdateResult.affected > 0) {
      //무료 횟수에서 차감되는 것 반환
      return { billingType: 'FREE' as BillingType, cost: 0 };
    }

    const paidAttemptUpdateResult = await userRepository
      .createQueryBuilder()
      .update(Users)
      .set({ chatAllowance: () => `chatAllowance - 1` })
      .where('id = :id', { id: userId })
      .andWhere('chatAllowance >= :1')
      .execute();
    // affected가 있고, 0보다 크면 billingType: points와 cost(300)반환
    if (paidAttemptUpdateResult.affected && paidAttemptUpdateResult.affected > 0) {
      return { billingType: 'ALLOWANCE' as BillingType, cost: 1 }
    }
    throw new BadRequestException('무료 횟수가 소진되었고, 채팅권도 부족합니다.');
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
    } else if (billingType === 'ALLOWANCE') {
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
        .set({ dailyChatAllowance: () => 'dailyChatAllowance + 1' })
        .where('id = :id', { id: ticket.userId })
        .execute();
      return;
    }
    //allowance 환불일 경우
    if (billingType === 'ALLOWANCE' && cost > 0) {
      await userRepository
        .createQueryBuilder()
        .update(Users)
        .set({ chatAllowance: () => `chatAllowance + 1` })
        .where('id = :id', { id: ticket.userId })
        .execute();
    }
  }

  async startRandomChatByOppositeGender(userId: number) {
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
      if (existingWaitingTicket) {
        throw new ConflictException('이미 매칭중인 유저입니다.');
      }




    } catch {

    } finally { }

  }
  // 만약 무료횟수가 다 차있으면 2회 차감, 1이면 각 1회씩 차감(), 0이면 횟수권에서 차감.
  private async consumeRandomChatAllowanceByOppositeGender(queryRunner: QueryRunner, userId: number) {
    const userRepository = queryRunner.manager.getRepository(Users);

    //무료 2회가 차있을경우
    const freeAttemptUpdateResult = await userRepository
      .createQueryBuilder()
      .update(Users)
      .set({ dailyChatAllowance: () => 'dailyChatAllowance - 2' })
      .where('id = :userId', { userId })
      .andWhere('dailyChatAllowance = 2')
      .execute();
    if (freeAttemptUpdateResult.affected && freeAttemptUpdateResult.affected > 0) {
      //무료 횟수에서 차감되는 것 반환
      return { billingType: 'FREE' as BillingType, cost: 0 };
    }

    const paidAttemptUpdateResult = await userRepository
      .createQueryBuilder()
      .update(Users)
      .set({ chatAllowance: () => `chatAllowance - 1` })
      .where('id = :id', { id: userId })
      .andWhere('chatAllowance >= :1')
      .execute();
    if (paidAttemptUpdateResult.affected && paidAttemptUpdateResult.affected > 0) {
      return { billingType: 'ALLOWANCE' as BillingType, cost: 1 }
    }





  }

}
