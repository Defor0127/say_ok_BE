import { IsNotEmpty, IsNumber } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class PostSaveDto {

    @ApiProperty({ description: '사용자 ID', example: 1 })
    @IsNotEmpty()
    @IsNumber()
    userId: number;
}

