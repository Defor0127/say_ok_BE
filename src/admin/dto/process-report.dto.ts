import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ProcessReportDto {
  @ApiProperty({ description: '신고 처리 상태', enum: ['COMPLETED', 'REJECTED'] })
  @IsNotEmpty()
  @IsEnum(['COMPLETED', 'REJECTED'])
  status: 'COMPLETED' | 'REJECTED';

  @ApiProperty({ description: '처리 내용', required: false })
  @IsOptional()
  @IsString()
  action: string;
}

