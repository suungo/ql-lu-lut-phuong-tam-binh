import { CloudinaryService } from '../cloudinary/cloudinary.service';
export declare class UploadController {
    private readonly cloudinaryService;
    constructor(cloudinaryService: CloudinaryService);
    uploadFile(file: Express.Multer.File): Promise<{
        url: any;
        publicId: any;
        resourceType: any;
    }>;
}
