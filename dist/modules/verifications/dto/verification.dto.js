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
exports.UpdateVerificationDto = exports.CreateVerificationDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const verification_enum_1 = require("../enums/verification.enum");
class CreateVerificationDto {
}
exports.CreateVerificationDto = CreateVerificationDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateVerificationDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateVerificationDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: verification_enum_1.VerificationType, default: verification_enum_1.VerificationType.OTHER }),
    (0, class_validator_1.IsEnum)(verification_enum_1.VerificationType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateVerificationDto.prototype, "verificationType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateVerificationDto.prototype, "attachments", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateVerificationDto.prototype, "referenceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateVerificationDto.prototype, "cccd", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: verification_enum_1.VerificationStatus, required: false }),
    (0, class_validator_1.IsEnum)(verification_enum_1.VerificationStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateVerificationDto.prototype, "status", void 0);
class UpdateVerificationDto extends (0, swagger_1.PartialType)(CreateVerificationDto) {
}
exports.UpdateVerificationDto = UpdateVerificationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: verification_enum_1.VerificationStatus, required: false }),
    (0, class_validator_1.IsEnum)(verification_enum_1.VerificationStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateVerificationDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateVerificationDto.prototype, "reviewNote", void 0);
//# sourceMappingURL=verification.dto.js.map