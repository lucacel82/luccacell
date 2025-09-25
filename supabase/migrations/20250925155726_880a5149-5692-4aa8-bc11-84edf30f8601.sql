-- Make user_id optional to allow inserts without authentication
ALTER TABLE public.vendas
ALTER COLUMN user_id DROP NOT NULL;