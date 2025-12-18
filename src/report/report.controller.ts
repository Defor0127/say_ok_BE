import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { User } from '@/common/decorators/user.decorator';
import { Role } from '@/user/enum/role.enum';
import { ReportType } from './enums/report-type.enum';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { ReportUserDto } from './dto/report-user.dto';

@ApiTags('신고')
@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) { }

  @Post('/user')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '사용자 신고', description: '사용자를 신고합니다.' })
  @ApiBody({ type: ReportUserDto })
  @ApiResponse({ status: 201, description: '사용자 신고 성공' })
  @ApiResponse({ status: 403, description: '자기 자신을 신고할 수 없음' })
  async reportUser(
    @User('userId') userId: number,
    @Body() reportUserDto: ReportUserDto
  ) {
    return this.reportService.reportUser(userId, reportUserDto)
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '신고 목록 조회', description: '신고 타입별로 신고 목록을 조회합니다. (ADMIN만 접근 가능)' })
  @ApiQuery({ name: 'type', enum: ReportType, description: '신고 타입' })
  @ApiResponse({ status: 200, description: '신고 목록 조회 성공' })
  @ApiResponse({ status: 401, description: '권한 없음' })
  async getReports(
    @Query('type') type: ReportType
  ) {
    return this.reportService.getReports(type)
  }

  @Get('/:reportId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '신고 상세 조회', description: '특정 신고의 상세 정보를 조회합니다. (ADMIN만 접근 가능)' })
  @ApiParam({ name: 'reportId', description: '신고 ID' })
  @ApiResponse({ status: 200, description: '신고 상세 조회 성공' })
  @ApiResponse({ status: 401, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '신고를 찾을 수 없음' })
  async getReportDetail(
    @Param('reportId') reportId: number
  ) {
    return this.reportService.getReportDetail(reportId)
  }

  @Get('/user/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '사용자 신고 기록 조회', description: '특정 사용자의 신고 기록을 조회합니다. (ADMIN만 접근 가능)' })
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  @ApiResponse({ status: 200, description: '신고 기록 조회 성공' })
  @ApiResponse({ status: 401, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
  async getUserReportedByStatus(
    @Param('userId') userId: number
  ) {
    return this.reportService.getUserReportByStatus(userId)
  }

  @Post('/:reportId/resolve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '신고 처리', description: '신고를 처리합니다. (ADMIN만 접근 가능)' })
  @ApiParam({ name: 'reportId', description: '신고 ID' })
  @ApiResponse({ status: 200, description: '신고 처리 성공' })
  @ApiResponse({ status: 401, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '신고를 찾을 수 없음' })
  async resolveReport(
    @Param('reportId') reportId: number
  ) {
    return this.reportService.resolveReport(reportId)
  }

  @Post('/:reportId/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '신고 기각', description: '신고를 기각합니다. (ADMIN만 접근 가능)' })
  @ApiParam({ name: 'reportId', description: '신고 ID' })
  @ApiResponse({ status: 200, description: '신고 기각 성공' })
  @ApiResponse({ status: 401, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '신고를 찾을 수 없음' })
  async rejectReport(
    @Param('reportId') reportId: number
  ) {
    return this.reportService.rejectReport(reportId)
  }
}

