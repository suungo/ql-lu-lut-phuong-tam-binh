import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Device } from '../entities/device.entity';

@Injectable()
export class DeviceRepository extends Repository<Device> {
  constructor(private dataSource: DataSource) {
    super(Device, dataSource.createEntityManager());
  }

  async findByDeviceId(deviceId: string): Promise<Device | null> {
    return this.findOne({ where: { deviceId }, relations: ['user'] });
  }

  async findActiveDevicesByUserId(userId: number): Promise<Device[]> {
    return this.find({
      where: { userId, isActive: true },
      order: { lastActiveAt: 'DESC' },
    });
  }

  async deactivateDevice(deviceId: string): Promise<void> {
    await this.update({ deviceId }, { isActive: false });
  }

  async deactivateAllUserDevices(
    userId: number,
    exceptDeviceId?: string,
  ): Promise<void> {
    const query = this.createQueryBuilder()
      .update(Device)
      .set({ isActive: false })
      .where('user_id = :userId', { userId });

    if (exceptDeviceId) {
      query.andWhere('deviceId != :deviceId', { deviceId: exceptDeviceId });
    }

    await query.execute();
  }

  async updateLastActive(deviceId: string): Promise<void> {
    await this.update({ deviceId }, { lastActiveAt: new Date() });
  }
}
