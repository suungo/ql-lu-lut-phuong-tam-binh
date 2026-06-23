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
exports.FilterFloodDamageDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const damage_category_enum_1 = require("../enums/damage-category.enum");
const damage_status_enum_1 = require("../enums/damage-status.enum");
class FilterFloodDamageDto {
}
exports.FilterFloodDamageDto = FilterFloodDamageDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FilterFloodDamageDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: damage_category_enum_1.DamageCategory, required: false }),
    (0, class_validator_1.IsEnum)(damage_category_enum_1.DamageCategory),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FilterFloodDamageDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: damage_status_enum_1.DamageStatus, required: false }),
    (0, class_validator_1.IsEnum)(damage_status_enum_1.DamageStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FilterFloodDamageDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    __metadata("design:type", Number)
], FilterFloodDamageDto.prototype, "reflectionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    __metadata("design:type", Number)
], FilterFloodDamageDto.prototype, "householdId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ default: 1, required: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value) || 1),
    __metadata("design:type", Number)
], FilterFloodDamageDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ default: 10, required: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value) || 10),
    __metadata("design:type", Number)
], FilterFloodDamageDto.prototype, "limit", void 0);
//# sourceMappingURL=filter-flood-damage.dto.js.map