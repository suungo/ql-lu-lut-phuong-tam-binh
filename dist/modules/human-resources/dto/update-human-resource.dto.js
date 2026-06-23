"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateHumanResourceDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_human_resource_dto_1 = require("./create-human-resource.dto");
class UpdateHumanResourceDto extends (0, swagger_1.PartialType)(create_human_resource_dto_1.CreateHumanResourceDto) {
}
exports.UpdateHumanResourceDto = UpdateHumanResourceDto;
//# sourceMappingURL=update-human-resource.dto.js.map