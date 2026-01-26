import { useState } from 'react';
import { Calendar as CalendarIcon, Search, TrendingUp, Package, DollarSign, Printer, Calendar } from 'lucide-react';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { LiquidButton } from '@/components/ui/liquid-glass-button';
import { Button } from '@/components/ui/button';
import { usePeriodSales } from '@/hooks/usePeriodSales';

export const PeriodReport = () => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfWeek(new Date(), { weekStartsOn: 1 }),
    to: endOfWeek(new Date(), { weekStartsOn: 1 }),
  });

  const { periodReport, loading, loadPeriodSales } = usePeriodSales();

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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleFilter = () => {
    if (date?.from && date?.to) {
      loadPeriodSales(date.from, date.to);
    }
  };

  const handlePrint = () => {
    if (periodReport.sales.length === 0) return;

    const printContent = `
      <html>
        <head>
          <title>Relatório do Período - Lucca Cell</title>
          <style>
            body { font-family: 'Ubuntu', Arial, sans-serif; margin: 20px; background: #000; color: #fff; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { color: #fff; font-size: 24px; font-weight: 600; }
            .period { color: #888; margin: 10px 0; }
            .summary { display: flex; justify-content: space-around; margin: 20px 0; }
            .summary-item { text-align: center; padding: 10px; }
            .summary-value { font-size: 18px; font-weight: bold; color: #fff; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #333; }
            th { background-color: #1a1a1a; color: #fff; font-weight: 600; }
            tr:nth-child(even) { background-color: #111; }
            .total-row { background-color: #fff; color: #000; font-weight: bold; }
            .total-value { font-size: 18px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">LUCCA CELL</div>
            <div class="period">Relatório do Período: ${periodReport.startDate ? format(periodReport.startDate, "dd/MM/yyyy", { locale: ptBR }) : ''} até ${periodReport.endDate ? format(periodReport.endDate, "dd/MM/yyyy", { locale: ptBR }) : ''}</div>
          </div>
          
          <div class="summary">
            <div class="summary-item">
              <div>Total de Vendas</div>
              <div class="summary-value">${periodReport.totalSales}</div>
            </div>
            <div class="summary-item">
              <div>Valor Total</div>
              <div class="summary-value">${formatCurrency(periodReport.totalValue)}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Data</th>
                <th>Quantidade</th>
                <th>Valor Unitário</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${periodReport.sales.map(sale => `
                <tr>
                  <td>${sale.nome_produto}</td>
                  <td>${formatDate(sale.data_venda)}</td>
                  <td>${sale.quantidade}</td>
                  <td>${formatCurrency(sale.valor)}</td>
                  <td>${formatCurrency(sale.quantidade * sale.valor)}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="4"><strong>TOTAL GERAL</strong></td>
                <td class="total-value">${formatCurrency(periodReport.totalValue)}</td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const hasSearched = periodReport.startDate !== null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search Section */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-primary p-3 rounded-2xl shadow-lg">
            <Search className="h-6 w-6 text-primary-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground">Consultar Vendas por Período</h3>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium text-foreground mb-3 block flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Selecione o período:
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-input border-border hover:bg-secondary transition-all duration-300",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                        {format(date.to, "dd/MM/yyyy", { locale: ptBR })}
                      </>
                    ) : (
                      format(date.from, "dd/MM/yyyy", { locale: ptBR })
                    )
                  ) : (
                    <span>Escolha as datas</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <LiquidButton
            onClick={handleFilter}
            disabled={!date?.from || !date?.to || loading}
            variant="gold"
            size="lg"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                Carregando...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Filtrar
              </>
            )}
          </LiquidButton>
        </div>
      </div>

      {hasSearched && (
        <>
          {/* Results Summary */}
          <div className="glass-card p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-secondary/50 rounded-2xl p-5 border border-border/50">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 rounded-xl p-3">
                    <Package className="h-8 w-8 text-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Total de Vendas</p>
                    <p className="text-3xl font-bold text-foreground">
                      {periodReport.totalSales}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-primary rounded-2xl p-5 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="bg-primary-foreground/20 rounded-xl p-3">
                    <DollarSign className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary-foreground/80 mb-1">Valor Total</p>
                    <p className="text-3xl font-bold text-primary-foreground">
                      {formatCurrency(periodReport.totalValue)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="bg-secondary/30 rounded-xl px-4 py-2 border border-border/50">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Período: {periodReport.startDate && format(periodReport.startDate, "dd/MM/yyyy", { locale: ptBR })} até{" "}
                  {periodReport.endDate && format(periodReport.endDate, "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>
              <Button
                onClick={handlePrint}
                disabled={periodReport.sales.length === 0}
                variant="outline"
                className="border-border hover:bg-secondary"
              >
                <Printer className="h-4 w-4 mr-2" />
                Imprimir Relatório
              </Button>
            </div>
          </div>

          {/* Sales List */}
          {periodReport.sales.length > 0 ? (
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-primary p-3 rounded-2xl shadow-lg">
                  <TrendingUp className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold text-foreground">Vendas do Período</h3>
                  <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                    {periodReport.sales.length} {periodReport.sales.length === 1 ? 'venda' : 'vendas'}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-3">
                {periodReport.sales.map((sale) => (
                  <div
                    key={sale.id}
                    className="flex justify-between items-center bg-secondary/50 border border-border/50 rounded-2xl p-4 transition-all duration-300 hover:bg-secondary/70"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">
                        {sale.nome_produto}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(sale.data_venda)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-foreground text-lg">
                        {formatCurrency(sale.quantidade * sale.valor)}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                          Qtd: {sale.quantidade}
                        </Badge>
                        <Badge variant="outline" className="border-border text-muted-foreground">
                          Unit: {formatCurrency(sale.valor)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="glass-card p-8">
              <div className="flex flex-col items-center justify-center">
                <div className="bg-secondary/30 rounded-full p-6 mb-4">
                  <TrendingUp className="h-16 w-16 text-muted-foreground" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-muted-foreground font-medium">
                    📊 Nenhuma venda registrada nesse período
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Tente selecionar um intervalo diferente ou verifique se há vendas cadastradas.
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
