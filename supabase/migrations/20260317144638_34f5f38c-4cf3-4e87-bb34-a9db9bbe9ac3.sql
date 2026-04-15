
-- 1. Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- 2. user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Deny all direct access to user_roles"
  ON public.user_roles FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

-- 3. Security definer function for role check
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 4. site_content table (key-value CMS)
CREATE TABLE public.site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Deny all direct access to site_content"
  ON public.site_content FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

-- Allow public read for site_content (page needs to read prices/texts)
CREATE POLICY "Public can read site_content"
  ON public.site_content FOR SELECT TO anon, authenticated
  USING (true);

-- 5. site_reviews table
CREATE TABLE public.site_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  city text,
  photo_url text,
  review_text text NOT NULL,
  video_url text,
  rating integer DEFAULT 5,
  sort_order integer DEFAULT 0,
  visible boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Deny all direct write to site_reviews"
  ON public.site_reviews FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

CREATE POLICY "Public can read visible site_reviews"
  ON public.site_reviews FOR SELECT TO anon, authenticated
  USING (visible = true);

-- 6. Triggers for updated_at
CREATE TRIGGER update_site_content_updated_at
  BEFORE UPDATE ON public.site_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_reviews_updated_at
  BEFORE UPDATE ON public.site_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Storage bucket for site assets
INSERT INTO storage.buckets (id, name, public) VALUES ('site-assets', 'site-assets', true);

CREATE POLICY "Public read site-assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'site-assets');

CREATE POLICY "Authenticated upload site-assets"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'site-assets');

CREATE POLICY "Authenticated update site-assets"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'site-assets');

CREATE POLICY "Authenticated delete site-assets"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'site-assets');
