import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './config/database.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ChatModule } from './chat/chat.module';
import { ChatAllowanceModule } from './chat-allowance/chat-allowance.module';
import { AdminModule } from './admin/admin.module';
import { SignupModule } from './signup/signup.module';
import { LoginModule } from './login/login.module';
import { LogoutModule } from './logout/logout.module';
import { NoticeModule } from './guide/guide.module';
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
    ChatModule,
    ChatAllowanceModule,
    AdminModule,
    SignupModule,
    LoginModule,
    LogoutModule,
    NoticeModule,
    ReportModule,
    MatchModule,
    CommonModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

