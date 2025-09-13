import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, DollarSign, Package, FileDown } from 'lucide-react';
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
                { text: formatCurrency(sale.valor), style: index % 2 === 0 ? 'tableRowEven' : 'tableRowOdd', alignment: 'right' },
                { text: formatCurrency(sale.quantidade ? sale.valor / sale.quantidade : sale.valor), style: index % 2 === 0 ? 'tableRowEven' : 'tableRowOdd', alignment: 'right' }
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
    <div className="space-y-6">
      {/* Calendar */}
      <Card className="bg-card border-border shadow-dark">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Consultar Vendas por Data
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && loadSalesByDate(date)}
            className="rounded-md border border-border"
          />
        </CardContent>
      </Card>

      {/* Selected Date Report */}
      <Card className="bg-card border-border shadow-dark">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <Package className="h-5 w-5" />
            Vendas do dia {formatDate(selectedDate)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Carregando vendas...</p>
            </div>
          ) : selectedDateSales.length > 0 ? (
            <div className="space-y-4">
              {/* Summary */}
              <div className="bg-gradient-gold rounded-lg p-4 text-primary-foreground">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary-foreground/20 rounded-full p-3">
                      <DollarSign className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm opacity-90">Total do Dia</p>
                      <p className="text-2xl font-bold">{formatCurrency(selectedDateReport.totalValue)}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">
                    {selectedDateSales.length} {selectedDateSales.length === 1 ? 'venda' : 'vendas'}
                  </Badge>
                </div>
              </div>

              {/* Sales List */}
              <div className="space-y-3">
                {selectedDateSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="flex justify-between items-center bg-secondary/30 border border-border rounded-lg p-3"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{sale.nome_produto}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(sale.data_venda)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">
                        {formatCurrency(sale.valor)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {sale.quantidade}x {formatCurrency(sale.quantidade ? sale.valor / sale.quantidade : sale.valor)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* PDF Button */}
              <div className="flex justify-center pt-4">
                <Button 
                  onClick={generatePDF}
                  className="bg-gradient-gold text-primary-foreground hover:opacity-90 flex items-center gap-2"
                >
                  <FileDown className="h-4 w-4" />
                  Fechar Caixa (PDF)
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nenhuma venda registrada nesse dia.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};