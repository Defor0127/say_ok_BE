import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '@/user/entities/user.entity';
import { ChatRoomUser } from './entities/chatroom-user.entity';
import { ChatRoom } from './entities/chatroom.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Users,ChatRoomUser,ChatRoom])],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}

