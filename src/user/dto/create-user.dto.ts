import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Role } from "../enum/role.enum";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
  @ApiProperty({ description: '로그인 이메일' })
  @IsNotEmpty()
  @IsString()
  loginEmail: string;

  @ApiProperty({ description: '비밀번호' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ description: '전화번호' })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiProperty({ description: '닉네임' })
  @IsNotEmpty()
  @IsString()
  nickname: string;

  @ApiProperty({ description: '프로필 이미지 URL', required: false })
  @IsOptional()
  @IsString()
  profileImageUrl: string;

  @ApiProperty({ description: '지역' })
  @IsNotEmpty()
  @IsString()
  region: string;

  @ApiProperty({ description: '사용자 역할', enum: Role, required: false })
  @IsOptional()
  @IsEnum(Role)
  role: Role;
}