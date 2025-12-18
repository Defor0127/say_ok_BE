import { Users } from '@/user/entities/user.entity';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class LogoutService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ){}

  async logout(loginEmail: string){
    try{
      const logoutUser = await this.usersRepository.findOne({
        where: { loginEmail: loginEmail }
      })
      if(!logoutUser){
        throw new NotFoundException("대상 유저가 존재하지 않습니다.")
      }
      const updateResult = await this.usersRepository.update(
        { loginEmail: loginEmail }, { refreshToken: null }
      )
      if(!updateResult || updateResult.affected === 0){
        throw new InternalServerErrorException("로그아웃에 실패하였습니다.")
      }
      return {
        message: "로그아웃에 성공하였습니다."
      }
    }catch(error){
      throw new InternalServerErrorException("서버 에러가 발생했습니다.")
    }
  }
}



