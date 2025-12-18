import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { User } from '@/common/decorators/user.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('프로필')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) { }

  @Get('/:userId')
  @ApiOperation({ summary: '프로필 조회', description: '사용자 프로필을 조회합니다.' })
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  @ApiResponse({ status: 200, description: '프로필 조회 성공' })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
  async getUserProfile(
    @Param('userId') userId: number
  ) {
    return this.profileService.getProfile(userId)
  }

  @Patch('/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '프로필 수정', description: '사용자 프로필을 수정합니다. (본인만 가능)' })
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({ status: 200, description: '프로필 수정 성공' })
  @ApiResponse({ status: 403, description: '수정 권한 없음' })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
  async updateProfile(
    @Param('userId') userId: number,
    @Body() updateProfileDto: UpdateProfileDto,
    @User('userId') myId: number
  ) {
    return this.profileService.updateProfile(userId, updateProfileDto, myId)
  }
}
