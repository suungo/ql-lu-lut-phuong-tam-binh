"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = exports.Priority = exports.EventType = exports.ReflectionStatus = void 0;
var ReflectionStatus;
(function (ReflectionStatus) {
    ReflectionStatus["PENDING"] = "PENDING";
    ReflectionStatus["VERIFIED"] = "VERIFIED";
    ReflectionStatus["ASSIGNED"] = "ASSIGNED";
    ReflectionStatus["IN_PROGRESS"] = "IN_PROGRESS";
    ReflectionStatus["COMPLETED"] = "COMPLETED";
    ReflectionStatus["RESOLVED"] = "RESOLVED";
    ReflectionStatus["REJECTED"] = "REJECTED";
})(ReflectionStatus || (exports.ReflectionStatus = ReflectionStatus = {}));
var EventType;
(function (EventType) {
    EventType["RAIN"] = "RAIN";
    EventType["TIDE"] = "TIDE";
    EventType["FLOOD"] = "FLOOD";
    EventType["DYKE_BREAK"] = "DYKE_BREAK";
    EventType["LANDSLIDE"] = "LANDSLIDE";
    EventType["OTHER"] = "OTHER";
})(EventType || (exports.EventType = EventType = {}));
var Priority;
(function (Priority) {
    Priority["LOW"] = "LOW";
    Priority["MEDIUM"] = "MEDIUM";
    Priority["HIGH"] = "HIGH";
})(Priority || (exports.Priority = Priority = {}));
var Category;
(function (Category) {
    Category["INFRASTRUCTURE"] = "INFRASTRUCTURE";
    Category["ENVIRONMENT"] = "ENVIRONMENT";
    Category["SECURITY"] = "SECURITY";
    Category["OTHER"] = "OTHER";
})(Category || (exports.Category = Category = {}));
//# sourceMappingURL=reflection.enum.js.map