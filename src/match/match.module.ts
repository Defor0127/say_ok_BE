import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchService } from './match.service';
import { MatchController } from './match.controller';
import { MatchTicket } from './entities/match-ticket.entity';
import { MatchSession } from './entities/match-session.entity';
import { Users } from '@/user/entities/user.entity';
import { ChatRoom } from '@/chat/entities/chatroom.entity';
import { ChatRoomUser } from '@/chat/entities/chatroom-user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Users,
      MatchTicket,
      MatchSession,
      ChatRoom,
      ChatRoomUser,
    ]),
  ],
  controllers: [MatchController],
  providers: [MatchService],
})
export class MatchModule {}
