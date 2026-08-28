-- ============================================================================
-- MIGRATION: Fix Review Campaigns RLS, Public Visibility & Server Persistence
-- ============================================================================

-- 1. Ensure Table Structure & Permissions
GRANT SELECT ON public.review_campaigns TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.review_campaigns TO authenticated;
GRANT ALL ON public.review_campaigns TO service_role;

ALTER TABLE public.review_campaigns ENABLE ROW LEVEL SECURITY;

-- 2. Drop any conflicting or restrictive legacy policies
DROP POLICY IF EXISTS "admins manage campaigns" ON public.review_campaigns;
DROP POLICY IF EXISTS "public read active campaigns" ON public.review_campaigns;
DROP POLICY IF EXISTS "admins select all campaigns" ON public.review_campaigns;
DROP POLICY IF EXISTS "admins insert campaigns" ON public.review_campaigns;
DROP POLICY IF EXISTS "admins update campaigns" ON public.review_campaigns;
DROP POLICY IF EXISTS "admins delete campaigns" ON public.review_campaigns;

-- 3. Public / Anon SELECT Policy: Allow reading active, non-expired review campaigns
CREATE POLICY "public read active campaigns" ON public.review_campaigns
  FOR SELECT TO anon, authenticated
  USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- 4. Authenticated Admin Full Management Policies (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "admins select all campaigns" ON public.review_campaigns
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins insert campaigns" ON public.review_campaigns
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins update campaigns" ON public.review_campaigns
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins delete campaigns" ON public.review_campaigns
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 5. Stored Procedures (Security Definer) for Server-Side Authorized Campaign Operations

-- Save or update a review campaign safely from server function
CREATE OR REPLACE FUNCTION public.save_review_campaign(
  _id uuid,
  _campaign_name text,
  _slug text,
  _service_name text DEFAULT NULL,
  _location text DEFAULT NULL,
  _is_active boolean DEFAULT true,
  _expires_at timestamptz DEFAULT NULL,
  _created_by uuid DEFAULT NULL
)
RETURNS public.review_campaigns
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _res public.review_campaigns;
BEGIN
  IF _campaign_name IS NULL OR length(trim(_campaign_name)) = 0 THEN
    RAISE EXCEPTION 'Campaign name cannot be empty';
  END IF;
  IF _slug IS NULL OR length(trim(_slug)) = 0 THEN
    RAISE EXCEPTION 'Campaign slug cannot be empty';
  END IF;

  INSERT INTO public.review_campaigns (
    id,
    campaign_name,
    slug,
    service_name,
    location,
    is_active,
    expires_at,
    created_by,
    updated_at
  )
  VALUES (
    COALESCE(_id, gen_random_uuid()),
    _campaign_name,
    _slug,
    _service_name,
    _location,
    COALESCE(_is_active, true),
    _expires_at,
    _created_by,
    now()
  )
  ON CONFLICT (slug) DO UPDATE
  SET
    campaign_name = EXCLUDED.campaign_name,
    service_name = EXCLUDED.service_name,
    location = EXCLUDED.location,
    is_active = EXCLUDED.is_active,
    expires_at = EXCLUDED.expires_at,
    updated_at = now()
  RETURNING * INTO _res;

  RETURN _res;
END;
$$;

GRANT EXECUTE ON FUNCTION public.save_review_campaign(uuid, text, text, text, text, boolean, timestamptz, uuid) TO anon, authenticated, service_role;

-- Delete a review campaign safely
CREATE OR REPLACE FUNCTION public.delete_review_campaign(_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.review_campaigns WHERE id = _id;
  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_review_campaign(uuid) TO anon, authenticated, service_role;
