import { IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateProfileDto  {

  @ApiProperty({ description: '닉네임', required: false })
  @IsOptional()
  @IsString()
  nickname: string;

  @ApiProperty({ description: '프로필 이미지 URL', required: false })
  @IsOptional()
  @IsString()
  profileImageUrl: string;

  @ApiProperty({ description: '자기소개', required: false })
  @IsOptional()
  @IsString()
  introduction: string;
}