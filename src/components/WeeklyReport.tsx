import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, DollarSign, Package } from 'lucide-react';
import { WeeklyReport as WeeklyReportType } from '@/types/sale';

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
    <div className="space-y-6">
      <Card className="bg-card border-border shadow-dark">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Relatório Semanal ({weekDates.start} - {weekDates.end})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-gold rounded-lg p-4 text-primary-foreground">
              <div className="flex items-center gap-3">
                <div className="bg-primary-foreground/20 rounded-full p-3">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm opacity-90">Total de Vendas</p>
                  <p className="text-2xl font-bold">{report.totalSales}</p>
                </div>
              </div>
            </div>

            <div className="bg-secondary border border-border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 rounded-full p-3">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valor Total</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(report.totalValue)}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {report.sales.length > 0 && (
        <Card className="bg-card border-border shadow-dark">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Vendas da Semana
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {report.sales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex justify-between items-center bg-secondary/30 border border-border rounded-lg p-3 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{sale.nome_produto}</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(sale.data_venda)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary">
                      {formatCurrency(sale.valor)}
                    </div>
                    <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                      Qtd: {sale.quantidade}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {report.sales.length === 0 && (
        <Card className="bg-card border-border shadow-dark">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Nenhuma venda registrada nesta semana.
              <br />
              Comece vendendo para ver seus resultados aqui!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};