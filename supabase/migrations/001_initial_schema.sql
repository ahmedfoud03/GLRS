-- ====================================================================
-- نظام إدارة التقارير اليومية - مستشفى اللواء الأخضر الدولي (GLRS)
-- GREENLAND INTERNATIONAL HOSPITAL - DAILY REPORTING SYSTEM
-- Migration: 001_initial_schema.sql
-- ====================================================================

-- 1. تمكين الامتدادات المطلوبة
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. تعريف أنواع التعداد (ENUM Types)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('reporter', 'admin', 'super_admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE unit_type AS ENUM ('department', 'service', 'administration', 'shift', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE report_status AS ENUM ('draft', 'submitted', 'returned', 'closed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE field_type AS ENUM (
        'text',
        'textarea',
        'number',
        'date',
        'time',
        'select',
        'multiselect',
        'checkbox',
        'file'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE review_action AS ENUM ('reviewed', 'returned', 'closed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. جدول قوالب التقارير (report_templates)
CREATE TABLE IF NOT EXISTS public.report_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. جدول حقول النماذج (report_fields)
CREATE TABLE IF NOT EXISTS public.report_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES public.report_templates(id) ON DELETE CASCADE,
    field_name VARCHAR(100) NOT NULL,
    field_label VARCHAR(255) NOT NULL,
    field_type field_type NOT NULL DEFAULT 'textarea',
    placeholder VARCHAR(255),
    required BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    options JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. جدول الجهات وأقسام إعداد التقارير (reporting_units)
CREATE TABLE IF NOT EXISTS public.reporting_units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    type unit_type NOT NULL DEFAULT 'department',
    description TEXT,
    report_template_id UUID REFERENCES public.report_templates(id) ON DELETE SET NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. جدول ملفات المستخدمين (profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    reporting_unit_id UUID REFERENCES public.reporting_units(id) ON DELETE SET NULL,
    role user_role NOT NULL DEFAULT 'reporter',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. جدول التقارير اليومية (daily_reports)
CREATE TABLE IF NOT EXISTS public.daily_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    reporting_unit_id UUID NOT NULL REFERENCES public.reporting_units(id) ON DELETE RESTRICT,
    template_id UUID NOT NULL REFERENCES public.report_templates(id) ON DELETE RESTRICT,
    report_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status report_status NOT NULL DEFAULT 'draft',
    submitted_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    -- قيد يمنع إنشاء أكثر من تقرير يومي لنفس الجهة في نفس التاريخ
    CONSTRAINT unique_unit_daily_report UNIQUE(reporting_unit_id, report_date)
);

-- 8. جدول إجابات حقول التقرير (report_answers)
CREATE TABLE IF NOT EXISTS public.report_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES public.daily_reports(id) ON DELETE CASCADE,
    field_id UUID NOT NULL REFERENCES public.report_fields(id) ON DELETE CASCADE,
    value JSONB DEFAULT '""'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_report_field_answer UNIQUE(report_id, field_id)
);

-- 9. جدول المرفقات (attachments)
CREATE TABLE IF NOT EXISTS public.attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES public.daily_reports(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_type VARCHAR(100),
    file_size BIGINT,
    uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. جدول مراجعات واعتمادات الإدارة (report_reviews)
CREATE TABLE IF NOT EXISTS public.report_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES public.daily_reports(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    action review_action NOT NULL,
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. جدول سجل العمليات والتدقيق (audit_logs)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================================
-- الفهارس لتحسين الأداء (Indexes)
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_unit ON public.profiles(reporting_unit_id);
CREATE INDEX IF NOT EXISTS idx_reports_date ON public.daily_reports(report_date);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.daily_reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_unit ON public.daily_reports(reporting_unit_id);
CREATE INDEX IF NOT EXISTS idx_reports_user ON public.daily_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_answers_report ON public.report_answers(report_id);
CREATE INDEX IF NOT EXISTS idx_fields_template ON public.report_fields(template_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_reviews_report ON public.report_reviews(report_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON public.audit_logs(entity_type, entity_id);

-- ====================================================================
-- دوال المساعدة لسياسات الأمان وتجنب Recursion
-- ====================================================================

-- دالة لمعرفة دور المستخدم الحالي بأمان
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
DECLARE
    u_role user_role;
BEGIN
    SELECT role INTO u_role FROM public.profiles WHERE id = auth.uid();
    RETURN COALESCE(u_role, 'reporter'::user_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- دالة لمعرفة جهة المستخدم الحالي بأمان
CREATE OR REPLACE FUNCTION public.get_current_user_unit()
RETURNS UUID AS $$
DECLARE
    u_unit UUID;
BEGIN
    SELECT reporting_unit_id INTO u_unit FROM public.profiles WHERE id = auth.uid();
    RETURN u_unit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- دالة لمعرفة هل المستخدم الحالي مدير (Admin أو Super Admin)
CREATE OR REPLACE FUNCTION public.is_admin_or_super()
RETURNS BOOLEAN AS $$
DECLARE
    u_role user_role;
BEGIN
    SELECT role INTO u_role FROM public.profiles WHERE id = auth.uid();
    RETURN (u_role IN ('admin', 'super_admin'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- دالة لمعرفة هل المستخدم الحالي Super Admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
DECLARE
    u_role user_role;
BEGIN
    SELECT role INTO u_role FROM public.profiles WHERE id = auth.uid();
    RETURN (u_role = 'super_admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ====================================================================
-- تفعيل Row Level Security (RLS)
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reporting_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------
-- سياسات Profiles
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_admin_or_super());

DROP POLICY IF EXISTS "Users can update own profile name/phone" ON public.profiles;
CREATE POLICY "Users can update own profile name/phone" ON public.profiles
    FOR UPDATE USING (auth.uid() = id OR public.is_super_admin());

DROP POLICY IF EXISTS "Super Admins can insert profiles" ON public.profiles;
CREATE POLICY "Super Admins can insert profiles" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id OR public.is_super_admin());

DROP POLICY IF EXISTS "Super Admins can delete profiles" ON public.profiles;
CREATE POLICY "Super Admins can delete profiles" ON public.profiles
    FOR DELETE USING (public.is_super_admin());

-- --------------------------------------------------------------------
-- سياسات Reporting Units
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone authenticated can view active units" ON public.reporting_units;
CREATE POLICY "Anyone authenticated can view active units" ON public.reporting_units
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Super Admins can manage units" ON public.reporting_units;
CREATE POLICY "Super Admins can manage units" ON public.reporting_units
    FOR ALL USING (public.is_super_admin());

-- --------------------------------------------------------------------
-- سياسات Report Templates & Fields
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone authenticated can read active templates" ON public.report_templates;
CREATE POLICY "Anyone authenticated can read active templates" ON public.report_templates
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Super Admins can manage templates" ON public.report_templates;
CREATE POLICY "Super Admins can manage templates" ON public.report_templates
    FOR ALL USING (public.is_super_admin());

DROP POLICY IF EXISTS "Anyone authenticated can read fields" ON public.report_fields;
CREATE POLICY "Anyone authenticated can read fields" ON public.report_fields
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Super Admins can manage fields" ON public.report_fields;
CREATE POLICY "Super Admins can manage fields" ON public.report_fields
    FOR ALL USING (public.is_super_admin());

-- --------------------------------------------------------------------
-- سياسات Daily Reports
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Reporters can view their unit reports, Admins view all" ON public.daily_reports;
CREATE POLICY "Reporters can view their unit reports, Admins view all" ON public.daily_reports
    FOR SELECT USING (
        public.is_admin_or_super() OR
        reporting_unit_id = public.get_current_user_unit() OR
        user_id = auth.uid()
    );

DROP POLICY IF EXISTS "Reporters can create reports for their unit" ON public.daily_reports;
CREATE POLICY "Reporters can create reports for their unit" ON public.daily_reports
    FOR INSERT WITH CHECK (
        (auth.uid() = user_id AND reporting_unit_id = public.get_current_user_unit()) OR
        public.is_admin_or_super()
    );

DROP POLICY IF EXISTS "Reporters can update draft/returned reports, Admins can review/close" ON public.daily_reports;
CREATE POLICY "Reporters can update draft/returned reports, Admins can review/close" ON public.daily_reports
    FOR UPDATE USING (
        (
            (reporting_unit_id = public.get_current_user_unit() OR user_id = auth.uid())
            AND status IN ('draft', 'returned')
        )
        OR public.is_admin_or_super()
    );

DROP POLICY IF EXISTS "Only Super Admins can delete reports" ON public.daily_reports;
CREATE POLICY "Only Super Admins can delete reports" ON public.daily_reports
    FOR DELETE USING (public.is_super_admin());

-- --------------------------------------------------------------------
-- سياسات Report Answers
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Answers can be viewed by report viewers" ON public.report_answers;
CREATE POLICY "Answers can be viewed by report viewers" ON public.report_answers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.daily_reports r
            WHERE r.id = report_answers.report_id
            AND (
                public.is_admin_or_super() OR
                r.reporting_unit_id = public.get_current_user_unit() OR
                r.user_id = auth.uid()
            )
        )
    );

DROP POLICY IF EXISTS "Answers can be created/updated for editable reports" ON public.report_answers;
CREATE POLICY "Answers can be created/updated for editable reports" ON public.report_answers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.daily_reports r
            WHERE r.id = report_answers.report_id
            AND (
                (
                    (r.reporting_unit_id = public.get_current_user_unit() OR r.user_id = auth.uid())
                    AND r.status IN ('draft', 'returned')
                )
                OR public.is_admin_or_super()
            )
        )
    );

-- --------------------------------------------------------------------
-- سياسات Attachments
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Attachments readable by report viewers" ON public.attachments;
CREATE POLICY "Attachments readable by report viewers" ON public.attachments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.daily_reports r
            WHERE r.id = attachments.report_id
            AND (
                public.is_admin_or_super() OR
                r.reporting_unit_id = public.get_current_user_unit() OR
                r.user_id = auth.uid()
            )
        )
    );

DROP POLICY IF EXISTS "Attachments can be inserted for draft/returned reports" ON public.attachments;
CREATE POLICY "Attachments can be inserted for draft/returned reports" ON public.attachments
    FOR INSERT WITH CHECK (
        uploaded_by = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.daily_reports r
            WHERE r.id = attachments.report_id
            AND (
                (
                    (r.reporting_unit_id = public.get_current_user_unit() OR r.user_id = auth.uid())
                    AND r.status IN ('draft', 'returned')
                )
                OR public.is_admin_or_super()
            )
        )
    );

DROP POLICY IF EXISTS "Attachments can be deleted by owner or super admin" ON public.attachments;
CREATE POLICY "Attachments can be deleted by owner or super admin" ON public.attachments
    FOR DELETE USING (
        uploaded_by = auth.uid() OR public.is_super_admin()
    );

-- --------------------------------------------------------------------
-- سياسات Report Reviews
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Reviews viewable by report stakeholders" ON public.report_reviews;
CREATE POLICY "Reviews viewable by report stakeholders" ON public.report_reviews
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.daily_reports r
            WHERE r.id = report_reviews.report_id
            AND (
                public.is_admin_or_super() OR
                r.reporting_unit_id = public.get_current_user_unit() OR
                r.user_id = auth.uid()
            )
        )
    );

