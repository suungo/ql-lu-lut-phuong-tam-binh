import { RoleSeederService } from './role.seeder';
export declare class SeederRunner {
    private readonly roleSeeder;
    constructor(roleSeeder: RoleSeederService);
    runAllSeeders(): Promise<void>;
}
