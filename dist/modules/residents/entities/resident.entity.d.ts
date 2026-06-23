import { BaseEntity } from 'src/common/entities/base.entity';
import type { FloodDamage } from 'src/modules/flood-damages/entities/flood-damage.entity';
import { HasBusiness, HasChildren, HasElderly, HasPregnant, HasSick, HouseType } from '../enums/resident.enum';
export declare class Resident extends BaseEntity {
    residentCode: string;
    fullName: string;
    phoneNumber?: string;
    email?: string;
    address: string;
    latitude: number;
    longitude: number;
    numberOfMembers: number;
    hasElderly: HasElderly;
    hasChildren: HasChildren;
    hasPregnantWomen: HasPregnant;
    hasChronicDisease: HasSick;
    houseType: HouseType;
    numberOfFloors: number;
    hasBusiness: HasBusiness;
    userId?: number;
    floodDamages: FloodDamage[];
}
