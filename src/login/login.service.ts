import { Users } from '@/user/entities/user.entity';
import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt'
import { SocialLoginDto } from './dto/social-login.dto';

@Injectable()
export class LoginService {

  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    private readonly jwtService: JwtService
  ) { }

  async login(loginDto: LoginDto) {
    const loggedInUser = await this.usersRepository.findOne({
      where: { loginEmail: loginDto.loginEmail }
    })
    if (!loggedInUser) {
      throw new NotFoundException("대상 유저가 존재하지 않습니다.")
    }
    const isMatch = await bcrypt.compare(loginDto.password, loggedInUser.hashedPassword)
    if (!isMatch) {
      throw new UnauthorizedException("비밀번호가 일치하지 않습니다.")
    }
    const payload = { userId: loggedInUser.id, loginEmail: loggedInUser.loginEmail, nickname: loggedInUser.nickname, role: loggedInUser.role, region: loggedInUser.region };
    const accessToken = await this.jwtService.sign(payload, { secret: process.env.JWT_SECRET, expiresIn: '2h' }) // 개발중엔 2시간으로 원래는 30분
    const refreshToken = await this.jwtService.sign({ sub: loggedInUser.id }, { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '2h' })
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    const updateResult = await this.usersRepository.update({ id: loggedInUser.id }, { refreshToken: hashedRefreshToken })
    if (!updateResult || updateResult.affected === 0) {
      throw new InternalServerErrorException("로그인이 실패하였습니다.")
    }
    return {
      message: "토큰 발급에 성공했습니다.",
      data: {
        accessToken,
        refreshToken
      }
    }
  }

  async socialLogin(socialLoginDto: SocialLoginDto) {
    const loggedInUser = await this.usersRepository.findOne({
      where: { loginEmail: socialLoginDto.email }
    })
    if (!loggedInUser) {
      throw new NotFoundException("대상 유저가 존재하지 않습니다.")
    }
  }
}

