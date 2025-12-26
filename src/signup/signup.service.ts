import { Users } from '@/user/entities/user.entity';
import { BadRequestException, ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
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
      const isMan = ['1','3']
      const isWoman = ['2','4']
      let userGender;
      const genderNumber = signUpDto.registrationNumber.slice(-1)
      if(isMan.includes(genderNumber)){
        userGender = 'MAN'
      }else if(isWoman.includes(genderNumber)){
        userGender = 'WOMAN'
      }else {
        throw new BadRequestException("잘못된 주민등록번호 형식입니다.")
      }
      const userToCreate = await this.usersRepository.save({
        ...signUpDto,
        gender: userGender,
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