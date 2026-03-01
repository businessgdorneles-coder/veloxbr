
ALTER TABLE public.abandoned_carts ADD COLUMN IF NOT EXISTS address_street text;
ALTER TABLE public.abandoned_carts ADD COLUMN IF NOT EXISTS address_number text;
ALTER TABLE public.abandoned_carts ADD COLUMN IF NOT EXISTS address_complement text;
ALTER TABLE public.abandoned_carts ADD COLUMN IF NOT EXISTS neighborhood text;
