import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { GuideService } from './guide.service';
import { CreateGuideDto } from './dto/create-guide.dto';
import { UpdateGuideDto } from './dto/update-guide.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/user/enum/role.enum';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('이용안내')
@Controller('guide')
export class GuideController {
  constructor(private readonly guideService: GuideService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '이용안내 작성', description: '새로운 이용안내를 작성합니다. (ADMIN만 접근 가능)' })
  @ApiBody({ type: CreateGuideDto })
  @ApiResponse({ status: 201, description: '이용안내 작성 성공' })
  @ApiResponse({ status: 401, description: '권한 없음' })
  async createGuide(
    @Body() createGuideDto: CreateGuideDto
  ) {
    return this.guideService.createGuide(createGuideDto)
  }

  @Get()
  @ApiOperation({ summary: '이용안내 목록 조회', description: '전체 이용안내 목록을 조회합니다.' })
  @ApiResponse({ status: 200, description: '이용안내 목록 조회 성공' })
  async getGuides() {
    return this.guideService.getGuides()
  }

  @Get('/:guideId')
  @ApiOperation({ summary: '이용안내 상세 조회', description: '특정 이용안내의 상세 정보를 조회합니다.' })
  @ApiParam({ name: 'guideId', description: '이용안내 ID' })
  @ApiResponse({ status: 200, description: '이용안내 조회 성공' })
  @ApiResponse({ status: 404, description: '이용안내 조회 실패' })
  async getGuide(
    @Param('guideId') guideId: number
  ) {
    return this.guideService.getGuide(guideId)
  }

  @Patch('/:guideId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '이용안내 수정', description: '이용안내를 수정합니다. (ADMIN만 접근 가능)' })
  @ApiParam({ name: 'guideId', description: '이용안내 ID' })
  @ApiBody({ type: UpdateGuideDto })
  @ApiResponse({ status: 200, description: '이용안내 수정 성공' })
  @ApiResponse({ status: 401, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '이용안내를 찾을 수 없음' })
  async updateGuide(
    @Param('guideId') guideId: number,
    @Body() updateGuideDto: UpdateGuideDto
  ) {
    return this.guideService.updateGuide(guideId, updateGuideDto)
  }

  @Delete('/:guideId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '이용안내 삭제', description: '이용안내를 삭제합니다. (ADMIN만 접근 가능)' })
  @ApiParam({ name: 'guideId', description: '이용안내 ID' })
  @ApiResponse({ status: 200, description: '이용안내 삭제 성공' })
  @ApiResponse({ status: 401, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '이용안내를 찾을 수 없음' })
  async deleteGuide(
    @Param('guideId') guideId: number
  ) {
    return this.guideService.deleteGuide(guideId)
  }
}
