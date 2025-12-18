import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { ClubType } from "../enum/club-type.enum";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateScheduleDto {
  @ApiProperty({ description: '카테고리 ID', required: false })
  @IsOptional()
  @IsNumber()
  categoryId: number;

  @ApiProperty({ description: '시작 일시 (ISO 8601 형식)', required: false })
  @IsOptional()
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: '종료 일시 (ISO 8601 형식)', required: false })
  @IsOptional()
  @IsDateString()
  endDate: string;

  @ApiProperty({ description: '장소', required: false })
  @IsOptional()
  @IsString()
  place: string;

  @ApiProperty({ description: '일정 제목', required: false })
  @IsOptional()
  @IsString()
  title: string;

  @ApiProperty({ description: '일정 내용', required: false })
  @IsOptional()
  @IsString()
  content: string;

  @ApiProperty({ description: '가격', required: false })
  @IsOptional()
  @IsNumber()
  price: number;

  @ApiProperty({ description: '최대 참석 인원', required: false })
  @IsOptional()
  @IsNumber()
  maxAttendee: number;
}