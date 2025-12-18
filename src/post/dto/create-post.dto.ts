import { IsBoolean, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {

  @ApiProperty({ description: '카테고리 ID', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  categoryId: number;

  @ApiProperty({ description: '사용자 ID', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiProperty({ description: '게시글 제목', example: '제목입니다' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: '게시글 내용', example: '내용입니다' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({ description: '공개 여부', example: true })
  @IsNotEmpty()
  @IsBoolean()
  isPublic: boolean;
}