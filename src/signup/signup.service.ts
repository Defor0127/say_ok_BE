import { Users } from '@/user/entities/user.entity';
import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { SignUpDto } from './dto/signup.dto';
import { InjectRepository } from '@nestjs/typeorm';
import *as bcrypt from 'bcrypt'

@Injectable()
export class SignupService {

  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>
  ) { }

  async signUp(signUpDto: SignUpDto) {
      const userExist = await this.usersRepository.findOne({
        where: { loginEmail: signUpDto.loginEmail }
      })
      if(userExist) {
        throw new ConflictException("이미 사용중인 이메일 주소입니다.")
      }
      const nickNameExist = await this.usersRepository.findOne({
        where : { nickname: signUpDto.nickname }
      })
      if(nickNameExist) {
        throw new ConflictException("이미 사용중인 닉네임입니다.")
      }
      const hashedPassword = await bcrypt.hash(signUpDto.password, 10);
      const userToCreate = await this.usersRepository.save({
        ...signUpDto,
        hashedPassword: hashedPassword
      })
      if(!userToCreate) {
        throw new InternalServerErrorException("서버 에러가 발생했습니다.")
      }
      return {
        message: "회원가입에 성공했습니다.",
        data: userToCreate
      }
  }
}