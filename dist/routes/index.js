"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = void 0;
const auths_module_1 = require("../modules/auths/auths.module");
const chats_module_1 = require("../modules/chats/chats.module");
const human_resources_module_1 = require("../modules/human-resources/human-resources.module");
const notifications_module_1 = require("../modules/notifications/notifications.module");
const reflections_module_1 = require("../modules/reflections/reflections.module");
const residents_module_1 = require("../modules/residents/residents.module");
const roles_module_1 = require("../modules/roles/roles.module");
const users_module_1 = require("../modules/users/users.module");
const administrative_module_1 = require("../modules/administrative/administrative.module");
const dispatch_reports_module_1 = require("../modules/dispatch-reports/dispatch-reports.module");
const resident_contacts_module_1 = require("../modules/resident-contacts/resident-contacts.module");
exports.routes = [
    { path: 'auth', module: auths_module_1.AuthsModule },
    { path: 'users', module: users_module_1.UsersModule },
    { path: 'roles', module: roles_module_1.RolesModule },
    { path: 'human-resources', module: human_resources_module_1.HumanResourcesModule },
    { path: 'residents', module: residents_module_1.ResidentsModule },
    { path: 'reports', module: reflections_module_1.ReflectionsModule },
    { path: 'chats', module: chats_module_1.ChatsModule },
    { path: 'notifications', module: notifications_module_1.NotificationsModule },
    { path: 'administrative', module: administrative_module_1.AdministrativeModule },
    { path: 'dispatch-reports', module: dispatch_reports_module_1.DispatchReportsModule },
    { path: 'resident-contacts', module: resident_contacts_module_1.ResidentContactsModule },
];
//# sourceMappingURL=index.js.map