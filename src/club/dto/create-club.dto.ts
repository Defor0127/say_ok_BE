import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { ClubType } from "../enum/club-type.enum";
import { ClubJoinMode } from "../enum/club-join-mode.enum";
import { ApiProperty } from '@nestjs/swagger';

export class CreateClubDto {
  @ApiProperty({ description: '모임명', example: '등산 모임' })
  @IsNotEmpty()
  @IsString()
  clubName: string;

  @ApiProperty({ description: '카테고리 ID', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  categoryId:number;

  @ApiProperty({ description: '지역', example: '서울시 강남구' })
  @IsNotEmpty()
  @IsString()
  region: string;

  @ApiProperty({ description: '모임 유형', enum: ClubType, example: 'FREE' })
  @IsNotEmpty()
  @IsEnum(ClubType)
  type: ClubType;

  @ApiProperty({ description: '가입 모드', enum: ClubJoinMode, example: 'AUTO' })
  @IsNotEmpty()
  @IsEnum(ClubJoinMode)
  joinMode: ClubJoinMode;

  @ApiProperty({ description: '모임 소개', example: '등산을 좋아하는 분들 모임입니다.' })
  @IsNotEmpty()
  @IsString()
  introduction: string;
}