import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { ReportType } from "../enums/report-type.enum";
import { ApiProperty } from '@nestjs/swagger';

export class ReportMessageDto {
  @ApiProperty({ description: '신고 대상 메시지 ID', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  messageId: string;

  @ApiProperty({ description: '신고 타입', enum: ReportType, example: 'SPAM' })
  @IsNotEmpty()
  @IsEnum(ReportType)
  reportType: ReportType

  @ApiProperty({ description: '신고 상세 내용', example: '부적절한 행동을 했습니다.' })
  @IsNotEmpty()
  @IsString()
  reportDetail: string;
}