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

  @Post('call/:matchSessionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '통화 생성', description: '매칭 세션에서 통화를 요청합니다.' })
  @ApiParam({ name: 'matchSessionId', description: '매칭 세션 ID' })
  @ApiResponse({ status: 200, description: '통화 요청 생성 성공' })
  @ApiResponse({ status: 400, description: '활성화된 매칭 세션이 아님' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 없음 (매칭 세션의 당사자가 아님)' })
  @ApiResponse({ status: 404, description: '매칭 세션을 찾을 수 없음' })
  @ApiResponse({ status: 409, description: '이미 진행 중이거나 요청 중인 통화가 있음' })
  async createCall(
    @User('userId') userId: number,
    @Param('matchSessionId') matchSessionId: string,
  ) {
    return this.matchService.createCall(userId, matchSessionId);
  }

  @Get('call/:matchSessionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '활성 통화 조회', description: '매칭 세션의 활성 통화 상태를 조회합니다.' })
  @ApiParam({ name: 'matchSessionId', description: '매칭 세션 ID' })
  @ApiResponse({ status: 200, description: '활성 통화 상태 조회 성공' })
  @ApiResponse({ status: 400, description: '활성화된 매칭 세션이 아님' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 없음 (매칭 세션의 당사자가 아님)' })
  @ApiResponse({ status: 404, description: '매칭 세션을 찾을 수 없음' })
  async getActiveCall(
    @User('userId') userId: number,
    @Param('matchSessionId') matchSessionId: string,
  ) {
    return this.matchService.getActiveCall(userId, matchSessionId);
  }

  @Post('call/:callSessionId/accept')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '통화 수락', description: '통화 요청을 수락하고 통화를 시작합니다. 10포인트가 선차감됩니다.' })
  @ApiParam({ name: 'callSessionId', description: '통화 세션 ID' })
  @ApiResponse({ status: 200, description: '통화 수락 성공' })
  @ApiResponse({ status: 400, description: '포인트 부족 또는 수락할 수 없는 통화 상태' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 없음 (수락 권한이 없음)' })
  @ApiResponse({ status: 404, description: '통화 세션 또는 참가자 정보를 찾을 수 없음' })
  @ApiResponse({ status: 409, description: '수락할 수 없는 통화 상태' })
  async acceptCall(
    @User('userId') userId: number,
    @Param('callSessionId') callSessionId: string,
  ) {
    return this.matchService.acceptCall(userId, callSessionId);
  }

  @Post('call/:callSessionId/decline')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '통화 거절', description: '통화 요청을 거절합니다.' })
  @ApiParam({ name: 'callSessionId', description: '통화 세션 ID' })
  @ApiResponse({ status: 200, description: '통화 거절 성공' })
  @ApiResponse({ status: 400, description: '요청 중인 통화만 거절 가능' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 없음 (거절 권한이 없음)' })
  @ApiResponse({ status: 404, description: '통화 세션을 찾을 수 없음' })
  async declineCall(
    @User('userId') userId: number,
    @Param('callSessionId') callSessionId: string,
  ) {
    return this.matchService.declineCall(userId, callSessionId);
  }

  @Post('call/:callSessionId/heartbeat')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '통화 하트비트', description: '통화 중 하트비트를 전송하고 과금을 처리합니다. 통화 진행 중 주기적으로 호출해야 합니다.' })
  @ApiParam({ name: 'callSessionId', description: '통화 세션 ID' })
  @ApiResponse({ status: 200, description: '하트비트 전송 성공' })
  @ApiResponse({ status: 400, description: '포인트 부족으로 통화 종료' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 없음 (통화 세션의 당사자가 아님)' })
  @ApiResponse({ status: 404, description: '통화 세션 또는 참가자 정보를 찾을 수 없음' })
  @ApiResponse({ status: 409, description: '통화 진행 중이 아님' })
  async heartbeat(
    @User('userId') userId: number,
    @Param('callSessionId') callSessionId: string,
  ) {
    return this.matchService.heartbeat(userId, callSessionId);
  }

  @Post('call/:callSessionId/end')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '통화 종료', description: '진행 중인 통화를 종료하고 정산합니다.' })
  @ApiParam({ name: 'callSessionId', description: '통화 세션 ID' })
  @ApiResponse({ status: 200, description: '통화 종료 성공' })
  @ApiResponse({ status: 400, description: '진행 중인 통화만 종료 가능' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 없음 (통화 세션의 당사자가 아님)' })
  @ApiResponse({ status: 404, description: '통화 세션을 찾을 수 없음' })
  async endCall(
    @User('userId') userId: number,
    @Param('callSessionId') callSessionId: string,
  ) {
    return this.matchService.endCall(userId, callSessionId);
  }
}
