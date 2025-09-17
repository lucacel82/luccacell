import { useState } from 'react';
import { Calendar as CalendarIcon, Search, TrendingUp, Package, DollarSign, Printer, Sparkles, Calendar } from 'lucide-react';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GlassEffect } from '@/components/ui/glass-effect';
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
            body { font-family: 'Poppins', Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { color: #FFD700; font-size: 24px; font-weight: 600; }
            .period { color: #666; margin: 10px 0; }
            .summary { display: flex; justify-content: space-around; margin: 20px 0; }
            .summary-item { text-align: center; padding: 10px; }
            .summary-value { font-size: 18px; font-weight: bold; color: #FFD700; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f9f9f9; color: #FFD700; font-weight: 600; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .total-row { background-color: #FFD700; color: white; font-weight: bold; }
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
    <div className="space-y-8 animate-fade-in">
      {/* Search Section */}
      <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-card via-card/90 to-card/80 shadow-2xl hover:shadow-gold/20 transition-all duration-500 animate-scale-in">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/10 pointer-events-none" />
        <div className="absolute top-0 left-0 w-24 h-24 bg-accent/20 rounded-full -translate-y-12 -translate-x-12 blur-2xl" />
        
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary to-accent p-3 rounded-2xl shadow-gold animate-pulse-glow">
              <Search className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary font-poppins text-xl">Consultar Vendas por Período</span>
              <Sparkles className="h-4 w-4 text-accent animate-pulse" />
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="relative z-10 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 animate-slide-up">
              <label className="text-sm font-medium text-foreground mb-3 block flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Selecione o período:
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-transparent border-2 border-primary/30 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 group",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-primary group-hover:animate-bounce" />
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
            
            <Button
              onClick={handleFilter}
              disabled={!date?.from || !date?.to || loading}
              className="bg-gradient-gold text-primary-foreground hover:from-primary/90 hover:to-primary/70 border border-primary/50 shadow-gold animate-scale-in group hover:scale-105 transition-all duration-300"
              size="lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  Carregando...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2 group-hover:animate-pulse" />
                  Filtrar
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {hasSearched && (
        <>
          {/* Results Summary */}
          <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-card via-card/90 to-card/80 shadow-2xl animate-slide-up">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/10 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/10 rounded-full translate-y-16 translate-x-16 blur-3xl" />
            
            <CardContent className="relative z-10 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-primary/15 to-accent/10 rounded-2xl p-6 border border-primary/30 hover:border-primary/50 transition-all duration-300 group animate-scale-in">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/20 rounded-2xl p-4 group-hover:bg-primary/30 transition-colors">
                      <Package className="h-8 w-8 text-primary animate-float" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Total de Vendas</p>
                      <p className="text-3xl font-bold text-primary font-poppins group-hover:scale-105 transition-transform">
                        {periodReport.totalSales}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-gold rounded-2xl p-6 shadow-gold animate-pulse-glow group hover:scale-105 transition-transform duration-300">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary-foreground/20 rounded-2xl p-4">
                      <DollarSign className="h-8 w-8 text-primary-foreground animate-bounce" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary-foreground/80 mb-1">Valor Total</p>
                      <p className="text-3xl font-bold text-primary-foreground font-poppins">
                        {formatCurrency(periodReport.totalValue)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 animate-fade-in">
                <div className="bg-muted/20 rounded-2xl px-4 py-2 border border-muted-foreground/20">
                  <p className="text-sm text-muted-foreground font-poppins flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Período: {periodReport.startDate && format(periodReport.startDate, "dd/MM/yyyy", { locale: ptBR })} até{" "}
                    {periodReport.endDate && format(periodReport.endDate, "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
                <Button
                  onClick={handlePrint}
                  disabled={periodReport.sales.length === 0}
                  variant="outline"
                  className="border-primary/50 text-primary hover:bg-primary/10 group transition-all duration-300"
                >
                  <Printer className="h-4 w-4 mr-2 group-hover:animate-bounce" />
                  Imprimir Relatório
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sales List */}
          {periodReport.sales.length > 0 ? (
            <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-card via-card/90 to-card/80 shadow-2xl animate-fade-in">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 pointer-events-none" />
              
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-primary to-accent p-3 rounded-2xl shadow-gold">
                    <TrendingUp className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-primary font-poppins text-xl">Vendas do Período</span>
                    <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 animate-pulse">
                      {periodReport.sales.length} {periodReport.sales.length === 1 ? 'venda' : 'vendas'}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="relative z-10">
                <div className="space-y-3">
                  {periodReport.sales.map((sale, index) => (
                    <div
                      key={sale.id}
                      className="flex justify-between items-center bg-gradient-to-r from-secondary/20 to-secondary/10 border border-border/50 rounded-2xl p-4 transition-all duration-300 hover:bg-secondary/30 hover:border-primary/30 hover:scale-[1.02] group animate-slide-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground font-poppins group-hover:text-primary transition-colors">
                          {sale.nome_produto}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(sale.data_venda)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary font-poppins text-lg group-hover:scale-105 transition-transform">
                          {formatCurrency(sale.quantidade * sale.valor)}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="secondary" className="bg-secondary/50 text-secondary-foreground border border-border/30">
                            Qtd: {sale.quantidade}
                          </Badge>
                          <Badge variant="outline" className="border-primary/50 text-primary bg-primary/5">
                            Unit: {formatCurrency(sale.valor)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="relative overflow-hidden border-2 border-dashed border-muted-foreground/30 bg-gradient-to-br from-muted/10 to-muted/5 animate-fade-in">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="bg-muted/20 rounded-full p-6 mb-4 animate-pulse">
                  <TrendingUp className="h-16 w-16 text-muted-foreground" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-muted-foreground font-poppins font-medium">
                    📊 Nenhuma venda registrada nesse período
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Tente selecionar um intervalo diferente ou verifique se há vendas cadastradas.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};