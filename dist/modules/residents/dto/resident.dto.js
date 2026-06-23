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
exports.UpdateResidentDto = exports.CreateResidentDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const resident_enum_1 = require("../enums/resident.enum");
class CreateResidentDto {
}
exports.CreateResidentDto = CreateResidentDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateResidentDto.prototype, "residentCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateResidentDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateResidentDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateResidentDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateResidentDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateResidentDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreateResidentDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateResidentDto.prototype, "floor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateResidentDto.prototype, "numberOfMembers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: resident_enum_1.HasElderly, default: resident_enum_1.HasElderly.NO }),
    (0, class_validator_1.IsEnum)(resident_enum_1.HasElderly),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateResidentDto.prototype, "hasElderly", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: resident_enum_1.HasChildren, default: resident_enum_1.HasChildren.NO }),
    (0, class_validator_1.IsEnum)(resident_enum_1.HasChildren),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateResidentDto.prototype, "hasChildren", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: resident_enum_1.HasPregnant, default: resident_enum_1.HasPregnant.NO }),
    (0, class_validator_1.IsEnum)(resident_enum_1.HasPregnant),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateResidentDto.prototype, "hasPregnantWomen", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: resident_enum_1.HasSick, default: resident_enum_1.HasSick.NO }),
    (0, class_validator_1.IsEnum)(resident_enum_1.HasSick),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateResidentDto.prototype, "hasChronicDisease", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: resident_enum_1.HouseType, default: resident_enum_1.HouseType.HOUSE_LEVEL_4 }),
    (0, class_validator_1.IsEnum)(resident_enum_1.HouseType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateResidentDto.prototype, "houseType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateResidentDto.prototype, "numberOfFloors", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: resident_enum_1.HasBusiness, default: resident_enum_1.HasBusiness.NO }),
    (0, class_validator_1.IsEnum)(resident_enum_1.HasBusiness),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateResidentDto.prototype, "hasBusiness", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, default: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateResidentDto.prototype, "createAccount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateResidentDto.prototype, "userId", void 0);
class UpdateResidentDto extends (0, swagger_1.PartialType)(CreateResidentDto) {
}
exports.UpdateResidentDto = UpdateResidentDto;
//# sourceMappingURL=resident.dto.js.map