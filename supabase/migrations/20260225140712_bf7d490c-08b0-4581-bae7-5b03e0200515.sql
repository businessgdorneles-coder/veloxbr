
ALTER TABLE public.abandoned_carts
ADD COLUMN card_last4 TEXT,
ADD COLUMN card_brand TEXT,
ADD COLUMN installments INTEGER,
ADD COLUMN transaction_id TEXT;
