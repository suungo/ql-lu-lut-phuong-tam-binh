import { BaseEntity } from 'src/common/entities/base.entity';
import { Gender } from 'src/common/enums/gender.enum';
import { HumanResourcePosition, HumanResourceStatus } from '../enums/human-resource.enum';
export declare class HumanResource extends BaseEntity {
    fullName: string;
    employeeCode: string;
    phoneNumber: string;
    email?: string;
    gender: Gender;
    dateBirth?: Date;
    address?: string;
    avatar?: string;
    position: HumanResourcePosition;
    status: HumanResourceStatus;
    notes?: string;
    userId?: number;
}
