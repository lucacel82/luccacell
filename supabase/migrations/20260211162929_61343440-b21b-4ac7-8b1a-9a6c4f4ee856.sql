
CREATE TABLE public.produtos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  preco NUMERIC NOT NULL DEFAULT 0,
  estoque INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to produtos" ON public.produtos FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to produtos" ON public.produtos FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to produtos" ON public.produtos FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to produtos" ON public.produtos FOR DELETE USING (true);
