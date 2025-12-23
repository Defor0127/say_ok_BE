import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '@/common/decorators/user.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/user/enum/role.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { ChangeUserStatusDto } from './dto/change-user-status.dto';
import { ChangeUserStatusItemDto } from './dto/change-user-status-item.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('사용자')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '전체 사용자 조회', description: '전체 사용자 목록을 조회합니다. (ADMIN만 접근 가능)' })
  @ApiResponse({ status: 200, description: '사용자 목록 조회 성공' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  async getUsers() {
    return await this.userService.getUsers()
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '사용자 생성', description: '새로운 사용자를 생성합니다. (ADMIN만 접근 가능)' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: '사용자 생성 성공' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 409, description: '이미 존재하는 이메일 또는 닉네임' })
  async createUser(
    @Body() createUserDto: CreateUserDto
  ) {
    return await this.userService.createUser(createUserDto)
  }

  @Get('/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '내 정보 조회', description: '현재 로그인한 사용자의 정보를 조회합니다.' })
  @ApiResponse({ status: 200, description: '정보 조회 성공' })
  async getUserInfoByMe(
    @User('userId') userId: number,
  ) {
    return await this.userService.getUserInfoByMe(userId)
  }

  @Get('/page')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '사용자 목록 조회 (페이지네이션)', description: '페이지네이션을 사용하여 사용자 목록을 조회합니다. (ADMIN만 접근 가능)' })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'limit', required: false, description: '페이지당 항목 수' })
  @ApiResponse({ status: 200, description: '사용자 목록 조회 성공' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  async getUsersByPage(
    @Query('page') page: number,
    @Query('limit') limit: number
  ) {
    return await this.userService.getUsersByPage(page, limit)
  }

  @Get('/search')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '사용자 검색', description: '닉네임 또는 이메일로 사용자를 검색합니다. (ADMIN만 접근 가능)' })
  @ApiQuery({ name: 'keyword', description: '검색 키워드' })
  @ApiResponse({ status: 200, description: '검색 결과 조회 성공' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  async searchUsers(
    @Query('keyword') keyword: string
  ) {
    return await this.userService.searchUsers(keyword)
  }

  @Get('/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '상태별 사용자 조회', description: '특정 상태의 사용자 목록을 조회합니다. (ADMIN만 접근 가능)' })
  @ApiQuery({ name: 'status', description: '사용자 상태 (1: 정상, 2: 경고, 0: 정지)' })
  @ApiResponse({ status: 200, description: '사용자 목록 조회 성공' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  async getUsersByStatus(
    @Query('status') status: number
  ) {
    return await this.userService.getUsersByStatus(status)
  }

  @Patch('/status/change')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '사용자 상태 변경', description: '여러 사용자의 상태를 일괄 변경합니다. (ADMIN만 접근 가능)' })
  @ApiBody({ type: ChangeUserStatusDto })
  @ApiResponse({ status: 200, description: '상태 변경 성공' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  async changeUsersStatus(
    @Body() changeUserStatusDto: ChangeUserStatusDto & { items: ChangeUserStatusItemDto }
  ) {
    return await this.userService.changeUserStatus(changeUserStatusDto)
  }

  @Get('/info/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '사용자 상세 정보 조회', description: '특정 사용자의 상세 정보를 조회합니다. (ADMIN만 접근 가능)' })
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  @ApiResponse({ status: 200, description: '사용자 정보 조회 성공' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
  async getUserInfo(
    @Param('userId') userId: number
  ) {
    return await this.userService.getUserInfo(userId)
  }
}

