import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { UserReported } from '@/user/entities/user-reported.entity';
import { Users } from '@/user/entities/user.entity';
import { UserSuspension } from '@/user/entities/user-suspension.entity';
import { ReportType } from './enums/report-type.enum';
import { ReportUserDto } from './dto/report-user.dto';
import { EntityLookupService } from '@/common/services/entity-lookup.service';
import { ChatRoomMessage } from '@/chat/entities/chatroom-message.enity';

@Injectable()
export class ReportService {
  private readonly SUSPENSION_THRESHOLD = 10;
  private readonly SUSPENSION_DURATION_DAYS = 7;
  constructor(
    @InjectRepository(UserReported)
    private readonly userReportedRepository: Repository<UserReported>,
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    @InjectRepository(UserSuspension)
    private readonly userSuspensionRepository: Repository<UserSuspension>,
    private readonly entityLookupService: EntityLookupService,
    private readonly dataSource: DataSource,
    @InjectRepository(ChatRoomMessage)
    private readonly chatRoomMessageRepository: Repository<ChatRoomMessage>
  ) { }

  async reportUser (userId: number, reportUserDto: ReportUserDto) {
    if(reportUserDto.reportedUserId === userId) {
      throw new ForbiddenException("자기 자신을 신고 대상으로 할 수 없습니다.")
    }
    const reportToCreate = this.userReportedRepository.create({
      ...reportUserDto,
      reporterId: userId
    })
    const saved = await this.userReportedRepository.save(reportToCreate);
    return {
      data: saved,
      message: "대상 유저 신고에 성공했습니다."
    }
  }

  async reportMessage (userId: number, messageId: string){
    const userExist = await this.userRepository.findOne({
      where : {id :userId}
    })
    if(!userExist){
      throw new NotFoundException("대상 유저가 존재하지 않습니다.")
    }
    const messageExist = await this.chatRoomMessageRepository.findOne({
      where: { id: messageId }
    })
    if(!messageExist) {
      throw new NotFoundException("대상 메시지가 존재하지 않습니다.")
    }
    if(messageExist.senderId === userId) {
      throw new ForbiddenException("자기자신을 신고 대상으로 할 수 없습니다.")
    }

  }


  async getReports(type: ReportType) {
    const reports = await this.userReportedRepository.find({
      where: { reportType: type }
    })
    return {
      data: reports,
      message: reports.length === 0 ? "해당 타입의 신고 목록이 없습니다." : "해당 타입의 신고 목록을 조회했습니다."
    }
  }

  async getReportDetail(reportId: number) {
    const report = await this.userReportedRepository.findOne({
      where: { id: reportId },
      relations: ['reporter', 'reportedUser'],
    })
    if (!report) {
      throw new NotFoundException("대상 신고가 존재하지 않습니다.")
    }
    return {
      data: report,
      message: "신고 상세 정보를 조회했습니다."
    }
  }

  async resolveReport(reportId: number) {
    const report = await this.userReportedRepository.findOne({
      where: { id: reportId }
    })
    if (!report) {
      throw new NotFoundException("대상 신고가 존재하지 않습니다.")
    }
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.update(
        UserReported,
        { id: reportId },
        { status: 'COMPLETED' }
      );

      await queryRunner.manager.increment(
        Users,
        { id: report.reportedUserId },
        'reportedCount',
        1
      );
      const updatedUser = await queryRunner.manager.findOne(Users, {
        where: { id: report.reportedUserId }
      });
      if (updatedUser && updatedUser.reportedCount >= this.SUSPENSION_THRESHOLD) {
        await this.suspendUser(
          queryRunner,
          report.reportedUserId,
          updatedUser.reportedCount
        );
      }
      await queryRunner.commitTransaction();
      return { message: "신고를 처리했습니다." }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async suspendUser(
    queryRunner: any,
    userId: number,
    reportedCount: number
  ) {
    const suspendedUntil = new Date();
    suspendedUntil.setDate(suspendedUntil.getDate() + this.SUSPENSION_DURATION_DAYS);

    await queryRunner.manager.update(
      Users,
      { id: userId },
      {
        isSuspended: true,
        suspendedUntil: suspendedUntil
      }
    );

    const suspension = queryRunner.manager.create(UserSuspension, {
      userId: userId,
      reportedCount: reportedCount,
      suspendedAt: new Date(),
      suspendedUntil: suspendedUntil,
      status: 'ACTIVE',
      reason: `신고 누적 횟수 ${reportedCount}회로 인한 자동 정지`
    });

    await queryRunner.manager.save(UserSuspension, suspension);
  }

  async rejectReport(reportId: number) {
    const report = await this.userReportedRepository.findOne({
      where: { id: reportId }
    })
    if (!report) {
      throw new NotFoundException("대상 신고가 존재하지 않습니다.")
    }
    await this.userReportedRepository.update(
      { id: reportId },
      { status: 'REJECTED' }
    )
    return { message: "신고를 기각했습니다." }
  }

  async getUserReportByStatus(userId: number) {
    const userExist = await this.entityLookupService.findOneOrThrow(
      this.userRepository,
      { id: userId },
      "대상 유저가 존재하지 않습니다."
    )
    const reports = await this.userReportedRepository.find({
      where: { reportedUserId: userId }
    })
    if(reports.length === 0) {
      return {
        data: [],
        message: "해당 유저의 신고 기록이 없습니다."
      }
    }
    const reportsByStatus = await this.userReportedRepository.createQueryBuilder('ur')
    .groupBy('ur.status')
    .getMany()
    return {
      data: reportsByStatus,
      message: "대상 유저의 신고기록을 전부 조회하였습니다."
    }
  }
}

