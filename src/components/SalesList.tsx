import { useState } from 'react';
import { GlassButton } from '@/components/ui/glass-button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, List, Save, X } from 'lucide-react';
import { Sale } from '@/types/sale';
import { SaleInput } from '@/hooks/useSales';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface SalesListProps {
  sales: Sale[];
  onUpdate: (id: string, sale: SaleInput) => void;
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
      <div className="glass-card p-8">
        <div className="flex flex-col items-center justify-center">
          <List className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            Nenhuma venda registrada nos últimos 30 dias.
            <br />
            Registre sua primeira venda usando o formulário acima.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-6">
        <List className="h-5 w-5" />
        Vendas Recentes ({sales.length})
      </h3>
      <div className="space-y-4">
        {sales.map((sale) => (
          <div
            key={sale.id}
            className="bg-secondary/50 border border-border/50 rounded-2xl p-4 transition-all duration-300 hover:bg-secondary/70"
          >
            {editingId === sale.id ? (
              <div className="space-y-3">
                <Input
                  value={editForm.productName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, productName: e.target.value }))}
                  placeholder="Nome do produto"
                  className="bg-input border-border text-foreground rounded-xl"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    min="1"
                    value={editForm.quantity}
                    onChange={(e) => setEditForm(prev => ({ ...prev, quantity: e.target.value }))}
                    placeholder="Quantidade"
                    className="bg-input border-border text-foreground rounded-xl"
                  />
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={editForm.value}
                    onChange={(e) => setEditForm(prev => ({ ...prev, value: e.target.value }))}
                    placeholder="Valor"
                    className="bg-input border-border text-foreground rounded-xl"
                  />
                </div>
                <div className="flex gap-2">
                  <GlassButton
                    size="sm"
                    variant="default"
                    onClick={() => saveEdit(sale.id)}
                    className="flex-1"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </GlassButton>
                  <GlassButton
                    size="sm"
                    variant="outline"
                    onClick={cancelEdit}
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </GlassButton>
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
                    <div className="text-xl font-bold text-foreground">
                      {formatCurrency(sale.valor)}
                    </div>
                    <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                      Qtd: {sale.quantidade}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <GlassButton
                    size="sm"
                    variant="glass"
                    onClick={() => startEdit(sale)}
                    className="flex-1"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Editar
                  </GlassButton>
                  <GlassButton
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(sale.id)}
                    className="flex-1"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </GlassButton>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
