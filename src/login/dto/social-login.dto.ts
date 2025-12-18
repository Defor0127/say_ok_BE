import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SocialLoginDto {

  @ApiProperty({ description: '소셜 로그인 제공자 (예: kakao, google)' })
  @IsNotEmpty()
  @IsString()
  provider: string;

  @ApiProperty({ description: '제공자에서 발급한 사용자 ID' })
  @IsNotEmpty()
  @IsString()
  providerId: string;

  @ApiProperty({ description: '이메일' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: '이름', required: false })
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty({ description: '프로필 이미지 URL', required: false })
  @IsOptional()
  @IsString()
  image: string;
}