import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { User } from '@/common/decorators/user.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { CreateMessageDto } from './dto/create-message.dto';

@ApiTags('채팅')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) { }

  @Get('/room')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '사용자 채팅방 목록 조회', description: '현재 사용자가 접속 중인 채팅방 목록을 조회합니다.' })
  @ApiResponse({ status: 200, description: '채팅방 목록 조회 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '유저를 찾을 수 없음' })
  async getChatRoomsByUser(
    @User('userId') userId: number
  ) {
    return this.chatService.getChatRoomsByUser(userId)
  }

  @Post('/room/:roomId/enter')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '채팅방 입장', description: '채팅방에 입장합니다.' })
  @ApiParam({ name: 'roomId', description: '채팅방 ID' })
  @ApiResponse({ status: 200, description: '채팅방 입장 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '유저 또는 채팅방을 찾을 수 없음' })
  async enterChatRoom(
    @Param('roomId') roomId: string,
    @User('userId') userId: number
  ) {
    return this.chatService.enterChatRoom(userId, roomId)
  }

  @Get('/room/:roomId/message')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '채팅방 메시지 조회', description: '채팅방 메시지를 조회합니다.' })
  @ApiParam({ name: 'roomId', description: '채팅방 ID' })
  @ApiResponse({ status: 200, description: '채팅방  성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '유저, 채팅방을 찾을 수 없거나 접속하지 않은 유저' })
  @ApiResponse({ status: 500, description: '채팅방 메시지 조회 실패' })
  async getMessages(
    @Param('roomId') roomId: string,
    @User('userId') userId: number
  ) {
    return this.chatService.getMessages(userId, roomId)
  }

  @Post('/room/:roomId/leave')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '채팅방 나가기', description: '채팅방에서 나갑니다.' })
  @ApiParam({ name: 'roomId', description: '채팅방 ID' })
  @ApiResponse({ status: 200, description: '채팅방 나가기 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '유저, 채팅방을 찾을 수 없거나 접속하지 않은 유저' })
  @ApiResponse({ status: 500, description: '채팅방 나가기 실패' })
  async leaveChatRoom(
    @Param('roomId') roomId: string,
    @User('userId') userId: number
  ) {
    return this.chatService.leaveChatRoom(userId, roomId)
  }


  @Post('/room/:roomId/message/send')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '채팅방 메시지 생성', description: '채팅방 메시지를 생성합니다.' })
  @ApiParam({ name: 'roomId', description: '채팅방 ID' })
  @ApiResponse({ status: 200, description: '메시지 생성 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '유저, 채팅방을 찾을 수 없거나 접속하지 않은 유저' })
  @ApiResponse({ status: 500, description: '채팅방 메시지 생성 실패' })
  async sendMessages(
    @Param('roomId') roomId: string,
    @User('userId') userId: number,
    @Body() createMessageDto : CreateMessageDto
  ) {
    return this.chatService.sendMessage(userId, roomId, createMessageDto)
  }



}

