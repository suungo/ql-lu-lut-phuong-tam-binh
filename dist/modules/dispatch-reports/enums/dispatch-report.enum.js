"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DispatchReportType = exports.DispatchReportStatus = void 0;
var DispatchReportStatus;
(function (DispatchReportStatus) {
    DispatchReportStatus["PENDING"] = "PENDING";
    DispatchReportStatus["ACCEPTED"] = "ACCEPTED";
    DispatchReportStatus["REJECTED"] = "REJECTED";
    DispatchReportStatus["EXPIRED"] = "EXPIRED";
    DispatchReportStatus["IN_PROGRESS"] = "IN_PROGRESS";
    DispatchReportStatus["COMPLETED"] = "COMPLETED";
    DispatchReportStatus["CANCELLED"] = "CANCELLED";
})(DispatchReportStatus || (exports.DispatchReportStatus = DispatchReportStatus = {}));
var DispatchReportType;
(function (DispatchReportType) {
    DispatchReportType["MANAGER_TO_INSPECTOR"] = "MANAGER_TO_INSPECTOR";
    DispatchReportType["INSPECTOR_TO_PATROL"] = "INSPECTOR_TO_PATROL";
})(DispatchReportType || (exports.DispatchReportType = DispatchReportType = {}));
//# sourceMappingURL=dispatch-report.enum.js.map