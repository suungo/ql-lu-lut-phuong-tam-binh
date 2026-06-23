import { AdministrativeService } from './administrative.service';
export declare class AdministrativeController {
    private readonly service;
    constructor(service: AdministrativeService);
    getProvinces(): Promise<import("./entities/province.entity").Province[]>;
    seedWards(): Promise<{
        message: string;
        success?: undefined;
    } | {
        message: string;
        success: boolean;
    }>;
    getWards(provinceCode: string): Promise<import("./entities/ward.entity").Ward[]>;
}
