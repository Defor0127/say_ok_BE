import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '@/user/entities/user.entity';
import { Post } from '@/post/entities/post.entity';
import { Club } from '@/club/entities/club.entity';
import { ChatRoom } from '@/chat/entities/chatroom.entity';
import { ChatRoomUser } from '@/chat/entities/chatroom-user.entity';
import { ClubMember } from '@/club/entities/club-member.entity';
import { ClubScheduleMember } from '@/club/entities/club-schedule-member.entity';
import { ClubSchedule } from '@/club/entities/club-schedule.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Users,Club,ChatRoom,ChatRoomUser,ClubMember,ClubScheduleMember,ClubSchedule])],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
