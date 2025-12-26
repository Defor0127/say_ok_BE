import { IsOptional, isString, IsString } from "class-validator";

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    nickName: string

    @IsOptional()
    @IsString()
    region: string;

    @IsOptional()
    @IsString()
    introduction:string
}