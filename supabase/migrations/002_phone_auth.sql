-- Authenticate users by phone number and password rather than email.
-- Enable Phone Auth in the Supabase Authentication provider settings before deploying.

ALTER TABLE public.profiles
    ALTER COLUMN email DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_phone_unique
    ON public.profiles (phone)
    WHERE phone IS NOT NULL;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, phone, role, active)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.phone, NEW.email),
        NEW.email,
        NEW.phone,
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'reporter'::user_role),
        true
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
