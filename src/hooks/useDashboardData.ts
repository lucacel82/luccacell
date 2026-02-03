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

interface ComparisonData {
  current: number;
  previous: number;
  percentChange: number;
  isPositive: boolean;
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
  // Comparisons
  todayComparison: ComparisonData;
  weekComparison: ComparisonData;
  monthComparison: ComparisonData;
}

const calculateComparison = (current: number, previous: number): ComparisonData => {
  const percentChange = previous > 0 
    ? ((current - previous) / previous) * 100 
    : current > 0 ? 100 : 0;
  
  return {
    current,
    previous,
    percentChange,
    isPositive: percentChange >= 0,
  };
};

export const useDashboardData = (): DashboardData => {
  const [dailySales, setDailySales] = useState<DailySalesData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [totalMonth, setTotalMonth] = useState(0);
  const [totalWeek, setTotalWeek] = useState(0);
  const [totalToday, setTotalToday] = useState(0);
  const [salesCount, setSalesCount] = useState(0);
  const [avgTicket, setAvgTicket] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Comparison states
  const [todayComparison, setTodayComparison] = useState<ComparisonData>({
    current: 0, previous: 0, percentChange: 0, isPositive: true
  });
  const [weekComparison, setWeekComparison] = useState<ComparisonData>({
    current: 0, previous: 0, percentChange: 0, isPositive: true
  });
  const [monthComparison, setMonthComparison] = useState<ComparisonData>({
    current: 0, previous: 0, percentChange: 0, isPositive: true
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Get date ranges
      const now = new Date();
      
      // Today
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Yesterday
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // This week (Monday to Sunday)
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay() + 1);
      startOfWeek.setHours(0, 0, 0, 0);
      
      // Last week
      const startOfLastWeek = new Date(startOfWeek);
      startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
      const endOfLastWeek = new Date(startOfWeek);
      
      // This month
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      // Last month
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      startOfLastMonth.setHours(0, 0, 0, 0);
      const endOfLastMonth = new Date(startOfMonth);
      
      // Last 7 days for chart
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      // Fetch all sales from start of last month (to cover all comparisons)
      const { data: sales, error } = await supabase
        .from('vendas')
        .select('*')
        .gte('data_venda', startOfLastMonth.toISOString())
        .order('data_venda', { ascending: true });

      if (error) throw error;

      const salesData = sales || [];

      // Helper function to calculate total for a date range
      const calculateTotal = (start: Date, end: Date) => {
        return salesData
          .filter(sale => {
            const saleDate = new Date(sale.data_venda);
            return saleDate >= start && saleDate < end;
          })
          .reduce((sum, sale) => sum + (sale.quantidade * sale.valor), 0);
      };

      // Calculate current period totals
      const todayTotal = calculateTotal(today, tomorrow);
      const weekTotal = calculateTotal(startOfWeek, tomorrow);
      const monthTotal = calculateTotal(startOfMonth, tomorrow);
      
      // Calculate previous period totals
      const yesterdayTotal = calculateTotal(yesterday, today);
      const lastWeekTotal = calculateTotal(startOfLastWeek, endOfLastWeek);
      const lastMonthTotal = calculateTotal(startOfLastMonth, endOfLastMonth);

      // Set totals
      setTotalToday(todayTotal);
      setTotalWeek(weekTotal);
      setTotalMonth(monthTotal);
      
      // Set comparisons
      setTodayComparison(calculateComparison(todayTotal, yesterdayTotal));
      setWeekComparison(calculateComparison(weekTotal, lastWeekTotal));
      setMonthComparison(calculateComparison(monthTotal, lastMonthTotal));

      // Current month sales for other calculations
      const currentMonthSales = salesData.filter(sale => new Date(sale.data_venda) >= startOfMonth);
      setSalesCount(currentMonthSales.length);
      setAvgTicket(currentMonthSales.length > 0 ? monthTotal / currentMonthSales.length : 0);

      // Group by day for chart (last 7 days)
      const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const dailyMap = new Map<string, DailySalesData>();

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

      // Group by product category (top 5) - current month only
      const categoryMap = new Map<string, CategoryData>();
      currentMonthSales.forEach(sale => {
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
    todayComparison,
    weekComparison,
    monthComparison,
  };
};
