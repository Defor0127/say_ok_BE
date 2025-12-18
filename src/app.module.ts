import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './config/database.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';
import { CategoryModule } from './category/category.module';
import { ClubModule } from './club/club.module';
import { ChatModule } from './chat/chat.module';
import { HubModule } from './hub/hub.module';
import { FaqModule } from './faq/faq.module';
import { PointModule } from './point/point.module';
import { AdminModule } from './admin/admin.module';
import { SignupModule } from './signup/signup.module';
import { LoginModule } from './login/login.module';
import { LogoutModule } from './logout/logout.module';
import { NoticeModule } from './notice/notice.module';
import { ProfileModule } from './profile/profile.module';
import { ReportModule } from './report/report.module';
import { MatchModule } from './match/match.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    UserModule,
    PostModule,
    CommentModule,
    CategoryModule,
    ClubModule,
    ChatModule,
    HubModule,
    FaqModule,
    PointModule,
    AdminModule,
    SignupModule,
    LoginModule,
    LogoutModule,
    NoticeModule,
    ProfileModule,
    ReportModule,
    MatchModule,
    CommonModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

