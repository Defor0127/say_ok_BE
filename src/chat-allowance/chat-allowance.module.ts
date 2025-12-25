import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatAllowanceController } from './chat-allowance.controller';
import { ChatAllowanceService } from './chat-allowance.service';
import { Users } from '@/user/entities/user.entity';
import { ChatAllowanceHistory } from './entities/chat-allowance-history.entity';
import { ChatAllowancePackage } from './entities/chat-allowance-package.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Users, ChatAllowanceHistory, ChatAllowancePackage])],
  controllers: [ChatAllowanceController],
  providers: [ChatAllowanceService],
})
export class ChatAllowanceModule {}

