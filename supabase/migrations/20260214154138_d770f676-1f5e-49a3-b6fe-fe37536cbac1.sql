
-- Adicionar user_id em produtos
ALTER TABLE public.produtos ADD COLUMN user_id uuid REFERENCES auth.users(id);

-- Remover politicas publicas antigas de vendas
DROP POLICY IF EXISTS "Allow public read access to vendas" ON public.vendas;
DROP POLICY IF EXISTS "Allow public insert access to vendas" ON public.vendas;
DROP POLICY IF EXISTS "Allow public update access to vendas" ON public.vendas;
DROP POLICY IF EXISTS "Allow public delete access to vendas" ON public.vendas;

-- Novas politicas para vendas (por usuario)
CREATE POLICY "Users can view own vendas" ON public.vendas FOR SELECT TO authenticated USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "Users can insert own vendas" ON public.vendas FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own vendas" ON public.vendas FOR UPDATE TO authenticated USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "Users can delete own vendas" ON public.vendas FOR DELETE TO authenticated USING (user_id = auth.uid() OR user_id IS NULL);

-- Remover politicas publicas antigas de produtos
DROP POLICY IF EXISTS "Allow public read access to produtos" ON public.produtos;
DROP POLICY IF EXISTS "Allow public insert access to produtos" ON public.produtos;
DROP POLICY IF EXISTS "Allow public update access to produtos" ON public.produtos;
DROP POLICY IF EXISTS "Allow public delete access to produtos" ON public.produtos;

-- Novas politicas para produtos (por usuario)
CREATE POLICY "Users can view own produtos" ON public.produtos FOR SELECT TO authenticated USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "Users can insert own produtos" ON public.produtos FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own produtos" ON public.produtos FOR UPDATE TO authenticated USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "Users can delete own produtos" ON public.produtos FOR DELETE TO authenticated USING (user_id = auth.uid() OR user_id IS NULL);
