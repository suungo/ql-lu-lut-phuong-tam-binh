export declare class CreateResidentContactDto {
    email?: string;
    phoneNumber?: string;
    cccd: string;
    address?: string;
}
export declare class BulkCreateResidentContactDto {
    contacts: CreateResidentContactDto[];
}
declare const UpdateResidentContactDto_base: import("@nestjs/common").Type<Partial<CreateResidentContactDto>>;
export declare class UpdateResidentContactDto extends UpdateResidentContactDto_base {
}
export {};
