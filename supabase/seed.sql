-- ====================================================================
-- نظام إدارة التقارير اليومية - مستشفى اللواء الأخضر الدولي (GLRS)
-- GREENLAND INTERNATIONAL HOSPITAL - SEED DATA
-- File: supabase/seed.sql
-- ====================================================================

-- 1. إنشاء قوالب التقارير المتخصصة والافتراضية
DO $$
DECLARE
    tpl_general_id UUID := '11111111-1111-1111-1111-111111111111';
    tpl_pharmacy_id UUID := '22222222-2222-2222-2222-222222222222';
    tpl_night_admin_id UUID := '33333333-3333-3333-3333-333333333333';
    tpl_lab_id UUID := '44444444-4444-4444-4444-444444444444';
    tpl_surgery_id UUID := '55555555-5555-5555-5555-555555555555';
    tpl_it_id UUID := '66666666-6666-6666-6666-666666666666';

    unit_admin_id UUID := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    unit_nursing_id UUID := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
    unit_pharmacy_id UUID := 'cccccccc-cccc-cccc-cccc-cccccccccccc';
    unit_lab_id UUID := 'dddddddd-dddd-dddd-dddd-dddddddddddd';
    unit_radiology_id UUID := 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
    unit_surgery_id UUID := 'ffffffff-ffff-ffff-ffff-ffffffffffff';
    unit_night_id UUID := '77777777-7777-7777-7777-777777777777';
    unit_it_id UUID := '88888888-8888-8888-8888-888888888888';
    unit_emergency_id UUID := '99999999-9999-9999-9999-999999999999';
