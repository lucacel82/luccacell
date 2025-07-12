import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SaleFormProps {
  onSubmit: (sale: {
    nome_produto: string;
    quantidade: number;
    valor: number;
  }) => void;
}

export const SaleForm = ({ onSubmit }: SaleFormProps) => {
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [value, setValue] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
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

    onSubmit({
      nome_produto: productName.trim(),
      quantidade: quantityNum,
      valor: valueNum,
    });

    // Reset form
    setProductName('');
    setQuantity('');
    setValue('');

    toast({
      title: "Sucesso!",
      description: "Venda registrada com sucesso",
    });
  };

  return (
    <Card className="bg-card border-border shadow-dark">
      <CardHeader>
        <CardTitle className="text-primary flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Registrar Nova Venda
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="productName" className="text-foreground">
              Nome do Produto *
            </Label>
            <Input
              id="productName"
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Ex: iPhone 15, Capinha Samsung..."
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
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
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
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
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-gold text-primary-foreground hover:opacity-90 transition-opacity font-medium"
          >
            <Plus className="h-4 w-4 mr-2" />
            Registrar Venda
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};