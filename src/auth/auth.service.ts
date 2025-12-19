import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Users } from '@/user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    private readonly jwtService: JwtService
  ) { }

  async refreshAccessToken(refreshToken: string) {
    const decoded = this.jwtService.verify(refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET
    });
    const userId = decoded.sub;
    if (!userId) {
      throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
    }
    const user = await this.usersRepository.findOne({
      where: { id: userId }
    });
    if (!user) {
      throw new NotFoundException('대상 유저가 존재하지 않습니다.');
    }
    const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isMatch) {
      throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
    }
    const newPayload = {
      userId: user.id,
      loginEmail: user.loginEmail,
      nickname: user.nickname,
      role: user.role,
      region: user.region
    };
    const newAccessToken = this.jwtService.sign(newPayload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '2h'
    });
    return {
      message: '액세스 토큰이 재발급되었습니다.',
      data: { accessToken: newAccessToken }
    };
  }
}
