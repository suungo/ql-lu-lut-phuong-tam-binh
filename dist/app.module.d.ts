import { OnApplicationBootstrap } from '@nestjs/common';
import { SeederRunner } from './seeds/seeder-runner';
export declare class AppModule implements OnApplicationBootstrap {
    private readonly seederRunner;
    constructor(seederRunner: SeederRunner);
    onApplicationBootstrap(): Promise<void>;
}
