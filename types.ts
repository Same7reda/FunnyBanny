export interface Guardian {
  name: string;
  relation: 'الأب' | 'الأم' | 'آخر';
  phone: string;
  email: string;
  accountId?: string;
}

export interface Child {
  id: string;
  name: string;
  age: number;
  address: string;
  healthStatus: string;
  guardian: Guardian;
  qrCodeId: string;
}

export type NewChild = Omit<Child, 'id'>;


export interface Staff {
  id: string;
  name: string;
  role: 'معلمة' | 'مشرفة' | 'إداري';
  specialization?: string;
  phone: string;
  qrCodeId: string;
  email: string;
  accountId?: string;
}

export type NewStaff = Omit<Staff, 'id'>;

export enum AttendanceStatus {
  Present = 'حاضر',
  Absent = 'غائب',
}

export interface AttendanceRecord {
  id: string;
  childId: string;
  childName: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: AttendanceStatus;
}

export type NewAttendanceRecord = Omit<AttendanceRecord, 'id'>;


export interface StaffAttendanceRecord {
  id: string;
  staffId: string;
  staffName: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: AttendanceStatus;
}

export type NewStaffAttendanceRecord = Omit<StaffAttendanceRecord, 'id'>;


export enum InvoiceStatus {
  Paid = 'مدفوعة',
  Unpaid = 'غير مدفوعة',
  Overdue = 'متأخرة',
}

export interface Invoice {
  id: string;
  childId: string;
  childName: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  paymentDate: string | null;
}

export type NewInvoice = Omit<Invoice, 'id'>;

export interface NurserySettings {
    checkInStartTime: string;
    checkInEndTime: string;
    checkOutStartTime: string;
    checkOutEndTime: string;
    nextDueDateStrategy: 'first_day_next_month' | 'last_day_next_month';
}

export type UserRole = 'admin' | 'staff' | 'parent';

export interface UserProfile {
    role: UserRole;
    linkId: string; // The ID of the staff member or child
}


export type ViewType = 'dashboard' | 'children' | 'staff' | 'attendance' | 'invoicing' | 'settings' | 'reports';