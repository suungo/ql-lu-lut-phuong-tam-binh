import { RoleCode } from 'src/common/enums/role-code.enum';
export declare const ROLES_KEY = "roles";
export declare const Roles: (...roles: RoleCode[]) => import("@nestjs/common").CustomDecorator<string>;
