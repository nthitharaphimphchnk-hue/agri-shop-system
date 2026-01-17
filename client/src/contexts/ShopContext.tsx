import { createContext, useContext, useState, ReactNode } from 'react';

/**
 * Shop Settings Context
 * จัดการข้อมูลร้านค้าที่ใช้ในใบเสร็จและรายงาน
 */

export interface ShopSettings {
  name: string;
  address: string;
  phone: string;
  receiptFooter?: string;
}

interface ShopContextType {
  shopSettings: ShopSettings;
  updateShopSettings: (settings: ShopSettings) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

const DEFAULT_SHOP_SETTINGS: ShopSettings = {
  name: 'ร้านเกษตรชุมชน',
  address: 'บ้าน 123 ม.1 ตำบล... อำเภอ... จังหวัด...',
  phone: '081-234-5678',
  receiptFooter: 'ขอบคุณที่ใช้บริการ'
};

export function ShopProvider({ children }: { children: ReactNode }) {
  const [shopSettings, setShopSettings] = useState<ShopSettings>(() => {
    // Try to load from localStorage
    const saved = localStorage.getItem('shopSettings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_SHOP_SETTINGS;
      }
    }
    return DEFAULT_SHOP_SETTINGS;
  });

  const updateShopSettings = (settings: ShopSettings) => {
    setShopSettings(settings);
    // Save to localStorage
    localStorage.setItem('shopSettings', JSON.stringify(settings));
  };

  return (
    <ShopContext.Provider value={{ shopSettings, updateShopSettings }}>
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}
