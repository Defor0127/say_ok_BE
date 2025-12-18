import { IsNumber, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateClubDto {
  @ApiProperty({ description: '카테고리 ID', required: false })
  @IsOptional()
  @IsNumber()
  categoryId: number;

  @ApiProperty({ description: '모임명', required: false })
  @IsOptional()
  @IsString()
  clubName: string;

  @ApiProperty({ description: '지역', required: false })
  @IsOptional()
  @IsString()
  region: string;
}