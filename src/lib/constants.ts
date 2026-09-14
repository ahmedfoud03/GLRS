// Hospital Constants & Configuration
// Greenland International Hospital - مستشفى اللواء الأخضر الدولي

export const HOSPITAL_INFO = {
  nameAr: 'مستشفى اللواء الأخضر الدولي',
  nameEn: 'Greenland International Hospital',
  taglineAr: '',
  taglineEn: '',
  systemName: 'نظام إدارة التقارير اليومية (GLRS)',
  logoUrl: '/logo.png',
  city: 'ج.ي - إب - السحول - خط صنعاء',
  cityEn: 'Yemen - Ibb - Al-Sahool - Sanaa Road',
  contactEmail: 'reports@greenland-hospital.ye',
  contactPhone: '04/469666 - 785533023',
  storageBucket: 'report_attachments'
};

export const BRAND_COLORS = {
  // Hospital Brand Colors based on the official emblem
  // Green: emerald family silhouettes in the logo
  primaryGreen: '#2E7D32',
  primaryGreenHover: '#1B5E20',
  // Blue: deep cobalt blue cupping hand & outer ring
  primaryBlue: '#1565C0',
  primaryBlueHover: '#0D47A1',
  // Red: crimson upper swoosh element
  primaryRed: '#C62828',
  primaryRedHover: '#B71C1C',
  darkBg: '#0F172A',
  lightBg: '#F8FAFC'
};

export const USER_ROLES: Record<string, { label: string; color: string; bg: string }> = {
  reporter: { label: 'مُعد تقرير (قسم/خدمة)', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  admin: { label: 'مدير عام المستشفى (Admin)', color: 'text-sky-700', bg: 'bg-sky-50 border-sky-200' },
  super_admin: { label: 'المسؤول التقني (Super Admin)', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' }
};

export const REPORT_STATUSES: Record<string, { label: string; color: string; bg: string; badgeClass: string; iconName: string }> = {
  draft: {
    label: 'مسودة',
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
    badgeClass: 'badge-draft',
    iconName: 'FileEdit'
  },
  submitted: {
    label: 'تم الرفع (قيد المراجعة)',
    color: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-200',
    badgeClass: 'badge-submitted',
    iconName: 'Clock'
  },
  returned: {
    label: 'معاد للتعديل',
    color: 'text-rose-700',
    bg: 'bg-rose-50 border-rose-200',
    badgeClass: 'badge-returned',
    iconName: 'AlertCircle'
  },
  closed: {
    label: 'معتمد ومغلق',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200',
    badgeClass: 'badge-closed',
    iconName: 'CheckCircle2'
  }
};

export const UNIT_TYPES: Record<string, { label: string; icon: string }> = {
  department: { label: 'قسم طبي / علاجي', icon: 'Building2' },
  service: { label: 'خدمة مساندة', icon: 'HeartHandshake' },
  administration: { label: 'إدارة / شؤون عامة', icon: 'Briefcase' },
  shift: { label: 'مناوبة / استلام', icon: 'Moon' },
  other: { label: 'أخرى', icon: 'Layers' }
};

export const FIELD_TYPES: Record<string, { label: string; description: string }> = {
  textarea: { label: 'نص متعدد الأسطر (شرح وتفاصيل)', description: 'مناسب للإنجازات، المشاكل، والمهام' },
  text: { label: 'نص قصير (سطر واحد)', description: 'مناسب للملاحظات الموجزة أو العناوين' },
  number: { label: 'رقم (إحصائيات وأعداد)', description: 'مناسب لأعداد الحالات، الفحوصات، أو الوصفات' },
  select: { label: 'قائمة اختيار مفردة (Dropdown)', description: 'لاختيار خيار واحد محدد' },
  multiselect: { label: 'قائمة اختيار متعددة', description: 'لاختيار عدة خيارات معًا' },
  checkbox: { label: 'مربع اختيار (نعم/لا)', description: 'لتأكيد حالة معينة' },
  date: { label: 'تاريخ', description: 'لتحديد تاريخ معين' },
  time: { label: 'وقت', description: 'لتحديد زمن معين' },
  file: { label: 'ملف / مستند مرفق', description: 'لإرفاق صور، تقارير PDF، أو وثائق' }
};
