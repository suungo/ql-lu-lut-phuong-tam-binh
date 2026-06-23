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
exports.UpdateFloodDamageDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const damage_category_enum_1 = require("../enums/damage-category.enum");
const damage_status_enum_1 = require("../enums/damage-status.enum");
class UpdateFloodDamageDto {
}
exports.UpdateFloodDamageDto = UpdateFloodDamageDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: damage_category_enum_1.DamageCategory,
        example: damage_category_enum_1.DamageCategory.PROPERTY,
        required: false,
    }),
    (0, class_validator_1.IsEnum)(damage_category_enum_1.DamageCategory),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateFloodDamageDto.prototype, "damageCategory", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Nhà bị ngập nước', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateFloodDamageDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 50000000, required: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateFloodDamageDto.prototype, "estimatedValue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 0, required: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateFloodDamageDto.prototype, "injuredCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 0, required: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateFloodDamageDto.prototype, "deathCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: damage_status_enum_1.DamageStatus,
        example: damage_status_enum_1.DamageStatus.APPROVED,
        required: false,
    }),
    (0, class_validator_1.IsEnum)(damage_status_enum_1.DamageStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateFloodDamageDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 101, required: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateFloodDamageDto.prototype, "householdId", void 0);
//# sourceMappingURL=update-flood-damage.dto.js.map