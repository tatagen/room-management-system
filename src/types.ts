export type RoomStatus = 'dirty' | 'cleaning' | 'checking' | 'clean';
export type StaffRole = 'cleaner' | 'manager';
export type ReportType = 'issue' | 'lost_item';
export type ReportStatus = 'pending' | 'resolved';

export interface Room {
  id: string;
  roomNumber: string;
  status: RoomStatus;
  assignedStaffId: string | null;
  assignedStaffName: string | null;
  roomType?: string;
  updatedAt: any; // Timestamp
  lastMaintenanceDate?: any;
  maintenanceNote?: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  isRequired: boolean;
  order: number;
}

export interface MaintenanceLog {
  id: string;
  roomId: string;
  partName: string;
  replacedAt: any;
  staffName: string;
}

export interface Staff {
  id: string;
  name: string;
  role: StaffRole;
}

export interface Report {
  id: string;
  roomId: string;
  roomNumber: string;
  staffId: string;
  staffName: string;
  type: ReportType;
  description: string;
  imageUrl: string;
  status: ReportStatus;
  createdAt: any; // Timestamp
}
