import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class SignUpDto {

  @ApiProperty({ description: '로그인 이메일', example: 'user@example.com' })
  @IsNotEmpty()
  @IsString()
  loginEmail: string;

  @ApiProperty({ description: '비밀번호', example: 'password123' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ description: '전화번호', example: '010-1234-5678' })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiProperty({ description: '닉네임', example: '홍길동' })
  @IsNotEmpty()
  @IsString()
  nickname: string;

  @ApiProperty({ description: '프로필 이미지 URL', example: 'https://example.com/image.jpg' })
  @IsNotEmpty()
  @IsString()
  profileImageUrl: string;

  @ApiProperty({ description: '지역', example: '서울시 강남구' })
  @IsNotEmpty()
  @IsString()
  region: string;
}