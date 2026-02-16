import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Product {
  id: string;
  nome: string;
  preco: number;
  estoque: number;
  codigo_barras?: string | null;
  created_at: string;
}

export interface ProductInput {
  nome: string;
  preco: number;
  estoque: number;
  codigo_barras?: string | null;
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .order('nome', { ascending: true });

    if (!error && data) {
      setProducts(data as Product[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addProduct = async (input: ProductInput) => {
    const { error } = await supabase.from('produtos').insert({
      nome: input.nome,
      preco: input.preco,
      estoque: input.estoque,
      codigo_barras: input.codigo_barras || null,
      user_id: user?.id,
    } as any);
    if (!error) await fetchProducts();
    return !error;
  };

  const updateProduct = async (id: string, input: Partial<ProductInput>) => {
    const { error } = await supabase.from('produtos').update(input).eq('id', id);
    if (!error) await fetchProducts();
    return !error;
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from('produtos').delete().eq('id', id);
    if (!error) await fetchProducts();
    return !error;
  };

  return { products, loading, addProduct, updateProduct, deleteProduct, refetch: fetchProducts };
};
