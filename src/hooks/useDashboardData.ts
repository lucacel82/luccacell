import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DailySalesData {
  date: string;
  day: string;
  total: number;
  count: number;
}

interface CategoryData {
  name: string;
  value: number;
  count: number;
}

interface DashboardData {
  dailySales: DailySalesData[];
  categoryData: CategoryData[];
  totalMonth: number;
  totalWeek: number;
  totalToday: number;
  salesCount: number;
  avgTicket: number;
  loading: boolean;
}

export const useDashboardData = (): DashboardData => {
  const [dailySales, setDailySales] = useState<DailySalesData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [totalMonth, setTotalMonth] = useState(0);
  const [totalWeek, setTotalWeek] = useState(0);
  const [totalToday, setTotalToday] = useState(0);
  const [salesCount, setSalesCount] = useState(0);
  const [avgTicket, setAvgTicket] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Get last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      // Get start of month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      // Get start of week (Monday)
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
      startOfWeek.setHours(0, 0, 0, 0);

      // Get today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Fetch all sales from start of month
      const { data: sales, error } = await supabase
        .from('vendas')
        .select('*')
        .gte('data_venda', startOfMonth.toISOString())
        .order('data_venda', { ascending: true });

      if (error) throw error;

      const salesData = sales || [];

      // Calculate totals
      const monthTotal = salesData.reduce((sum, sale) => sum + (sale.quantidade * sale.valor), 0);
      setTotalMonth(monthTotal);
      setSalesCount(salesData.length);
      setAvgTicket(salesData.length > 0 ? monthTotal / salesData.length : 0);

      // Calculate week total
      const weekSales = salesData.filter(sale => new Date(sale.data_venda) >= startOfWeek);
      const weekTotal = weekSales.reduce((sum, sale) => sum + (sale.quantidade * sale.valor), 0);
      setTotalWeek(weekTotal);

      // Calculate today total
      const todaySales = salesData.filter(sale => {
        const saleDate = new Date(sale.data_venda);
        return saleDate >= today && saleDate < tomorrow;
      });
      const todayTotal = todaySales.reduce((sum, sale) => sum + (sale.quantidade * sale.valor), 0);
      setTotalToday(todayTotal);

      // Group by day for chart (last 7 days)
      const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const dailyMap = new Map<string, DailySalesData>();

      // Initialize last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        dailyMap.set(dateStr, {
          date: dateStr,
          day: dayNames[date.getDay()],
          total: 0,
          count: 0,
        });
      }

      // Fill with actual data
      salesData.forEach(sale => {
        const saleDate = new Date(sale.data_venda);
        if (saleDate >= sevenDaysAgo) {
          const dateStr = saleDate.toISOString().split('T')[0];
          const existing = dailyMap.get(dateStr);
          if (existing) {
            existing.total += sale.quantidade * sale.valor;
            existing.count += 1;
          }
        }
      });

      setDailySales(Array.from(dailyMap.values()));

      // Group by product category (top 5)
      const categoryMap = new Map<string, CategoryData>();
      salesData.forEach(sale => {
        const name = sale.nome_produto;
        const existing = categoryMap.get(name);
        if (existing) {
          existing.value += sale.quantidade * sale.valor;
          existing.count += sale.quantidade;
        } else {
          categoryMap.set(name, {
            name,
            value: sale.quantidade * sale.valor,
            count: sale.quantidade,
          });
        }
      });

      const sortedCategories = Array.from(categoryMap.values())
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      setCategoryData(sortedCategories);

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    dailySales,
    categoryData,
    totalMonth,
    totalWeek,
    totalToday,
    salesCount,
    avgTicket,
    loading,
  };
};
