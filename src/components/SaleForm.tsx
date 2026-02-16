import { useState, useRef, useEffect } from 'react';
import { LiquidButton } from '@/components/ui/liquid-glass-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useProducts } from '@/hooks/useProducts';
import { usePrinterSettings } from '@/hooks/usePrinterSettings';
import { printProductLabel, LabelProduct, LabelSale } from '@/services/printService';
import { PrintLabelDialog } from '@/components/PrintLabelDialog';
import { SaleInput } from '@/hooks/useSales';

interface SaleFormProps {
  onSubmit: (sale: SaleInput) => void;
}

export const SaleForm = ({ onSubmit }: SaleFormProps) => {
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [value, setValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [printDialog, setPrintDialog] = useState<{ product: LabelProduct; sale: LabelSale } | null>(null);
  const { toast } = useToast();
  const { products } = useProducts();
  const { settings } = usePrinterSettings();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = productName.trim()
    ? products.filter(p => p.nome.toLowerCase().includes(productName.toLowerCase()))
    : products;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selectProduct = (nome: string, preco: number) => {
    setProductName(nome);
    setValue(String(preco));
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productName.trim() || !quantity || !value) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const quantityNum = parseInt(quantity);
    const valueNum = parseFloat(value);

    if (quantityNum <= 0 || valueNum <= 0) {
      toast({
        title: "Erro",
        description: "Quantidade e valor devem ser maiores que zero",
        variant: "destructive"
      });
      return;
    }

    // Find matching product for barcode info
    const matchedProduct = products.find(
      p => p.nome.toLowerCase() === productName.trim().toLowerCase()
    );

    onSubmit({
      nome_produto: productName.trim(),
      quantidade: quantityNum,
      valor: valueNum,
    });

    const labelProduct: LabelProduct = {
      nome: productName.trim(),
      preco: valueNum,
      codigo_barras: matchedProduct?.codigo_barras,
    };

    // Generate a temporary sale ID for the label
    const labelSale: LabelSale = {
      id: crypto.randomUUID(),
      data_venda: new Date().toISOString(),
    };

    setProductName('');
    setQuantity('1');
    setValue('');

    if (settings.autoPrint) {
      const success = await printProductLabel(labelProduct, labelSale, settings);
      if (success) {
        toast({ title: 'Sucesso!', description: 'Venda registrada e etiqueta impressa' });
      } else {
        toast({ title: 'Sucesso!', description: 'Venda registrada. Permita popups para imprimir.' });
      }
    } else {
      toast({ title: "Sucesso!", description: "Venda registrada com sucesso" });
      setPrintDialog({ product: labelProduct, sale: labelSale });
    }
  };

  return (
    <>
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-6">
          <Plus className="h-5 w-5" />
          Registrar Nova Venda
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2 relative" ref={wrapperRef}>
            <Label htmlFor="productName" className="text-foreground">
              Nome do Produto *
            </Label>
            <Input
              id="productName"
              type="text"
              value={productName}
              onChange={(e) => {
                setProductName(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Digite ou selecione um produto..."
              className="bg-input border-border text-foreground placeholder:text-muted-foreground rounded-xl"
              autoComplete="off"
            />
            {showSuggestions && filtered.length > 0 && (
              <div className="absolute z-[100] top-[calc(100%+4px)] left-0 right-0 bg-card border border-border rounded-xl max-h-48 overflow-y-auto shadow-lg">
                {filtered.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => selectProduct(p.nome, Number(p.preco))}
                    className="w-full text-left px-4 py-2.5 hover:bg-accent transition-colors flex justify-between items-center text-sm border-b border-border/50 last:border-0"
                  >
                    <span className="text-foreground font-medium truncate">{p.nome}</span>
                    <span className="text-muted-foreground shrink-0 ml-2">R$ {Number(p.preco).toFixed(2)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-foreground">
                Quantidade *
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="1"
                className="bg-input border-border text-foreground placeholder:text-muted-foreground rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="value" className="text-foreground">
                Valor da Venda (R$) *
              </Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                min="0.01"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="0,00"
                className="bg-input border-border text-foreground placeholder:text-muted-foreground rounded-xl"
              />
            </div>
          </div>

          <LiquidButton 
            type="submit" 
            variant="gold"
            size="lg"
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Registrar Venda
          </LiquidButton>
        </form>
      </div>

      {printDialog && (
        <PrintLabelDialog
          open={!!printDialog}
          onOpenChange={(open) => { if (!open) setPrintDialog(null); }}
          product={printDialog.product}
          sale={printDialog.sale}
        />
      )}
    </>
  );
};
