import { Module } from '@nestjs/common';
import { LoginController } from './login.controller';
import { LoginService } from './login.service';
import { UserModule } from '@/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '@/user/entities/user.entity';
import { AuthModule } from '@/auth/auth.module';



@Module({
  imports: [
    TypeOrmModule.forFeature([Users]),
    UserModule,
    AuthModule
  ],
  controllers: [LoginController],
  providers: [LoginService],
})
export class LoginModule { }

