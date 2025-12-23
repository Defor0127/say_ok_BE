import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateGuideDto {
  @ApiProperty({ description: '이용안내 제목' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: '이용안내 내용' })
  @IsNotEmpty()
  @IsString()
  content: string;

}

