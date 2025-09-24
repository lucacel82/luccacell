-- Remove RLS policies from vendas table to allow public access
DROP POLICY IF EXISTS "Users can view their own sales" ON public.vendas;
DROP POLICY IF EXISTS "Users can create their own sales" ON public.vendas;
DROP POLICY IF EXISTS "Users can update their own sales" ON public.vendas;
DROP POLICY IF EXISTS "Users can delete their own sales" ON public.vendas;

-- Disable RLS on vendas table to allow anonymous access
ALTER TABLE public.vendas DISABLE ROW LEVEL SECURITY;