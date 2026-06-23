"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Public = void 0;
const Public = () => {
    const { SetMetadata } = require('@nestjs/common');
    return SetMetadata('isPublic', true);
};
exports.Public = Public;
//# sourceMappingURL=public.decorator.js.map