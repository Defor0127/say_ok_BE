import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '@/user/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '@/common/strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users]),
    PassportModule.register({ session: false }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      // jwt.sign의 기본값 지정
      signOptions: { expiresIn: '15m' }
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtModule, PassportModule]
})
export class AuthModule { }

