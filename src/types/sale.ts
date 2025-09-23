export interface Sale {
  id: string;
  nome_produto: string;
  quantidade: number;
  valor: number;
  data_venda: string;
  user_id: string;
}

export type SaleInput = Omit<Sale, 'id' | 'data_venda' | 'user_id'>;

export interface WeeklyReport {
  totalSales: number;
  totalValue: number;
  sales: Sale[];
}

export interface DailyReport {
  totalValue: number;
}