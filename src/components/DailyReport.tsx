import { DollarSign, Sparkles, TrendingUp } from 'lucide-react';
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
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="mb-8 animate-fade-in">
      <div className="relative overflow-hidden">
        <GlassEffect className="relative border-2 border-primary/20 hover:border-primary/40 transition-all duration-300">
          {/* Background gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/10 pointer-events-none" />
          
          <div className="relative z-10 flex items-center justify-between p-1">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="bg-primary rounded-2xl p-4 shadow-md animate-pulse-glow">
                  <DollarSign className="h-8 w-8 text-primary-foreground animate-float" />
                </div>
                <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-primary animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold font-poppins text-primary">
                    Vendas de Hoje
                  </h2>
                  <TrendingUp className="h-5 w-5 text-primary animate-bounce" />
                </div>
                <p className="text-sm font-medium font-poppins text-muted-foreground capitalize">
                  {getCurrentDate()}
                </p>
              </div>
            </div>
            
            <div className="text-right animate-scale-in">
              <div className="relative">
                <div className="text-4xl font-bold font-poppins text-transparent bg-gradient-to-r from-primary via-accent to-primary bg-clip-text animate-pulse">
                  {formatCurrency(report.totalValue)}
                </div>
                {report.totalValue > 0 && (
                  <div className="absolute -top-2 -right-2">
                    <div className="bg-primary/20 rounded-full p-1 animate-ping">
                      <div className="bg-primary rounded-full w-2 h-2"></div>
                    </div>
                  </div>
                )}
              </div>
              {report.totalValue > 0 ? (
                <p className="text-xs font-medium text-primary mt-1 animate-fade-in">
                  🎉 Excelente trabalho!
                </p>
              ) : (
                <p className="text-xs text-muted-foreground mt-1">
                  Vamos começar as vendas! 💪
                </p>
              )}
            </div>
          </div>
        </GlassEffect>
      </div>
    </div>
  );
};