import { Role } from 'src/modules/roles/entities/role.entity';
import { Repository } from 'typeorm';
export declare class RoleSeederService {
    private readonly roleRepo;
    constructor(roleRepo: Repository<Role>);
    seedRoles(): Promise<void>;
}
