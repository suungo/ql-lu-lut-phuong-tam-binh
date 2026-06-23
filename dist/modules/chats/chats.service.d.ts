import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
export declare class ChatsService {
    private readonly convRepo;
    private readonly msgRepo;
    constructor(convRepo: Repository<Conversation>, msgRepo: Repository<Message>);
    getOrCreateConversation(user1Id: number, user2Id: number): Promise<{
        statusCode: number;
        message: string;
        data: Conversation;
    }>;
    getMyConversations(userId: number): Promise<{
        statusCode: number;
        message: string;
        data: Conversation[];
    }>;
    getMessages(conversationId: number, page?: number, limit?: number): Promise<{
        statusCode: number;
        message: string;
        data: Message[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    sendMessage(conversationId: number, senderId: number, content: string): Promise<Message>;
}
