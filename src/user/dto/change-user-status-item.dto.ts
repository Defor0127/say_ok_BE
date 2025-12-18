import { IsNotEmpty, IsNumber, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ChangeUserStatusItemDto {
  @ApiProperty({ description: '사용자 ID' })
  @IsNotEmpty()
  @IsNumber()
  userId: number;
}