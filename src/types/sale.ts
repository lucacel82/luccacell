export interface Sale {
  id: string;
  nome_produto: string;
  quantidade: number;
  valor: number;
  data_venda: string;
}

export interface WeeklyReport {
  totalSales: number;
  totalValue: number;
  sales: Sale[];
}

export interface DailyReport {
  totalValue: number;
}