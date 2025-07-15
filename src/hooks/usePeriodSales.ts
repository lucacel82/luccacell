import { useState } from 'react';
import { Sale } from '@/types/sale';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PeriodReport {
  totalSales: number;
  totalValue: number;
  sales: Sale[];
  startDate: Date | null;
  endDate: Date | null;
}

export const usePeriodSales = () => {
  const [periodReport, setPeriodReport] = useState<PeriodReport>({
    totalSales: 0,
    totalValue: 0,
    sales: [],
    startDate: null,
    endDate: null,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadPeriodSales = async (startDate: Date, endDate: Date) => {
    setLoading(true);
    try {
      // Set time to cover full days
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('vendas')
        .select('*')
        .gte('data_venda', start.toISOString())
        .lte('data_venda', end.toISOString())
        .order('data_venda', { ascending: false });

      if (error) throw error;

      const salesData = data || [];
      const totalValue = salesData.reduce((sum, sale) => sum + (sale.quantidade * sale.valor), 0);

      setPeriodReport({
        totalSales: salesData.length,
        totalValue,
        sales: salesData,
        startDate: start,
        endDate: end,
      });
    } catch (error) {
      console.error('Erro ao carregar vendas do período:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as vendas do período.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    periodReport,
    loading,
    loadPeriodSales,
  };
};