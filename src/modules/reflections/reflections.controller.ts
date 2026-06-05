import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
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
  ) {}

  @Post()
  @ApiOperation({ summary: 'Gửi phản ánh (tất cả role)' })
  create(@Body() dto: CreateReflectionDto, @CurrentUser() user: any) {
    return this.service.create(dto, user);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(
    RoleCode.ADMIN,
    RoleCode.MANAGER,
    RoleCode.OFFICER,
    RoleCode.INSPECTOR,
    RoleCode.PATROL,
    RoleCode.STAFF,
    RoleCode.RESIDENT,
  )
  @ApiOperation({ summary: 'Danh sách phản ánh (theo role)' })
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
  findMy(
    @CurrentUser() user: any,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.service.findMyReflections(user.id, +page, +limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết phản ánh' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleCode.ADMIN, RoleCode.MANAGER, RoleCode.RESIDENT, RoleCode.OFFICER)
  @ApiOperation({ summary: 'Cập nhật phản ánh' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReflectionDto,
    @CurrentUser() user: any,
  ) {
    return this.service.update(id, dto, user.id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleCode.ADMIN, RoleCode.MANAGER, RoleCode.RESIDENT, RoleCode.OFFICER)
  @ApiOperation({ summary: 'Xóa phản ánh' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.service.remove(id, user);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(RoleCode.ADMIN, RoleCode.MANAGER)
  @ApiOperation({ summary: 'Cập nhật trạng thái (Admin/Manager)' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { status: ReflectionStatus },
    @CurrentUser() user: any,
  ) {
    return this.service.updateStatus(id, dto.status, user);
  }

  // ══════════════════════════════════════════════════════════════════════
  // WORKFLOW ENDPOINTS
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Bước 3: OFFICER xác minh phản ánh (từ người dân)
   */
  @Patch(':id/verify')
  @UseGuards(RolesGuard)
  @Roles(RoleCode.OFFICER)
  @ApiOperation({ summary: '[OFFICER] Xác minh thực địa phản ánh' })
  verifyByOfficer(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { confirmed: boolean; rejectReason?: string; note?: string },
    @CurrentUser() user: any,
  ) {
    return this.service.verifyByOfficer(id, dto, user);
  }

  /**
   * Bước 4: MANAGER giao yêu cầu cho INSPECTOR
   */
  @Patch(':id/assign')
  @UseGuards(RolesGuard)
  @Roles(RoleCode.MANAGER, RoleCode.ADMIN)
  @ApiOperation({ summary: '[MANAGER] Giao phản ánh cho Hậu kiểm' })
  assignToInspector(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { inspectorId: number; note?: string },
    @CurrentUser() user: any,
  ) {
    return this.service.assignToInspector(id, dto, user);
  }

  /**
   * Bước 5: INSPECTOR điều PATROL
   */
  @Patch(':id/dispatch')
  @UseGuards(RolesGuard)
  @Roles(RoleCode.INSPECTOR)
  @ApiOperation({ summary: '[INSPECTOR] Điều cán bộ tuần tra xử lý' })
  dispatchPatrol(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    dto: { patrolId: number; estimatedHandleMinutes?: number; note?: string },
    @CurrentUser() user: any,
  ) {
    return this.service.dispatchPatrol(id, dto, user);
  }

  // ══════════════════════════════════════════════════════════════════════
  // NHẬN VIỆC
  // ══════════════════════════════════════════════════════════════════════

  @Patch(':id/accept-inspector')
  @UseGuards(RolesGuard)
  @Roles(RoleCode.INSPECTOR)
  @ApiOperation({ summary: '[INSPECTOR] Nhận việc được phân công' })
  acceptByInspector(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.service.acceptByInspector(id, user);
  }

  @Patch(':id/accept-patrol')
  @UseGuards(RolesGuard)
  @Roles(RoleCode.PATROL)
  @ApiOperation({ summary: '[PATROL] Nhận việc được điều động' })
  acceptByPatrol(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.service.acceptByPatrol(id, user);
  }

  /**
   * Bước 6: PATROL cập nhật vị trí realtime
   */
  @Patch(':id/patrol-location')
  @UseGuards(RolesGuard)
  @Roles(RoleCode.PATROL)
  @ApiOperation({ summary: '[PATROL] Cập nhật vị trí hiện tại' })
  updatePatrolLocation(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { lat: number; lng: number },
    @CurrentUser() user: any,
  ) {
    return this.service.updatePatrolLocation(id, dto, user);
  }

  /**
   * Bước 8: PATROL nộp báo cáo kết quả
   */
  @Patch(':id/patrol-report')
  @UseGuards(RolesGuard)
  @Roles(RoleCode.PATROL)
  @ApiOperation({ summary: '[PATROL] Nộp báo cáo tình trạng xử lý' })
  submitPatrolReport(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    dto: {
      resolved: boolean;
      patrolReport: string;
      needReinforcement?: boolean;
      incompleteReason?: string;
    },
    @CurrentUser() user: any,
  ) {
    return this.service.submitPatrolReport(id, dto, user);
  }

  /**
   * Bước 9: INSPECTOR xác nhận hoàn thành, gửi báo cáo lên MANAGER
   */
  @Patch(':id/inspector-confirm')
  @UseGuards(RolesGuard)
  @Roles(RoleCode.INSPECTOR, RoleCode.MANAGER)
  @ApiOperation({ summary: '[INSPECTOR] Xác nhận hoàn thành và gửi báo cáo' })
  inspectorConfirm(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { note?: string },
    @CurrentUser() user: any,
  ) {
    return this.service.inspectorConfirm(id, dto, user);
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
    return this.commentsService.create(
      reflectionId,
      user.id,
      dto.content,
      dto.parentId,
    );
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
    return this.commentsService.remove(
      commentId,
      user.id,
      user.roleCode === RoleCode.ADMIN,
    );
  }
}
