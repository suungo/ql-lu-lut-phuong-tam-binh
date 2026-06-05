export enum DispatchReportStatus {
  PENDING = 'PENDING', // Chờ xác nhận
  ACCEPTED = 'ACCEPTED', // Đã xác nhận
  REJECTED = 'REJECTED', // Từ chối
  EXPIRED = 'EXPIRED', // Hết hạn (quá 5 phút)
  IN_PROGRESS = 'IN_PROGRESS', // Đang xử lý
  COMPLETED = 'COMPLETED', // Hoàn thành
  CANCELLED = 'CANCELLED', // Đã hủy (phân công lại)
}

export enum DispatchReportType {
  MANAGER_TO_INSPECTOR = 'MANAGER_TO_INSPECTOR', // Quản lý → Hậu kiểm
  INSPECTOR_TO_PATROL = 'INSPECTOR_TO_PATROL', // Hậu kiểm → Tuần tra
}
