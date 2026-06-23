"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReflectionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const role_code_enum_1 = require("../../common/enums/role-code.enum");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const comments_service_1 = require("./comments.service");
const reflection_dto_1 = require("./dto/reflection.dto");
const reflection_enum_1 = require("./enums/reflection.enum");
const likes_service_1 = require("./likes.service");
const reflections_service_1 = require("./reflections.service");
let ReflectionsController = class ReflectionsController {
    constructor(service, likesService, commentsService) {
        this.service = service;
        this.likesService = likesService;
        this.commentsService = commentsService;
    }
    create(dto, user) {
        return this.service.create(dto, user);
    }
    findAll(user, page = 1, limit = 10, keyword, status, isMap, assignedUserId) {
        return this.service.findAll(+page, +limit, user, keyword, status, isMap, assignedUserId ? +assignedUserId : undefined);
    }
    getAssignedStats(userId) {
        return this.service.getAssignedStats(userId);
    }
    findMy(user, page = 1, limit = 10) {
        return this.service.findMyReflections(user.id, +page, +limit);
    }
    findOne(id, user) {
        return this.service.findOne(id, user);
    }
    update(id, dto, user) {
        return this.service.update(id, dto, user.id);
    }
    remove(id, user) {
        return this.service.remove(id, user);
    }
    updateStatus(id, dto, user) {
        return this.service.updateStatus(id, dto.status, user);
    }
    verifyByOfficer(id, dto, user) {
        return this.service.verifyByOfficer(id, dto, user);
    }
    acceptByPatrol(id, user) {
        return this.service.acceptByPatrol(id, user);
    }
    updatePatrolLocation(id, dto, user) {
        return this.service.updatePatrolLocation(id, dto, user);
    }
    submitPatrolReport(id, dto, user) {
        return this.service.submitPatrolReport(id, dto, user);
    }
    managerConfirm(id, dto, user) {
        return this.service.managerConfirm(id, dto, user);
    }
    rateReflection(id, dto, user) {
        return this.service.rateReflection(id, dto.rating, user.id, dto.comment);
    }
    toggleLike(reflectionId, user) {
        return this.likesService.toggleLike(reflectionId, user.id);
    }
    getLikes(reflectionId, page = 1, limit = 20) {
        return this.likesService.getLikes(reflectionId, +page, +limit);
    }
    async getLikeCount(reflectionId) {
        const count = await this.likesService.getLikeCount(reflectionId);
        return { statusCode: 200, data: { count } };
    }
    checkLiked(reflectionId, user) {
        return this.likesService.checkLiked(reflectionId, user.id);
    }
    createComment(reflectionId, user, dto) {
        return this.commentsService.create(reflectionId, user.id, dto.content, dto.parentId);
    }
    getComments(reflectionId, page = 1, limit = 20) {
        return this.commentsService.findAll(reflectionId, +page, +limit);
    }
    async getCommentCount(reflectionId) {
        const count = await this.commentsService.getCommentCount(reflectionId);
        return { statusCode: 200, data: { count } };
    }
    updateComment(commentId, user, dto) {
        return this.commentsService.update(commentId, user.id, dto.content);
    }
    deleteComment(commentId, user) {
        return this.commentsService.remove(commentId, user.id, user.roleCode === role_code_enum_1.RoleCode.ADMIN);
    }
};
exports.ReflectionsController = ReflectionsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Gửi phản ánh (tất cả role)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reflection_dto_1.CreateReflectionDto, Object]),
    __metadata("design:returntype", void 0)
], ReflectionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_code_enum_1.RoleCode.ADMIN, role_code_enum_1.RoleCode.MANAGER, role_code_enum_1.RoleCode.OFFICER, role_code_enum_1.RoleCode.INSPECTOR, role_code_enum_1.RoleCode.PATROL, role_code_enum_1.RoleCode.STAFF, role_code_enum_1.RoleCode.RESIDENT),
    (0, swagger_1.ApiOperation)({ summary: 'Danh sách phản ánh (theo role)' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'keyword', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'status', enum: reflection_enum_1.ReflectionStatus, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'isMap', type: Boolean, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'assignedUserId', type: Number, required: false }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('keyword')),
    __param(4, (0, common_1.Query)('status')),
    __param(5, (0, common_1.Query)('isMap')),
    __param(6, (0, common_1.Query)('assignedUserId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, String, String, Boolean, Number]),
    __metadata("design:returntype", void 0)
], ReflectionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('assigned-stats/:userId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_code_enum_1.RoleCode.ADMIN, role_code_enum_1.RoleCode.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Thống kê nhiệm vụ được giao của nhân sự' }),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ReflectionsController.prototype, "getAssignedStats", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, swagger_1.ApiOperation)({ summary: 'Phản ánh của tôi' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], ReflectionsController.prototype, "findMy", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Chi tiết phản ánh' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], ReflectionsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_code_enum_1.RoleCode.ADMIN, role_code_enum_1.RoleCode.MANAGER, role_code_enum_1.RoleCode.RESIDENT, role_code_enum_1.RoleCode.OFFICER),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật phản ánh' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, reflection_dto_1.UpdateReflectionDto, Object]),
    __metadata("design:returntype", void 0)
], ReflectionsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_code_enum_1.RoleCode.ADMIN, role_code_enum_1.RoleCode.MANAGER, role_code_enum_1.RoleCode.RESIDENT, role_code_enum_1.RoleCode.OFFICER),
    (0, swagger_1.ApiOperation)({ summary: 'Xóa phản ánh' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], ReflectionsController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_code_enum_1.RoleCode.ADMIN, role_code_enum_1.RoleCode.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật trạng thái (Admin/Manager)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", void 0)
], ReflectionsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)(':id/verify'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_code_enum_1.RoleCode.OFFICER),
    (0, swagger_1.ApiOperation)({ summary: '[OFFICER] Xác minh thực địa phản ánh' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", void 0)
], ReflectionsController.prototype, "verifyByOfficer", null);
__decorate([
    (0, common_1.Patch)(':id/accept-patrol'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_code_enum_1.RoleCode.PATROL),
    (0, swagger_1.ApiOperation)({ summary: '[PATROL] Nhận việc được điều động' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], ReflectionsController.prototype, "acceptByPatrol", null);
__decorate([
    (0, common_1.Patch)(':id/patrol-location'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_code_enum_1.RoleCode.PATROL),
    (0, swagger_1.ApiOperation)({ summary: '[PATROL] Cập nhật vị trí hiện tại' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", void 0)
], ReflectionsController.prototype, "updatePatrolLocation", null);
__decorate([
    (0, common_1.Patch)(':id/patrol-report'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_code_enum_1.RoleCode.PATROL),
    (0, swagger_1.ApiOperation)({ summary: '[PATROL] Nộp báo cáo tình trạng xử lý' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", void 0)
], ReflectionsController.prototype, "submitPatrolReport", null);
__decorate([
    (0, common_1.Patch)(':id/manager-confirm'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_code_enum_1.RoleCode.MANAGER, role_code_enum_1.RoleCode.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: '[MANAGER] Xác nhận hoàn thành sự cố (COMPLETED → RESOLVED)',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", void 0)
], ReflectionsController.prototype, "managerConfirm", null);
__decorate([
    (0, common_1.Patch)(':id/rate'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_code_enum_1.RoleCode.RESIDENT),
    (0, swagger_1.ApiOperation)({ summary: '[RESIDENT] Đánh giá chất lượng xử lý sự cố' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", void 0)
], ReflectionsController.prototype, "rateReflection", null);
__decorate([
    (0, common_1.Post)(':id/like'),
    (0, swagger_1.ApiOperation)({ summary: 'Like/Unlike phản ánh' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], ReflectionsController.prototype, "toggleLike", null);
__decorate([
    (0, common_1.Get)(':id/likes'),
    (0, swagger_1.ApiOperation)({ summary: 'Danh sách likes' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", void 0)
], ReflectionsController.prototype, "getLikes", null);
__decorate([
    (0, common_1.Get)(':id/likes/count'),
    (0, swagger_1.ApiOperation)({ summary: 'Số lượng likes' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ReflectionsController.prototype, "getLikeCount", null);
__decorate([
    (0, common_1.Get)(':id/liked'),
    (0, swagger_1.ApiOperation)({ summary: 'Kiểm tra đã like chưa' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], ReflectionsController.prototype, "checkLiked", null);
__decorate([
    (0, common_1.Post)(':id/comments'),
    (0, swagger_1.ApiOperation)({ summary: 'Bình luận phản ánh' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", void 0)
], ReflectionsController.prototype, "createComment", null);
__decorate([
    (0, common_1.Get)(':id/comments'),
    (0, swagger_1.ApiOperation)({ summary: 'Danh sách bình luận' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", void 0)
], ReflectionsController.prototype, "getComments", null);
__decorate([
    (0, common_1.Get)(':id/comments/count'),
    (0, swagger_1.ApiOperation)({ summary: 'Số lượng bình luận' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ReflectionsController.prototype, "getCommentCount", null);
__decorate([
    (0, common_1.Patch)('comments/:commentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Sửa bình luận' }),
    __param(0, (0, common_1.Param)('commentId', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", void 0)
], ReflectionsController.prototype, "updateComment", null);
__decorate([
    (0, common_1.Delete)('comments/:commentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Xóa bình luận' }),
    __param(0, (0, common_1.Param)('commentId', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], ReflectionsController.prototype, "deleteComment", null);
exports.ReflectionsController = ReflectionsController = __decorate([
    (0, swagger_1.ApiTags)('Báo cáo/Phản ánh (Reports)'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [reflections_service_1.ReflectionsService,
        likes_service_1.LikesService,
        comments_service_1.CommentsService])
], ReflectionsController);
//# sourceMappingURL=reflections.controller.js.map