import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateFaqDto {
  @ApiProperty({ description: 'FAQ 카테고리 ID' })
  @IsNotEmpty()
  @IsNumber()
  categoryId: number;

  @ApiProperty({ description: '질문' })
  @IsNotEmpty()
  @IsString()
  question: string;

  @ApiProperty({ description: '답변' })
  @IsNotEmpty()
  @IsString()
  answer: string;
}