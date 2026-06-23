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
exports.Verification = void 0;
const base_entity_1 = require("../../../common/entities/base.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const typeorm_1 = require("typeorm");
const verification_enum_1 = require("../enums/verification.enum");
let Verification = class Verification extends base_entity_1.BaseEntity {
};
exports.Verification = Verification;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Verification.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Verification.prototype, "expiredAt", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Verification.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Verification.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: verification_enum_1.VerificationType,
        default: verification_enum_1.VerificationType.OTHER,
    }),
    __metadata("design:type", String)
], Verification.prototype, "verificationType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: verification_enum_1.VerificationStatus,
        default: verification_enum_1.VerificationStatus.PENDING,
    }),
    __metadata("design:type", String)
], Verification.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], Verification.prototype, "reviewNote", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Verification.prototype, "reviewedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: 'reviewed_by' }),
    __metadata("design:type", Number)
], Verification.prototype, "reviewedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: 'user_id' }),
    __metadata("design:type", Number)
], Verification.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], Verification.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'json' }),
    __metadata("design:type", Array)
], Verification.prototype, "attachments", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: 'reference_id' }),
    __metadata("design:type", Number)
], Verification.prototype, "referenceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Verification.prototype, "cccd", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, default: null, name: 'is_matched_contact' }),
    __metadata("design:type", Boolean)
], Verification.prototype, "isMatchedContact", void 0);
exports.Verification = Verification = __decorate([
    (0, typeorm_1.Entity)('verifications')
], Verification);
//# sourceMappingURL=verification.entity.js.map