import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('앱')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: '헬로 월드', description: '기본 헬로 월드 메시지를 반환합니다.' })
  @ApiResponse({ status: 200, description: '성공' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({ summary: '헬스 체크', description: '서버 상태를 확인합니다.' })
  @ApiResponse({ status: 200, description: '서버 정상 작동' })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}

