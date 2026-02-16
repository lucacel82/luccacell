import { usePrinterSettings } from '@/hooks/usePrinterSettings';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Printer } from 'lucide-react';

export const PrinterSettings = () => {
  const { settings, updateSettings } = usePrinterSettings();

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-6">
          <Settings className="h-5 w-5" />
          Configurações da Impressora
        </h3>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-foreground">Nome da Loja</Label>
            <Input
              value={settings.storeName}
              onChange={e => updateSettings({ storeName: e.target.value })}
              placeholder="Nome exibido na etiqueta"
              className="bg-input border-border text-foreground placeholder:text-muted-foreground rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Largura da Etiqueta</Label>
            <Select
              value={settings.labelWidth}
              onValueChange={(v) => updateSettings({ labelWidth: v as '58mm' | '80mm' })}
            >
              <SelectTrigger className="bg-input border-border text-foreground rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="58mm">58mm (térmica pequena)</SelectItem>
                <SelectItem value="80mm">80mm (térmica padrão)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between glass-card p-4">
            <div className="space-y-0.5">
              <Label className="text-foreground flex items-center gap-2">
                <Printer className="h-4 w-4" />
                Impressão Automática
              </Label>
              <p className="text-xs text-muted-foreground">
                Imprimir etiqueta automaticamente ao registrar venda
              </p>
            </div>
            <Switch
              checked={settings.autoPrint}
              onCheckedChange={v => updateSettings({ autoPrint: v })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
