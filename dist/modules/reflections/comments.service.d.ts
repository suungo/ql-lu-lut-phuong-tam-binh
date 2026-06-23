import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { Reflection } from './entities/reflection.entity';
export declare class CommentsService {
    private readonly commentRepository;
    private readonly reflectionRepository;
    constructor(commentRepository: Repository<Comment>, reflectionRepository: Repository<Reflection>);
    create(reflectionId: number, userId: number, content: string, parentId?: number): Promise<{
        statusCode: number;
        message: string;
        data: Comment;
    }>;
    findAll(reflectionId: number, page?: number, limit?: number): Promise<{
        statusCode: number;
        message: string;
        data: Comment[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    update(commentId: number, userId: number, content: string): Promise<{
        statusCode: number;
        message: string;
        data: Comment;
    }>;
    remove(commentId: number, userId: number, isAdmin?: boolean): Promise<{
        statusCode: number;
        message: string;
    }>;
    getCommentCount(reflectionId: number): Promise<number>;
}
