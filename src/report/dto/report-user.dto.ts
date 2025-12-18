import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { ReportType } from "../enums/report-type.enum";
import { ApiProperty } from '@nestjs/swagger';

export class ReportUserDto {
  @ApiProperty({ description: '신고 대상 사용자 ID', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  reportedUserId: number;

  @ApiProperty({ description: '신고 타입', enum: ReportType, example: 'SPAM' })
  @IsNotEmpty()
  @IsEnum(ReportType)
  reportType: ReportType

  @ApiProperty({ description: '신고 상세 내용', example: '부적절한 행동을 했습니다.' })
  @IsNotEmpty()
  @IsString()
  reportDetail: string;
}