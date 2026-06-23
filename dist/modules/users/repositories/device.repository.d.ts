import { DataSource, Repository } from 'typeorm';
import { Device } from '../entities/device.entity';
export declare class DeviceRepository extends Repository<Device> {
    private dataSource;
    constructor(dataSource: DataSource);
    findByDeviceId(deviceId: string): Promise<Device | null>;
    findActiveDevicesByUserId(userId: number): Promise<Device[]>;
    deactivateDevice(deviceId: string): Promise<void>;
    deactivateAllUserDevices(userId: number, exceptDeviceId?: string): Promise<void>;
    updateLastActive(deviceId: string): Promise<void>;
}
