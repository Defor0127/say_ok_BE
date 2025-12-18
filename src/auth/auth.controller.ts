import { Controller, Get, Req, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth } from '@nestjs/swagger';

@ApiTags('인증 - 토큰')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Get()
  @ApiOperation({ summary: '액세스 토큰 갱신', description: '리프레시 토큰으로 액세스 토큰을 갱신합니다.' })
  @ApiCookieAuth('refreshToken')
  @ApiResponse({ status: 200, description: '토큰 갱신 성공' })
  @ApiResponse({ status: 401, description: '유효하지 않은 리프레시 토큰' })
  async refreshAccessToken(
    @Req() req: Request,
  ) {
    const refreshToken = req.cookies['refreshToken']
    if (!refreshToken) {
      throw new UnauthorizedException('리프레시 토큰이 존재하지 않습니다.')
    }
    return this.authService.refreshAccessToken(refreshToken)
  }
}

