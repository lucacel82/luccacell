

# Impressao de Etiquetas via Navegador

## Resumo
Adicionar funcionalidade de impressao de etiquetas de produtos apos registrar uma venda. A etiqueta sera gerada como HTML formatado para impressoras termicas (58mm/80mm) e impressa usando `window.print()`. Tambem sera adicionada uma tela de configuracoes da impressora.

## O que muda para voce
- Apos registrar uma venda, aparece um botao "Imprimir Etiqueta"
- A etiqueta mostra: nome da loja, produto, preco, codigo, codigo de barras e data
- Uma nova aba "Config" permite ajustar largura da etiqueta e impressao automatica
- Funciona com qualquer impressora configurada no computador

## Etapas

### 1. Adicionar campo de codigo de barras nos produtos
A tabela `produtos` nao possui campo para codigo de barras. Sera adicionada uma coluna `codigo_barras` (texto, opcional).

### 2. Instalar bibliotecas de codigo de barras e QR Code
- `jsbarcode` - para gerar codigos de barras no canvas
- `qrcode` (ou `qrcode.react`) - para gerar QR Codes

### 3. Criar servico de impressao (`src/services/printService.ts`)
- Funcao `printProductLabel(product, sale, config)` que:
  - Cria uma janela popup com HTML formatado para etiqueta
  - Aplica CSS de impressao otimizado para 58mm ou 80mm
  - Inclui codigo de barras (canvas) e QR Code (com ID da venda)
  - Chama `window.print()` na janela popup
  - Fecha a janela apos impressao

### 4. Criar hook de configuracoes (`src/hooks/usePrinterSettings.ts`)
- Armazena configuracoes em `localStorage`:
  - Largura: 58mm ou 80mm
  - Impressao automatica apos venda: sim/nao
  - Nome da loja (padrao: "LUCCA CELL")

### 5. Criar componente de configuracoes (`src/components/PrinterSettings.tsx`)
- Tela simples com:
  - Selecao de largura (58mm / 80mm)
  - Toggle de impressao automatica
  - Campo para nome da loja
- Segue o visual existente (glass-card, rounded-xl, etc.)

### 6. Atualizar formulario de venda (`src/components/SaleForm.tsx`)
- Apos registrar venda com sucesso:
  - Se impressao automatica ativada: imprimir etiqueta direto
  - Senao: exibir dialog com botao "Imprimir Etiqueta"
- Toast de sucesso/erro conforme resultado

### 7. Atualizar cadastro de produtos (`src/components/Products.tsx`)
- Adicionar campo opcional "Codigo de Barras" no formulario
- Exibir codigo de barras na listagem quando existir

### 8. Adicionar aba "Config" no menu (`src/pages/Index.tsx`)
- Nova aba com icone de engrenagem (Settings)
- Conteudo: componente PrinterSettings

---

## Detalhes Tecnicos

### Migracao SQL
```sql
ALTER TABLE public.produtos ADD COLUMN codigo_barras text;
```

### Estrutura da etiqueta (HTML para impressao)
```text
+---------------------------+
|       LUCCA CELL          |  (centralizado, fonte normal)
|                           |
|   CAPINHA IPHONE 15       |  (negrito, fonte grande)
|                           |
|      R$ 49,90             |  (fonte extra grande, destaque)
|                           |
|   Cod: abc123             |  (fonte pequena)
|   |||||||||||||||||||      |  (codigo de barras)
|                           |
|   [QR CODE - ID venda]    |  (QR code pequeno)
|                           |
|   16/02/2026              |  (data da venda)
+---------------------------+
```

### CSS de impressao
- `@media print` para ocultar tudo exceto a etiqueta
- `@page { size: 58mm auto; margin: 2mm; }` (ou 80mm)
- Fonte monospacada para melhor leitura em termicas

### Arquivos criados
- `src/services/printService.ts` - logica de formatacao e impressao
- `src/hooks/usePrinterSettings.ts` - configuracoes em localStorage
- `src/components/PrinterSettings.tsx` - tela de configuracoes
- `src/components/PrintLabelDialog.tsx` - dialog pos-venda com botao de imprimir

### Arquivos modificados
- `src/components/SaleForm.tsx` - integrar impressao apos venda
- `src/components/Products.tsx` - campo codigo de barras
- `src/hooks/useProducts.ts` - suporte ao campo codigo_barras
- `src/pages/Index.tsx` - nova aba Config
- `src/types/sale.ts` - (sem alteracao, tipos ja atendem)

### Tratamento de erros
- Se popup bloqueado pelo navegador: toast avisando para permitir popups
- Se impressao cancelada: nenhum erro, fluxo continua normal
- Impressao roda de forma assincrona, nao bloqueia o fluxo de venda
