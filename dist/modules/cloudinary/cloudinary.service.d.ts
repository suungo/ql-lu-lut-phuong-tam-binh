import { ConfigService } from '@nestjs/config';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
export type CloudinaryResponse = UploadApiResponse | UploadApiErrorResponse;
export declare class CloudinaryService {
    private configService;
    constructor(configService: ConfigService);
    uploadFile(file: Express.Multer.File): Promise<CloudinaryResponse>;
}
