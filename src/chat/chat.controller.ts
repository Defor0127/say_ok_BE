import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { User } from '@/common/decorators/user.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('채팅')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) { }

  @Post('/room/:roomId/enter')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '채팅방 입장', description: '채팅방에 입장합니다.' })
  @ApiParam({ name: 'roomId', description: '채팅방 ID' })
  @ApiResponse({ status: 200, description: '채팅방 입장 성공' })
  @ApiResponse({ status: 404, description: '채팅방을 찾을 수 없음' })
  async enterChatRoom(
    @Param('roomId') roomId: string,
    @User('userId') userId: number
  ) {
    return this.chatService.enterChatRoom(userId, roomId)
  }

  @Post('/room/:roomId/out')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '채팅방 나가기', description: '채팅방에서 나갑니다.' })
  @ApiParam({ name: 'roomId', description: '채팅방 ID' })
  @ApiResponse({ status: 200, description: '채팅방 나가기 성공' })
  @ApiResponse({ status: 404, description: '채팅방을 찾을 수 없음' })
  async leaveChatRoom(
    @Param('roomId') roomId: string,
    @User('userId') userId: number
  ) {
    return this.chatService.leaveChatRoom(userId, roomId)
  }

  @Post('/video/start')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '영상통화 시작', description: '영상통화를 시작합니다. 10분당 300포인트 차감' })
  @ApiResponse({ status: 200, description: '영상통화 시작 성공' })
  @ApiResponse({ status: 400, description: '보유 포인트 부족' })
  async startVideoCall(
    @User('userId') userId: number
  ) {
    return this.chatService.startVideoCall(userId);
  }
}

