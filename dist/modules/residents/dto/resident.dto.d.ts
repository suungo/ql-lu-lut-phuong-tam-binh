import { HasBusiness, HasChildren, HasElderly, HasPregnant, HasSick, HouseType } from '../enums/resident.enum';
export declare class CreateResidentDto {
    residentCode: string;
    fullName: string;
    phoneNumber?: string;
    email?: string;
    address?: string;
    latitude: number;
    longitude: number;
    floor?: number;
    numberOfMembers: number;
    hasElderly: HasElderly;
    hasChildren: HasChildren;
    hasPregnantWomen: HasPregnant;
    hasChronicDisease: HasSick;
    houseType: HouseType;
    numberOfFloors: number;
    hasBusiness: HasBusiness;
    createAccount?: boolean;
    userId?: number;
}
declare const UpdateResidentDto_base: import("@nestjs/common").Type<Partial<CreateResidentDto>>;
export declare class UpdateResidentDto extends UpdateResidentDto_base {
}
export {};
