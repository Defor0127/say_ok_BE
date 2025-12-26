import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateChatAllowancePackageDto {
  @ApiProperty({ description: '패키지 제목' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: '패키지 설명' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ description: '충전 채팅 권한' })
  @IsNotEmpty()
  @IsNumber()
  allowanceCharge: number;

  @ApiProperty({ description: '필요한 현금' })
  @IsNotEmpty()
  @IsNumber()
  requireCash: number;
}

