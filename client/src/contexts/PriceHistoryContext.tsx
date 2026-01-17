import { createContext, useContext, useState, ReactNode } from 'react';

export interface PriceRecord {
  id: string;
  productId: string;
  productName: string;
  oldPrice: number;
  newPrice: number;
  changedAt: Date;
  changedBy?: string;
  reason?: string;
}

interface PriceHistoryContextType {
  priceHistory: PriceRecord[];
  addPriceRecord: (record: Omit<PriceRecord, 'id' | 'changedAt'>) => void;
  getPriceHistory: (productId: string) => PriceRecord[];
  getAllPriceHistory: () => PriceRecord[];
  clearHistory: () => void;
}

const PriceHistoryContext = createContext<PriceHistoryContextType | undefined>(undefined);

export function PriceHistoryProvider({ children }: { children: ReactNode }) {
  const [priceHistory, setPriceHistory] = useState<PriceRecord[]>(() => {
    const saved = localStorage.getItem('agri_price_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((record: any) => ({
          ...record,
          changedAt: new Date(record.changedAt)
        }));
      } catch (error) {
        console.error('Error loading price history:', error);
        return [];
      }
    }
    return [];
  });

  const addPriceRecord = (record: Omit<PriceRecord, 'id' | 'changedAt'>) => {
    const newRecord: PriceRecord = {
      ...record,
      id: `price-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      changedAt: new Date()
    };

    const updated = [newRecord, ...priceHistory];
    setPriceHistory(updated);

    // Save to localStorage
    localStorage.setItem(
      'agri_price_history',
      JSON.stringify(updated.map(r => ({
        ...r,
        changedAt: r.changedAt.toISOString()
      })))
    );
  };

  const getPriceHistory = (productId: string) => {
    return priceHistory.filter(record => record.productId === productId);
  };

  const getAllPriceHistory = () => {
    return priceHistory;
  };

  const clearHistory = () => {
    setPriceHistory([]);
    localStorage.removeItem('agri_price_history');
  };

  return (
    <PriceHistoryContext.Provider
      value={{
        priceHistory,
        addPriceRecord,
        getPriceHistory,
        getAllPriceHistory,
        clearHistory
      }}
    >
      {children}
    </PriceHistoryContext.Provider>
  );
}

export function usePriceHistory() {
  const context = useContext(PriceHistoryContext);
  if (!context) {
    throw new Error('usePriceHistory must be used within PriceHistoryProvider');
  }
  return context;
}
