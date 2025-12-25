import { IsNotEmpty, IsNumber } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class ChargeChatAllowanceByPackageDto {
  @ApiProperty({ description: '사용자 ID', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiProperty({ description: '패키지 ID', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  packageId: number;

  @ApiProperty({ description: '결제 ID', example: 12345, required: false })
  @IsNumber()
  paymentId: number;
}

