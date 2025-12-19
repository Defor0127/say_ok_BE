import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class ChargePointDto {
  @ApiProperty({ description: '사용자 ID', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiProperty({ description: '충전 포인트', example: 1000 })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({ description: '결제 ID', example: 12345, required: false })
  @IsOptional()
  @IsNumber()
  paymentId: number;

  @ApiProperty({ description: '충전 사유', example: '포인트 충전' })
  @IsNotEmpty()
  @IsString()
  chargeReason: string;
}

