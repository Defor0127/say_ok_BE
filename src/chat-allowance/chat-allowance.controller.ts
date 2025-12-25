import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ChatAllowanceService } from './chat-allowance.service';
import { ChargeChatAllowanceByPackageDto } from './dto/charge-chat-allowance-by-package.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { User } from '@/common/decorators/user.decorator';
import { Role } from '@/user/enum/role.enum';
import { CreateChatAllowancePackageDto } from './dto/create-chat-allowance-package.dto';
import { UpdateChatAllowancePackageDto } from './dto/update-chat-allowance-package.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('채팅 허용권')
@Controller('chat-allowance')
export class ChatAllowanceController {
  constructor(private readonly chatAllowanceService: ChatAllowanceService) { }


  @Post('/charge/package')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '채팅 허용권 패키지로 충전', description: '채팅 허용권 패키지를 사용하여 채팅 허용권을 충전합니다.' })
  @ApiBody({ type: ChargeChatAllowanceByPackageDto })
  @ApiResponse({ status: 200, description: '채팅 허용권 패키지 충전 성공' })
  @ApiResponse({ status: 404, description: '패키지 또는 사용자를 찾을 수 없음' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  async chargeChatAllowanceByPackage(
    @Body() chargeChatAllowanceByPackageDto: ChargeChatAllowanceByPackageDto,
    @User('userId') userId: number
  ) {
    return this.chatAllowanceService.chargeChatAllowanceByPackage(userId, chargeChatAllowanceByPackageDto)
  }

  @Get('/history/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '채팅 허용권 내역 조회', description: '사용자의 채팅 허용권 사용 내역을 조회합니다. (본인만 조회 가능)' })
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  @ApiResponse({ status: 200, description: '채팅 허용권 내역 조회 성공' })
  @ApiResponse({ status: 403, description: '본인의 채팅 허용권 내역만 조회 가능' })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
  async getChatAllowanceHistories(
    @Param('userId') userId: number,
    @User('userId') myId: number
  ) {
    return this.chatAllowanceService.getChatAllowanceHistories(userId, myId)
  }

  @Get('/current')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '현재 채팅 허용권 조회', description: '현재 보유 채팅 허용권을 조회합니다.' })
  @ApiResponse({ status: 200, description: '채팅 허용권 조회 성공' })
  async getCurrentChatAllowance(
    @User('userId') userId: number
  ) {
    return this.chatAllowanceService.getCurrentChatAllowance(userId)
  }

  @Get('/package')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '채팅 허용권 패키지 목록 조회', description: '채팅 허용권 패키지 목록을 조회합니다.' })
  @ApiResponse({ status: 200, description: '패키지 목록 조회 성공' })
  async getChatAllowancePackages() {
    return this.chatAllowanceService.getChatAllowancePackages()
  }

  @Post('/package')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '채팅 허용권 패키지 생성', description: '새로운 채팅 허용권 패키지를 생성합니다. (ADMIN만 접근 가능)' })
  @ApiBody({ type: CreateChatAllowancePackageDto })
  @ApiResponse({ status: 201, description: '패키지 생성 성공' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  async createChatAllowancePackage(
    @Body() createChatAllowancePackageDto: CreateChatAllowancePackageDto
  ) {
    return this.chatAllowanceService.createChatAllowancePackage(createChatAllowancePackageDto)
  }

  @Get('/package/:packageId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '채팅 허용권 패키지 조회', description: '특정 채팅 허용권 패키지의 정보를 조회합니다.' })
  @ApiParam({ name: 'packageId', description: '패키지 ID' })  
  @ApiResponse({ status: 200, description: '패키지 조회 성공' })
  @ApiResponse({ status: 404, description: '패키지를 찾을 수 없음' })
  async getChatAllowancePackage(
    @Param('packageId') packageId: number
  ) {
    return this.chatAllowanceService.getChatAllowancePackage(packageId)
  }

  @Delete('/package/:packageId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '채팅 허용권 패키지 삭제', description: '채팅 허용권 패키지를 삭제합니다. (ADMIN만 접근 가능)' })
  @ApiParam({ name: 'packageId', description: '패키지 ID' })
  @ApiResponse({ status: 200, description: '패키지 삭제 성공' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '패키지를 찾을 수 없음' })
  async deleteChatAllowancePackage(
    @Param('packageId') packageId: number
  ) {
    return this.chatAllowanceService.deleteChatAllowancePackage(packageId)
  }

  @Patch('/package/:packageId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '채팅 허용권 패키지 수정', description: '채팅 허용권 패키지 정보를 수정합니다. (ADMIN만 접근 가능)' })
  @ApiParam({ name: 'packageId', description: '패키지 ID' })
  @ApiBody({ type: UpdateChatAllowancePackageDto })
  @ApiResponse({ status: 200, description: '패키지 수정 성공' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '패키지를 찾을 수 없음' })
  async updateChatAllowancePackage(
    @Param('packageId') packageId: number,
    @Body() updateChatAllowancePackageDto: UpdateChatAllowancePackageDto
  ) {
    return this.chatAllowanceService.updateChatAllowancePackage(packageId, updateChatAllowancePackageDto)
  }
}

