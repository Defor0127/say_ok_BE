import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Users } from '@/user/entities/user.entity';
import { UserReported } from '@/user/entities/user-reported.entity';
import { ChatAllowanceHistory } from '@/chat-allowance/entities/chat-allowance-history.entity';
import { ChatRoom } from '@/chat/entities/chatroom.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Users,
      UserReported,
      ChatAllowanceHistory,
      ChatRoom,
    ])
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}

