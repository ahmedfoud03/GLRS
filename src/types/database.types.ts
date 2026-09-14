// Database type definitions for Greenland International Hospital (GLRS)

export type UserRole = 'reporter' | 'admin' | 'super_admin';
export type UnitType = 'department' | 'service' | 'administration' | 'shift' | 'other';
export type ReportStatus = 'draft' | 'submitted' | 'returned' | 'closed';
export type FieldType = 'text' | 'textarea' | 'number' | 'date' | 'time' | 'select' | 'multiselect' | 'checkbox' | 'file';
export type ReviewAction = 'reviewed' | 'returned' | 'closed';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  reporting_unit_id?: string | null;
  role: UserRole;
  active: boolean;
  created_at: string;
  updated_at: string;
  reporting_unit?: ReportingUnit | null;
}

export interface ReportingUnit {
  id: string;
  name: string;
  code?: string | null;
  type: UnitType;
  description?: string | null;
  report_template_id?: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
  report_template?: ReportTemplate | null;
  reporters_count?: number;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description?: string | null;
  is_default: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
  fields?: ReportField[];
}

export interface ReportField {
  id: string;
  template_id: string;
  field_name: string;
  field_label: string;
  field_type: FieldType;
  placeholder?: string | null;
  required: boolean;
  sort_order: number;
  options?: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface DailyReport {
  id: string;
  user_id: string;
  reporting_unit_id: string;
  template_id: string;
  report_date: string; // YYYY-MM-DD
  status: ReportStatus;
  submitted_at?: string | null;
  closed_at?: string | null;
  created_at: string;
  updated_at: string;
  // Joined Relations
  user?: Profile;
  reporting_unit?: ReportingUnit;
  template?: ReportTemplate;
  answers?: ReportAnswer[];
  attachments?: Attachment[];
  reviews?: ReportReview[];
}

export interface ReportAnswer {
  id: string;
  report_id: string;
  field_id: string;
  value: any; // string, number, string[], boolean, etc.
  created_at: string;
  updated_at: string;
  field?: ReportField;
}

export interface Attachment {
  id: string;
  report_id: string;
  file_name: string;
  file_path: string;
  file_type?: string | null;
  file_size?: number | null;
  uploaded_by: string;
  created_at: string;
  uploader?: Profile;
}

export interface ReportReview {
  id: string;
  report_id: string;
  reviewer_id: string;
  action: ReviewAction;
  comment?: string | null;
  created_at: string;
  reviewer?: Profile;
}

export interface AuditLog {
  id: string;
  user_id?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  metadata?: Record<string, any> | null;
  created_at: string;
  user?: Profile;
}
