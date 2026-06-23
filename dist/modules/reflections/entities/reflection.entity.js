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
exports.Reflection = void 0;
const base_entity_1 = require("../../../common/entities/base.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const typeorm_1 = require("typeorm");
const reflection_enum_1 = require("../enums/reflection.enum");
const comment_entity_1 = require("./comment.entity");
const like_entity_1 = require("./like.entity");
let Reflection = class Reflection extends base_entity_1.BaseEntity {
};
exports.Reflection = Reflection;
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Reflection.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Reflection.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Reflection.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: reflection_enum_1.Category,
        default: reflection_enum_1.Category.OTHER,
    }),
    __metadata("design:type", String)
], Reflection.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: reflection_enum_1.ReflectionStatus,
        default: reflection_enum_1.ReflectionStatus.PENDING,
    }),
    __metadata("design:type", String)
], Reflection.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: reflection_enum_1.Priority,
        default: reflection_enum_1.Priority.LOW,
    }),
    __metadata("design:type", String)
], Reflection.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: reflection_enum_1.EventType,
        default: reflection_enum_1.EventType.OTHER,
    }),
    __metadata("design:type", String)
], Reflection.prototype, "typeOfIncident", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata("design:type", Number)
], Reflection.prototype, "lat", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata("design:type", Number)
], Reflection.prototype, "lng", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Reflection.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: 'user_id' }),
    __metadata("design:type", Number)
], Reflection.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.reflections),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], Reflection.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], Reflection.prototype, "imageUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Reflection.prototype, "response", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Reflection.prototype, "respondedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: 'managed_by' }),
    __metadata("design:type", Number)
], Reflection.prototype, "managedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false, name: 'is_published_on_map' }),
    __metadata("design:type", Boolean)
], Reflection.prototype, "isPublishedOnMap", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true, name: 'published_at' }),
    __metadata("design:type", Date)
], Reflection.prototype, "publishedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: 'original_reflection_id' }),
    __metadata("design:type", Number)
], Reflection.prototype, "originalReflectionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Reflection.prototype, "rating", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: 'officer_id' }),
    __metadata("design:type", Number)
], Reflection.prototype, "officerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: 'inspector_id' }),
    __metadata("design:type", Number)
], Reflection.prototype, "inspectorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: 'patrol_id' }),
    __metadata("design:type", Number)
], Reflection.prototype, "patrolId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, name: 'reject_reason' }),
    __metadata("design:type", String)
], Reflection.prototype, "rejectReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, name: 'patrol_report' }),
    __metadata("design:type", String)
], Reflection.prototype, "patrolReport", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false, name: 'need_reinforcement' }),
    __metadata("design:type", Boolean)
], Reflection.prototype, "needReinforcement", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: 'estimated_handle_minutes' }),
    __metadata("design:type", Number)
], Reflection.prototype, "estimatedHandleMinutes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true, name: 'patrol_lat' }),
    __metadata("design:type", Number)
], Reflection.prototype, "patrolLat", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true, name: 'patrol_lng' }),
    __metadata("design:type", Number)
], Reflection.prototype, "patrolLng", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true, name: 'verified_at' }),
    __metadata("design:type", Date)
], Reflection.prototype, "verifiedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true, name: 'dispatched_at' }),
    __metadata("design:type", Date)
], Reflection.prototype, "dispatchedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true, name: 'assigned_at' }),
    __metadata("design:type", Date)
], Reflection.prototype, "assignedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true, name: 'inspector_accepted_at' }),
    __metadata("design:type", Date)
], Reflection.prototype, "inspectorAcceptedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true, name: 'patrol_accepted_at' }),
    __metadata("design:type", Date)
], Reflection.prototype, "patrolAcceptedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => like_entity_1.Like, (l) => l.reflection),
    __metadata("design:type", Array)
], Reflection.prototype, "likes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => comment_entity_1.Comment, (c) => c.reflection),
    __metadata("design:type", Array)
], Reflection.prototype, "comments", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => require('../../flood-damages/entities/flood-damage.entity').FloodDamage, (fd) => fd.reflection),
    __metadata("design:type", Array)
], Reflection.prototype, "floodDamages", void 0);
exports.Reflection = Reflection = __decorate([
    (0, typeorm_1.Entity)('reflections')
], Reflection);
//# sourceMappingURL=reflection.entity.js.map