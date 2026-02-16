import { useState } from 'react';
import { useProducts, ProductInput } from '@/hooks/useProducts';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LiquidButton } from '@/components/ui/liquid-glass-button';
import { GlassButton } from '@/components/ui/glass-button';
import { useToast } from '@/hooks/use-toast';
import { Plus, Package, Pencil, Trash2, X, Check, Search } from 'lucide-react';

export const Products = () => {
  const { products, loading, addProduct, updateProduct, deleteProduct } = useProducts();
  const { toast } = useToast();
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [estoque, setEstoque] = useState('');
  const [codigoBarras, setCodigoBarras] = useState('');
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editPreco, setEditPreco] = useState('');
  const [editEstoque, setEditEstoque] = useState('');
  const [editCodigoBarras, setEditCodigoBarras] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !preco) {
      toast({ title: 'Erro', description: 'Preencha nome e preço', variant: 'destructive' });
      return;
    }
    const success = await addProduct({
      nome: nome.trim(),
      preco: parseFloat(preco),
      estoque: estoque ? parseInt(estoque) : 0,
      codigo_barras: codigoBarras.trim() || null,
    });
    if (success) {
      setNome('');
      setPreco('');
      setEstoque('');
      setCodigoBarras('');
      toast({ title: 'Sucesso!', description: 'Produto cadastrado' });
    }
  };

  const startEdit = (p: { id: string; nome: string; preco: number; estoque: number; codigo_barras?: string | null }) => {
    setEditingId(p.id);
    setEditNome(p.nome);
    setEditPreco(String(p.preco));
    setEditEstoque(String(p.estoque));
    setEditCodigoBarras(p.codigo_barras || '');
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const success = await updateProduct(editingId, {
      nome: editNome.trim(),
      preco: parseFloat(editPreco),
      estoque: parseInt(editEstoque),
      codigo_barras: editCodigoBarras.trim() || null,
    });
    if (success) {
      setEditingId(null);
      toast({ title: 'Atualizado!', description: 'Produto atualizado' });
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteProduct(id);
    if (success) toast({ title: 'Removido', description: 'Produto removido' });
  };

  const filtered = products.filter(p =>
    p.nome.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-6">
          <Plus className="h-5 w-5" />
          Cadastrar Produto
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-foreground">Nome do Produto *</Label>
            <Input
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Ex: Capinha iPhone 15..."
              className="bg-input border-border text-foreground placeholder:text-muted-foreground rounded-xl"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Preço (R$) *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={preco}
                onChange={e => setPreco(e.target.value)}
                placeholder="0,00"
                className="bg-input border-border text-foreground placeholder:text-muted-foreground rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Estoque</Label>
              <Input
                type="number"
                min="0"
                value={estoque}
                onChange={e => setEstoque(e.target.value)}
                placeholder="0"
                className="bg-input border-border text-foreground placeholder:text-muted-foreground rounded-xl"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-foreground">Código de Barras (opcional)</Label>
            <Input
              value={codigoBarras}
              onChange={e => setCodigoBarras(e.target.value)}
              placeholder="Ex: 7891234567890"
              className="bg-input border-border text-foreground placeholder:text-muted-foreground rounded-xl"
            />
          </div>
          <LiquidButton type="submit" variant="gold" size="lg" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Cadastrar Produto
          </LiquidButton>
        </form>
      </div>

      {/* List */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Package className="h-5 w-5" />
            Produtos ({filtered.length})
          </h3>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar produto..."
            className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground rounded-xl"
          />
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground py-8">Carregando...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Nenhum produto cadastrado</p>
        ) : (
          <div className="space-y-2">
            {filtered.map(p => (
              <div key={p.id} className="glass-card-interactive p-4 flex items-center justify-between gap-3">
                {editingId === p.id ? (
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <Input
                      value={editNome}
                      onChange={e => setEditNome(e.target.value)}
                      className="bg-input border-border text-foreground rounded-xl text-sm"
                    />
                    <Input
                      type="number"
                      step="0.01"
                      value={editPreco}
                      onChange={e => setEditPreco(e.target.value)}
                      className="bg-input border-border text-foreground rounded-xl text-sm"
                    />
                    <Input
                      type="number"
                      value={editEstoque}
                      onChange={e => setEditEstoque(e.target.value)}
                      className="bg-input border-border text-foreground rounded-xl text-sm"
                    />
                  </div>
                ) : (
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{p.nome}</p>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>R$ {Number(p.preco).toFixed(2)}</span>
                      <span>Estoque: {p.estoque}</span>
                      {p.codigo_barras && <span>Cód: {p.codigo_barras}</span>}
                    </div>
                  </div>
                )}
                <div className="flex gap-1.5 shrink-0">
                  {editingId === p.id ? (
                    <>
                      <GlassButton variant="ghost" size="sm" onClick={saveEdit}>
                        <Check className="h-4 w-4 text-emerald-400" />
                      </GlassButton>
                      <GlassButton variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                        <X className="h-4 w-4 text-muted-foreground" />
                      </GlassButton>
                    </>
                  ) : (
                    <>
                      <GlassButton variant="ghost" size="sm" onClick={() => startEdit(p)}>
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </GlassButton>
                      <GlassButton variant="ghost" size="sm" onClick={() => handleDelete(p.id)}>
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </GlassButton>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
