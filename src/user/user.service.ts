import { BadRequestException, ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './entities/user.entity';
import { In, Like, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import *as bcrypt from 'bcrypt'
import { ChangeUserStatusDto } from './dto/change-user-status.dto';
import { ChangeUserStatusItemDto } from './dto/change-user-status-item.dto';
import { EntityLookupService } from '@/common/services/entity-lookup.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    private readonly entityLookupService: EntityLookupService
  ) { }

  async getUsers() {
    const users = await this.userRepository.find({})
    return {
      data: users,
      message: "전체 사용자 정보를 조회했습니다.",
    }
  }

  async getUsersByPage(page: number, limit: number) {
    const [user, total] = await this.userRepository.createQueryBuilder('users')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return {
      message: `${user.length}개의 유저 정보를 조회했습니다.`,
      data: {
        total: total,
        user: user
      }
    }
  }

  async getUsersByStatus(status: number) {
    const users = await this.userRepository.find({
      where: { status: status }
    })
    return {
      data: users,
      message: users.length === 0 ? "대상 상태에 해당하는 유저가 없습니다" : "대상 상태에 해당하는 유저 정보를 반환합니다.",
    }
  }

  async searchUsers(keyword: string) {
    const targetUsers = await this.userRepository.find({
      where: [{ nickname: Like(`%${keyword}%`) }, { loginEmail: Like(`%${keyword}%`) }],
    })
    return {
      data: targetUsers,
      message: targetUsers.length === 0 ? "검색 결과가 없습니다" : "검색 결과를 반환합니다.",
    }
  }

  async getUserInfoByMe(userId: number) {
    const userExist = await this.entityLookupService.findOneOrThrow(
      this.userRepository,
      { id: userId },
      "해당 유저가 존재하지 않습니다."
    )
    const { loginEmail, phoneNumber, gender, birthDate, points } = userExist
    return {
      message: "내 정보를 반환합니다.",
      data: {
        loginEmail,
        phoneNumber,
        gender,
        birthDate,
        points
      }
    }

  }

  async getUserInfo(userId: number) {
    const userExist = await this.entityLookupService.findOneOrThrow(
      this.userRepository,
      { id: userId },
      "대상 유저가 존재하지 않습니다."
    )
    return {
      message: "대상 유저의 정보를 반환합니다.",
      data: userExist
    }
  }

  async createUser(createUserDto: CreateUserDto) {
    const emailExist = await this.userRepository.findOne({
      where: { loginEmail: createUserDto.loginEmail }
    })
    if (emailExist) {
      throw new ConflictException("이미 존재하는 이메일 주소입니다.")
    }
    const nicknameExist = await this.userRepository.findOne({
      where: { nickname: createUserDto.nickname }
    })
    if (nicknameExist) {
      throw new ConflictException("이미 존재하는 닉네임입니다.")
    }
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const userToCreate = await this.userRepository.create({
      ...createUserDto,
      hashedPassword: hashedPassword
    })
    const saved = await this.userRepository.save(userToCreate)
    return {
      message: "유저 생성에 성공했습니다.",
      data: saved
    }
  }

  async changeUserStatus(changeUserStatusDto: ChangeUserStatusDto & { items: ChangeUserStatusItemDto }) {
    const { status, items } = changeUserStatusDto;
    if (items.length === 0) {
      throw new BadRequestException("대상 유저가 없습니다.")
    }
    const users = []
    for (const item of items) {
      users.push(item.userId)
    }
    const updateResult = await this.userRepository.update(
      { id: In(users) },
      { status }
    )
    if (!updateResult || updateResult.affected === 0) {
      throw new InternalServerErrorException("유저 상태 변경에 실패했습니다.")
    }
    return {
      message: "유저 상태 일괄 변경에 성공했습니다."
    }
  }
}

