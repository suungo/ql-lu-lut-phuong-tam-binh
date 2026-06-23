import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
import { User } from 'src/modules/users/entities/user.entity';
import { Repository } from 'typeorm';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private configService;
    private userRepository;
    constructor(configService: ConfigService, userRepository: Repository<User>);
    validate(payload: any): Promise<{
        sub: number;
        id: number;
        phoneNumber: string;
        email: string;
        fullName: string;
        role: import("../../roles/entities/role.entity").Role;
        roleCode: import("../../../common/enums/role-code.enum").RoleCode;
    }>;
}
export {};
