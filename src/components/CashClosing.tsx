import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, Share } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Sale } from '@/types/sale';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

  const generatePDF = async () => {
    try {
      // Verificar se há dados antes de gerar o PDF
      console.log('Gerando PDF com dados:', { dailySales, dailyTotal });
      
      if (!dailySales) {
        throw new Error('Dados de vendas não estão disponíveis');
      }

      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('LUCCA CELL', 105, 20, { align: 'center' });
      
      doc.setFontSize(16);
      doc.text(`Fechamento de Caixa - ${getCurrentDate()}`, 105, 35, { align: 'center' });
      
      // Line separator
      doc.setDrawColor(0, 0, 0);
      doc.line(20, 45, 190, 45);
      
      if (dailySales.length === 0) {
        doc.setFontSize(12);
        doc.text('Nenhuma venda registrada hoje.', 20, 60);
        
        // Ainda mostrar o total (que será R$ 0,00)
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total do Dia: ${formatCurrency(dailyTotal)}`, 20, 80);
      } else {
        // Table data
        const tableData = dailySales.map(sale => [
          sale.nome_produto,
          sale.quantidade.toString(),
          formatCurrency(sale.valor)
        ]);

        // Add table using autoTable
        autoTable(doc, {
          head: [['Produto', 'Quantidade', 'Valor']],
          body: tableData,
          startY: 55,
          margin: { left: 20, right: 20 },
          styles: {
            fontSize: 10,
            cellPadding: 5,
          },
          headStyles: {
            fillColor: [45, 45, 45],
            textColor: [255, 215, 0],
            fontSize: 11,
            fontStyle: 'bold',
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245],
          },
        });

        // Total
        const finalY = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total do Dia: ${formatCurrency(dailyTotal)}`, 190, finalY, { align: 'right' });
      }

      // Footer
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Relatório gerado automaticamente pelo Sistema Lucca Cell', 105, pageHeight - 10, { align: 'center' });

      console.log('PDF gerado com sucesso');
      return doc;
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
        doc.save(fileName);
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

      // Convert PDF to blob
      const pdfBlob = doc.output('blob');
      const fileName = `fechamento-caixa-${getCurrentDate().replace(/\//g, '-')}.pdf`;
      const file = new File([pdfBlob], fileName, {
        type: 'application/pdf',
      });

      // Check if Web Share API is available
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Fechamento de Caixa - ${getCurrentDate()}`,
          text: `Relatório de vendas do dia ${getCurrentDate()}`,
          files: [file],
        });
        
        console.log('Compartilhamento realizado com sucesso');
        toast({
          title: "Sucesso",
          description: "PDF compartilhado com sucesso!",
        });
      } else {
        // Fallback: download the file
        console.log('Web Share API não disponível, fazendo download...');
        await downloadPDF();
        toast({
          title: "Compartilhamento não disponível",
          description: "PDF baixado para compartilhamento manual.",
        });
      }
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
        </div>
      </CardContent>
    </Card>
  );
};