import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '@/user/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) { }

  async getProfile(userId: number) {
    try {
      const userToGet = await this.usersRepository.findOne({
        where: { id: userId }
      })
      if (!userToGet) {
        throw new NotFoundException("대상 유저가 존재하지 않습니다.")
      }
      const result = [];
      result.push({
        nickname: userToGet.nickname,
        introduction: userToGet.introduction,
        profileImageUrl: userToGet.profileImageUrl,
        region: userToGet.region
      })
      return {
        message: "대상 유저의 프로필 정보를 조회하였습니다.",
        data: result
      }
    } catch (error) {
      throw new InternalServerErrorException("서버 에러가 발생했습니다.")
    }
  }

  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto, myId: number) {
    try {
      if (userId !== myId) {
        throw new ForbiddenException("본인의 프로필만 수정할 수 있습니다.")
      }
      const userToUpdate = await this.usersRepository.findOne({
        where: { id: userId }
      })
      if (!userToUpdate) {
        throw new NotFoundException("대상 유저가 존재하지 않습니다.")
      }
      Object.assign(userToUpdate, updateProfileDto)
      const saved = await this.usersRepository.save(userToUpdate)
      const result = [];
      result.push({
        nickname: saved.nickname,
        introduction: saved.introduction,
        profileImageUrl: saved.profileImageUrl,
        region: saved.region
      })
      return {
        message: "프로필을 수정했습니다.",
        data: result
      }
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException("서버 에러가 발생했습니다.")
    }
  }
}
