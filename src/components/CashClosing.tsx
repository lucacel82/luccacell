import { GlassButton } from '@/components/ui/glass-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, Share, TrendingUp, Calculator, Sparkles } from 'lucide-react';
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
    <div className="animate-fade-in space-y-6">
      {/* Summary Card */}
      <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-card via-card/90 to-card/80 shadow-2xl hover:shadow-gold/20 transition-all duration-500 animate-scale-in">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-16 translate-x-16 blur-2xl" />
        
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-gold p-3 rounded-2xl shadow-gold animate-pulse-glow">
                <Calculator className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-primary font-poppins text-xl">Fechamento de Caixa</span>
                  <Sparkles className="h-4 w-4 text-accent animate-pulse" />
                </div>
                <p className="text-sm text-muted-foreground font-poppins">
                  Relatório do dia {getCurrentDate()}
                </p>
              </div>
            </div>
            <TrendingUp className="h-6 w-6 text-primary animate-bounce" />
          </CardTitle>
        </CardHeader>
        
        <CardContent className="relative z-10 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up">
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-6 border border-primary/20 hover:border-primary/40 transition-all duration-300 group">
              <div className="flex items-center gap-4">
                <div className="bg-primary/20 p-3 rounded-full group-hover:bg-primary/30 transition-colors">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Vendas Realizadas</p>
                  <p className="text-2xl font-bold text-primary font-poppins group-hover:scale-105 transition-transform">
                    {dailySales.length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-gold rounded-2xl p-6 shadow-gold animate-pulse-glow group hover:scale-105 transition-transform duration-300">
              <div className="flex items-center gap-4">
                <div className="bg-primary-foreground/20 p-3 rounded-full">
                  <TrendingUp className="h-6 w-6 text-primary-foreground animate-float" />
                </div>
                <div>
                  <p className="text-sm font-medium text-primary-foreground/80">Total Arrecadado</p>
                  <p className="text-3xl font-bold text-primary-foreground font-poppins">
                    {formatCurrency(dailyTotal)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 animate-fade-in">
            <div className="flex gap-3">
              <GlassButton 
                onClick={downloadPDF}
                variant="glass"
                size="lg"
                className="flex-1 font-poppins group hover:scale-105 transition-all duration-300"
              >
                <Download className="h-4 w-4 mr-2 group-hover:animate-bounce" />
                Baixar PDF
              </GlassButton>
              
              <GlassButton 
                onClick={sharePDF}
                variant="gold"
                size="lg"
                className="flex-1 font-poppins group hover:scale-105 transition-all duration-300"
              >
                <Share className="h-4 w-4 mr-2 group-hover:animate-pulse" />
                Compartilhar
              </GlassButton>
            </div>
            
            {dailySales.length === 0 && (
              <div className="text-center p-6 bg-muted/20 rounded-2xl border-2 border-dashed border-muted-foreground/30 animate-pulse">
                <p className="text-muted-foreground font-poppins">
                  📊 Nenhuma venda registrada hoje
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Quando houver vendas, elas aparecerão aqui!
                </p>
              </div>
            )}
            
            {dailySales.length > 0 && (
              <div className="text-center p-4 bg-primary/5 rounded-2xl border border-primary/20 animate-fade-in">
                <p className="text-primary font-medium font-poppins flex items-center justify-center gap-2">
                  🎉 <span>Parabéns! {dailySales.length} vendas realizadas hoje</span>
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};