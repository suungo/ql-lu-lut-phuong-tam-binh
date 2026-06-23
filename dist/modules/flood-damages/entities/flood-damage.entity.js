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
exports.FloodDamage = void 0;
const base_entity_1 = require("../../../common/entities/base.entity");
const typeorm_1 = require("typeorm");
const damage_category_enum_1 = require("../enums/damage-category.enum");
const damage_status_enum_1 = require("../enums/damage-status.enum");
let FloodDamage = class FloodDamage extends base_entity_1.BaseEntity {
};
exports.FloodDamage = FloodDamage;
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: damage_category_enum_1.DamageCategory }),
    __metadata("design:type", String)
], FloodDamage.prototype, "damageCategory", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], FloodDamage.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', default: 0 }),
    __metadata("design:type", Number)
], FloodDamage.prototype, "estimatedValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], FloodDamage.prototype, "injuredCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], FloodDamage.prototype, "deathCount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: damage_status_enum_1.DamageStatus,
        default: damage_status_enum_1.DamageStatus.PENDING,
    }),
    __metadata("design:type", String)
], FloodDamage.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reflection_id' }),
    __metadata("design:type", Number)
], FloodDamage.prototype, "reflectionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => require('../../reflections/entities/reflection.entity').Reflection, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'reflection_id' }),
    __metadata("design:type", Function)
], FloodDamage.prototype, "reflection", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'household_id', nullable: true }),
    __metadata("design:type", Number)
], FloodDamage.prototype, "householdId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => require('../../residents/entities/resident.entity').Resident, {
        onDelete: 'SET NULL',
        nullable: true,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'household_id' }),
    __metadata("design:type", Function)
], FloodDamage.prototype, "household", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by' }),
    __metadata("design:type", Number)
], FloodDamage.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => require('../../users/entities/user.entity').User, {
        onDelete: 'RESTRICT',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", Function)
], FloodDamage.prototype, "creator", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reviewed_by', nullable: true }),
    __metadata("design:type", Number)
], FloodDamage.prototype, "reviewedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reviewed_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], FloodDamage.prototype, "reviewedAt", void 0);
exports.FloodDamage = FloodDamage = __decorate([
    (0, typeorm_1.Entity)('flood_damages')
], FloodDamage);
//# sourceMappingURL=flood-damage.entity.js.map