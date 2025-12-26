import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from '@/user/entities/user.entity';
import { UserReported } from '@/user/entities/user-reported.entity';
import { ChatAllowanceHistory } from '@/chat-allowance/entities/chat-allowance-history.entity';
import { ChatRoom } from '@/chat/entities/chatroom.entity';
import { EntityLookupService } from '@/common/services/entity-lookup.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    @InjectRepository(UserReported)
    private readonly userReportedRepository: Repository<UserReported>,
    @InjectRepository(ChatAllowanceHistory)
    private readonly chatAllowanceHistoryRepository: Repository<ChatAllowanceHistory>,
    @InjectRepository(ChatRoom)
    private readonly chatRoomRepository: Repository<ChatRoom>,
    private readonly entityLookupService: EntityLookupService
  ) { }

  async getDashboard() {
    const totalUsers = await this.userRepository.count()
    const activeUsers = await this.userRepository.count({
      where: { status: 1 }
    })
    const pendingReports = await this.userReportedRepository.count({
      where: { status: 'PENDING' }
    })
    const warnedUsers = await this.userRepository.count({
      where: { status: 2 }
    })

    return {
      data: {
        totalUsers,
        activeUsers,
        pendingReports,
        warnedUsers,
      },
      message: "대시보드 통계를 조회했습니다."
    }
  }

  async getUserDetail(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: [
        'id',
        'loginEmail',
        'nickname',
        'phoneNumber',
        'region',
        'status',
        'reportedCount',
        'createdAt',
      ],
    });
    if (!user) {
      throw new NotFoundException('대상 유저가 존재하지 않습니다.');
    }
    return {
      message: '사용자 상세 정보를 조회했습니다.',
      data: {
        ...user,
      },
    };
  }

  async deleteUser(userId: number) {
    const userExist = await this.entityLookupService.findOneOrThrow(
      this.userRepository,
      { id: userId },
      "대상 유저가 존재하지 않습니다."
    )
    const deleteResult = await this.userRepository.delete({ id: userId })
    if (!deleteResult || deleteResult.affected === 0) {
      throw new NotFoundException("대상 사용자가 존재하지 않습니다.")
    }
    return { message: "사용자를 삭제했습니다." }
  }

  async getAllReports(status: string) {
    const reports = await this.userReportedRepository.createQueryBuilder('report')
      .leftJoin('report.reporter', 'reporter')
      .leftJoin('report.reportedUser', 'reportedUser')
      .select([
        'report.id',
        'report.status',
        'report.reportType',
        'report.createdAt',
        'reporter.id',
        'reporter.nickname',
        'reportedUser.id',
        'reportedUser.nickname',
      ])
      .where('report.status = :status', { status })
      .getMany()
    return {
      data: reports,
      message: reports.length === 0 ? "해당 상태의 신고 기록이 존재하지 않습니다." : `${status} 상태의 신고 기록을 전부 조회하였습니다.`
    }
  }

  // 시스템 세팅
  async updateSystemSettings(settingsDto: any) {
    return {
      data: settingsDto,
      message: "시스템 설정이 업데이트되었습니다."
    }
  }

  async getUserPointsHistories(userId: number) {
    const userExist = await this.entityLookupService.findOneOrThrow(
      this.userRepository,
      { id: userId },
      "대상 유저가 존재하지 않습니다."
    )
    const chatAllowanceHistories = await this.chatAllowanceHistoryRepository.find({
      where: { userId }
    })
    if (chatAllowanceHistories.length === 0) {
      return {
        message: "대상 유저의 포인트 사용 이력이 존재하지 않습니다.",
        data: []
      }
    }
    // 사용 총합, 충전 총합
    const chatAllowanceHistoriesSum = await this.chatAllowanceHistoryRepository.createQueryBuilder('ph')
      // if문이랑 같다고 생각하면 됨. ph.changes가 0보다 작으면 합침. 이걸 'used'로 반환.
      .select(`SUM(CASE WHEN ph.changes < 0 THEN ph.changes ELSE 0 END)`, 'used')
      // if문이랑 같다고 생각하면 됨. ph.changes가 0보다 크면 합침. 이걸 'charged'로 반환.
      .addSelect(`SUM(CASE WHEN ph.changes > 0 THEN ph.changes ELSE 0 END)`, 'charged')
      .where('ph.userId = :userId', { userId })
      //쿼리문의 결과가 엔티티가 아닐때는 getRaw 사용해야 함.
      .getRawOne()
    return {
      data: {
        histories: chatAllowanceHistories,
        total: chatAllowanceHistoriesSum
      },
      message: "대상 유저의 포인트 사용 이력을 조회합니다."
    }
  }
}
