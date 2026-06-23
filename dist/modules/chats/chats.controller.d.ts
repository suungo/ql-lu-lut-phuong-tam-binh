import { ChatsService } from './chats.service';
declare class SendMessageDto {
    content: string;
}
export declare class ChatsController {
    private readonly service;
    constructor(service: ChatsService);
    getOrCreate(userId: number, user: any): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/conversation.entity").Conversation;
    }>;
    getMyConversations(user: any): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/conversation.entity").Conversation[];
    }>;
    getMessages(conversationId: number, page?: number, limit?: number): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/message.entity").Message[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    sendMessage(conversationId: number, dto: SendMessageDto, user: any): Promise<import("./entities/message.entity").Message>;
}
export {};
