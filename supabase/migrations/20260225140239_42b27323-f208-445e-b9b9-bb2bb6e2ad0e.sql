
-- Table for abandoned carts and payment attempts
CREATE TABLE public.abandoned_carts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  name TEXT,
  email TEXT,
  phone TEXT,
  cpf TEXT,
  brand TEXT,
  model TEXT,
  year TEXT,
  vehicle_type TEXT,
  selected_color TEXT,
  selected_kit TEXT,
  selected_texture TEXT,
  product_title TEXT,
  amount_cents INTEGER,
  payment_method TEXT,
  payment_status TEXT NOT NULL DEFAULT 'cart_started',
  ip_address TEXT,
  user_agent TEXT,
  cep TEXT,
  city TEXT,
  state TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS but allow public inserts via edge function
ALTER TABLE public.abandoned_carts ENABLE ROW LEVEL SECURITY;

-- No direct client access - all access via edge function with service role
-- Admin reads will use service role key in edge function

-- Index for filtering
CREATE INDEX idx_abandoned_carts_status ON public.abandoned_carts (payment_status);
CREATE INDEX idx_abandoned_carts_created ON public.abandoned_carts (created_at DESC);
CREATE INDEX idx_abandoned_carts_email ON public.abandoned_carts (email);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_abandoned_carts_updated_at
BEFORE UPDATE ON public.abandoned_carts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
