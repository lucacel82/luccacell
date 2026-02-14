
-- Fix vendas policies: remove OR user_id IS NULL
DROP POLICY IF EXISTS "Users can view own vendas" ON public.vendas;
DROP POLICY IF EXISTS "Users can update own vendas" ON public.vendas;
DROP POLICY IF EXISTS "Users can delete own vendas" ON public.vendas;

CREATE POLICY "Users can view own vendas" ON public.vendas FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update own vendas" ON public.vendas FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own vendas" ON public.vendas FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Fix produtos policies: remove OR user_id IS NULL
DROP POLICY IF EXISTS "Users can view own produtos" ON public.produtos;
DROP POLICY IF EXISTS "Users can update own produtos" ON public.produtos;
DROP POLICY IF EXISTS "Users can delete own produtos" ON public.produtos;

CREATE POLICY "Users can view own produtos" ON public.produtos FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update own produtos" ON public.produtos FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own produtos" ON public.produtos FOR DELETE TO authenticated USING (user_id = auth.uid());
