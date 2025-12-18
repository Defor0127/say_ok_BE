import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { LogoutService } from './logout.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { Response } from 'express';
import { User } from '@/common/decorators/user.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('인증 - 로그아웃')
@Controller('logout')
export class LogoutController {
  constructor(private readonly logoutService: LogoutService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '로그아웃', description: '로그아웃합니다.' })
  @ApiResponse({ status: 200, description: '로그아웃 성공' })
  async logout(
    @Res() res: Response,
    @User('loginEmail') loginEmail: string
  ){
    res.clearCookie('refreshToken')
    const result = await this.logoutService.logout(loginEmail)
    return res.json(result)
  }
}

