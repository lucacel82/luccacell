import { useState } from 'react';
import { Calendar as CalendarIcon, Search, TrendingUp, Package, DollarSign } from 'lucide-react';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GlassEffect } from '@/components/ui/glass-effect';
import { LiquidButton } from '@/components/ui/liquid-glass-button';
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

  const hasSearched = periodReport.startDate !== null;

  return (
    <div className="space-y-6">
      <GlassEffect>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary font-poppins flex items-center gap-2">
            <Search className="h-5 w-5" />
            Consultar Vendas por Período
          </h3>
          
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Selecione o período:
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <LiquidButton
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-transparent border border-primary/30 hover:border-primary/50",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
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
                  </LiquidButton>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
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
      </GlassEffect>

      {hasSearched && (
        <>
          <GlassEffect>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/20 rounded-full p-3">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Vendas</p>
                    <p className="text-2xl font-bold text-primary font-poppins">{periodReport.totalSales}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/20 rounded-full p-3">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Valor Total</p>
                    <p className="text-2xl font-bold text-primary font-poppins">{formatCurrency(periodReport.totalValue)}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Período: {periodReport.startDate && format(periodReport.startDate, "dd/MM/yyyy", { locale: ptBR })} até{" "}
                {periodReport.endDate && format(periodReport.endDate, "dd/MM/yyyy", { locale: ptBR })}
              </p>
            </div>
          </GlassEffect>

          {periodReport.sales.length > 0 ? (
            <Card className="bg-card border-primary/30 shadow-[0_8px_32px_0_rgba(255,215,0,0.37)]">
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2 font-poppins">
                  <TrendingUp className="h-5 w-5" />
                  Vendas do Período
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {periodReport.sales.map((sale) => (
                    <div
                      key={sale.id}
                      className="flex justify-between items-center bg-secondary/30 border border-border rounded-xl p-4 transition-colors hover:bg-secondary/50"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground font-poppins">{sale.nome_produto}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(sale.data_venda)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary font-poppins">
                          {formatCurrency(sale.quantidade * sale.valor)}
                        </div>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                            Qtd: {sale.quantidade}
                          </Badge>
                          <Badge variant="outline" className="border-primary/50 text-primary">
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
            <GlassEffect>
              <div className="flex flex-col items-center justify-center py-8">
                <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center font-poppins">
                  Nenhuma venda registrada nesse período.
                  <br />
                  Tente selecionar um intervalo diferente.
                </p>
              </div>
            </GlassEffect>
          )}
        </>
      )}
    </div>
  );
};