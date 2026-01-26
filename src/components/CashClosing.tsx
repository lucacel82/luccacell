import { GlassButton } from '@/components/ui/glass-button';
import { FileText, Download, Share, TrendingUp, Calculator } from 'lucide-react';
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
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total do Dia: ${formatCurrency(dailyTotal)}`, 20, 80);
      } else {
        const tableData = dailySales.map(sale => [
          sale.nome_produto,
          sale.quantidade.toString(),
          formatCurrency(sale.valor)
        ]);

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
            fillColor: [30, 30, 30],
            textColor: [255, 255, 255],
            fontSize: 11,
            fontStyle: 'bold',
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245],
          },
        });

        const finalY = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total do Dia: ${formatCurrency(dailyTotal)}`, 190, finalY, { align: 'right' });
      }

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

      const pdfBlob = doc.output('blob');
      const fileName = `fechamento-caixa-${getCurrentDate().replace(/\//g, '-')}.pdf`;
      const file = new File([pdfBlob], fileName, {
        type: 'application/pdf',
      });

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
    <div className="animate-fade-in space-y-6">
      {/* Summary Card */}
      <div className="glass-card-interactive p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-3 rounded-2xl shadow-lg">
              <Calculator className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground">Fechamento de Caixa</h3>
              <p className="text-sm text-muted-foreground">
                Relatório do dia {getCurrentDate()}
              </p>
            </div>
          </div>
          <TrendingUp className="h-6 w-6 text-muted-foreground" />
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-secondary/50 rounded-2xl p-5 border border-border/50">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-xl">
                <FileText className="h-6 w-6 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vendas Realizadas</p>
                <p className="text-2xl font-bold text-foreground">
                  {dailySales.length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-primary rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="bg-primary-foreground/20 p-3 rounded-xl">
                <TrendingUp className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary-foreground/80">Total Arrecadado</p>
                <p className="text-2xl font-bold text-primary-foreground">
                  {formatCurrency(dailyTotal)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <div className="flex gap-3">
            <GlassButton 
              onClick={downloadPDF}
              variant="glass"
              size="lg"
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar PDF
            </GlassButton>
            
            <GlassButton 
              onClick={sharePDF}
              variant="default"
              size="lg"
              className="flex-1"
            >
              <Share className="h-4 w-4 mr-2" />
              Compartilhar
            </GlassButton>
          </div>
          
          {dailySales.length === 0 && (
            <div className="text-center p-6 bg-secondary/30 rounded-2xl border border-border/50">
              <p className="text-muted-foreground">
                📊 Nenhuma venda registrada hoje
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Quando houver vendas, elas aparecerão aqui!
              </p>
            </div>
          )}
          
          {dailySales.length > 0 && (
            <div className="text-center p-4 bg-primary/5 rounded-2xl border border-border/50">
              <p className="text-foreground font-medium flex items-center justify-center gap-2">
                🎉 <span>Parabéns! {dailySales.length} vendas realizadas hoje</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
