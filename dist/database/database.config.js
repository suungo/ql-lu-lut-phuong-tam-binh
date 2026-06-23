"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabaseConfig = exports.ALL_ENTITIES = void 0;
const typeorm_naming_strategies_1 = require("typeorm-naming-strategies");
const conversation_entity_1 = require("../modules/chats/entities/conversation.entity");
const message_entity_1 = require("../modules/chats/entities/message.entity");
const flood_damage_entity_1 = require("../modules/flood-damages/entities/flood-damage.entity");
const human_resource_entity_1 = require("../modules/human-resources/entities/human-resource.entity");
const notification_entity_1 = require("../modules/notifications/entities/notification.entity");
const comment_entity_1 = require("../modules/reflections/entities/comment.entity");
const like_entity_1 = require("../modules/reflections/entities/like.entity");
const reflection_entity_1 = require("../modules/reflections/entities/reflection.entity");
const resident_entity_1 = require("../modules/residents/entities/resident.entity");
const role_entity_1 = require("../modules/roles/entities/role.entity");
const device_entity_1 = require("../modules/users/entities/device.entity");
const user_entity_1 = require("../modules/users/entities/user.entity");
const reputation_history_entity_1 = require("../modules/users/entities/reputation-history.entity");
const verification_entity_1 = require("../modules/verifications/entities/verification.entity");
const province_entity_1 = require("../modules/administrative/entities/province.entity");
const ward_entity_1 = require("../modules/administrative/entities/ward.entity");
const dispatch_report_entity_1 = require("../modules/dispatch-reports/entities/dispatch-report.entity");
const site_visit_entity_1 = require("../modules/statistics/entities/site-visit.entity");
const resident_contact_entity_1 = require("../modules/resident-contacts/entities/resident-contact.entity");
exports.ALL_ENTITIES = [
    user_entity_1.User,
    role_entity_1.Role,
    device_entity_1.Device,
    reputation_history_entity_1.ReputationHistory,
    province_entity_1.Province,
    ward_entity_1.Ward,
    flood_damage_entity_1.FloodDamage,
    human_resource_entity_1.HumanResource,
    resident_entity_1.Resident,
    reflection_entity_1.Reflection,
    like_entity_1.Like,
    comment_entity_1.Comment,
    verification_entity_1.Verification,
    notification_entity_1.Notification,
    conversation_entity_1.Conversation,
    message_entity_1.Message,
    dispatch_report_entity_1.DispatchReport,
    site_visit_entity_1.SiteVisit,
    resident_contact_entity_1.ResidentContact,
];
const getDatabaseConfig = (configService) => {
    const isProduction = configService.get('NODE_ENV') === 'production';
    return {
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: exports.ALL_ENTITIES,
        synchronize: configService.get('DB_SYNC') === 'true',
        namingStrategy: new typeorm_naming_strategies_1.SnakeNamingStrategy(),
        logging: ['error'],
        ssl: configService.get('DB_HOST') === 'localhost' ||
            configService.get('DB_HOST') === '127.0.0.1'
            ? false
            : { rejectUnauthorized: false },
        connectTimeoutMS: 10000,
        extra: {
            connectionTimeoutMillis: 10000,
        },
    };
};
exports.getDatabaseConfig = getDatabaseConfig;
//# sourceMappingURL=database.config.js.map