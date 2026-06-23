"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LikesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const like_entity_1 = require("./entities/like.entity");
const reflection_entity_1 = require("./entities/reflection.entity");
let LikesService = class LikesService {
    constructor(likeRepository, reflectionRepository) {
        this.likeRepository = likeRepository;
        this.reflectionRepository = reflectionRepository;
    }
    async toggleLike(reflectionId, userId) {
        const reflection = await this.reflectionRepository.findOne({
            where: { id: reflectionId },
        });
        if (!reflection) {
            throw new common_1.NotFoundException('Không tìm thấy phản ánh');
        }
        const existingLike = await this.likeRepository.findOne({
            where: { reflectionId, userId },
        });
        if (existingLike) {
            await this.likeRepository.remove(existingLike);
            const totalLikes = await this.getLikeCount(reflectionId);
            return {
                statusCode: 200,
                message: 'Đã bỏ thích',
                data: { liked: false, totalLikes },
            };
        }
        const like = this.likeRepository.create({
            reflectionId,
            userId,
        });
        await this.likeRepository.save(like);
        const totalLikes = await this.getLikeCount(reflectionId);
        return {
            statusCode: 201,
            message: 'Đã thích',
            data: { liked: true, totalLikes },
        };
    }
    async checkLiked(reflectionId, userId) {
        const like = await this.likeRepository.findOne({
            where: { reflectionId, userId },
        });
        return { liked: !!like };
    }
    async getLikeCount(reflectionId) {
        return await this.likeRepository.count({
            where: { reflectionId },
        });
    }
    async getLikes(reflectionId, page = 1, limit = 20) {
        const [data, total] = await this.likeRepository.findAndCount({
            where: { reflectionId },
            relations: ['user'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return {
            statusCode: 200,
            message: 'Thành công',
            data,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
};
exports.LikesService = LikesService;
exports.LikesService = LikesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(like_entity_1.Like)),
    __param(1, (0, typeorm_1.InjectRepository)(reflection_entity_1.Reflection)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], LikesService);
//# sourceMappingURL=likes.service.js.map