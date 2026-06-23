import { BaseEntity } from 'src/common/entities/base.entity';
import { RoleCode } from 'src/common/enums/role-code.enum';
import { User } from 'src/modules/users/entities/user.entity';
export declare class Role extends BaseEntity {
    roleName: string;
    roleCode: RoleCode;
    description: string;
    users: User[];
}
