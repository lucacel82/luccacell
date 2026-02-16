import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { LiquidButton } from '@/components/ui/liquid-glass-button';
import { Printer, X } from 'lucide-react';
import { useState } from 'react';
import { printProductLabel, LabelProduct, LabelSale } from '@/services/printService';
import { usePrinterSettings } from '@/hooks/usePrinterSettings';
import { useToast } from '@/hooks/use-toast';

interface PrintLabelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: LabelProduct;
  sale: LabelSale;
}

export const PrintLabelDialog = ({ open, onOpenChange, product, sale }: PrintLabelDialogProps) => {
  const [printing, setPrinting] = useState(false);
  const { settings } = usePrinterSettings();
  const { toast } = useToast();

  const handlePrint = async () => {
    setPrinting(true);
    const success = await printProductLabel(product, sale, settings);
    setPrinting(false);

    if (success) {
      toast({ title: 'Sucesso', description: 'Etiqueta enviada para impressão' });
      onOpenChange(false);
    } else {
      toast({
        title: 'Erro',
        description: 'Não foi possível imprimir. Permita popups no navegador.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Imprimir Etiqueta</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Venda registrada com sucesso! Deseja imprimir a etiqueta?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="glass-card p-4 text-sm space-y-1">
            <p className="font-semibold text-foreground">{product.nome}</p>
            <p className="text-primary text-lg font-bold">
              {product.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
            {product.codigo_barras && (
              <p className="text-muted-foreground text-xs">Cód: {product.codigo_barras}</p>
            )}
          </div>
          <div className="flex gap-2">
            <LiquidButton
              variant="gold"
              className="flex-1"
              onClick={handlePrint}
              disabled={printing}
            >
              <Printer className="h-4 w-4 mr-2" />
              {printing ? 'Imprimindo...' : 'Imprimir Etiqueta'}
            </LiquidButton>
            <LiquidButton
              variant="default"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </LiquidButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
