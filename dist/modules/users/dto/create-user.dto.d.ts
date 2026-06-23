import { RoleCode } from 'src/common/enums/role-code.enum';
export declare class CreateUserDto {
    fullName: string;
    phoneNumber: string;
    email?: string;
    password?: string;
    roleCode: RoleCode;
}
