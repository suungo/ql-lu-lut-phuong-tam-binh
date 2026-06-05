export enum ReflectionStatus {
  PENDING = 'PENDING', // Chờ xác minh (vừa gửi)
  VERIFIED = 'VERIFIED', // OFFICER đã xác minh hợp lệ, gửi lên MANAGER
  ASSIGNED = 'ASSIGNED', // MANAGER đã giao cho INSPECTOR, INSPECTOR điều PATROL
  IN_PROGRESS = 'IN_PROGRESS', // PATROL đang xử lý thực địa
  COMPLETED = 'COMPLETED', // PATROL đã xong, chờ INSPECTOR báo cáo lên MANAGER
  RESOLVED = 'RESOLVED', // MANAGER xác nhận hoàn thành (hiển thị bản đồ)
  REJECTED = 'REJECTED', // OFFICER từ chối (không xảy ra/thông tin sai)
}

export enum EventType {
  RAIN = 'RAIN', // Mưa
  TIDE = 'TIDE', // Mực nước
  FLOOD = 'FLOOD', // Lũ lụt
  DYKE_BREAK = 'DYKE_BREAK', // Vỡ đê
  // sạt lở
  LANDSLIDE = 'LANDSLIDE', // Sạt lở
  OTHER = 'OTHER', // Loại khác
}

// Mức độ
export enum Priority {
  LOW = 'LOW', // Thấp
  MEDIUM = 'MEDIUM', // Trung bình
  HIGH = 'HIGH', // Cao
}

// Loại danh mục
export enum Category {
  INFRASTRUCTURE = 'INFRASTRUCTURE', // Hạ tầng
  ENVIRONMENT = 'ENVIRONMENT', // Môi trường
  SECURITY = 'SECURITY', // An ninh trật tự
  OTHER = 'OTHER', // Loại khác
}
