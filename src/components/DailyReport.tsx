import { DollarSign } from 'lucide-react';
import { DailyReport as DailyReportType } from '@/types/sale';
import { GlassEffect } from '@/components/ui/glass-effect';

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
    <GlassEffect className="mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 rounded-xl p-3 backdrop-blur-sm border border-primary/30">
            <DollarSign className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-poppins text-primary">Total de Vendas</h2>
            <p className="text-sm opacity-90 font-poppins text-muted-foreground">{getCurrentDate()}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold font-poppins text-primary">
            {formatCurrency(report.totalValue)}
          </div>
        </div>
      </div>
    </GlassEffect>
  );
};