import { CommentsService } from './comments.service';
import { CreateReflectionDto, UpdateReflectionDto } from './dto/reflection.dto';
import { ReflectionStatus } from './enums/reflection.enum';
import { LikesService } from './likes.service';
import { ReflectionsService } from './reflections.service';
export declare class ReflectionsController {
    private readonly service;
    private readonly likesService;
    private readonly commentsService;
    constructor(service: ReflectionsService, likesService: LikesService, commentsService: CommentsService);
    create(dto: CreateReflectionDto, user: any): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/reflection.entity").Reflection;
    }>;
    findAll(user: any, page?: number, limit?: number, keyword?: string, status?: ReflectionStatus, isMap?: boolean, assignedUserId?: number): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/reflection.entity").Reflection[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getAssignedStats(userId: number): Promise<{
        statusCode: number;
        message: string;
        data: {
            total: number;
            completed: number;
            inProgress: number;
            pending: number;
            rejected: number;
        };
    }>;
    findMy(user: any, page?: number, limit?: number): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/reflection.entity").Reflection[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findOne(id: number, user: any): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/reflection.entity").Reflection;
    }>;
    update(id: number, dto: UpdateReflectionDto, user: any): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/reflection.entity").Reflection;
    }>;
    remove(id: number, user: any): Promise<{
        statusCode: number;
        message: string;
    }>;
    updateStatus(id: number, dto: {
        status: ReflectionStatus;
    }, user: any): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/reflection.entity").Reflection;
    }>;
    verifyByOfficer(id: number, dto: {
        confirmed: boolean;
        rejectReason?: string;
        note?: string;
    }, user: any): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/reflection.entity").Reflection;
    }>;
    acceptByPatrol(id: number, user: any): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/reflection.entity").Reflection;
    }>;
    updatePatrolLocation(id: number, dto: {
        lat: number;
        lng: number;
    }, user: any): Promise<{
        statusCode: number;
        message: string;
        data: {
            patrolLat: number;
            patrolLng: number;
        };
    }>;
    submitPatrolReport(id: number, dto: {
        resolved: boolean;
        patrolReport: string;
        incompleteReason?: string;
    }, user: any): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/reflection.entity").Reflection;
    }>;
    managerConfirm(id: number, dto: {
        note?: string;
        rating?: number;
    }, user: any): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/reflection.entity").Reflection;
    }>;
    rateReflection(id: number, dto: {
        rating: number;
        comment?: string;
    }, user: any): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/reflection.entity").Reflection;
    }>;
    toggleLike(reflectionId: number, user: any): Promise<{
        statusCode: number;
        message: string;
        data: {
            liked: boolean;
            totalLikes: number;
        };
    }>;
    getLikes(reflectionId: number, page?: number, limit?: number): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/like.entity").Like[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getLikeCount(reflectionId: number): Promise<{
        statusCode: number;
        data: {
            count: number;
        };
    }>;
    checkLiked(reflectionId: number, user: any): Promise<{
        liked: boolean;
    }>;
    createComment(reflectionId: number, user: any, dto: {
        content: string;
        parentId?: number;
    }): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/comment.entity").Comment;
    }>;
    getComments(reflectionId: number, page?: number, limit?: number): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/comment.entity").Comment[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getCommentCount(reflectionId: number): Promise<{
        statusCode: number;
        data: {
            count: number;
        };
    }>;
    updateComment(commentId: number, user: any, dto: {
        content: string;
    }): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/comment.entity").Comment;
    }>;
    deleteComment(commentId: number, user: any): Promise<{
        statusCode: number;
        message: string;
    }>;
}
