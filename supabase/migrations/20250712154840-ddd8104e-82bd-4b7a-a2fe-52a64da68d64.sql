-- Criar tabela de vendas
CREATE TABLE public.vendas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_produto TEXT NOT NULL,
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  valor NUMERIC(10,2) NOT NULL CHECK (valor > 0),
  data_venda TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índice para melhorar performance nas consultas por data
CREATE INDEX idx_vendas_data_venda ON public.vendas(data_venda);

-- Habilitar Row Level Security (mesmo sem autenticação, é boa prática)
ALTER TABLE public.vendas ENABLE ROW LEVEL SECURITY;

-- Política para permitir todas as operações (já que não há autenticação)
CREATE POLICY "Allow all operations on vendas" 
ON public.vendas 
FOR ALL 
USING (true) 
WITH CHECK (true);