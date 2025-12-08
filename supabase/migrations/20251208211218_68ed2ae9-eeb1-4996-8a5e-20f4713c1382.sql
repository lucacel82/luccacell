-- Allow public read access to vendas
CREATE POLICY "Allow public read access to vendas"
ON public.vendas
FOR SELECT
USING (true);

-- Allow public insert access to vendas
CREATE POLICY "Allow public insert access to vendas"
ON public.vendas
FOR INSERT
WITH CHECK (true);

-- Allow public update access to vendas
CREATE POLICY "Allow public update access to vendas"
ON public.vendas
FOR UPDATE
USING (true);

-- Allow public delete access to vendas
CREATE POLICY "Allow public delete access to vendas"
ON public.vendas
FOR DELETE
USING (true);