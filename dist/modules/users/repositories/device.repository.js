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
exports.DeviceRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const device_entity_1 = require("../entities/device.entity");
let DeviceRepository = class DeviceRepository extends typeorm_1.Repository {
    constructor(dataSource) {
        super(device_entity_1.Device, dataSource.createEntityManager());
        this.dataSource = dataSource;
    }
    async findByDeviceId(deviceId) {
        return this.findOne({ where: { deviceId }, relations: ['user'] });
    }
    async findActiveDevicesByUserId(userId) {
        return this.find({
            where: { userId, isActive: true },
            order: { lastActiveAt: 'DESC' },
        });
    }
    async deactivateDevice(deviceId) {
        await this.update({ deviceId }, { isActive: false });
    }
    async deactivateAllUserDevices(userId, exceptDeviceId) {
        const query = this.createQueryBuilder()
            .update(device_entity_1.Device)
            .set({ isActive: false })
            .where('user_id = :userId', { userId });
        if (exceptDeviceId) {
            query.andWhere('deviceId != :deviceId', { deviceId: exceptDeviceId });
        }
        await query.execute();
    }
    async updateLastActive(deviceId) {
        await this.update({ deviceId }, { lastActiveAt: new Date() });
    }
};
exports.DeviceRepository = DeviceRepository;
exports.DeviceRepository = DeviceRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], DeviceRepository);
//# sourceMappingURL=device.repository.js.map