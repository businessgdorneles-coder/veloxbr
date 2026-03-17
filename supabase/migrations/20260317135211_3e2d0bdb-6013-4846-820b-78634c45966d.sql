
-- Explicit deny-all policy for abandoned_carts
-- All legitimate access goes through edge functions with service_role_key (bypasses RLS)
CREATE POLICY "Deny all direct access" ON public.abandoned_carts
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);
