import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { PostSaveDto } from './dto/post-save.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostLikeDto } from './dto/post-like.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { User } from '@/common/decorators/user.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('게시글')
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) { }


  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '게시글 작성', description: '새로운 게시글을 작성합니다.' })
  @ApiBody({ type: CreatePostDto })
  @ApiResponse({ status: 201, description: '게시글 작성 성공' })
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @User('userId') userId: number
  ) {
    return this.postService.createPost(createPostDto)
  }

  @Get()
  @ApiOperation({ summary: '지역별 게시글 조회', description: '지역별로 게시글을 조회합니다.' })
  @ApiQuery({ name: 'region', required: false, description: '지역명' })
  @ApiResponse({ status: 200, description: '게시글 조회 성공' })
  async getPostsByRegion(
    @Query('region') region: string
  ) {
    return this.postService.getPostsByRegion(region)
  }

  @Get('/user/:userId')
  @ApiOperation({ summary: '사용자 게시글 조회', description: '특정 사용자가 작성한 게시글을 조회합니다.' })
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  @ApiResponse({ status: 200, description: '게시글 조회 성공' })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
  async getPostsByUser(
    @Param('userId') userId: number,
  ) {
    return this.postService.getPostsByUser(userId);
  }

  @Get('/popular')
  @ApiOperation({ summary: '인기 게시글 조회', description: '지역별 인기 게시글을 조회합니다.' })
  @ApiQuery({ name: 'region', required: false, description: '지역명' })
  @ApiResponse({ status: 200, description: '인기 게시글 조회 성공' })
  async getPopularPostsByRegion(
    @Query('region') region: string
  ) {
    return this.postService.getPopularPostsByRegion(region)
  }

  @Get('/user/:userId/saved')
  @ApiOperation({ summary: '저장한 게시글 조회', description: '사용자가 저장한 게시글을 조회합니다.' })
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  @ApiResponse({ status: 200, description: '저장한 게시글 조회 성공' })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
  async getSavedPostsByUser(
    @Param('userId') userId: number,
  ) {
    return this.postService.getSavedPostsByUser(userId);
  }

  @Get('/:postId')
  @ApiOperation({ summary: '게시글 상세 조회', description: '특정 게시글의 상세 정보를 조회합니다.' })
  @ApiParam({ name: 'postId', description: '게시글 ID' })
  @ApiResponse({ status: 200, description: '게시글 조회 성공' })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없음' })
  async getPost(
    @Param('postId') postId: number
  ) {
    return this.postService.getPost(postId);
  }

  @Get('/category/:categoryId')
  @ApiOperation({ summary: '카테고리별 게시글 조회', description: '특정 카테고리의 게시글을 조회합니다.' })
  @ApiParam({ name: 'categoryId', description: '카테고리 ID' })
  @ApiResponse({ status: 200, description: '게시글 조회 성공' })
  @ApiResponse({ status: 404, description: '카테고리를 찾을 수 없음' })
  async getPostByCategory(
    @Param('categoryId') categoryId: number
  ) {
    return this.postService.getPostsByCategory(categoryId)
  }

  @Delete('/:postId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '게시글 삭제', description: '게시글을 삭제합니다. (작성자만 가능)' })
  @ApiParam({ name: 'postId', description: '게시글 ID' })
  @ApiResponse({ status: 200, description: '게시글 삭제 성공' })
  @ApiResponse({ status: 403, description: '삭제 권한 없음' })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없음' })
  async deletePost(
    @Param('postId') postId: number,
    @User('userId') userId: number
  ) {
    return this.postService.deletePost(postId, userId)
  }

  @Patch('/:postId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '게시글 수정', description: '게시글을 수정합니다. (작성자만 가능)' })
  @ApiParam({ name: 'postId', description: '게시글 ID' })
  @ApiBody({ type: UpdatePostDto })
  @ApiResponse({ status: 200, description: '게시글 수정 성공' })
  @ApiResponse({ status: 403, description: '수정 권한 없음' })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없음' })
  async updatePost(
    @Param('postId') postId: number,
    @Body() updatePostDto: UpdatePostDto,
    @User('userId') userId: number
  ) {
    return this.postService.updatePost(postId, updatePostDto, userId)
  }

  @Get('/:postId/share')
  @ApiOperation({ summary: '게시글 공유', description: '게시글을 공유합니다.' })
  @ApiParam({ name: 'postId', description: '게시글 ID' })
  @ApiResponse({ status: 200, description: '게시글 공유 성공' })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없음' })
  async sharePost(
    @Param('postId') postId: number
  ) {
    return this.postService.sharePost(postId)
  }

  @Post('/:postId/save')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '게시글 저장', description: '게시글을 저장하거나 저장 해제합니다.' })
  @ApiParam({ name: 'postId', description: '게시글 ID' })
  @ApiBody({ type: PostSaveDto })
  @ApiResponse({ status: 200, description: '게시글 저장/저장 해제 성공' })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없음' })
  async toggleSavePost(
    @Param('postId') postId: number,
    @Body() postSaveDto: PostSaveDto
  ) {
    return this.postService.togglePostSave(postId, postSaveDto)
  }

  @Get('/:postId/comments')
  @ApiOperation({ summary: '게시글 댓글 조회', description: '게시글의 댓글 목록을 조회합니다.' })
  @ApiParam({ name: 'postId', description: '게시글 ID' })
  @ApiResponse({ status: 200, description: '댓글 조회 성공' })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없음' })
  async getPostComments(
    @Param('postId') postId: number
  ) {
    return this.postService.getPostComments(postId)
  }

  @Post('/:postId/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '게시글 좋아요', description: '게시글에 좋아요를 추가하거나 제거합니다.' })
  @ApiParam({ name: 'postId', description: '게시글 ID' })
  @ApiBody({ type: PostLikeDto })
  @ApiResponse({ status: 200, description: '게시글 좋아요/좋아요 해제 성공' })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없음' })
  async togglePostLike(
    @Param('postId') postId: number,
    @Body() postLikeDto: PostLikeDto
  ) {
    return this.postService.togglePostLike(postId, postLikeDto)
  }
}

