import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, Share } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Sale } from '@/types/sale';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import logoSrc from '@/assets/logo.png';

// Configure pdfMake fonts
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

interface CashClosingProps {
  dailySales: Sale[];
  dailyTotal: number;
}

export const CashClosing = ({ dailySales, dailyTotal }: CashClosingProps) => {
  const { toast } = useToast();

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

  const getCurrentDateTime = () => {
    return new Date().toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Convert image to base64
  const getBase64Image = (imgSrc: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      };
      img.onerror = reject;
      img.src = imgSrc;
    });
  };

  const generatePDF = async () => {
    try {
      console.log('Gerando PDF com dados:', { dailySales, dailyTotal });
      
      if (!dailySales) {
        throw new Error('Dados de vendas não estão disponíveis');
      }

      // Check if there are no sales for the day
      if (dailySales.length === 0) {
        toast({
          title: "Nenhuma venda registrada",
          description: "Não é possível gerar PDF sem vendas do dia.",
          variant: "destructive",
        });
        return null;
      }

      let logoBase64 = '';
      try {
        logoBase64 = await getBase64Image(logoSrc);
      } catch (error) {
        console.warn('Não foi possível carregar a logo:', error);
      }

      // Prepare table data with calculated totals
      const tableBody = dailySales.map(sale => {
        const unitPrice = sale.valor;
        const quantity = sale.quantidade;
        const total = unitPrice * quantity;
        
        return [
          { text: sale.nome_produto, style: 'tableCell' },
          { text: quantity.toString(), style: 'tableCellCenter' },
          { text: formatCurrency(unitPrice), style: 'tableCellRight' },
          { text: formatCurrency(total), style: 'tableCellRight', bold: true }
        ];
      });

      const docDefinition = {
        pageSize: 'A4',
        pageMargins: [40, 60, 40, 60],
        header: {
          margin: [40, 20, 40, 0],
          table: {
            widths: ['*'],
            body: [
              [{ 
                text: '',
                border: [false, false, false, true],
                borderColor: '#FFD700',
                borderWidth: 2
              }]
            ]
          }
        },
        content: [
          // Logo and Title Section
          {
            columns: [
              logoBase64 ? {
                image: logoBase64,
                width: 60,
                height: 60,
                alignment: 'left'
              } : {},
              {
                stack: [
                  {
                    text: 'LUCCA CELL',
                    style: 'companyName',
                    alignment: 'center'
                  },
                  {
                    text: 'Sistema de Gestão de Vendas',
                    style: 'subtitle',
                    alignment: 'center'
                  }
                ],
                width: '*'
              },
              { text: '', width: 60 } // Spacer for alignment
            ],
            columnGap: 20,
            margin: [0, 0, 0, 30]
          },
          
          // Report Title
          {
            text: `FECHAMENTO DE CAIXA`,
            style: 'reportTitle',
            alignment: 'center',
            margin: [0, 0, 0, 10]
          },
          {
            text: `${getCurrentDate()}`,
            style: 'dateTitle',
            alignment: 'center',
            margin: [0, 0, 0, 30]
          },

          // Sales Summary
          {
            table: {
              widths: ['*', 'auto'],
              body: [
                [
                  { text: 'Total de Vendas:', style: 'summaryLabel' },
                  { text: `${dailySales.length} itens`, style: 'summaryValue' }
                ],
                [
                  { text: 'Gerado em:', style: 'summaryLabel' },
                  { text: getCurrentDateTime(), style: 'summaryValue' }
                ]
              ]
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 20]
          },

          // Sales Table
          {
            table: {
              headerRows: 1,
              widths: ['*', 'auto', 'auto', 'auto'],
              body: [
                [
                  { text: 'PRODUTO', style: 'tableHeader' },
                  { text: 'QTD', style: 'tableHeader' },
                  { text: 'VALOR UNIT.', style: 'tableHeader' },
                  { text: 'TOTAL', style: 'tableHeader' }
                ],
                ...tableBody
              ]
            },
            layout: {
              fillColor: function (rowIndex: number) {
                return (rowIndex === 0) ? '#2D2D2D' : (rowIndex % 2 === 0) ? '#F9F9F9' : null;
              },
              hLineWidth: function (i: number, node: any) {
                return (i === 0 || i === 1 || i === node.table.body.length) ? 1 : 0.5;
              },
              vLineWidth: function () {
                return 0.5;
              },
              hLineColor: function () {
                return '#DDDDDD';
              },
              vLineColor: function () {
                return '#DDDDDD';
              }
            },
            margin: [0, 0, 0, 30]
          },

          // Total Section
          {
            table: {
              widths: ['*', 'auto'],
              body: [
                [
                  { text: '', border: [false, false, false, false] },
                  {
                    table: {
                      widths: ['auto', 'auto'],
                      body: [
                        [
                          { text: 'TOTAL GERAL:', style: 'totalLabel' },
                          { text: formatCurrency(dailyTotal), style: 'totalValue' }
                        ]
                      ]
                    },
                    layout: 'noBorders'
                  }
                ]
              ]
            },
            layout: 'noBorders'
          }
        ],
        footer: function(currentPage: number, pageCount: number) {
          return {
            margin: [40, 0, 40, 0],
            table: {
              widths: ['*'],
              body: [
                [{ 
                  text: '',
                  border: [false, true, false, false],
                  borderColor: '#FFD700',
                  borderWidth: 1
                }],
                [{
                  stack: [
                    {
                      text: 'Relatório gerado automaticamente pelo Sistema Lucca Cell',
                      style: 'footer',
                      alignment: 'center',
                      margin: [0, 10, 0, 5]
                    },
                    {
                      text: `Página ${currentPage} de ${pageCount}`,
                      style: 'pageNumber',
                      alignment: 'center'
                    }
                  ],
                  border: [false, false, false, false]
                }]
              ]
            }
          };
        },
        styles: {
          companyName: {
            fontSize: 22,
            bold: true,
            color: '#FFD700',
            font: 'Helvetica'
          },
          subtitle: {
            fontSize: 12,
            color: '#666666',
            font: 'Helvetica',
            margin: [0, 5, 0, 0]
          },
          reportTitle: {
            fontSize: 18,
            bold: true,
            color: '#2D2D2D',
            font: 'Helvetica'
          },
          dateTitle: {
            fontSize: 14,
            bold: true,
            color: '#FFD700',
            font: 'Helvetica'
          },
          summaryLabel: {
            fontSize: 11,
            color: '#666666',
            font: 'Helvetica',
            margin: [0, 3, 0, 3]
          },
          summaryValue: {
            fontSize: 11,
            bold: true,
            color: '#2D2D2D',
            font: 'Helvetica',
            alignment: 'right',
            margin: [0, 3, 0, 3]
          },
          tableHeader: {
            fontSize: 11,
            bold: true,
            color: '#FFD700',
            alignment: 'center',
            margin: [5, 8, 5, 8],
            font: 'Helvetica'
          },
          tableCell: {
            fontSize: 10,
            color: '#2D2D2D',
            margin: [5, 6, 5, 6],
            font: 'Helvetica'
          },
          tableCellCenter: {
            fontSize: 10,
            color: '#2D2D2D',
            alignment: 'center',
            margin: [5, 6, 5, 6],
            font: 'Helvetica'
          },
          tableCellRight: {
            fontSize: 10,
            color: '#2D2D2D',
            alignment: 'right',
            margin: [5, 6, 5, 6],
            font: 'Helvetica'
          },
          totalLabel: {
            fontSize: 14,
            bold: true,
            color: '#2D2D2D',
            font: 'Helvetica',
            margin: [10, 10, 5, 10]
          },
          totalValue: {
            fontSize: 16,
            bold: true,
            color: '#FFD700',
            font: 'Helvetica',
            margin: [5, 10, 10, 10]
          },
          footer: {
            fontSize: 9,
            color: '#888888',
            font: 'Helvetica'
          },
          pageNumber: {
            fontSize: 8,
            color: '#AAAAAA',
            font: 'Helvetica'
          }
        },
        defaultStyle: {
          font: 'Helvetica'
        }
      };

      console.log('PDF gerado com sucesso');
      return pdfMake.createPdf(docDefinition);
    } catch (error) {
      console.error('Erro detalhado ao gerar PDF:', error);
      toast({
        title: "Erro",
        description: `Erro ao gerar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive",
      });
      return null;
    }
  };

  const downloadPDF = async () => {
    try {
      console.log('Iniciando download do PDF...');
      const doc = await generatePDF();
      if (doc) {
        const fileName = `fechamento-caixa-${getCurrentDate().replace(/\//g, '-')}.pdf`;
        doc.download(fileName);
        console.log('Download realizado:', fileName);
        toast({
          title: "Sucesso",
          description: "PDF baixado com sucesso!",
        });
      }
    } catch (error) {
      console.error('Erro no download:', error);
      toast({
        title: "Erro",
        description: "Erro ao baixar o PDF.",
        variant: "destructive",
      });
    }
  };

  const sharePDF = async () => {
    try {
      console.log('Iniciando compartilhamento do PDF...');
      const doc = await generatePDF();
      if (!doc) return;

      // Generate PDF blob
      doc.getBlob((blob: Blob) => {
        const fileName = `fechamento-caixa-${getCurrentDate().replace(/\//g, '-')}.pdf`;
        const file = new File([blob], fileName, {
          type: 'application/pdf',
        });

        // Check if Web Share API is available
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          navigator.share({
            title: `Fechamento de Caixa - ${getCurrentDate()}`,
            text: `Relatório de vendas do dia ${getCurrentDate()}`,
            files: [file],
          }).then(() => {
            console.log('Compartilhamento realizado com sucesso');
            toast({
              title: "Sucesso",
              description: "PDF compartilhado com sucesso!",
            });
          }).catch((error) => {
            console.error('Erro ao compartilhar:', error);
            downloadPDF(); // Fallback to download
          });
        } else {
          // Fallback: download the file
          console.log('Web Share API não disponível, fazendo download...');
          downloadPDF();
          toast({
            title: "Compartilhamento não disponível",
            description: "PDF baixado para compartilhamento manual.",
          });
        }
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      toast({
        title: "Erro",
        description: "Não foi possível compartilhar o PDF.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-card border-border shadow-dark">
      <CardHeader>
        <CardTitle className="text-primary flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Fechamento de Caixa
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center p-4 bg-gradient-gold rounded-lg">
            <p className="text-primary-foreground font-medium">
              {dailySales.length} vendas registradas hoje
            </p>
            <p className="text-primary-foreground text-2xl font-bold">
              {formatCurrency(dailyTotal)}
            </p>
          </div>
          
          {dailySales.length === 0 ? (
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-muted-foreground">
                Nenhuma venda registrada hoje.
                <br />
                O PDF só pode ser gerado com vendas registradas.
              </p>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button 
                onClick={downloadPDF}
                className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/80"
              >
                <Download className="h-4 w-4 mr-2" />
                Baixar PDF
              </Button>
              
              <Button 
                onClick={sharePDF}
                className="flex-1 bg-gradient-gold text-primary-foreground hover:opacity-90"
              >
                <Share className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};