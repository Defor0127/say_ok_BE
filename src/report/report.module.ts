import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { UserReported } from '@/user/entities/user-reported.entity';
import { Users } from '@/user/entities/user.entity';
import { UserSuspension } from '@/user/entities/user-suspension.entity';
import { CommonModule } from '@/common/common.module';
import { ChatRoomMessage } from '@/chat/entities/chatroom-message.enity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserReported, Users, UserSuspension,ChatRoomMessage]),
    CommonModule,
  ],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}

