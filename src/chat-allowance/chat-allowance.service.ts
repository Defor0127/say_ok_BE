import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Users } from '@/user/entities/user.entity';
import { ChatAllowanceHistory } from './entities/chat-allowance-history.entity';
import { ChargeChatAllowanceByPackageDto } from './dto/charge-chat-allowance-by-package.dto';
import { ChatAllowancePackage } from './entities/chat-allowance-package.entity';
import { CreateChatAllowancePackageDto } from './dto/create-chat-allowance-package.dto';
import { UpdateChatAllowancePackageDto } from './dto/update-chat-allowance-package.dto';

@Injectable()
export class ChatAllowanceService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    @InjectRepository(ChatAllowanceHistory)
    private readonly chatAllowanceHistoryRepository: Repository<ChatAllowanceHistory>,
    @InjectRepository(ChatAllowancePackage)
    private readonly chatAllowancePackageRepository: Repository<ChatAllowancePackage>,
    private readonly dataSource: DataSource
  ) { }

  async chargeChatAllowanceByPackage(userId: number, chargeChatAllowanceByPackageDto: ChargeChatAllowanceByPackageDto) {
    if (chargeChatAllowanceByPackageDto.userId !== userId) {
      throw new ForbiddenException("본인의 채팅 허용권만 충전할 수 있습니다.")
    }
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const userRepo = queryRunner.manager.getRepository(Users)
      const chatAllowanceHistoryRepo = queryRunner.manager.getRepository(ChatAllowanceHistory)
      const chatAllowancePackageRepo = queryRunner.manager.getRepository(ChatAllowancePackage)
      const chatAllowancePackage = await chatAllowancePackageRepo.findOne({
        where: { id: chargeChatAllowanceByPackageDto.packageId }
      })
      if (!chatAllowancePackage) {
        throw new NotFoundException("채팅 허용권 패키지를 찾을 수 없습니다.")
      }
      const user = await userRepo.findOne({
        where: { id: chargeChatAllowanceByPackageDto.userId },
        lock: { mode: 'pessimistic_write' }
      })
      if (!user) {
        throw new NotFoundException("대상 유저가 존재하지 않습니다.")
      }
      const currentPoints = user.points;
      await userRepo.increment(
        { id: userId },
        'allowance',
        chatAllowancePackage.allowanceCharge
      )
      const chatAllowanceHistory = chatAllowanceHistoryRepo.create({
        userId: chargeChatAllowanceByPackageDto.userId,
        paymentId: chargeChatAllowanceByPackageDto.paymentId,
        changes: chatAllowancePackage.allowanceCharge,
        charge: `패키지 충전: ${chatAllowancePackage.title} (${chatAllowancePackage.allowanceCharge}채팅 허용권)`
      })
      await chatAllowanceHistoryRepo.save(chatAllowanceHistory)
      await queryRunner.commitTransaction();
      return {
        data: {
          userId: user.id,
          points: currentPoints + chatAllowancePackage.allowanceCharge,
          package: {
            id: chatAllowancePackage.id,
            title: chatAllowancePackage.title,
            allowanceCharge: chatAllowancePackage.allowanceCharge,
            requireCash: chatAllowancePackage.requireCash
          }
        },
        message: "채팅 허용권 패키지 충전에 성공했습니다."
      }
    } catch (error) {
      await queryRunner.rollbackTransaction()
      if (error instanceof NotFoundException || error instanceof ForbiddenException) throw error;
      throw new InternalServerErrorException("서버 에러가 발생했습니다.")
    } finally {
      await queryRunner.release()
    }
  }

  async getChatAllowanceHistories(userId: number, myId: number) {
    if (userId !== myId) {
      throw new ForbiddenException("내 채팅 허용권 사용이력만 조회할 수 있습니다.")
    }
    const historiesToGet = await this.chatAllowanceHistoryRepository.createQueryBuilder('ph')
      .where('ph.userId = :userId', { userId })
      .orderBy('ph.createdAt', 'DESC')
      .getRawMany()
    return {
      data: historiesToGet,
      message: historiesToGet.length === 0 ? "대상 유저의 채팅 허용권 사용기록이 없습니다." : "대상 유저의 채팅 허용권 사용 기록을 전부 조회하였습니다."
    }
  }

  async getCurrentChatAllowance(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    })
    if (!user) {
      throw new NotFoundException("대상 유저가 존재하지 않습니다.")
    }
    return {
      data: {
        userId: user.id,
        allowance: user.chatAllowance
      },  
      message: "현재 보유 채팅 허용권을 조회했습니다."
    }
  }

  async createChatAllowancePackage(createChatAllowancePackageDto: CreateChatAllowancePackageDto) {
    const packageToCreate = this.chatAllowancePackageRepository.create({
      ...createChatAllowancePackageDto
    })
    const saved = await this.chatAllowancePackageRepository.save(packageToCreate)
    return {
      message: "채팅 허용권 패키지 생성에 성공했습니다.",
      data: saved
    }
  }

  async getChatAllowancePackages() {
    const packages = await this.chatAllowancePackageRepository.find({
      order: { requireCash: 'ASC' }
    })
    return {
      data: packages,
      message: packages.length === 0 ? "만들어진 채팅 허용권 패키지가 없습니다." : "채팅 허용권 패키지 목록을 반환합니다."
    }
  }

  async updateChatAllowancePackage(packageId: number, updateChatAllowancePackageDto: UpdateChatAllowancePackageDto) {
    const packageToUpdate = await this.chatAllowancePackageRepository.findOne({
      where: { id: packageId }
    })
    if (!packageToUpdate) {
      throw new NotFoundException("대상 패키지가 존재하지 않습니다.")
    }
    Object.assign(packageToUpdate, updateChatAllowancePackageDto)
    const saved = await this.chatAllowancePackageRepository.save(packageToUpdate)
    return {
      message: "대상 패키지 정보 수정에 성공했습니다.",
      data: saved
    }
  }

  async deleteChatAllowancePackage(packageId: number) {
    const deleteResult = await this.chatAllowancePackageRepository.delete({
      id: packageId
    })
    if (!deleteResult) {
      throw new NotFoundException("대상 패키지가 존재하지 않습니다.")
    }
    return {
      message: "대상 패키지 삭제에 성공했습니다.",
    }
  }

  async getChatAllowancePackage(packageId: number) {
    const packageToGet = await this.chatAllowancePackageRepository.findOne({
      where: { id: packageId }
    })
    if (!packageToGet) {
      throw new NotFoundException("대상 패키지가 존재하지 않습니다.")
    }
    return {
      message: "대상 패키지를 조회하였습니다",
      data: packageToGet
    }
  }
}

