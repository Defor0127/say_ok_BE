import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateNoticeDto {
  @ApiProperty({ description: '공지사항 제목' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: '공지사항 내용' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({ description: '공지사항 카테고리' })
  @IsNotEmpty()
  @IsString()
  category: string;
}

