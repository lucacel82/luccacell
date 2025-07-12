import { useState, useEffect } from 'react';
import { Sale, WeeklyReport } from '@/types/sale';

export const useSales = () => {
  const [sales, setSales] = useState<Sale[]>([]);

  // Load sales from localStorage on component mount
  useEffect(() => {
    const savedSales = localStorage.getItem('lucca-cell-sales');
    if (savedSales) {
      setSales(JSON.parse(savedSales));
    }
  }, []);

  // Save sales to localStorage whenever sales change
  useEffect(() => {
    localStorage.setItem('lucca-cell-sales', JSON.stringify(sales));
  }, [sales]);

  const addSale = (sale: Omit<Sale, 'id'>) => {
    const newSale: Sale = {
      ...sale,
      id: Date.now().toString(),
    };
    setSales(prev => [newSale, ...prev]);
  };

  const updateSale = (id: string, updatedSale: Omit<Sale, 'id'>) => {
    setSales(prev => 
      prev.map(sale => 
        sale.id === id ? { ...updatedSale, id } : sale
      )
    );
  };

  const deleteSale = (id: string) => {
    setSales(prev => prev.filter(sale => sale.id !== id));
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
      const saleDate = new Date(sale.date);
      return saleDate >= startOfWeek && saleDate <= endOfWeek;
    });

    const totalValue = weekSales.reduce((sum, sale) => sum + sale.value, 0);

    return {
      totalSales: weekSales.length,
      totalValue,
      sales: weekSales,
    };
  };

  return {
    sales,
    addSale,
    updateSale,
    deleteSale,
    getWeeklyReport,
  };
};