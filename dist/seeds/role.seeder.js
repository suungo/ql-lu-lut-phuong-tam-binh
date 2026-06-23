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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleSeederService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const role_code_enum_1 = require("../common/enums/role-code.enum");
const role_entity_1 = require("../modules/roles/entities/role.entity");
const typeorm_2 = require("typeorm");
const defaultRoles = [
    {
        roleCode: role_code_enum_1.RoleCode.ADMIN,
        roleName: 'Quản trị viên',
        description: 'Toàn quyền hệ thống',
    },
    {
        roleCode: role_code_enum_1.RoleCode.MANAGER,
        roleName: 'Quản lý',
        description: 'Quản lý hoạt động phường',
    },
    {
        roleCode: role_code_enum_1.RoleCode.OFFICER,
        roleName: 'Cán bộ',
        description: 'Cán bộ tăng cường',
    },
    {
        roleCode: role_code_enum_1.RoleCode.INSPECTOR,
        roleName: 'Hậu kiểm',
        description: 'Cán bộ hậu kiểm',
    },
    {
        roleCode: role_code_enum_1.RoleCode.PATROL,
        roleName: 'Tuần tra',
        description: 'Cán bộ tuần tra',
    },
    {
        roleCode: role_code_enum_1.RoleCode.STAFF,
        roleName: 'Nhân viên',
        description: 'Nhân viên y tế',
    },
    {
        roleCode: role_code_enum_1.RoleCode.RESIDENT,
        roleName: 'Người dân',
        description: 'Người dân sinh sống tại địa bàn',
    },
];
let RoleSeederService = class RoleSeederService {
    constructor(roleRepo) {
        this.roleRepo = roleRepo;
    }
    async seedRoles() {
        for (const role of defaultRoles) {
            const existing = await this.roleRepo.findOne({
                where: { roleCode: role.roleCode },
            });
            if (!existing) {
                await this.roleRepo.save(this.roleRepo.create(role));
                console.log(`✅ Seeded role: ${role.roleName}`);
            }
        }
        console.log('✅ All roles seeded!');
    }
};
exports.RoleSeederService = RoleSeederService;
exports.RoleSeederService = RoleSeederService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], RoleSeederService);
//# sourceMappingURL=role.seeder.js.map