import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {

  @ApiProperty({ description: '로그인 이메일', example: 'user@example.com' })
  @IsNotEmpty()
  @IsString()
  loginEmail: string;

  @ApiProperty({ description: '비밀번호', example: 'password123' })
  @IsNotEmpty()
  @IsString()
  password: string;
}