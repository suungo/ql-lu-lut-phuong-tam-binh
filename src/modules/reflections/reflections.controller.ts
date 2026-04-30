import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleCode } from 'src/common/enums/role-code.enum';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CommentsService } from './comments.service';
import { CreateReflectionDto, UpdateReflectionDto } from './dto/reflection.dto';
import { ReflectionStatus } from './enums/reflection.enum';
import { LikesService } from './likes.service';
import { ReflectionsService } from './reflections.service';

@ApiTags('Báo cáo/Phản ánh (Reports)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class ReflectionsController {
  constructor(
    private readonly service: ReflectionsService,
    private readonly likesService: LikesService,
    private readonly commentsService: CommentsService,
  ) { }

  @Post()
  @ApiOperation({ summary: 'Gửi phản ánh / kiến nghị' })
  create(@Body() dto: CreateReflectionDto, @CurrentUser() user: any) {
    return this.service.create(dto, user);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(RoleCode.ADMIN, RoleCode.MANAGER, RoleCode.STAFF, RoleCode.RESIDENT, RoleCode.LEADER)
  @ApiOperation({ summary: 'Danh sách phản ánh (Admin/Manager)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'keyword', required: false })
  @ApiQuery({ name: 'status', enum: ReflectionStatus, required: false })
  @ApiQuery({ name: 'isMap', type: Boolean, required: false })
  findAll(
    @CurrentUser() user: any,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('keyword') keyword?: string,
    @Query('status') status?: ReflectionStatus,
    @Query('isMap') isMap?: boolean,
  ) {
    return this.service.findAll(+page, +limit, user, keyword, status, isMap);
  }

  @Get('my')
  @ApiOperation({ summary: 'Phản ánh của tôi' })
  findMy(@CurrentUser() user: any, @Query('page') page = 1, @Query('limit') limit = 10) {
    return this.service.findMyReflections(user.id, +page, +limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết phản ánh' })
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleCode.ADMIN, RoleCode.MANAGER)
  @ApiOperation({ summary: 'Cập nhật / phản hồi phản ánh' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateReflectionDto, @CurrentUser() user: any) {
    return this.service.update(id, dto, user.id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleCode.ADMIN, RoleCode.MANAGER)
  @ApiOperation({ summary: 'Xóa phản ánh' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) { return this.service.remove(id, user); }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(RoleCode.ADMIN, RoleCode.MANAGER, RoleCode.LEADER)
  @ApiOperation({ summary: 'Cập nhật trạng thái phản ánh' })
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: { status: ReflectionStatus }) {
    return this.service.updateStatus(id, dto.status);
  }

  // ==================== LIKES ====================
  @Post(':id/like')
  @ApiOperation({ summary: 'Like/Unlike phản ánh' })
  toggleLike(
    @Param('id', ParseIntPipe) reflectionId: number,
    @CurrentUser() user: any,
  ) {
    return this.likesService.toggleLike(reflectionId, user.id);
  }

  @Get(':id/likes')
  @ApiOperation({ summary: 'Danh sách likes' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getLikes(
    @Param('id', ParseIntPipe) reflectionId: number,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.likesService.getLikes(reflectionId, +page, +limit);
  }

  @Get(':id/likes/count')
  @ApiOperation({ summary: 'Số lượng likes' })
  async getLikeCount(@Param('id', ParseIntPipe) reflectionId: number) {
    const count = await this.likesService.getLikeCount(reflectionId);
    return { statusCode: 200, data: { count } };
  }

  @Get(':id/liked')
  @ApiOperation({ summary: 'Kiểm tra đã like chưa' })
  checkLiked(
    @Param('id', ParseIntPipe) reflectionId: number,
    @CurrentUser() user: any,
  ) {
    return this.likesService.checkLiked(reflectionId, user.id);
  }

  // ==================== COMMENTS ====================
  @Post(':id/comments')
  @ApiOperation({ summary: 'Bình luận phản ánh' })
  createComment(
    @Param('id', ParseIntPipe) reflectionId: number,
    @CurrentUser() user: any,
    @Body() dto: { content: string; parentId?: number },
  ) {
    return this.commentsService.create(reflectionId, user.id, dto.content, dto.parentId);
  }

  @Get(':id/comments')
  @ApiOperation({ summary: 'Danh sách bình luận' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getComments(
    @Param('id', ParseIntPipe) reflectionId: number,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.commentsService.findAll(reflectionId, +page, +limit);
  }

  @Get(':id/comments/count')
  @ApiOperation({ summary: 'Số lượng bình luận' })
  async getCommentCount(@Param('id', ParseIntPipe) reflectionId: number) {
    const count = await this.commentsService.getCommentCount(reflectionId);
    return { statusCode: 200, data: { count } };
  }

  @Patch('comments/:commentId')
  @ApiOperation({ summary: 'Sửa bình luận' })
  updateComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @CurrentUser() user: any,
    @Body() dto: { content: string },
  ) {
    return this.commentsService.update(commentId, user.id, dto.content);
  }

  @Delete('comments/:commentId')
  @ApiOperation({ summary: 'Xóa bình luận' })
  deleteComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @CurrentUser() user: any,
  ) {
    return this.commentsService.remove(commentId, user.id, user.roleCode === RoleCode.ADMIN);
  }
}
