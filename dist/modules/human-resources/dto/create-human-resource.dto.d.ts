import { Gender } from 'src/common/enums/gender.enum';
import { HumanResourcePosition, HumanResourceStatus } from '../enums/human-resource.enum';
export declare class CreateHumanResourceDto {
    fullName: string;
    employeeCode: string;
    phoneNumber: string;
    email?: string;
    gender?: Gender;
    dateBirth?: Date;
    address?: string;
    avatar?: string;
    position?: HumanResourcePosition;
    status?: HumanResourceStatus;
    notes?: string;
}
