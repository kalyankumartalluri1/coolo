-- Site settings for operator-editable public content (phones, email, hours, etc.)
-- Public pages read this table server-side; only super admins may change values.

CREATE TABLE IF NOT EXISTS public.site_settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Public pages (including anonymous visitors) may read settings.
CREATE POLICY "Site settings are publicly readable"
    ON public.site_settings FOR SELECT
    USING (TRUE);

-- Only super administrators may manage settings values.
CREATE POLICY "Super admins manage site settings"
    ON public.site_settings FOR ALL
    USING (public.is_super_admin())
    WITH CHECK (public.is_super_admin());

-- Allow super admins to adjust catalog pricing rendered across the public site.
-- (The services table previously had read-only policies.)
DROP POLICY IF EXISTS "Super admins update service pricing" ON public.services;
CREATE POLICY "Super admins update service pricing"
    ON public.services FOR UPDATE
    USING (public.is_super_admin())
    WITH CHECK (public.is_super_admin());

-- Keep updated_at fresh on every change (self-contained trigger function).
CREATE OR REPLACE FUNCTION public.touch_site_settings_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER set_site_settings_updated_at
    BEFORE UPDATE ON public.site_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.touch_site_settings_updated_at();
