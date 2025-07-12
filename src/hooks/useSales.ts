import { useState, useEffect } from 'react';
import { Sale, WeeklyReport, DailyReport } from '@/types/sale';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load sales from Supabase on component mount
  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      const { data, error } = await supabase
        .from('vendas')
        .select('*')
        .order('data_venda', { ascending: false });

      if (error) throw error;
      setSales(data || []);
    } catch (error) {
      console.error('Erro ao carregar vendas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as vendas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addSale = async (sale: Omit<Sale, 'id' | 'data_venda'>) => {
    try {
      const { data, error } = await supabase
        .from('vendas')
        .insert([{
          nome_produto: sale.nome_produto,
          quantidade: sale.quantidade,
          valor: sale.valor
        }])
        .select()
        .single();

      if (error) throw error;
      
      setSales(prev => [data, ...prev]);
      toast({
        title: "Sucesso",
        description: "Venda registrada com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao adicionar venda:', error);
      toast({
        title: "Erro",
        description: "Não foi possível registrar a venda.",
        variant: "destructive",
      });
    }
  };

  const updateSale = async (id: string, updatedSale: Omit<Sale, 'id' | 'data_venda'>) => {
    try {
      const { data, error } = await supabase
        .from('vendas')
        .update({
          nome_produto: updatedSale.nome_produto,
          quantidade: updatedSale.quantidade,
          valor: updatedSale.valor
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setSales(prev => 
        prev.map(sale => 
          sale.id === id ? data : sale
        )
      );
      toast({
        title: "Sucesso",
        description: "Venda atualizada com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao atualizar venda:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a venda.",
        variant: "destructive",
      });
    }
  };

  const deleteSale = async (id: string) => {
    try {
      const { error } = await supabase
        .from('vendas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setSales(prev => prev.filter(sale => sale.id !== id));
      toast({
        title: "Sucesso",
        description: "Venda excluída com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao excluir venda:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a venda.",
        variant: "destructive",
      });
    }
  };

  const getDailyReport = (): DailyReport => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const todaySales = sales.filter(sale => {
      const saleDate = new Date(sale.data_venda);
      return saleDate >= today && saleDate < tomorrow;
    });

    const totalValue = todaySales.reduce((sum, sale) => sum + sale.valor, 0);

    return {
      totalValue,
    };
  };

  const getDailySales = (): Sale[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    return sales.filter(sale => {
      const saleDate = new Date(sale.data_venda);
      return saleDate >= today && saleDate < tomorrow;
    });
  };

  const getWeeklyReport = (): WeeklyReport => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
    endOfWeek.setHours(23, 59, 59, 999);

    const weekSales = sales.filter(sale => {
      const saleDate = new Date(sale.data_venda);
      return saleDate >= startOfWeek && saleDate <= endOfWeek;
    });

    const totalValue = weekSales.reduce((sum, sale) => sum + sale.valor, 0);

    return {
      totalSales: weekSales.length,
      totalValue,
      sales: weekSales,
    };
  };

  return {
    sales,
    loading,
    addSale,
    updateSale,
    deleteSale,
    getDailyReport,
    getDailySales,
    getWeeklyReport,
  };
};