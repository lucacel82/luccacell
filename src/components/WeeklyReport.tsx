import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, DollarSign, Package, CalendarDays, Calendar } from 'lucide-react';
import { WeeklyReport as WeeklyReportType } from '@/types/sale';
import { DailyReportCalendar } from './DailyReportCalendar';
import { PeriodReport } from './PeriodReport';

interface WeeklyReportProps {
  report: WeeklyReportType;
}

export const WeeklyReport = ({ report }: WeeklyReportProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getWeekDates = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return {
      start: startOfWeek.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      end: endOfWeek.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    };
  };

  const weekDates = getWeekDates();

  return (
    <Tabs defaultValue="calendar" className="w-full">
      <TabsList className="grid w-full grid-cols-3 glass-card p-1.5">
        <TabsTrigger 
          value="calendar" 
          className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl transition-all duration-300"
        >
          <CalendarDays className="h-4 w-4" />
          <span className="hidden sm:inline">Consulta por</span> Data
        </TabsTrigger>
        <TabsTrigger 
          value="period" 
          className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl transition-all duration-300"
        >
          <Calendar className="h-4 w-4" />
          <span className="hidden sm:inline">Por</span> Período
        </TabsTrigger>
        <TabsTrigger 
          value="weekly" 
          className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl transition-all duration-300"
        >
          <BarChart3 className="h-4 w-4" />
          <span className="hidden sm:inline">Relatório</span> Semanal
        </TabsTrigger>
      </TabsList>

      <TabsContent value="calendar" className="mt-6">
        <DailyReportCalendar />
      </TabsContent>

      <TabsContent value="period" className="mt-6">
        <PeriodReport />
      </TabsContent>

      <TabsContent value="weekly" className="mt-6">
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-6">
              <BarChart3 className="h-5 w-5" />
              Relatório Semanal ({weekDates.start} - {weekDates.end})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-primary rounded-2xl p-5 text-primary-foreground">
                <div className="flex items-center gap-3">
                  <div className="bg-primary-foreground/20 rounded-xl p-3">
                    <Package className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm opacity-80">Total de Vendas</p>
                    <p className="text-2xl font-bold">{report.totalSales}</p>
                  </div>
                </div>
              </div>

              <div className="bg-secondary border border-border/50 rounded-2xl p-5">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 rounded-xl p-3">
                    <DollarSign className="h-6 w-6 text-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Valor Total</p>
                    <p className="text-2xl font-bold text-foreground">{formatCurrency(report.totalValue)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {report.sales.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-6">
                <TrendingUp className="h-5 w-5" />
                Vendas da Semana
              </h3>
              <div className="space-y-3">
                {report.sales.map((sale) => (
                  <div
                    key={sale.id}
                    className="flex justify-between items-center bg-secondary/50 border border-border/50 rounded-2xl p-4 transition-all duration-300 hover:bg-secondary/70"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{sale.nome_produto}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(sale.data_venda)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-foreground">
                        {formatCurrency(sale.valor)}
                      </div>
                      <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                        Qtd: {sale.quantidade}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {report.sales.length === 0 && (
            <div className="glass-card p-8">
              <div className="flex flex-col items-center justify-center">
                <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  Nenhuma venda registrada nesta semana.
                  <br />
                  Comece vendendo para ver seus resultados aqui!
                </p>
              </div>
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
};
