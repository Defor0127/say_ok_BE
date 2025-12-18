import { IsEnum, IsNotEmpty, IsNumber } from "class-validator";
import { ReportType } from "@/report/enums/report-type.enum";

export class ReportUserDto {

  @IsNotEmpty()
  @IsNumber()
  userIdToReport: number

  @IsNotEmpty()
  @IsEnum(ReportType)
  reportType: ReportType;

  reportDetail: string;
}