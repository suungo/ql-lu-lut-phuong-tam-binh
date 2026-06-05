export enum HumanResourceStatus {
  ACTIVE = 'ACTIVE', // Đang làm việc
  INACTIVE = 'INACTIVE', // Đã dừng làm việc / Nghỉ việc
  PENDING = 'PENDING', // Chưa làm việc (đang chờ duyệt / onboarding)
}

export enum HumanResourcePosition {
  OFFICER = 'OFFICER', // Cán bộ phường (công an)
  LEADER = 'LEADER', // Trưởng/phó khu phố
  STAFF = 'STAFF', // Nhân viên y tế
  POSTOFFICER = 'POSTOFFICER', // Cán bộ hậu kiểm
  ELECTRICITYSTAFF = 'ELECTRICITYSTAFF', // Nhân viên điện lực
  PATROL = 'PATROL', // Cán bộ tuần tra
}
