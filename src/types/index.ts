import { Profile, ReportingUnit, ReportTemplate, DailyReport, ReportStatus, UnitType, UserRole } from './database.types';

export * from './database.types';

export interface AuthUser {
  id: string;
  email: string;
  profile: Profile;
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
}

export interface DailyReportFilter {
  date?: string;
  startDate?: string;
  endDate?: string;
  unitId?: string;
  status?: ReportStatus | 'all';
  searchQuery?: string;
}

export interface UnsubmittedUnitInfo {
  unit: ReportingUnit;
  hasSubmitted: boolean;
  report?: DailyReport | null;
  assignedUsers: Profile[];
  status: 'submitted' | 'draft' | 'returned' | 'closed' | 'unsubmitted';
}

export interface AdminStatsSummary {
  totalActiveUnits: number;
  totalSubmittedToday: number;
  totalUnsubmittedToday: number;
  totalReturnedToday: number;
  totalClosedToday: number;
  totalDraftsToday: number;
  submissionRate: number; // percentage 0 - 100
}

export interface FormFieldAnswerState {
  field_id: string;
  field_name: string;
  field_label: string;
  value: any;
  error?: string;
}
