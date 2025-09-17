import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, DollarSign, Package, FileDown, Sparkles } from 'lucide-react';
import { useSalesByDate } from '@/hooks/useSalesByDate';
import pdfMake from 'pdfmake/build/pdfmake';
// @ts-ignore
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Configure pdfMake
// @ts-ignore
pdfMake.vfs = pdfFonts;

export const DailyReportCalendar = () => {
  const { selectedDate, selectedDateSales, loading, loadSalesByDate, getSelectedDateReport } = useSalesByDate();
  
  useEffect(() => {
    // Load today's sales on component mount
    loadSalesByDate(new Date());
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const generatePDF = async () => {
    if (selectedDateSales.length === 0) {
      return;
    }

    const report = getSelectedDateReport();
    
    // Convert logo to base64
    const logoBase64 = await fetch('/src/assets/logo.png')
      .then(res => res.blob())
      .then(blob => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      })
      .catch(() => ''); // Fallback if logo not found

    const docDefinition = {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      content: [
        // Header with logo and title
        {
          columns: [
            logoBase64 ? {
              image: logoBase64,
              width: 80,
              height: 80,
              alignment: 'left'
            } : {},
            {
              text: [
                { text: 'Lucca Cell\n', fontSize: 20, bold: true, color: '#FFD700' },
                { text: 'Fechamento de Caixa\n', fontSize: 16, bold: true },
                { text: formatDate(selectedDate), fontSize: 14, color: '#666' }
              ],
              alignment: 'center',
              margin: [0, 10, 0, 0]
            },
            { text: '', width: 80 } // Spacer for alignment
          ],
          margin: [0, 0, 0, 30]
        },
        
        // Sales table
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto'],
            body: [
              // Header
              [
                { text: 'Produto', style: 'tableHeader' },
                { text: 'Quantidade', style: 'tableHeader', alignment: 'center' },
                { text: 'Valor Total', style: 'tableHeader', alignment: 'right' },
                { text: 'Valor Unitário', style: 'tableHeader', alignment: 'right' }
              ],
              // Data rows
              ...selectedDateSales.map((sale, index) => [
                { text: sale.nome_produto, style: index % 2 === 0 ? 'tableRowEven' : 'tableRowOdd' },
                { text: sale.quantidade.toString(), style: index % 2 === 0 ? 'tableRowEven' : 'tableRowOdd', alignment: 'center' },
                { text: formatCurrency(sale.valor * sale.quantidade), style: index % 2 === 0 ? 'tableRowEven' : 'tableRowOdd', alignment: 'right' },
                { text: formatCurrency(sale.valor), style: index % 2 === 0 ? 'tableRowEven' : 'tableRowOdd', alignment: 'right' }
              ])
            ]
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#ddd',
            vLineColor: () => '#ddd'
          }
        },
        
        // Total
        {
          table: {
            widths: ['*', 'auto'],
            body: [
              [
                { text: 'TOTAL GERAL:', style: 'totalLabel', alignment: 'right', border: [false, true, false, false] },
                { text: formatCurrency(report.totalValue), style: 'totalValue', alignment: 'right', border: [false, true, false, false] }
              ]
            ]
          },
          margin: [0, 20, 0, 0]
        },
        
        // Footer
        {
          text: `Relatório gerado em ${new Date().toLocaleString('pt-BR')}`,
          style: 'footer',
          alignment: 'center',
          margin: [0, 40, 0, 0]
        }
      ],
      
      styles: {
        tableHeader: {
          bold: true,
          fontSize: 12,
          color: '#FFD700',
          fillColor: '#000',
          margin: [8, 8, 8, 8]
        },
        tableRowEven: {
          fontSize: 10,
          margin: [8, 6, 8, 6]
        },
        tableRowOdd: {
          fontSize: 10,
          fillColor: '#f9f9f9',
          margin: [8, 6, 8, 6]
        },
        totalLabel: {
          bold: true,
          fontSize: 14,
          margin: [8, 10, 8, 10]
        },
        totalValue: {
          bold: true,
          fontSize: 16,
          color: '#FFD700',
          fillColor: '#000',
          margin: [8, 10, 8, 10]
        },
        footer: {
          fontSize: 8,
          color: '#666',
          italics: true
        }
      }
    };

    pdfMake.createPdf(docDefinition as any).download(`Fechamento_${formatDate(selectedDate).replace(/\//g, '-')}.pdf`);
  };

  const selectedDateReport = getSelectedDateReport();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Calendar Card */}
      <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-card via-card/90 to-card/80 shadow-2xl hover:shadow-gold/20 transition-all duration-500 animate-scale-in">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-16 translate-x-16 blur-2xl" />
        
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-3">
            <div className="bg-gradient-gold p-3 rounded-2xl shadow-gold animate-pulse-glow">
              <CalendarDays className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary font-poppins text-xl">Consultar Vendas por Data</span>
              <Sparkles className="h-4 w-4 text-accent animate-pulse" />
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="relative z-10 flex justify-center pb-8">
          <div className="bg-gradient-to-br from-background/80 to-background/60 rounded-3xl p-6 border-2 border-primary/20 shadow-inner">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && loadSalesByDate(date)}
              className="rounded-2xl border border-border/50 p-4 pointer-events-auto hover:border-primary/30 transition-all duration-300"
            />
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Report */}
      <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-card via-card/90 to-card/80 shadow-2xl animate-slide-up">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/20 rounded-full translate-y-12 -translate-x-12 blur-2xl" />
        
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary to-accent p-3 rounded-2xl shadow-gold">
              <Package className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-primary font-poppins text-xl">
              Vendas do dia {formatDate(selectedDate)}
            </span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="relative z-10">
          {loading ? (
            <div className="text-center py-12 animate-pulse">
              <div className="bg-primary/20 rounded-full p-6 w-fit mx-auto mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
              <p className="text-muted-foreground font-poppins">Carregando vendas...</p>
            </div>
          ) : selectedDateSales.length > 0 ? (
            <div className="space-y-6 animate-fade-in">
              {/* Summary */}
              <div className="bg-gradient-gold rounded-2xl p-6 shadow-gold animate-pulse-glow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary-foreground/20 rounded-2xl p-4">
                      <DollarSign className="h-8 w-8 text-primary-foreground animate-bounce" />
                    </div>
                    <div>
                      <p className="text-sm text-primary-foreground/80 font-medium mb-1">Total do Dia</p>
                      <p className="text-3xl font-bold text-primary-foreground font-poppins">
                        {formatCurrency(selectedDateReport.totalValue)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 animate-pulse">
                      {selectedDateSales.length} {selectedDateSales.length === 1 ? 'venda' : 'vendas'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Sales List */}
              <div className="space-y-3">
                {selectedDateSales.map((sale, index) => (
                  <div
                    key={sale.id}
                    className="flex justify-between items-center bg-gradient-to-r from-secondary/20 to-secondary/10 border border-border/50 rounded-2xl p-4 transition-all duration-300 hover:bg-secondary/30 hover:border-primary/30 hover:scale-[1.02] group animate-slide-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground font-poppins group-hover:text-primary transition-colors">
                        {sale.nome_produto}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(sale.data_venda)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary text-lg font-poppins group-hover:scale-105 transition-transform">
                        {formatCurrency(sale.valor * sale.quantidade)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {sale.quantidade}x {formatCurrency(sale.valor)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* PDF Button */}
              <div className="flex justify-center pt-6 animate-fade-in">
                <Button 
                  onClick={generatePDF}
                  className="bg-gradient-gold text-primary-foreground hover:opacity-90 flex items-center gap-2 shadow-gold group hover:scale-105 transition-all duration-300 px-8 py-3"
                  size="lg"
                >
                  <FileDown className="h-5 w-5 group-hover:animate-bounce" />
                  <span className="font-poppins font-medium">Fechar Caixa (PDF)</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 animate-fade-in">
              <div className="bg-muted/20 rounded-full p-6 w-fit mx-auto mb-6 animate-pulse">
                <Package className="h-16 w-16 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground font-poppins font-medium">
                  📅 Nenhuma venda registrada nesse dia
                </p>
                <p className="text-sm text-muted-foreground">
                  Quando houver vendas nesta data, elas aparecerão aqui!
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};