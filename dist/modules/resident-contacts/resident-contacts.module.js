"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResidentContactsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const resident_contact_entity_1 = require("./entities/resident-contact.entity");
const resident_contacts_controller_1 = require("./resident-contacts.controller");
const resident_contacts_service_1 = require("./resident-contacts.service");
let ResidentContactsModule = class ResidentContactsModule {
};
exports.ResidentContactsModule = ResidentContactsModule;
exports.ResidentContactsModule = ResidentContactsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([resident_contact_entity_1.ResidentContact])],
        controllers: [resident_contacts_controller_1.ResidentContactsController],
        providers: [resident_contacts_service_1.ResidentContactsService],
        exports: [resident_contacts_service_1.ResidentContactsService],
    })
], ResidentContactsModule);
//# sourceMappingURL=resident-contacts.module.js.map