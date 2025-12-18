import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { ClubType } from "../enum/club-type.enum";
import { ApiProperty } from "@nestjs/swagger";

export class CreateScheduleDto {
  @ApiProperty({ description: '카테고리 ID' })
  @IsNotEmpty()
  @IsNumber()
  categoryId: number;

  @ApiProperty({ description: '시작 일시 (ISO 8601 형식)' })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: '종료 일시 (ISO 8601 형식)' })
  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @ApiProperty({ description: '장소' })
  @IsNotEmpty()
  @IsString()
  place: string;

  @ApiProperty({ description: '일정 제목' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: '일정 내용' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({ description: '모임 유형', enum: ClubType })
  @IsNotEmpty()
  @IsEnum(ClubType)
  type: ClubType;

  @ApiProperty({ description: '가격', required: false })
  @IsOptional()
  @IsNumber()
  price: number;

  @ApiProperty({ description: '최대 참석 인원' })
  @IsNotEmpty()
  @IsNumber()
  maxAttendee: number;
}