DROP POLICY IF EXISTS "Admins can insert reviews" ON public.report_reviews;
CREATE POLICY "Admins can insert reviews" ON public.report_reviews
    FOR INSERT WITH CHECK (
        public.is_admin_or_super() AND reviewer_id = auth.uid()
    );

-- --------------------------------------------------------------------
-- سياسات Audit Logs
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Super Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Super Admins can view audit logs" ON public.audit_logs
    FOR SELECT USING (public.is_super_admin());

DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON public.audit_logs;
CREATE POLICY "Authenticated users can insert audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ====================================================================
-- Storage Bucket Setup & Policies
-- ====================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('report_attachments', 'report_attachments', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Authenticated users can upload report attachments" ON storage.objects;
CREATE POLICY "Authenticated users can upload report attachments" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'report_attachments' AND
        auth.role() = 'authenticated'
    );

DROP POLICY IF EXISTS "Authenticated users can view report attachments" ON storage.objects;
CREATE POLICY "Authenticated users can view report attachments" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'report_attachments' AND
        auth.role() = 'authenticated'
    );

DROP POLICY IF EXISTS "Users can delete their uploaded attachments" ON storage.objects;
CREATE POLICY "Users can delete their uploaded attachments" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'report_attachments' AND
        (auth.uid() = owner OR public.is_super_admin())
    );

-- ====================================================================
-- Trigger: تزامن تلقائي لإنشاء Profile عند التسجيل في auth.users
-- ====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role, active)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.email,
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'reporter'::user_role),
        true
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- دالة التحديث التلقائي لـ updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_reporting_units_modtime ON public.reporting_units;
CREATE TRIGGER update_reporting_units_modtime BEFORE UPDATE ON public.reporting_units FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS update_profiles_modtime ON public.profiles;
CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS update_report_templates_modtime ON public.report_templates;
CREATE TRIGGER update_report_templates_modtime BEFORE UPDATE ON public.report_templates FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS update_daily_reports_modtime ON public.daily_reports;
CREATE TRIGGER update_daily_reports_modtime BEFORE UPDATE ON public.daily_reports FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
