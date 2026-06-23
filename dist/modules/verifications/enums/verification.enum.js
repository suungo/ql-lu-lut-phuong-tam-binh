"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationType = exports.VerificationStatus = void 0;
var VerificationStatus;
(function (VerificationStatus) {
    VerificationStatus["PENDING"] = "PENDING";
    VerificationStatus["APPROVED"] = "APPROVED";
    VerificationStatus["REJECTED"] = "REJECTED";
    VerificationStatus["COMPLETED"] = "COMPLETED";
})(VerificationStatus || (exports.VerificationStatus = VerificationStatus = {}));
var VerificationType;
(function (VerificationType) {
    VerificationType["RESIDENT_REGISTRATION"] = "RESIDENT_REGISTRATION";
    VerificationType["VEHICLE_REGISTRATION"] = "VEHICLE_REGISTRATION";
    VerificationType["TEMPORARY_RESIDENT"] = "TEMPORARY_RESIDENT";
    VerificationType["REFLECTION"] = "REFLECTION";
    VerificationType["OTHER"] = "OTHER";
})(VerificationType || (exports.VerificationType = VerificationType = {}));
//# sourceMappingURL=verification.enum.js.map