BEGIN

    -- 1.1 إدخال القوالب
    INSERT INTO public.report_templates (id, name, description, is_default, active)
    VALUES 
    (tpl_general_id, 'النموذج العام للتقارير اليومية', 'النموذج القياسي المعتمد للأقسام والخدمات العامة بالمستشفى', true, true),
    (tpl_pharmacy_id, 'نموذج تقرير الصيدلية والتموين الدوائي', 'مخصص للصيدلية المركزية وصيدلية الطوارئ وحركة الأدوية والناقص', false, true),
    (tpl_night_admin_id, 'نموذج تقرير المستلم الإداري والمناوبة الليلية', 'مخصص لمتابعة أحداث المناوبة وحالات الطوارئ والرقابة الإدارية', false, true),
    (tpl_lab_id, 'نموذج تقرير المختبر وبنك الدم', 'مخصص لتقارير الفحوصات والتحاليل وبنك الدم والمواد المخبرية', false, true),
    (tpl_surgery_id, 'نموذج تقرير قسم العمليات والتخدير', 'مخصص لإحصائيات العمليات الجراحية المجدولة والطارئة', false, true),
    (tpl_it_id, 'نموذج تقرير تقنية المعلومات والأنظمة', 'مخصص لمتابعة الخوادم والشبكات والأجهزة والأنظمة الطبية', false, true)
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        is_default = EXCLUDED.is_default;

    -- 1.2 إدخال حقول النموذج العام (General Template)
    INSERT INTO public.report_fields (template_id, field_name, field_label, field_type, placeholder, required, sort_order, options)
    VALUES
    (tpl_general_id, 'completed_tasks', 'الأعمال والمهام المنجزة خلال اليوم', 'textarea', 'أدخل تفاصيل الإنجازات والمهام المكتملة بالتفصيل...', true, 1, '[]'::jsonb),
    (tpl_general_id, 'in_progress_tasks', 'الأعمال قيد التنفيذ والمتابعة', 'textarea', 'أدخل المهام التي ما زالت تحت الإجراء أو المتابعة...', false, 2, '[]'::jsonb),
    (tpl_general_id, 'problems_and_obstacles', 'المشاكل والمعوقات والملاحظات', 'textarea', 'أي صعوبات واجهت العمل أو أعطال أو معوقات...', false, 3, '[]'::jsonb),
    (tpl_general_id, 'needs_and_suggestions', 'الاحتياجات والمقترحات التطويرية', 'textarea', 'المواد أو التجهيزات المطلوبة أو مقترحات تحسين الأداء...', false, 4, '[]'::jsonb),
    (tpl_general_id, 'shift_staff_count', 'عدد الكادر المتواجد في المناوبة', 'number', 'مثال: 5', false, 5, '[]'::jsonb),
    (tpl_general_id, 'department_notes', 'ملاحظات إضافية', 'text', 'أي ملاحظة موجزة أخرى...', false, 6, '[]'::jsonb);

    -- 1.3 إدخال حقول نموذج الصيدلية (Pharmacy Template)
    INSERT INTO public.report_fields (template_id, field_name, field_label, field_type, placeholder, required, sort_order, options)
    VALUES
    (tpl_pharmacy_id, 'prescriptions_count', 'إجمالي الوصفات المصروفة اليوم', 'number', 'أدخل إجمالي عدد الوصفات...', true, 1, '[]'::jsonb),
    (tpl_pharmacy_id, 'out_of_stock_medicines', 'الأصناف والأدوية الناقصة أو الحرجة', 'textarea', 'قائمة الأدوية والمستلزمات الطبية المنتهية من المخزون أو قاربت على النفاد...', true, 2, '[]'::jsonb),
    (tpl_pharmacy_id, 'near_expiry_medicines', 'الأدوية القريبة من الانتهاء (Near Expiry)', 'textarea', 'الأدوية التي يقل تاريخ صلاحيتها عن 3 أشهر...', false, 3, '[]'::jsonb),
    (tpl_pharmacy_id, 'emergency_stock_status', 'حالة مخزون الطوارئ والأدوية المنقذة للحياة', 'select', 'اختر الحالة...', true, 4, '["متوفر ومكتمل بنسبة 100%", "نقص طفيف غير حرج", "نقص حرج يستدعي توريد فوري"]'::jsonb),
    (tpl_pharmacy_id, 'refrigerator_temperatures', 'مراقبة درجات حرارة ثلاجات الأدوية (2-8 م°)', 'text', 'مثال: الثلاجة 1: 4م° / الثلاجة 2: 5م°', true, 5, '[]'::jsonb),
    (tpl_pharmacy_id, 'pharmacy_problems_notes', 'المشاكل والمعوقات والمقترحات', 'textarea', 'أي ملاحظات أو احتياجات لقسم الصيدلية...', false, 6, '[]'::jsonb);

    -- 1.4 إدخال حقول نموذج المستلم الإداري والمناوبة الليلية (Night Admin Template)
    INSERT INTO public.report_fields (template_id, field_name, field_label, field_type, placeholder, required, sort_order, options)
    VALUES
    (tpl_night_admin_id, 'shift_type', 'فترة المناوبة', 'select', 'اختر فترة المناوبة...', true, 1, '["مناوبة ليلية (السهرة)", "مناوبة ليلية (المبيت والصباح)", "مناوبة الجمعة / العطلات"]'::jsonb),
    (tpl_night_admin_id, 'shift_events_summary', 'ملخص أحداث المناوبة وسير العمل العام', 'textarea', 'تفاصيل سير العمل في أقسام المستشفى والطوارئ والرقود...', true, 2, '[]'::jsonb),
    (tpl_night_admin_id, 'critical_cases', 'الحالات الحرجة والوفيات والتحويلات', 'textarea', 'أي حالات وفاة أو تحويل إلى مستشفيات أخرى أو حالات ذات طابع خاص...', true, 3, '[]'::jsonb),
    (tpl_night_admin_id, 'staff_attendance_discipline', 'انضباط الكادر وحضور الأطباء والمناوبين', 'textarea', 'مدى التزام الكادر الطبي والتمريضي والإداري بالمناوبة والغيابات إن وجدت...', true, 4, '[]'::jsonb),
    (tpl_night_admin_id, 'maintenance_security_issues', 'المشاكل الأمنية وأعطال الصيانة والمولدات', 'textarea', 'أي خلل كهربائي، أكسجين، نظافة، أو إشكال أمني خلال المناوبة...', false, 5, '[]'::jsonb),
    (tpl_night_admin_id, 'followup_required', 'قضايا تحتاج متابعة فورية من الإدارة الصباحية', 'textarea', 'المواضيع العاجلة الموجهة لمدير المستشفى أو الشؤون الإدارية...', true, 6, '[]'::jsonb);

    -- 1.5 إدخال حقول نموذج المختبر (Lab Template)
    INSERT INTO public.report_fields (template_id, field_name, field_label, field_type, placeholder, required, sort_order, options)
    VALUES
    (tpl_lab_id, 'total_tests_conducted', 'إجمالي الفحوصات والتحاليل المنفذة', 'number', 'مثال: 145', true, 1, '[]'::jsonb),
    (tpl_lab_id, 'blood_bank_units_available', 'أرصدة بنك الدم المتوفرة', 'text', 'مثال: A+: 10, O+: 15, B+: 8, AB+: 3, السالب: 4', true, 2, '[]'::jsonb),
    (tpl_lab_id, 'reagents_shortage', 'المحاليل والكواشف الناقصة أو القريبة من النفاد', 'textarea', 'قائمة المواد المخبرية المطلوبة...', false, 3, '[]'::jsonb),
    (tpl_lab_id, 'devices_status', 'حالة وكفاءة أجهزة التحاليل المخبرية', 'select', 'حالة الأجهزة...', true, 4, '["جميع الأجهزة تعمل بكفاءة تامة", "يوجد جهاز متعطل يحتاج صيانة", "أجهزة تحت المعايرة الدورية"]'::jsonb),
    (tpl_lab_id, 'lab_remarks', 'ملاحظات واحتياجات المختبر', 'textarea', 'أي ملاحظات أخرى...', false, 5, '[]'::jsonb);

    -- 1.6 إدخال حقول نموذج تقنية المعلومات (IT Template)
    INSERT INTO public.report_fields (template_id, field_name, field_label, field_type, placeholder, required, sort_order, options)
    VALUES
    (tpl_it_id, 'his_system_status', 'حالة النظام الطبي الإلكتروني (HIS/PACS)', 'select', 'حالة النظام...', true, 1, '["مستقر 100% وبدون انقطاع", "بطء طفيف في بعض الأوقات", "توقف مؤقت تم حله", "خلل قيد المعالجة"]'::jsonb),
    (tpl_it_id, 'servers_and_backup', 'حالة الخوادم والنسخ الاحتياطي اليومي', 'select', 'حالة النسخ الاحتياطي...', true, 2, '["تم النسخ الاحتياطي بنجاح (ناجح)", "فشل النسخ الاحتياطي وجار المعالجة", "قيد التشغيل والتنفيذ"]'::jsonb),
    (tpl_it_id, 'network_internet_status', 'استقرار الشبكة الداخلية والإنترنت والمراقبة', 'text', 'حالة شبكة المستشفى وكاميرات المراقبة والاتصالات...', true, 3, '[]'::jsonb),
    (tpl_it_id, 'tickets_resolved_count', 'عدد البلاغات التقنية التي تم إنجازها اليوم', 'number', 'مثال: 12', true, 4, '[]'::jsonb),
    (tpl_it_id, 'pending_technical_issues', 'المشاكل التقنية المعلقة ومقترحات التحسين', 'textarea', 'تفاصيل الأعطال التي تحتاج قطع غيار أو تدخل خارجي...', false, 5, '[]'::jsonb);

    -- 2. إدخال الجهات والأقسام (Reporting Units)
    INSERT INTO public.reporting_units (id, name, code, type, description, report_template_id, active)
    VALUES
    (unit_admin_id, 'الإدارة العامة والمتابعة', 'ADM-01', 'administration', 'إدارة المستشفى والمتابعة الإدارية الشاملة', tpl_general_id, true),
    (unit_nursing_id, 'هيئة التمريض والرعاية الطبية', 'NUR-01', 'service', 'إدارة التمريض وأقسام العناية والتنويم', tpl_general_id, true),
    (unit_pharmacy_id, 'الصيدلية والتموين الدوائي', 'PHARM-01', 'department', 'الصيدلية المركزية، صيدلية الطوارئ والمستودع الدوائي', tpl_pharmacy_id, true),
    (unit_lab_id, 'المختبرات الطبية وبنك الدم', 'LAB-01', 'department', 'قسم الفحوصات والتحاليل الطبية الشاملة وبنك الدم', tpl_lab_id, true),
    (unit_radiology_id, 'قسم الأشعة والتصوير التشخيصي', 'RAD-01', 'department', 'الأشعة السينية، الرنين المغناطيسي، المقطعية والموجات الصوتية', tpl_general_id, true),
    (unit_surgery_id, 'قسم العمليات الجراحية والتخدير', 'SURG-01', 'department', 'غرف العمليات الكبرى والصغرى وجناح الإفاقة', tpl_general_id, true),
    (unit_night_id, 'المستلم الإداري والمناوبة الليلية', 'NIGHT-01', 'shift', 'إدارة المستشفى ومتابعة سير العمل أثناء فترات المناوبة الليلية', tpl_night_admin_id, true),
    (unit_it_id, 'قسم تقنية المعلومات والأنظمة', 'IT-01', 'service', 'إدارة البنية التحتية والأنظمة الطبية والشبكات والدعم الفني', tpl_it_id, true),
    (unit_emergency_id, 'قسم الطوارئ والحوادث', 'EMERG-01', 'department', 'استقبال الطوارئ والحالات الحرجة والإسعاف السريع', tpl_general_id, true)
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        code = EXCLUDED.code,
        type = EXCLUDED.type,
        report_template_id = EXCLUDED.report_template_id;

END $$;
