import { useState, useCallback } from 'react';

export interface PrinterSettings {
  labelWidth: '58mm' | '80mm';
  autoPrint: boolean;
  storeName: string;
}

const STORAGE_KEY = 'printer-settings';

const defaultSettings: PrinterSettings = {
  labelWidth: '58mm',
  autoPrint: false,
  storeName: 'LUCCA CELL',
};

const loadSettings = (): PrinterSettings => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...defaultSettings, ...JSON.parse(stored) };
  } catch {}
  return defaultSettings;
};

export const usePrinterSettings = () => {
  const [settings, setSettings] = useState<PrinterSettings>(loadSettings);

  const updateSettings = useCallback((partial: Partial<PrinterSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...partial };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { settings, updateSettings };
};
