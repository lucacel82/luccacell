import { useState, useEffect } from 'react';
import { Sale, WeeklyReport, DailyReport } from '@/types/sale';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export type SaleInput = Omit<Sale, 'id' | 'data_venda'>;

export const useSales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReport>({
    totalSales: 0,
    totalValue: 0,
    sales: [],
  });
  const { toast } = useToast();
  const { user } = useAuth();

  // Load only today's sales from Supabase on component mount
  useEffect(() => {
    loadTodaySales();
    loadWeeklyReport();
  }, []);

  // Helper function to get recent sales date range (last 30 days)
  const getRecentDateRange = () => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    return { thirtyDaysAgo, today };
  };

  // Helper function to get today's date range for filtering
  const getTodayDateRange = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    return { today, tomorrow };
  };

  const loadTodaySales = async () => {
    try {
      const { thirtyDaysAgo, today } = getRecentDateRange();
      
      const { data, error } = await supabase
        .from('vendas')
        .select('*')
        .gte('data_venda', thirtyDaysAgo.toISOString())
        .lte('data_venda', today.toISOString())
        .order('data_venda', { ascending: false });

      if (error) throw error;
      console.log('Vendas carregadas:', data); // Debug log
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

  const loadWeeklyReport = async () => {
    try {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
      endOfWeek.setHours(23, 59, 59, 999);

      const { data: weekSales, error } = await supabase
        .from('vendas')
        .select('*')
        .gte('data_venda', startOfWeek.toISOString())
        .lte('data_venda', endOfWeek.toISOString())
        .order('data_venda', { ascending: false });

      if (error) throw error;

      const salesData = weekSales || [];
      const totalValue = salesData.reduce((sum, sale) => sum + (sale.quantidade * sale.valor), 0);

      setWeeklyReport({
        totalSales: salesData.length,
        totalValue,
        sales: salesData,
      });
    } catch (error) {
      console.error('Erro ao carregar relatório semanal:', error);
    }
  };

  const addSale = async (sale: SaleInput) => {
    try {
      const { data, error } = await supabase
        .from('vendas')
        .insert([{
          nome_produto: sale.nome_produto,
          quantidade: sale.quantidade,
          valor: sale.valor,
          user_id: user?.id
        }])
        .select()
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setSales(prev => [data, ...prev]);
        // Reload weekly report when new sale is added
        loadWeeklyReport();
        toast({
          title: "Sucesso",
          description: "Venda registrada com sucesso!",
        });
      }
    } catch (error) {
      console.error('Erro ao adicionar venda:', error);
      toast({
        title: "Erro",
        description: "Não foi possível registrar a venda.",
        variant: "destructive",
      });
    }
  };

  const updateSale = async (id: string, updatedSale: SaleInput) => {
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
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setSales(prev => 
          prev.map(sale => 
            sale.id === id ? data : sale
          )
        );
        toast({
          title: "Sucesso",
          description: "Venda atualizada com sucesso!",
        });
      }
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
    // Filter sales for today only
    const { today, tomorrow } = getTodayDateRange();
    const todaySales = sales.filter(sale => {
      const saleDate = new Date(sale.data_venda);
      return saleDate >= today && saleDate < tomorrow;
    });
    
    const totalValue = todaySales.reduce((sum, sale) => sum + (sale.quantidade * sale.valor), 0);

    return {
      totalValue,
    };
  };

  const getDailySales = (): Sale[] => {
    // Filter sales for today only
    const { today, tomorrow } = getTodayDateRange();
    return sales.filter(sale => {
      const saleDate = new Date(sale.data_venda);
      return saleDate >= today && saleDate < tomorrow;
    });
  };

  const getWeeklyReport = (): WeeklyReport => {
    return weeklyReport;
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
    loadWeeklyReport,
  };
};