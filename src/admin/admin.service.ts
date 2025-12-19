import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from '@/user/entities/user.entity';
import { Post } from '@/post/entities/post.entity';
import { Club } from '@/club/entities/club.entity';
import { Category } from '@/category/entities/category.entity';
import { UserReported } from '@/user/entities/user-reported.entity';
import { PointHistory } from '@/point/entities/point-history.entity';
import { ChatRoom } from '@/chat/entities/chatroom.entity';
import { EntityLookupService } from '@/common/services/entity-lookup.service';
import { ClubChatRoom } from '@/club/entities/club-chat-room.entity';
import { ClubChatRoomMember } from '@/club/entities/club-chat-room-member.entity';
import { SeniorContent } from '@/hub/entities/senior-content.entity';
import { UpdateHubContentDto } from '@/hub/dto/update-hub-content.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Club)
    private readonly clubRepository: Repository<Club>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(UserReported)
    private readonly userReportedRepository: Repository<UserReported>,
    @InjectRepository(PointHistory)
    private readonly pointHistoryRepository: Repository<PointHistory>,
    @InjectRepository(ChatRoom)
    private readonly chatRoomRepository: Repository<ChatRoom>,
    @InjectRepository(ClubChatRoom)
    private readonly clubChatRoomRepository: Repository<ClubChatRoom>,
    @InjectRepository(SeniorContent)
    private readonly seniorContentRepository: Repository<SeniorContent>,
    private readonly entityLookupService: EntityLookupService
  ) { }

  async getDashboard() {
    const totalUsers = await this.userRepository.count()
    const activeUsers = await this.userRepository.count({
      where: { status: 1 }
    })
    const totalPosts = await this.postRepository.count({
      where: { status: 1 }
    })
    const totalClubs = await this.clubRepository.count()
    const awaitingClubs = await this.clubRepository.count({
      where: { status: 'AWAITING' }
    })
    const pendingReports = await this.userReportedRepository.count({
      where: { status: 'PENDING' }
    })
    const warnedUsers = await this.userRepository.count({
      where: { status: 2 }
    })
    //카테고리 기준
    const popularCategories = await this.categoryRepository.createQueryBuilder('category')
      .leftJoin('category.posts', 'post')
      .select('category.id', 'id')
      .addSelect('category.name', 'name')
      //post 갯수를 postCount로
      .addSelect('COUNT(post.id)', 'postCount')
      // 상태가 1인 게시물
      .where('post.status = 1')
      // 카테고리 기준 그룹
      .groupBy('category.id')
      .orderBy('postCount', 'DESC')
      .limit(5)
      .getRawMany()
    return {
      data: {
        totalUsers,
        activeUsers,
        totalPosts,
        totalClubs,
        awaitingClubs,
        pendingReports,
        warnedUsers,
        popularCategories
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
        'zipCode',
        'region',
        'status',
        'points',
        'reportedCount',
        'createdAt',
      ],
    });
    if (!user) {
      throw new NotFoundException('대상 유저가 존재하지 않습니다.');
    }
    const [postCount, leadingClubCount] = await Promise.all([
      this.postRepository.count({ where: { userId } }),
      this.clubRepository.count({ where: { leaderId: userId } }),
    ]);
    return {
      message: '사용자 상세 정보를 조회했습니다.',
      data: {
        ...user,
        postCount,
        leadingClubCount,
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

  async getAllClubs(page: number, limit: number, categoryId: number, status: string) {
    const queryBuilder = this.clubRepository.createQueryBuilder('club')
      .leftJoinAndSelect('club.category', 'category')
      .leftJoinAndSelect('club.leader', 'leader')
      .leftJoinAndSelect('club.members', 'members')
    if (categoryId) {
      queryBuilder.where('club.categoryId = :categoryId', { categoryId })
    }
    if (status) {
      if (categoryId) {
        queryBuilder.andWhere('club.status = :status', { status })
      } else {
        queryBuilder.where('club.status = :status', { status })
      }
    }
    if (page && limit) {
      queryBuilder.skip((page - 1) * limit).take(limit)
    }
    const [clubs, total] = await queryBuilder.getManyAndCount()
    return {
      data: {
        clubs,
        total,
        page: page || 1,
        limit: limit || total
      },
      message: "모임 목록을 조회했습니다."
    }
  }

  async approveClub(clubId: number) {
    const clubExist = await this.entityLookupService.findOneOrThrow(
      this.clubRepository,
      { id: clubId },
      "대상 모임이 존재하지 않습니다."
    )
    if (clubExist.status !== 'AWAITING') {
      throw new ConflictException("승인 대기 상태의 모임만 승인할 수 있습니다.")
    }
    const updateResult = await this.clubRepository.update(
      { id: clubId },
      { status: 'ACTIVE' }
    )
    if (!updateResult || updateResult.affected === 0) {
      throw new InternalServerErrorException("대상 모임의 상태 변경에 실패했습니다.")
    }
    const clubChatRoomToCreate = await this.clubChatRoomRepository.create({
      clubId
    })
    const savedClubChatRoom = await this.clubChatRoomRepository.save(clubChatRoomToCreate)
    return { message: "모임을 승인했습니다." }
  }

  async rejectClub(clubId: number) {
    const clubExist = await this.entityLookupService.findOneOrThrow(
      this.clubRepository,
      { id: clubId },
      "대상 모임이 존재하지 않습니다."
    )
    if (clubExist.status !== 'AWAITING') {
      throw new ConflictException("승인 대기 상태의 모임만 승인 거절할 수 있습니다.")
    }
    const updateResult = await this.clubRepository.update(
      { id: clubId },
      { status: 'DELETED' }
    )
    if (!updateResult || updateResult.affected === 0) {
      throw new InternalServerErrorException("대상 모임의 상태 변경에 실패했습니다.")
    }
    return { message: "모임 승인을 거부했습니다." }
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
    const pointHistories = await this.pointHistoryRepository.find({
      where: { userId }
    })
    if (pointHistories.length === 0) {
      return {
        message: "대상 유저의 포인트 사용 이력이 존재하지 않습니다.",
        data: []
      }
    }
    // 사용 총합, 충전 총합
    const pointHistoriesSum = await this.pointHistoryRepository.createQueryBuilder('ph')
      // if문이랑 같다고 생각하면 됨. ph.changes가 0보다 작으면 합침. 이걸 'used'로 반환.
      .select(`SUM(CASE WHEN ph.changes < 0 THEN ph.changes ELSE 0 END)`, 'used')
      // if문이랑 같다고 생각하면 됨. ph.changes가 0보다 크면 합침. 이걸 'charged'로 반환.
      .addSelect(`SUM(CASE WHEN ph.changes > 0 THEN ph.changes ELSE 0 END)`, 'charged')
      .where('ph.userId = :userId', { userId })
      //쿼리문의 결과가 엔티티가 아닐때는 getRaw 사용해야 함.
      .getRawOne()
    return {
      data: {
        histories: pointHistories,
        total: pointHistoriesSum
      },
      message: "대상 유저의 포인트 사용 이력을 조회합니다."
    }
  }

  async updateHubContent(contentId: number, updateHubContentDto: UpdateHubContentDto) {
    const contentExist = await this.entityLookupService.findOneOrThrow(
      this.seniorContentRepository,
      { id: contentId },
      "대상 콘텐츠가 존재하지 않습니다."
    )
    Object.assign(contentExist, updateHubContentDto)
    const saved = await this.seniorContentRepository.save(contentExist)
    return {
      data: saved,
      message: "허브 콘텐츠 수정에 성공했습니다."
    }
  }

  async deleteHubContent(contentId: number) {
    const contentExist = await this.entityLookupService.findOneOrThrow(
      this.seniorContentRepository,
      { id: contentId },
      "대상 콘텐츠가 존재하지 않습니다."
    )
    const deleteResult = await this.seniorContentRepository.delete({ id: contentId })
    if (!deleteResult || deleteResult.affected === 0) {
      throw new NotFoundException("대상 콘텐츠가 존재하지 않습니다.")
    }
    return { message: "콘텐츠 삭제에 성공했습니다." }
  }
}
