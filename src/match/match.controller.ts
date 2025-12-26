import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { MatchService } from './match.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { User } from '@/common/decorators/user.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('매칭')
@Controller('match')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Post('ticket')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '랜덤 채팅 시작', description: '랜덤 채팅 매칭을 시작합니다. 무료 횟수 또는 포인트를 사용합니다.' })
  @ApiResponse({ status: 200, description: '매칭 시작 성공 (대기 중 또는 매칭 완료)' })
  @ApiResponse({ status: 400, description: '무료 횟수 소진 및 포인트 부족' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '유저를 찾을 수 없음' })
  @ApiResponse({ status: 409, description: '이미 매칭 중인 유저' })
  async startRandomChat(
    @User('userId') userId: number
  ) {
    return this.matchService.startRandomChat(userId);
  }

  @Get('ticket/:ticketId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '티켓 상태 확인', description: '매칭 티켓의 현재 상태를 확인합니다.' })
  @ApiParam({ name: 'ticketId', description: '티켓 ID' })
  @ApiResponse({ status: 200, description: '티켓 상태 조회 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 없음 (본인의 티켓만 조회 가능)' })
  @ApiResponse({ status: 404, description: '티켓을 찾을 수 없음' })
  async getTicketStatus(
    @User('userId') userId: number,
    @Param('ticketId') ticketId: string,
  ) {
    return this.matchService.getTicketStatus(userId, ticketId);
  }

  @Delete('ticket/:ticketId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '티켓 취소', description: '매칭 대기 중인 티켓을 취소합니다. 사용한 포인트는 환불됩니다.' })
  @ApiParam({ name: 'ticketId', description: '티켓 ID' })
  @ApiResponse({ status: 200, description: '티켓 취소 성공' })
  @ApiResponse({ status: 400, description: '대기 중인 티켓만 취소 가능' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 없음 (본인의 티켓만 취소 가능)' })
  @ApiResponse({ status: 404, description: '티켓을 찾을 수 없음' })
  async cancelTicket(
    @User('userId') userId: number,
    @Param('ticketId') ticketId: string,
  ) {
    return this.matchService.cancelTicket(userId, ticketId);
  }
}
