import { useState, useEffect } from 'react';
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
    
    const logoBase64 = await fetch('/src/assets/logo.png')
      .then(res => res.blob())
      .then(blob => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      })
      .catch(() => '');

    const docDefinition = {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      content: [
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
                { text: 'Lucca Cell\n', fontSize: 20, bold: true, color: '#000' },
                { text: 'Fechamento de Caixa\n', fontSize: 16, bold: true },
                { text: formatDate(selectedDate), fontSize: 14, color: '#666' }
              ],
              alignment: 'center',
              margin: [0, 10, 0, 0]
            },
            { text: '', width: 80 }
          ],
          margin: [0, 0, 0, 30]
        },
        
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Produto', style: 'tableHeader' },
                { text: 'Quantidade', style: 'tableHeader', alignment: 'center' },
                { text: 'Valor Total', style: 'tableHeader', alignment: 'right' },
                { text: 'Valor Unitário', style: 'tableHeader', alignment: 'right' }
              ],
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
          color: '#fff',
          fillColor: '#1a1a1a',
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
          color: '#000',
          fillColor: '#f0f0f0',
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
    <div className="space-y-6 animate-fade-in">
      {/* Calendar Card */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-primary p-3 rounded-2xl shadow-lg">
            <CalendarDays className="h-6 w-6 text-primary-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground">Consultar Vendas por Data</h3>
        </div>
        
        <div className="flex justify-center">
          <div className="bg-secondary/30 rounded-2xl p-4 border border-border/50">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && loadSalesByDate(date)}
              className="rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Selected Date Report */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-primary p-3 rounded-2xl shadow-lg">
            <Package className="h-6 w-6 text-primary-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground">
            Vendas do dia {formatDate(selectedDate)}
          </h3>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="bg-secondary/30 rounded-full p-6 w-fit mx-auto mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
            </div>
            <p className="text-muted-foreground">Carregando vendas...</p>
          </div>
        ) : selectedDateSales.length > 0 ? (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-primary rounded-2xl p-5 text-primary-foreground shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-primary-foreground/20 rounded-xl p-3">
                    <DollarSign className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-primary-foreground/80 font-medium mb-1">Total do Dia</p>
                    <p className="text-3xl font-bold text-primary-foreground">
                      {formatCurrency(selectedDateReport.totalValue)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground">
                    {selectedDateSales.length} {selectedDateSales.length === 1 ? 'venda' : 'vendas'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Sales List */}
            <div className="space-y-3">
              {selectedDateSales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex justify-between items-center bg-secondary/50 border border-border/50 rounded-2xl p-4 hover:bg-secondary/70 transition-colors duration-200"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">
                      {sale.nome_produto}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(sale.data_venda)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-foreground text-lg">
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
            <div className="flex justify-center pt-4">
              <Button 
                onClick={generatePDF}
                className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 px-8 py-3 rounded-xl"
                size="lg"
              >
                <FileDown className="h-5 w-5" />
                <span className="font-medium">Fechar Caixa (PDF)</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-secondary/30 rounded-full p-6 w-fit mx-auto mb-6">
              <Package className="h-16 w-16 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <p className="text-muted-foreground font-medium">
                📅 Nenhuma venda registrada nesse dia
              </p>
              <p className="text-sm text-muted-foreground">
                Quando houver vendas nesta data, elas aparecerão aqui!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
