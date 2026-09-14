import { createClient } from '@supabase/supabase-js';
import { 
  Profile, 
  ReportingUnit, 
  ReportTemplate, 
  DailyReport, 
  ReportField, 
  ReportAnswer, 
  ReportReview, 
  Attachment, 
  AuditLog 
} from '../types';

const rawSupabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseUrl = rawSupabaseUrl.replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    !supabaseUrl.includes('placeholder') &&
    supabaseUrl.startsWith('https://')
  );
};

// Initial Supabase Client
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    })
  : null as any;

// ====================================================================
// Mock Data Engine & Local State Store for Instant Demo / Offline Use
// ====================================================================

const STORAGE_PREFIX = 'glrs_demo_';

const initialTemplates: ReportTemplate[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'النموذج العام للتقارير اليومية',
    description: 'النموذج القياسي المعتمد للأقسام والخدمات العامة بالمستشفى',
    is_default: true,
    active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'نموذج تقرير الصيدلية والتموين الدوائي',
    description: 'مخصص للصيدلية المركزية وصيدلية الطوارئ وحركة الأدوية والناقص',
    is_default: false,
    active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'نموذج تقرير المستلم الإداري والمناوبة الليلية',
    description: 'مخصص لمتابعة أحداث المناوبة وحالات الطوارئ والرقابة الإدارية',
    is_default: false,
    active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    name: 'نموذج تقرير المختبر وبنك الدم',
    description: 'مخصص لتقارير الفحوصات والتحاليل وبنك الدم والمواد المخبرية',
    is_default: false,
    active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    name: 'نموذج تقرير تقنية المعلومات والأنظمة',
    description: 'مخصص لمتابعة الخوادم والشبكات والأجهزة والأنظمة الطبية',
    is_default: false,
    active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    name: 'نموذج تقرير التسويق والإعلام والعلاقات العامة',
    description: 'مخصص لمتابعة الحملات الترويجية، التفاعل الرقمي، التغطيات الإعلامية ورضا المستفيدين',
    is_default: false,
    active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  }
];

