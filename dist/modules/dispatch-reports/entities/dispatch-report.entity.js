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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DispatchReport = void 0;
const base_entity_1 = require("../../../common/entities/base.entity");
const reflection_entity_1 = require("../../reflections/entities/reflection.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const typeorm_1 = require("typeorm");
const dispatch_report_enum_1 = require("../enums/dispatch-report.enum");
let DispatchReport = class DispatchReport extends base_entity_1.BaseEntity {
};
exports.DispatchReport = DispatchReport;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DispatchReport.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: dispatch_report_enum_1.DispatchReportType,
    }),
    __metadata("design:type", String)
], DispatchReport.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: dispatch_report_enum_1.DispatchReportStatus,
        default: dispatch_report_enum_1.DispatchReportStatus.PENDING,
    }),
    __metadata("design:type", String)
], DispatchReport.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reflection_id' }),
    __metadata("design:type", Number)
], DispatchReport.prototype, "reflectionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => reflection_entity_1.Reflection),
    (0, typeorm_1.JoinColumn)({ name: 'reflection_id' }),
    __metadata("design:type", reflection_entity_1.Reflection)
], DispatchReport.prototype, "reflection", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'assigned_by' }),
    __metadata("design:type", Number)
], DispatchReport.prototype, "assignedBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'assigned_by' }),
    __metadata("design:type", user_entity_1.User)
], DispatchReport.prototype, "assigner", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'assigned_to', nullable: true }),
    __metadata("design:type", Number)
], DispatchReport.prototype, "assignedTo", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'assigned_to' }),
    __metadata("design:type", user_entity_1.User)
], DispatchReport.prototype, "assignee", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, name: 'custom_handler' }),
    __metadata("design:type", String)
], DispatchReport.prototype, "customHandler", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', name: 'assigned_at' }),
    __metadata("design:type", Date)
], DispatchReport.prototype, "assignedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', name: 'expired_at', nullable: true }),
    __metadata("design:type", Date)
], DispatchReport.prototype, "expiredAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true, name: 'accepted_at' }),
    __metadata("design:type", Date)
], DispatchReport.prototype, "acceptedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true, name: 'completed_at' }),
    __metadata("design:type", Date)
], DispatchReport.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true, name: 'expected_time' }),
    __metadata("design:type", Date)
], DispatchReport.prototype, "expectedTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], DispatchReport.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], DispatchReport.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], DispatchReport.prototype, "note", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, name: 'report_content' }),
    __metadata("design:type", String)
], DispatchReport.prototype, "reportContent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, name: 'reflection_status_update' }),
    __metadata("design:type", String)
], DispatchReport.prototype, "reflectionStatusUpdate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], DispatchReport.prototype, "attachments", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, name: 'reject_reason' }),
    __metadata("design:type", String)
], DispatchReport.prototype, "rejectReason", void 0);
exports.DispatchReport = DispatchReport = __decorate([
    (0, typeorm_1.Entity)('dispatch_reports')
], DispatchReport);
//# sourceMappingURL=dispatch-report.entity.js.map