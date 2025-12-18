import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateCommentDto {
  @ApiProperty({ description: '댓글 내용', required: false })
  @IsOptional()
  @IsString()
  content: string
}