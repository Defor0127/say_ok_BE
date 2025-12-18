import { Type } from "class-transformer";
import { ChangeUserStatusItemDto } from "./change-user-status-item.dto";
import { IsArray, IsNotEmpty, IsNumber, ValidateNested } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ChangeUserStatusDto {
  @ApiProperty({ description: '변경할 상태 (1: 정상, 2: 경고, 0: 정지)' })
  @IsNotEmpty()
  @IsNumber()
  status: number

  @ApiProperty({ description: '상태를 변경할 사용자 목록', type: [ChangeUserStatusItemDto] })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChangeUserStatusItemDto)
  items: ChangeUserStatusItemDto[]
}