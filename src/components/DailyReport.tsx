import { Card, CardContent } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';
import { DailyReport as DailyReportType } from '@/types/sale';

interface DailyReportProps {
  report: DailyReportType;
}

export const DailyReport = ({ report }: DailyReportProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <Card className="bg-gradient-gold border-border shadow-gold mb-6 text-primary-foreground">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary-foreground/20 rounded-full p-3">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Total de Vendas Hoje</h2>
              <p className="text-sm opacity-90">{getCurrentDate()}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">
              {formatCurrency(report.totalValue)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};