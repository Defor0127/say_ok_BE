import { Controller, Post, UseGuards, Res, Body, Get, Req } from '@nestjs/common';
import { LoginService } from './login.service';
import { LoginDto } from './dto/login.dto';
import { Response, Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('인증 - 로그인')
@Controller('login')
export class LoginController {
  constructor(private readonly loginService: LoginService) { }

  @Post()
  @ApiOperation({ summary: '로그인', description: '이메일과 비밀번호로 로그인합니다.' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: '로그인 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const { accessToken, refreshToken } = (await this.loginService.login(loginDto)).data;
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24, // 24시간
    });
    return {
      message: "로그인이 성공했습니다.",
      data: accessToken
    }
  }
}
