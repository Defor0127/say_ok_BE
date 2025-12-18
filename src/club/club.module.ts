import { Module } from '@nestjs/common';
import { ClubController } from './club.controller';
import { ClubService } from './club.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Club } from './entities/club.entity';
import { Users } from '@/user/entities/user.entity';
import { ClubMember } from './entities/club-member.entity';
import { ClubSchedule } from './entities/club-schedule.entity';
import { ClubBanMember } from './entities/club-ban-member.entity';
import { ClubScheduleMember } from './entities/club-schedule-member.entity';
import { ChatRoom } from '@/chat/entities/chatroom.entity';
import { ChatRoomUser } from '@/chat/entities/chatroom-user.entity';
import { ClubChatRoom } from './entities/club-chat-room.entity';
import { ClubChatRoomMember } from './entities/club-chat-room-member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Club, Users, ClubMember, ClubSchedule, ClubBanMember, ClubScheduleMember, ClubChatRoom, ChatRoom, ChatRoomUser,ClubChatRoomMember])],
  controllers: [ClubController],
  providers: [ClubService],
})
export class ClubModule { }

