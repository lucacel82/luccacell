export interface Sale {
  id: string;
  productName: string;
  quantity: number;
  value: number;
  date: string;
}

export interface WeeklyReport {
  totalSales: number;
  totalValue: number;
  sales: Sale[];
}