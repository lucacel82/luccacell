-- Update RLS policies to allow access without user authentication for single-user app
-- Since only one person uses this app, we can simplify the policies

DROP POLICY IF EXISTS "Authenticated users can view sales" ON public.vendas;
DROP POLICY IF EXISTS "Authenticated users can create sales" ON public.vendas;  
DROP POLICY IF EXISTS "Authenticated users can update sales" ON public.vendas;
DROP POLICY IF EXISTS "Authenticated users can delete sales" ON public.vendas;

-- Create new policies that allow public access for the single-user app
CREATE POLICY "Allow all sales operations" ON public.vendas
FOR ALL USING (true) WITH CHECK (true);