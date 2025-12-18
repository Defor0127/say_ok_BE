import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { PointReason } from "../enum/point-reason.enum";
import { ApiProperty } from "@nestjs/swagger";

export class UsePointDto {
  @ApiProperty({ description: '사용자 ID' })
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiProperty({ description: '사용할 포인트 금액' })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({ description: '포인트 사용 사유' })
  @IsNotEmpty()
  @IsString()
  useReason: string;
}

