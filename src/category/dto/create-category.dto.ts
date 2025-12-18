import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { CategoryType } from "../enum/category-type.enum";
import { ApiProperty } from "@nestjs/swagger";

export class CreateCategoryDto {
  @ApiProperty({ description: '카테고리명' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: '카테고리 유형', enum: CategoryType })
  @IsNotEmpty()
  @IsEnum(CategoryType)
  type: CategoryType;
}

