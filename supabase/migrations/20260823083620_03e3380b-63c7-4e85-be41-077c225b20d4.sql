-- ============ enums ============
CREATE TYPE public.review_status AS ENUM ('pending','approved','rejected','archived');
CREATE TYPE public.report_status AS ENUM ('open','resolved','dismissed');

-- ============ campaigns ============
CREATE TABLE public.review_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_name text NOT NULL,
  slug text NOT NULL UNIQUE,
  service_name text,
  location text,
  is_active boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  visits integer NOT NULL DEFAULT 0,
  scans integer NOT NULL DEFAULT 0,
  submissions integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.review_campaigns TO authenticated;
GRANT ALL ON public.review_campaigns TO service_role;
ALTER TABLE public.review_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage campaigns" ON public.review_campaigns
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ reviews ============
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES public.review_campaigns(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_email text,
  customer_phone text,
  service_name text,
  rating smallint NOT NULL,
  review_text text NOT NULL,
  customer_photo_url text,
  customer_location text,
  consent_to_publish boolean NOT NULL DEFAULT false,
  status public.review_status NOT NULL DEFAULT 'pending',
  is_featured boolean NOT NULL DEFAULT false,
  moderation_reason text,
  moderated_by uuid,
  submitter_ip text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz,
  rejected_at timestamptz,
  archived_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT reviews_rating_range CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT reviews_text_len CHECK (char_length(review_text) BETWEEN 5 AND 2000),
  CONSTRAINT reviews_name_len CHECK (char_length(customer_name) BETWEEN 2 AND 80)
);
CREATE INDEX reviews_status_idx ON public.reviews(status, submitted_at DESC);
CREATE INDEX reviews_campaign_idx ON public.reviews(campaign_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT INSERT ON public.reviews TO anon;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can submit a pending review" ON public.reviews
  FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'pending' AND consent_to_publish = true AND is_featured = false);

CREATE POLICY "admins read reviews" ON public.reviews
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins update reviews" ON public.reviews
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins delete reviews" ON public.reviews
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- public-safe projection (no email / phone), only approved rows
CREATE VIEW public.public_reviews AS
  SELECT r.id, r.customer_name, r.service_name, r.rating, r.review_text,
         r.customer_photo_url, r.customer_location, r.is_featured,
         COALESCE(r.approved_at, r.submitted_at) AS published_at,
         r.submitted_at
  FROM public.reviews r
  WHERE r.status = 'approved';
GRANT SELECT ON public.public_reviews TO anon, authenticated;

-- ============ reports ============
CREATE TABLE public.review_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  reporter_name text,
  reporter_email text,
  reason text NOT NULL,
  message text,
  status public.report_status NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  resolved_by uuid
);
CREATE INDEX review_reports_status_idx ON public.review_reports(status, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.review_reports TO authenticated;
GRANT INSERT ON public.review_reports TO anon;
GRANT ALL ON public.review_reports TO service_role;
ALTER TABLE public.review_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can report a review" ON public.review_reports
  FOR INSERT TO anon, authenticated WITH CHECK (status = 'open');
CREATE POLICY "admins manage reports" ON public.review_reports
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ audit logs ============
CREATE TABLE public.admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  old_value jsonb,
  new_value jsonb,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX admin_audit_logs_created_idx ON public.admin_audit_logs(created_at DESC);
GRANT SELECT ON public.admin_audit_logs TO authenticated;
GRANT ALL ON public.admin_audit_logs TO service_role;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read audit logs" ON public.admin_audit_logs
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- ============ notification settings ============
CREATE TABLE public.review_settings (
  id boolean PRIMARY KEY DEFAULT true,
  notify_on_submit boolean NOT NULL DEFAULT true,
  notify_on_approve boolean NOT NULL DEFAULT false,
  notify_on_reject boolean NOT NULL DEFAULT false,
  notify_on_report boolean NOT NULL DEFAULT true,
  notify_campaign_summary boolean NOT NULL DEFAULT false,
  notify_email text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT review_settings_singleton CHECK (id)
);
GRANT SELECT, INSERT, UPDATE ON public.review_settings TO authenticated;
GRANT ALL ON public.review_settings TO service_role;
ALTER TABLE public.review_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage review settings" ON public.review_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
INSERT INTO public.review_settings (id) VALUES (true);

-- ============ counters ============
CREATE OR REPLACE FUNCTION public.bump_campaign_counter(_slug text, _kind text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _kind = 'visit' THEN
    UPDATE public.review_campaigns SET visits = visits + 1 WHERE slug = _slug;
  ELSIF _kind = 'scan' THEN
    UPDATE public.review_campaigns SET scans = scans + 1 WHERE slug = _slug;
  ELSIF _kind = 'submission' THEN
    UPDATE public.review_campaigns SET submissions = submissions + 1 WHERE slug = _slug;
  END IF;
END;
$$;
GRANT EXECUTE ON FUNCTION public.bump_campaign_counter(text, text) TO anon, authenticated, service_role;

-- public campaign lookup (only safe fields, only live campaigns)
CREATE OR REPLACE FUNCTION public.get_public_campaign(_slug text)
RETURNS TABLE (id uuid, campaign_name text, service_name text, location text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id, c.campaign_name, c.service_name, c.location
  FROM public.review_campaigns c
  WHERE c.slug = _slug AND c.is_active AND (c.expires_at IS NULL OR c.expires_at > now())
$$;
GRANT EXECUTE ON FUNCTION public.get_public_campaign(text) TO anon, authenticated, service_role;

-- updated_at triggers
CREATE TRIGGER reviews_touch BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER review_campaigns_touch BEFORE UPDATE ON public.review_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();