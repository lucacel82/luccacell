import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, List, Save, X } from 'lucide-react';
import { Sale } from '@/types/sale';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface SalesListProps {
  sales: Sale[];
  onUpdate: (id: string, sale: Omit<Sale, 'id' | 'data_venda'>) => void;
  onDelete: (id: string) => void;
}

export const SalesList = ({ sales, onUpdate, onDelete }: SalesListProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    productName: '',
    quantity: '',
    value: '',
  });
  const { toast } = useToast();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const startEdit = (sale: Sale) => {
    setEditingId(sale.id);
    setEditForm({
      productName: sale.nome_produto,
      quantity: sale.quantidade.toString(),
      value: sale.valor.toString(),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ productName: '', quantity: '', value: '' });
  };

  const saveEdit = (id: string) => {
    if (!editForm.productName.trim() || !editForm.quantity || !editForm.value) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive"
      });
      return;
    }

    const quantity = parseInt(editForm.quantity);
    const value = parseFloat(editForm.value);

    if (quantity <= 0 || value <= 0) {
      toast({
        title: "Erro",
        description: "Quantidade e valor devem ser maiores que zero",
        variant: "destructive"
      });
      return;
    }

    onUpdate(id, {
      nome_produto: editForm.productName.trim(),
      quantidade: quantity,
      valor: value,
    });

    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta venda?')) {
      onDelete(id);
    }
  };

  if (sales.length === 0) {
    return (
      <Card className="bg-card border-border shadow-dark">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <List className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            Nenhuma venda registrada ainda.
            <br />
            Registre sua primeira venda usando o formulário acima.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border shadow-dark">
      <CardHeader>
        <CardTitle className="text-primary flex items-center gap-2">
          <List className="h-5 w-5" />
          Vendas Registradas ({sales.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sales.map((sale) => (
            <div
              key={sale.id}
              className="bg-secondary/50 border border-border rounded-lg p-4 transition-colors"
            >
              {editingId === sale.id ? (
                <div className="space-y-3">
                  <Input
                    value={editForm.productName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, productName: e.target.value }))}
                    placeholder="Nome do produto"
                    className="bg-input border-border text-foreground"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      min="1"
                      value={editForm.quantity}
                      onChange={(e) => setEditForm(prev => ({ ...prev, quantity: e.target.value }))}
                      placeholder="Quantidade"
                      className="bg-input border-border text-foreground"
                    />
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={editForm.value}
                      onChange={(e) => setEditForm(prev => ({ ...prev, value: e.target.value }))}
                      placeholder="Valor"
                      className="bg-input border-border text-foreground"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => saveEdit(sale.id)}
                      className="bg-gradient-gold text-primary-foreground hover:opacity-90 flex-1"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Salvar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={cancelEdit}
                      className="border-border text-foreground hover:bg-muted flex-1"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">{sale.nome_produto}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(sale.data_venda)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-primary">
                        {formatCurrency(sale.valor)}
                      </div>
                      <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                        Qtd: {sale.quantidade}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEdit(sale)}
                      className="border-border text-foreground hover:bg-muted flex-1"
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(sale.id)}
                      className="flex-1"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};