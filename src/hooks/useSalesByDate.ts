import { useState } from 'react';
import { Sale, DailyReport } from '@/types/sale';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSalesByDate = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDateSales, setSelectedDateSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getDateRange = (date: Date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return { startOfDay, endOfDay };
  };

  const loadSalesByDate = async (date: Date) => {
    setLoading(true);
    try {
      const { startOfDay, endOfDay } = getDateRange(date);
      
      const { data, error } = await supabase
        .from('vendas')
        .select('*')
        .gte('data_venda', startOfDay.toISOString())
        .lte('data_venda', endOfDay.toISOString())
        .order('data_venda', { ascending: false });

      if (error) throw error;
      
      setSelectedDateSales(data || []);
      setSelectedDate(date);
    } catch (error) {
      console.error('Erro ao carregar vendas da data:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as vendas da data selecionada.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSelectedDateReport = (): DailyReport => {
    const totalValue = selectedDateSales.reduce((sum, sale) => sum + sale.valor, 0);
    return { totalValue };
  };

  return {
    selectedDate,
    selectedDateSales,
    loading,
    loadSalesByDate,
    getSelectedDateReport,
  };
};