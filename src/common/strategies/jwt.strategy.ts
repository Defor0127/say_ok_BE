import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET 환경변수가 설정되지 않았습니다.');
    }
    
    const options: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    };
    super(options);
  }

  async validate(payload: { userId: number; loginEmail: string; nickname: string; role: string, region: string; }) {
    return { userId: payload.userId, loginEmail: payload.loginEmail, nickname: payload.nickname, role: payload.role, region: payload.region };
  }
}