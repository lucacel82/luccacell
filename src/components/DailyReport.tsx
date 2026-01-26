import { DollarSign, TrendingUp } from 'lucide-react';
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
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="mb-8 animate-fade-in">
      <div className="glass-card-interactive p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary rounded-2xl p-4 shadow-lg">
              <DollarSign className="h-8 w-8 text-primary-foreground" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-foreground">
                  Vendas de Hoje
                </h2>
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground capitalize">
                {getCurrentDate()}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-4xl font-bold text-foreground">
              {formatCurrency(report.totalValue)}
            </div>
            {report.totalValue > 0 ? (
              <p className="text-xs font-medium text-muted-foreground mt-1">
                🎉 Excelente trabalho!
              </p>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">
                Vamos começar as vendas! 💪
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