const initialFields: ReportField[] = [
  // General
  {
    id: 'f-gen-1',
    template_id: '11111111-1111-1111-1111-111111111111',
    field_name: 'completed_tasks',
    field_label: 'الأعمال والمهام المنجزة خلال اليوم',
    field_type: 'textarea',
    placeholder: 'أدخل تفاصيل الإنجازات والمهام المكتملة بالتفصيل...',
    required: true,
    sort_order: 1,
    options: [],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'f-gen-2',
    template_id: '11111111-1111-1111-1111-111111111111',
    field_name: 'in_progress_tasks',
    field_label: 'الأعمال قيد التنفيذ والمتابعة',
    field_type: 'textarea',
    placeholder: 'أدخل المهام التي ما زالت تحت الإجراء أو المتابعة...',
    required: false,
    sort_order: 2,
    options: [],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'f-gen-3',
    template_id: '11111111-1111-1111-1111-111111111111',
    field_name: 'problems_and_obstacles',
    field_label: 'المشاكل والمعوقات والملاحظات',
    field_type: 'textarea',
    placeholder: 'أي صعوبات واجهت العمل أو أعطال أو معوقات...',
    required: false,
    sort_order: 3,
    options: [],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'f-gen-4',
    template_id: '11111111-1111-1111-1111-111111111111',
    field_name: 'needs_and_suggestions',
    field_label: 'الاحتياجات والمقترحات التطويرية',
    field_type: 'textarea',
    placeholder: 'المواد أو التجهيزات المطلوبة أو مقترحات تحسين الأداء...',
    required: false,
    sort_order: 4,
    options: [],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'f-gen-5',
    template_id: '11111111-1111-1111-1111-111111111111',
    field_name: 'shift_staff_count',
    field_label: 'عدد الكادر المتواجد في المناوبة',
    field_type: 'number',
    placeholder: 'مثال: 5',
    required: false,
    sort_order: 5,
    options: [],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  // Pharmacy
  {
    id: 'f-pharm-1',
    template_id: '22222222-2222-2222-2222-222222222222',
    field_name: 'prescriptions_count',
    field_label: 'إجمالي الوصفات المصروفة اليوم',
    field_type: 'number',
    placeholder: 'أدخل إجمالي عدد الوصفات...',
    required: true,
    sort_order: 1,
    options: [],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'f-pharm-2',
    template_id: '22222222-2222-2222-2222-222222222222',
    field_name: 'out_of_stock_medicines',
    field_label: 'الأصناف والأدوية الناقصة أو الحرجة',
    field_type: 'textarea',
    placeholder: 'قائمة الأدوية والمستلزمات الطبية المنتهية من المخزون أو قاربت على النفاد...',
    required: true,
    sort_order: 2,
    options: [],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'f-pharm-3',
    template_id: '22222222-2222-2222-2222-222222222222',
    field_name: 'emergency_stock_status',
    field_label: 'حالة مخزون الطوارئ والأدوية المنقذة للحياة',
    field_type: 'select',
    placeholder: 'اختر الحالة...',
    required: true,
    sort_order: 3,
    options: ['متوفر ومكتمل بنسبة 100%', 'نقص طفيف غير حرج', 'نقص حرج يستدعي توريد فوري'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'f-pharm-4',
    template_id: '22222222-2222-2222-2222-222222222222',
    field_name: 'refrigerator_temperatures',
    field_label: 'مراقبة درجات حرارة ثلاجات الأدوية (2-8 م°)',
    field_type: 'text',
    placeholder: 'مثال: الثلاجة 1: 4م° / الثلاجة 2: 5م°',
    required: true,
    sort_order: 4,
    options: [],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  // Night Admin
  {
    id: 'f-night-1',
    template_id: '33333333-3333-3333-3333-333333333333',
    field_name: 'shift_type',
    field_label: 'فترة المناوبة',
    field_type: 'select',
    placeholder: 'اختر فترة المناوبة...',
    required: true,
    sort_order: 1,
    options: ['مناوبة ليلية (السهرة)', 'مناوبة ليلية (المبيت والصباح)', 'مناوبة الجمعة / العطلات'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'f-night-2',
    template_id: '33333333-3333-3333-3333-333333333333',
    field_name: 'shift_events_summary',
    field_label: 'ملخص أحداث المناوبة وسير العمل العام',
    field_type: 'textarea',
    placeholder: 'تفاصيل سير العمل في أقسام المستشفى والطوارئ والرقود...',
    required: true,
    sort_order: 2,
    options: [],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'f-night-3',
    template_id: '33333333-3333-3333-3333-333333333333',
    field_name: 'critical_cases',
    field_label: 'الحالات الحرجة والوفيات والتحويلات',
    field_type: 'textarea',
    placeholder: 'أي حالات وفاة أو تحويل إلى مستشفيات أخرى أو حالات ذات طابع خاص...',
    required: true,
    sort_order: 3,
    options: [],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'f-night-4',
    template_id: '33333333-3333-3333-3333-333333333333',
    field_name: 'followup_required',
    field_label: 'قضايا تحتاج متابعة فورية من الإدارة الصباحية',
    field_type: 'textarea',
    placeholder: 'المواضيع العاجلة الموجهة لمدير المستشفى أو الشؤون الإدارية...',
    required: true,
    sort_order: 4,
    options: [],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  // IT Department Fields (66666666-6666-6666-6666-666666666666)
  {
    id: 'f-it-1',
    template_id: '66666666-6666-6666-6666-666666666666',
    field_name: 'systems_health_status',
    field_label: 'حالة الخوادم والأنظمة الطبية والشبكات',
    field_type: 'select',
    placeholder: 'اختر الحالة التشغيلية...',
    required: true,
    sort_order: 1,
    options: [
      'مستقرة وتعمل بكفاءة تامة 100%',
      'استقرار عام مع بطء طفيف في بعض النقاط',
      'أعطال جزئية قيد المعالجة السريعة',
      'توقف حرج في بعض الخدمات يتطلب تدخلاً عاجلاً'
    ],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'f-it-2',
    template_id: '66666666-6666-6666-6666-666666666666',
    field_name: 'tickets_resolved_count',
    field_label: 'عدد بلاغات الدعم الفني المنجزة اليوم',
    field_type: 'number',
    placeholder: 'مثال: 14',
    required: true,
    sort_order: 2,
    options: [],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'f-it-3',
    template_id: '66666666-6666-6666-6666-666666666666',
    field_name: 'it_maintenance_completed',
    field_label: 'أعمال الصيانة والتطوير التقني المنجزة',
    field_type: 'textarea',
    placeholder: 'صيانة الأجهزة، ترقية الأنظمة، ضبط الشبكات، دعم الأقسام...',
    required: true,
    sort_order: 3,
    options: [],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'f-it-4',
    template_id: '66666666-6666-6666-6666-666666666666',
    field_name: 'backup_and_security',
    field_label: 'النسخ الاحتياطي وأمن المعلومات والأنظمة',
    field_type: 'textarea',
    placeholder: 'اكتمال النسخ الاحتياطي، حالة مضاد الفيروسات، جدران الحماية...',
    required: false,
    sort_order: 4,
    options: [],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'f-it-5',
    template_id: '66666666-6666-6666-6666-666666666666',
    field_name: 'it_issues_and_parts',
    field_label: 'المعوقات التقنية وقطع الغيار والتجهيزات المطلوبة',
    field_type: 'textarea',
    placeholder: 'أي أجهزة بحاجة لقطع غيار أو استبدال أو متطلبات شبكة جديدة...',
    required: false,
    sort_order: 5,
    options: [],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  // Marketing Department Fields (55555555-5555-5555-5555-555555555555)
  {
    id: 'f-mkt-1',
    template_id: '55555555-5555-5555-5555-555555555555',
    field_name: 'campaigns_and_posts',
    field_label: 'الحملات الترويجية والمنشورات الإعلامية المنفذة',
    field_type: 'textarea',
    placeholder: 'تفاصيل المنشورات التوعوية، عروض العيادات، الإعلانات الممولة...',
    required: true,
    sort_order: 1,
    options: [],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'f-mkt-2',
    template_id: '55555555-5555-5555-5555-555555555555',
    field_name: 'patient_inquiries_count',
    field_label: 'عدد تفاعلات واستفسارات الجمهور عبر المنصات الرقمية',
    field_type: 'number',
    placeholder: 'مثال: 85',
    required: true,
    sort_order: 2,
    options: [],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'f-mkt-3',
    template_id: '55555555-5555-5555-5555-555555555555',
    field_name: 'satisfaction_indicator',
    field_label: 'مؤشر رضا المراجعين واستطلاعات الرأي',
    field_type: 'select',
    placeholder: 'اختر المؤشر...',
    required: true,
    sort_order: 3,
    options: [
      'ممتاز - نسبة الرضا أعلى من 90%',
      'جيد جداً - نسبة الرضا بين 80% و 89%',
      'متوسط - نسبة الرضا بين 70% و 79%',
      'بحاجة لتحسين وتدخل عاجل'
    ],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'f-mkt-4',
    template_id: '55555555-5555-5555-5555-555555555555',
    field_name: 'media_coverage_events',
    field_label: 'التغطيات الإعلامية وتوثيق فعاليات المستشفى',
    field_type: 'textarea',
    placeholder: 'توثيق العمليات النوعية، الزيارات، الورش الطبية، إشادات المرضى...',
    required: false,
    sort_order: 4,
    options: [],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'f-mkt-5',
    template_id: '55555555-5555-5555-5555-555555555555',
    field_name: 'mkt_recommendations',
    field_label: 'المقترحات التسويقية والشراكات قيد المتابعة',
    field_type: 'textarea',
    placeholder: 'خطط التعاقدات، العروض الترويجية المقترحة، الاحتياجات الإعلانية...',
    required: false,
    sort_order: 5,
    options: [],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  }
];

const initialUnits: ReportingUnit[] = [
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    name: 'الإدارة العامة والمتابعة',
    code: 'ADM-01',
    type: 'administration',
    description: 'إدارة المستشفى والمتابعة الإدارية الشاملة',
    report_template_id: '11111111-1111-1111-1111-111111111111',
    active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    name: 'هيئة التمريض والرعاية الطبية',
    code: 'NUR-01',
    type: 'service',
    description: 'إدارة التمريض وأقسام العناية والتنويم',
    report_template_id: '11111111-1111-1111-1111-111111111111',
    active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    name: 'الصيدلية والتموين الدوائي',
    code: 'PHARM-01',
    type: 'department',
    description: 'الصيدلية المركزية، صيدلية الطوارئ والمستودع الدوائي',
    report_template_id: '22222222-2222-2222-2222-222222222222',
    active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
    name: 'المختبرات الطبية وبنك الدم',
    code: 'LAB-01',
    type: 'department',
    description: 'قسم الفحوصات والتحاليل الطبية الشاملة وبنك الدم',
    report_template_id: '44444444-4444-4444-4444-444444444444',
    active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    name: 'قسم الأشعة والتصوير التشخيصي',
    code: 'RAD-01',
    type: 'department',
    description: 'الأشعة السينية، الرنين المغناطيسي، المقطعية والموجات الصوتية',
    report_template_id: '11111111-1111-1111-1111-111111111111',
    active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
    name: 'قسم العمليات الجراحية والتخدير',
    code: 'SURG-01',
    type: 'department',
    description: 'غرف العمليات الكبرى والصغرى وجناح الإفاقة',
    report_template_id: '11111111-1111-1111-1111-111111111111',
    active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    id: '77777777-7777-7777-7777-777777777777',
    name: 'المستلم الإداري والمناوبة الليلية',
    code: 'NIGHT-01',
    type: 'shift',
    description: 'إدارة المستشفى ومتابعة سير العمل أثناء فترات المناوبة الليلية',
    report_template_id: '33333333-3333-3333-3333-333333333333',
    active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    id: '88888888-8888-8888-8888-888888888888',
    name: 'قسم تقنية المعلومات والأنظمة',
    code: 'IT-01',
    type: 'service',
    description: 'إدارة البنية التحتية والأنظمة الطبية والشبكات والدعم الفني',
    report_template_id: '66666666-6666-6666-6666-666666666666',
    active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    id: '99999999-9999-9999-9999-999999999999',
    name: 'قسم الطوارئ والحوادث',
    code: 'EMERG-01',
    type: 'department',
    description: 'استقبال الطوارئ والحالات الحرجة والإسعاف السريع',
    report_template_id: '11111111-1111-1111-1111-111111111111',
    active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    id: '10101010-1010-1010-1010-101010101010',
    name: 'قسم التسويق والإعلام والتواصل',
    code: 'MKT-01',
    type: 'service',
    description: 'إدارة الحملات الإعلانية والتواصل الاجتماعي والعلاقات العامة وخدمة المستفيدين',
    report_template_id: '55555555-5555-5555-5555-555555555555',
    active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  }
];

const initialProfiles: Profile[] = [
  {
    id: 'user-super-admin',
    full_name: 'م. أيمن الشوافي (المسؤول التقني عن المستشفى)',
    email: 'tech@greenland.hospital',
    phone: '+967 777 111 222',
    reporting_unit_id: '88888888-8888-8888-8888-888888888888',
    role: 'super_admin',
    active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'user-admin',
    full_name: 'د. خالد العمري (مدير عام المستشفى)',
    email: 'director@greenland.hospital',
    phone: '+967 777 333 444',
    reporting_unit_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    role: 'admin',
    active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'user-pharmacy-reporter',
    full_name: 'د. سارة الحداد (مسؤول الصيدلية والتموين)',
    email: 'pharmacy@greenland.hospital',
    phone: '+967 777 555 666',
    reporting_unit_id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    role: 'reporter',
    active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'user-nursing-reporter',
    full_name: 'أ. سامي الورد (مشرف هيئة التمريض)',
    email: 'nursing@greenland.hospital',
    phone: '+967 777 777 888',
    reporting_unit_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    role: 'reporter',
    active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'user-night-reporter',
    full_name: 'د. بشير النظاري (المستلم الإداري الليلي)',
    email: 'night@greenland.hospital',
    phone: '+967 777 999 000',
    reporting_unit_id: '77777777-7777-7777-7777-777777777777',
    role: 'reporter',
    active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  }
];

const todayDate = new Date().toISOString().split('T')[0];

const initialReports: DailyReport[] = [
  {
    id: 'rep-001',
    user_id: 'user-pharmacy-reporter',
    reporting_unit_id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    template_id: '22222222-2222-2222-2222-222222222222',
    report_date: todayDate,
    status: 'submitted',
    submitted_at: `${todayDate}T08:30:00Z`,
    created_at: `${todayDate}T08:00:00Z`,
    updated_at: `${todayDate}T08:30:00Z`
  },
  {
    id: 'rep-002',
    user_id: 'user-nursing-reporter',
    reporting_unit_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    template_id: '11111111-1111-1111-1111-111111111111',
    report_date: todayDate,
    status: 'returned',
    submitted_at: `${todayDate}T07:15:00Z`,
    created_at: `${todayDate}T07:00:00Z`,
    updated_at: `${todayDate}T09:00:00Z`
  },
  {
    id: 'rep-003',
    user_id: 'user-night-reporter',
    reporting_unit_id: '77777777-7777-7777-7777-777777777777',
    template_id: '33333333-3333-3333-3333-333333333333',
    report_date: todayDate,
    status: 'closed',
    submitted_at: `${todayDate}T06:00:00Z`,
    closed_at: `${todayDate}T07:30:00Z`,
    created_at: `${todayDate}T05:30:00Z`,
    updated_at: `${todayDate}T07:30:00Z`
  }
];

const initialAnswers: ReportAnswer[] = [
  // Pharmacy answers for rep-001
  {
    id: 'ans-001',
    report_id: 'rep-001',
    field_id: 'f-pharm-1',
    value: 284,
    created_at: `${todayDate}T08:30:00Z`,
    updated_at: `${todayDate}T08:30:00Z`
  },
  {
    id: 'ans-002',
    report_id: 'rep-001',
    field_id: 'f-pharm-2',
    value: 'محلول ملحي نورمال سلاين 500 مل (نقص كمية)، أمبولات أدريينالين (المتبقي 15 فقط)، مسكن باراسيتامول وريدي.',
    created_at: `${todayDate}T08:30:00Z`,
    updated_at: `${todayDate}T08:30:00Z`
  },
  {
    id: 'ans-003',
    report_id: 'rep-001',
    field_id: 'f-pharm-3',
    value: 'نقص طفيف غير حرج',
    created_at: `${todayDate}T08:30:00Z`,
    updated_at: `${todayDate}T08:30:00Z`
  },
  {
    id: 'ans-004',
    report_id: 'rep-001',
    field_id: 'f-pharm-4',
    value: 'الثلاجة الرئيسية: 4.2 م° / ثلاجة الطوارئ: 3.8 م° (ضمن الحدود السليمة المعيارية)',
    created_at: `${todayDate}T08:30:00Z`,
    updated_at: `${todayDate}T08:30:00Z`
  },
  // Nursing answers for rep-002
  {
    id: 'ans-005',
    report_id: 'rep-002',
    field_id: 'f-gen-1',
    value: 'تم استلام المناوبة لجميع أجنحة التنويم، تقديم العلاجات الدورية لـ 42 مريضًا، والتنسيق لدخول 6 حالات جديدة للعناية المركزة.',
    created_at: `${todayDate}T07:15:00Z`,
    updated_at: `${todayDate}T07:15:00Z`
  },
  {
    id: 'ans-006',
    report_id: 'rep-002',
    field_id: 'f-gen-2',
    value: 'متابعة 3 حالات غير مستقرة في العناية المتوسطة وتجهيز ملفات الخروج لـ 8 مرضى.',
    created_at: `${todayDate}T07:15:00Z`,
    updated_at: `${todayDate}T07:15:00Z`
  },
  {
    id: 'ans-007',
    report_id: 'rep-002',
    field_id: 'f-gen-3',
    value: 'تعطل جهاز قياس الضغط الآلي في الدور الثالث، ونقص كادر تمريضي في جناح الأطفال بسبب إجازة مرضية مفاجئة.',
    created_at: `${todayDate}T07:15:00Z`,
    updated_at: `${todayDate}T07:15:00Z`
  },
  {
    id: 'ans-008',
    report_id: 'rep-002',
    field_id: 'f-gen-4',
    value: 'طلب سرعة صيانة جهاز قياس الضغط أو استبداله من المخزن، وتغطية نقص التمريض من الطوارئ.',
    created_at: `${todayDate}T07:15:00Z`,
    updated_at: `${todayDate}T07:15:00Z`
  },
  {
    id: 'ans-009',
    report_id: 'rep-002',
    field_id: 'f-gen-5',
    value: 18,
    created_at: `${todayDate}T07:15:00Z`,
    updated_at: `${todayDate}T07:15:00Z`
  },
  // Night Admin answers for rep-003
  {
    id: 'ans-010',
    report_id: 'rep-003',
    field_id: 'f-night-1',
    value: 'مناوبة ليلية (المبيت والصباح)',
    created_at: `${todayDate}T06:00:00Z`,
    updated_at: `${todayDate}T06:00:00Z`
  },
  {
    id: 'ans-011',
    report_id: 'rep-003',
    field_id: 'f-night-2',
    value: 'سير العمل هادئ ومنتظم في الطوارئ والرقود. استقبل الطوارئ 54 حالة، أجريت عمليتان قيصريتان طارئتان بنجاح تام للأم والمولود.',
    created_at: `${todayDate}T06:00:00Z`,
    updated_at: `${todayDate}T06:00:00Z`
  },
  {
    id: 'ans-012',
    report_id: 'rep-003',
    field_id: 'f-night-3',
    value: 'وفاة طبيعية لمريض مسن في العناية المركزة (توقف قلب وتنفس بعد محاولات إنعاش دامت 45 دقيقة)، وتم إنهاء الإجراءات الطبية والنظامية وتسليم الجثمان لذويه.',
    created_at: `${todayDate}T06:00:00Z`,
    updated_at: `${todayDate}T06:00:00Z`
  },
  {
    id: 'ans-013',
    report_id: 'rep-003',
    field_id: 'f-night-4',
    value: 'صرف مستحقات مناوبة الطبيب الأخصائي الزائر، ومتابعة تعبئة خزان الأكسجين الاحتياطي اليوم صباحًا.',
    created_at: `${todayDate}T06:00:00Z`,
    updated_at: `${todayDate}T06:00:00Z`
  }
];

const initialReviews: ReportReview[] = [
  {
    id: 'rev-001',
    report_id: 'rep-002',
    reviewer_id: 'user-admin',
    action: 'returned',
    comment: 'يرجى توضيح رقم جهاز قياس الضغط المتعطل وموقعه بدقة لإرسال فريق الصيانة الهندسية فورًا، مع ذكر تفاصيل خطة تغطية كادر تمريض الأطفال.',
    created_at: `${todayDate}T09:00:00Z`
  },
  {
    id: 'rev-002',
    report_id: 'rep-003',
    reviewer_id: 'user-admin',
    action: 'closed',
    comment: 'تمت المراجعة والاعتماد. تم توجيه قسم الخدمات والصيانة بمتابعة الأكسجين فورًا.',
    created_at: `${todayDate}T07:30:00Z`
  }
];

const initialAuditLogs: AuditLog[] = [
  {
    id: 'log-001',
    user_id: 'user-pharmacy-reporter',
    action: 'CREATE_REPORT',
    entity_type: 'daily_reports',
    entity_id: 'rep-001',
    metadata: { unit: 'الصيدلية والتموين الدوائي', status: 'submitted' },
    created_at: `${todayDate}T08:30:00Z`
  },
  {
    id: 'log-002',
    user_id: 'user-admin',
    action: 'RETURN_REPORT',
    entity_type: 'daily_reports',
    entity_id: 'rep-002',
    metadata: { unit: 'هيئة التمريض والرعاية الطبية', comment: 'طلب توضيح رقم الجهاز ونقص التمريض' },
    created_at: `${todayDate}T09:00:00Z`
  },
  {
    id: 'log-003',
    user_id: 'user-admin',
    action: 'CLOSE_REPORT',
    entity_type: 'daily_reports',
    entity_id: 'rep-003',
    metadata: { unit: 'المستلم الإداري والمناوبة الليلية' },
    created_at: `${todayDate}T07:30:00Z`
  }
];

// In-Memory / Local Storage Helper Class for seamless client-side state
const initialAttachments: Attachment[] = [
  {
    id: 'att-demo-1',
    report_id: 'rep-001',
    file_name: 'تقرير_الصيدلية_ومخزون_الأدوية.jpg',
    file_path: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=800&q=80',
    file_type: 'image/jpeg',
    file_size: 245120,
    uploaded_by: 'user-pharmacy-reporter',
    created_at: `${todayDate}T08:15:00Z`
  },
  {
    id: 'att-demo-2',
    report_id: 'rep-001',
    file_name: 'كشف_الوصفات_المصروفة.jpg',
    file_path: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80',
    file_type: 'image/jpeg',
    file_size: 312450,
    uploaded_by: 'user-pharmacy-reporter',
    created_at: `${todayDate}T08:20:00Z`
  }
];

class MockDataStore {
  constructor() {
    this.checkVersion();
  }

  private checkVersion() {
    try {
      const ver = localStorage.getItem(STORAGE_PREFIX + 'version');
      if (ver !== 'v2_hospital_roles') {
        localStorage.removeItem(STORAGE_PREFIX + 'profiles');
        localStorage.removeItem(STORAGE_PREFIX + 'units');
        localStorage.removeItem(STORAGE_PREFIX + 'templates');
        localStorage.removeItem(STORAGE_PREFIX + 'fields');
        localStorage.removeItem('glrs_active_user');
        localStorage.setItem(STORAGE_PREFIX + 'version', 'v2_hospital_roles');
      }
    } catch {
      // ignore in SSR / restricted environments
    }
  }

  private load<T>(key: string, defaultData: T): T {
    try {
      const data = localStorage.getItem(STORAGE_PREFIX + key);
      return data ? JSON.parse(data) : defaultData;
    } catch {
      return defaultData;
    }
  }

  private save<T>(key: string, data: T): void {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
    } catch (e) {
      console.warn('Storage error:', e);
    }
  }

  getTemplates(): ReportTemplate[] {
    return this.load('templates', initialTemplates);
  }
  saveTemplates(items: ReportTemplate[]) {
    this.save('templates', items);
  }

  getFields(): ReportField[] {
    return this.load('fields', initialFields);
  }
  saveFields(items: ReportField[]) {
    this.save('fields', items);
  }

  getUnits(): ReportingUnit[] {
    return this.load('units', initialUnits);
  }
  saveUnits(items: ReportingUnit[]) {
    this.save('units', items);
  }

  getProfiles(): Profile[] {
    return this.load('profiles', initialProfiles);
  }
  saveProfiles(items: Profile[]) {
    this.save('profiles', items);
  }

  getReports(): DailyReport[] {
    return this.load('reports', initialReports);
  }
  saveReports(items: DailyReport[]) {
    this.save('reports', items);
  }

  getAnswers(): ReportAnswer[] {
    return this.load('answers', initialAnswers);
  }
  saveAnswers(items: ReportAnswer[]) {
    this.save('answers', items);
  }

  getReviews(): ReportReview[] {
    return this.load('reviews', initialReviews);
  }
  saveReviews(items: ReportReview[]) {
    this.save('reviews', items);
  }

  getAuditLogs(): AuditLog[] {
    return this.load('audit_logs', initialAuditLogs);
  }
  saveAuditLogs(items: AuditLog[]) {
    this.save('audit_logs', items);
  }

  getAttachments(): Attachment[] {
    return this.load('attachments', initialAttachments);
  }
  saveAttachments(items: Attachment[]) {
    this.save('attachments', items);
  }

  resetToDefault() {
    localStorage.removeItem(STORAGE_PREFIX + 'templates');
    localStorage.removeItem(STORAGE_PREFIX + 'fields');
    localStorage.removeItem(STORAGE_PREFIX + 'units');
    localStorage.removeItem(STORAGE_PREFIX + 'profiles');
    localStorage.removeItem(STORAGE_PREFIX + 'reports');
    localStorage.removeItem(STORAGE_PREFIX + 'answers');
    localStorage.removeItem(STORAGE_PREFIX + 'reviews');
    localStorage.removeItem(STORAGE_PREFIX + 'audit_logs');
    localStorage.removeItem(STORAGE_PREFIX + 'attachments');
  }
}

export const mockStore = new MockDataStore();
