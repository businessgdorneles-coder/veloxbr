
-- Enable RLS on abandoned_carts table
ALTER TABLE public.abandoned_carts ENABLE ROW LEVEL SECURITY;

-- No SELECT/INSERT/UPDATE/DELETE policies are created intentionally.
-- All access is through edge functions using service_role_key (bypasses RLS).
-- This means NO direct client access is possible, which is the desired security posture.
