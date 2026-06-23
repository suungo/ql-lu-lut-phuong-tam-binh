import { Repository } from 'typeorm';
import { Province } from './entities/province.entity';
import { Ward } from './entities/ward.entity';
export declare class AdministrativeService {
    private readonly provinceRepo;
    private readonly wardRepo;
    constructor(provinceRepo: Repository<Province>, wardRepo: Repository<Ward>);
    getProvinces(): Promise<Province[]>;
    getWards(provinceCode: number): Promise<Ward[]>;
    seedWards(): Promise<{
        message: string;
        success?: undefined;
    } | {
        message: string;
        success: boolean;
    }>;
}
