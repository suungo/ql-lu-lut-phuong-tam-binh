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
exports.CreateHumanResourceDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const gender_enum_1 = require("../../../common/enums/gender.enum");
const human_resource_enum_1 = require("../enums/human-resource.enum");
class CreateHumanResourceDto {
}
exports.CreateHumanResourceDto = CreateHumanResourceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Nguyễn Văn A' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateHumanResourceDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'NV001' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateHumanResourceDto.prototype, "employeeCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '0898987871' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateHumanResourceDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateHumanResourceDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: gender_enum_1.Gender, default: gender_enum_1.Gender.MALE }),
    (0, class_validator_1.IsEnum)(gender_enum_1.Gender),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateHumanResourceDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], CreateHumanResourceDto.prototype, "dateBirth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateHumanResourceDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateHumanResourceDto.prototype, "avatar", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: human_resource_enum_1.HumanResourcePosition }),
    (0, class_validator_1.IsEnum)(human_resource_enum_1.HumanResourcePosition),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateHumanResourceDto.prototype, "position", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: human_resource_enum_1.HumanResourceStatus }),
    (0, class_validator_1.IsEnum)(human_resource_enum_1.HumanResourceStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateHumanResourceDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateHumanResourceDto.prototype, "notes", void 0);
//# sourceMappingURL=create-human-resource.dto.js.map