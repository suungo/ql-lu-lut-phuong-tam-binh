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
exports.HumanResource = void 0;
const base_entity_1 = require("../../../common/entities/base.entity");
const gender_enum_1 = require("../../../common/enums/gender.enum");
const typeorm_1 = require("typeorm");
const human_resource_enum_1 = require("../enums/human-resource.enum");
let HumanResource = class HumanResource extends base_entity_1.BaseEntity {
};
exports.HumanResource = HumanResource;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], HumanResource.prototype, "fullName", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], HumanResource.prototype, "employeeCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], HumanResource.prototype, "phoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], HumanResource.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: gender_enum_1.Gender, default: gender_enum_1.Gender.MALE }),
    __metadata("design:type", String)
], HumanResource.prototype, "gender", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], HumanResource.prototype, "dateBirth", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], HumanResource.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], HumanResource.prototype, "avatar", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: human_resource_enum_1.HumanResourcePosition,
        default: human_resource_enum_1.HumanResourcePosition.STAFF,
    }),
    __metadata("design:type", String)
], HumanResource.prototype, "position", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: human_resource_enum_1.HumanResourceStatus,
    }),
    __metadata("design:type", String)
], HumanResource.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], HumanResource.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], HumanResource.prototype, "userId", void 0);
exports.HumanResource = HumanResource = __decorate([
    (0, typeorm_1.Entity)('human_resources')
], HumanResource);
//# sourceMappingURL=human-resource.entity.js.map