import { createContext, useContext, useState, ReactNode } from 'react';

/**
 * Sales History Context
 * จัดการประวัติการขายทั้งหมด
 */

export interface SalesItem {
  name: string;
  quantity: number;
  unit: string;
  price: number;
  total: number;
}

export interface SalesRecord {
  id: string;
  date: string;
  time: string;
  items: SalesItem[];
  totalAmount: number;
  paymentMethod: 'cash' | 'transfer' | 'credit';
  customerName?: string;
  notes?: string;
}

interface SalesHistoryContextType {
  salesRecords: SalesRecord[];
  addSalesRecord: (record: Omit<SalesRecord, 'id'>) => void;
  getSalesRecordById: (id: string) => SalesRecord | undefined;
  getSalesRecordsByDate: (date: string) => SalesRecord[];
  searchSalesRecords: (query: string) => SalesRecord[];
}

const SalesHistoryContext = createContext<SalesHistoryContextType | undefined>(undefined);

export function SalesHistoryProvider({ children }: { children: ReactNode }) {
  const [salesRecords, setSalesRecords] = useState<SalesRecord[]>(() => {
    // Try to load from localStorage
    const saved = localStorage.getItem('salesRecords');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const addSalesRecord = (record: Omit<SalesRecord, 'id'>) => {
    const newRecord: SalesRecord = {
      ...record,
      id: `sale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    const updated = [newRecord, ...salesRecords];
    setSalesRecords(updated);
    // Save to localStorage
    localStorage.setItem('salesRecords', JSON.stringify(updated));
  };

  const getSalesRecordById = (id: string): SalesRecord | undefined => {
    return salesRecords.find(record => record.id === id);
  };

  const getSalesRecordsByDate = (date: string): SalesRecord[] => {
    return salesRecords.filter(record => record.date === date);
  };

  const searchSalesRecords = (query: string): SalesRecord[] => {
    const lowerQuery = query.toLowerCase();
    return salesRecords.filter(record => {
      return (
        record.date.includes(query) ||
        record.customerName?.toLowerCase().includes(lowerQuery) ||
        record.items.some(item => item.name.toLowerCase().includes(lowerQuery))
      );
    });
  };

  return (
    <SalesHistoryContext.Provider
      value={{
        salesRecords,
        addSalesRecord,
        getSalesRecordById,
        getSalesRecordsByDate,
        searchSalesRecords
      }}
    >
      {children}
    </SalesHistoryContext.Provider>
  );
}

export function useSalesHistory() {
  const context = useContext(SalesHistoryContext);
  if (context === undefined) {
    throw new Error('useSalesHistory must be used within a SalesHistoryProvider');
  }
  return context;
}
