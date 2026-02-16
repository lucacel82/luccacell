import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import type { PrinterSettings } from '@/hooks/usePrinterSettings';

export interface LabelProduct {
  nome: string;
  preco: number;
  codigo_barras?: string | null;
}

export interface LabelSale {
  id: string;
  data_venda: string;
}

const generateBarcodeDataUrl = (code: string): string | null => {
  try {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, code, {
      format: 'CODE128',
      width: 1.5,
      height: 40,
      displayValue: false,
      margin: 0,
    });
    return canvas.toDataURL('image/png');
  } catch {
    return null;
  }
};

const generateQRCodeDataUrl = async (data: string): Promise<string | null> => {
  try {
    return await QRCode.toDataURL(data, { width: 80, margin: 1 });
  } catch {
    return null;
  }
};

export const printProductLabel = async (
  product: LabelProduct,
  sale: LabelSale,
  config: PrinterSettings
): Promise<boolean> => {
  const width = config.labelWidth === '80mm' ? '80mm' : '58mm';
  const saleDate = new Date(sale.data_venda).toLocaleDateString('pt-BR');
  const priceFormatted = product.preco.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  let barcodeImg = '';
  if (product.codigo_barras) {
    const url = generateBarcodeDataUrl(product.codigo_barras);
    if (url) barcodeImg = `<img src="${url}" style="max-width:90%;height:auto;margin:4px auto;display:block;" />`;
  }

  let qrImg = '';
  const qrUrl = await generateQRCodeDataUrl(sale.id);
  if (qrUrl) qrImg = `<img src="${qrUrl}" style="width:60px;height:60px;margin:4px auto;display:block;" />`;

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>Etiqueta</title>
<style>
  @page { size: ${width} auto; margin: 2mm; }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Courier New', monospace; width: ${width}; text-align:center; padding:2mm; }
  .store { font-size:11px; margin-bottom:4px; }
  .product { font-size:14px; font-weight:bold; margin:6px 0; word-wrap:break-word; }
  .price { font-size:20px; font-weight:bold; margin:6px 0; }
  .code { font-size:9px; color:#555; margin:4px 0; }
  .date { font-size:9px; color:#777; margin-top:6px; }
  .separator { border-top:1px dashed #999; margin:4px 0; }
  @media print {
    body { width: ${width}; }
  }
</style>
</head>
<body>
  <div class="store">${config.storeName}</div>
  <div class="separator"></div>
  <div class="product">${product.nome}</div>
  <div class="price">${priceFormatted}</div>
  ${product.codigo_barras ? `<div class="code">Cód: ${product.codigo_barras}</div>` : ''}
  ${barcodeImg}
  ${qrImg}
  <div class="separator"></div>
  <div class="date">${saleDate}</div>
</body>
</html>`;

  const printWindow = window.open('', '_blank', 'width=400,height=600');
  if (!printWindow) return false;

  printWindow.document.write(html);
  printWindow.document.close();

  return new Promise((resolve) => {
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        setTimeout(() => {
          printWindow.close();
          resolve(true);
        }, 1000);
      }, 300);
    };
    // Fallback if onload doesn't fire
    setTimeout(() => {
      try {
        printWindow.print();
        setTimeout(() => { printWindow.close(); resolve(true); }, 1000);
      } catch { resolve(false); }
    }, 2000);
  });
};
