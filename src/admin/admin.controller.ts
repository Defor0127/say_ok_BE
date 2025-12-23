import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/user/enum/role.enum';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('관리자')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  @Get('/dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '대시보드 통계', description: '관리자 대시보드 통계를 조회합니다. (ADMIN만 접근 가능)' })
  @ApiResponse({ status: 200, description: '통계 조회 성공' })
  @ApiResponse({ status: 401, description: '권한 없음' })
  async getDashboard() {
    return this.adminService.getDashboard()
  }

  @Get('/user/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '사용자 상세 조회', description: '특정 사용자의 상세 정보를 조회합니다. (ADMIN만 접근 가능)' })
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  @ApiResponse({ status: 200, description: '사용자 정보 조회 성공' })
  @ApiResponse({ status: 401, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
  async getUserDetail(
    @Param('userId') userId: number
  ) {
    return this.adminService.getUserDetail(userId)
  }

  @Get('user/:userId/point-history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '사용자 포인트 내역 조회', description: '특정 사용자의 포인트 사용 내역을 조회합니다. (ADMIN만 접근 가능)' })
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  @ApiResponse({ status: 200, description: '포인트 내역 조회 성공' })
  @ApiResponse({ status: 401, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
  async getUserPointHistories(
    @Param('userId') userId: number
  ){
    return this.adminService.getUserPointsHistories(userId)
  }

  @Delete('/user/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '사용자 삭제', description: '사용자를 삭제합니다. (ADMIN만 접근 가능)' })
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  @ApiResponse({ status: 200, description: '사용자 삭제 성공' })
  @ApiResponse({ status: 401, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
  async deleteUser(
    @Param('userId') userId: number
  ) {
    return this.adminService.deleteUser(userId)
  }

  @Get('/report')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '신고 목록 조회', description: 'status에 해당하는 신고 목록을 조회합니다. (ADMIN만 접근 가능)' })
  @ApiQuery({ name: 'status', required: false, description: '신고 상태' })
  @ApiResponse({ status: 200, description: '신고 목록 조회 성공' })
  @ApiResponse({ status: 401, description: '권한 없음' })
  async getAllReports(
    @Query('status') status: string
  ) {
    return this.adminService.getAllReports(status)
  }

  @Post('/system')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '시스템 설정 업데이트', description: '시스템 설정을 업데이트합니다. (ADMIN만 접근 가능)' })
  @ApiBody({ description: '시스템 설정 객체', schema: { type: 'object' } })
  @ApiResponse({ status: 200, description: '시스템 설정 업데이트 성공' })
  @ApiResponse({ status: 401, description: '권한 없음' })
  async updateSystemSettings(
    @Body() settingsDto: any
  ) {
    return this.adminService.updateSystemSettings(settingsDto)
  }
}
