import { Module } from '@nestjs/common';
import { LogoutController } from './logout.controller';
import { LogoutService } from './logout.service';
import { Users } from '@/user/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from '@/common/strategies/jwt.strategy';

@Module({
  imports: [TypeOrmModule.forFeature([Users]),],
  controllers: [LogoutController],
  providers: [LogoutService, JwtStrategy,],
})
export class LogoutModule {}

