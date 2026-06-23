import { Repository } from 'typeorm';
import { Like } from './entities/like.entity';
import { Reflection } from './entities/reflection.entity';
export declare class LikesService {
    private readonly likeRepository;
    private readonly reflectionRepository;
    constructor(likeRepository: Repository<Like>, reflectionRepository: Repository<Reflection>);
    toggleLike(reflectionId: number, userId: number): Promise<{
        statusCode: number;
        message: string;
        data: {
            liked: boolean;
            totalLikes: number;
        };
    }>;
    checkLiked(reflectionId: number, userId: number): Promise<{
        liked: boolean;
    }>;
    getLikeCount(reflectionId: number): Promise<number>;
    getLikes(reflectionId: number, page?: number, limit?: number): Promise<{
        statusCode: number;
        message: string;
        data: Like[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
}
