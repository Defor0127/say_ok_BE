import { Module } from '@nestjs/common';
import { SignupController } from './signup.controller';
import { SignupService } from './signup.service';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '@/user/entities/user.entity';

@Module({
  imports: [JwtModule, TypeOrmModule.forFeature([Users])],
  controllers: [SignupController],
  providers: [SignupService],
})
export class SignupModule {}

