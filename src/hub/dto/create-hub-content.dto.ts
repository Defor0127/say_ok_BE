import { CategoryType } from "@/category/enum/category-type.enum";
import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateHubContentDto {
  @ApiProperty({ description: '콘텐츠 제목' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: '콘텐츠 내용' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({ description: '카테고리 ID' })
  @IsNumber()
  categoryId: number;
}

