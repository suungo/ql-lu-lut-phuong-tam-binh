import { Category, EventType, Priority, ReflectionStatus } from '../enums/reflection.enum';
export declare class CreateReflectionDto {
    title: string;
    content: string;
    category: Category;
    description?: string;
    lat: number;
    lng: number;
    address: string;
    imageUrl: string[];
    priority: Priority;
    typeOfIncident: EventType;
    isPublishedOnMap?: boolean;
    originalReflectionId?: number;
}
declare const UpdateReflectionDto_base: import("@nestjs/common").Type<Partial<CreateReflectionDto>>;
export declare class UpdateReflectionDto extends UpdateReflectionDto_base {
    title?: string;
    content?: string;
    category?: Category;
    description?: string;
    lat?: number;
    lng?: number;
    address?: string;
    imageUrl?: string[];
    priority?: Priority;
    typeOfIncident?: EventType;
    response?: string;
}
export declare class ResponseReflectionDto {
    title?: string;
    content?: string;
    category?: Category;
    description?: string;
    lat?: number;
    lng?: number;
    address?: string;
    imageUrl?: string[];
    priority?: Priority;
    typeOfIncident?: EventType;
    status?: ReflectionStatus;
    response?: string;
}
export {};
