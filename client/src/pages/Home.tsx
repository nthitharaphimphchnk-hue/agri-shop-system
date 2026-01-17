import { useState, useEffect } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import { BarChart3, Package, Users, TrendingUp, Plus, LogOut, Settings, History, LogOut as LogOutIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import Dashboard from '@/components/Dashboard';
import SalesForm from '@/components/SalesForm';
import CustomerManagement from '@/components/CustomerManagement';
import InventoryManagement from '@/components/InventoryManagement';
import Reports from '@/components/Reports';
import CloseDay from '@/components/CloseDay';
import ShopSettings from '@/components/ShopSettings';
import SalesHistory from '@/components/SalesHistory';
import NotificationCenter from '@/components/NotificationCenter';
import PriceHistory from '@/components/PriceHistory';
import ProductShortcutsManager from '@/components/ProductShortcutsManager';
import { AISidebar } from '@/components/AISidebar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/contexts/ThemeContext';
// import ShopSetup from '@/components/ShopSetup';

/**
 * Design Philosophy: Rural Warmth
 * - Sidebar navigation on the left
 * - Card-based layout for main content
 * - Large numbers for sales data
 * - Warm colors: green (#6B8E23), cream (#FFFEF5), orange (#E8A76A)
 * - Easy-to-read typography using Noto Sans Thai
 */

type PageType = 'dashboard' | 'sales' | 'customers' | 'inventory' | 'reports' | 'closeday' | 'settings' | 'history' | 'pricehistory' | 'shortcuts' | 'setup';

export default function Home() {
  // The userAuth hooks provides authentication state
  let { user, loading, error, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  // Fetch shop data from API
  const { data: shop, isLoading: shopLoading } = trpc.shop.getMyShop.useQuery();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      logout();
      setLocation('/');
    }
  });

  // Fetch products, customers, sales from API
  const { data: products = [] } = trpc.product.list.useQuery(undefined, {
    enabled: !!shop,
  });
  
  const { data: customers = [] } = trpc.customer.list.useQuery(undefined, {
    enabled: !!shop,
  });
  
  const { data: sales = [] } = trpc.sales.list.useQuery(undefined, {
    enabled: !!shop,
  });

  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      setLocation('/');
    }
  }, [isAuthenticated, loading, setLocation]);

  // If shop doesn't exist, show setup page
  // if (shop === null && !shopLoading) {
  //   return <ShopSetup onSetupComplete={() => window.location.reload()} />;
  // }

  // Show loading skeleton only if auth is still loading (first time)
  // Don't block the whole page if shop is loading
  const isInitialAuthLoading = loading && !isAuthenticated;
  
  if (isInitialAuthLoading) {
    return (
      <div className="flex h-screen bg-background text-foreground font-sans">
        <div className="w-64 bg-sidebar border-r border-sidebar-border shadow-sm flex flex-col animate-pulse">
          <div className="p-6 border-b border-sidebar-border">
            <div className="h-8 bg-sidebar-accent/20 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-sidebar-accent/20 rounded w-1/2"></div>
          </div>
        </div>
        <div className="flex-1 bg-background animate-pulse"></div>
      </div>
    );
  }

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'แดชบอร์ด',
      icon: BarChart3,
      description: 'ภาพรวมร้าน'
    },
    {
      id: 'sales',
      label: 'ระบบขาย',
      icon: Plus,
      description: 'บันทึกการขาย'
    },
    {
      id: 'customers',
      label: 'จัดการลูกค้า',
      icon: Users,
      description: 'ลูกค้าและหนี้สิน'
    },
    {
      id: 'inventory',
      label: 'จัดการสินค้า',
      icon: Package,
      description: 'สต็อกสินค้า'
    },
    {
      id: 'reports',
      label: 'รายงาน',
      icon: TrendingUp,
      description: 'ผลการขาย'
    },
    {
      id: 'closeday',
      label: 'ปิดวัน',
      icon: LogOut,
      description: 'สรุปวันนี้'
    },
    {
      id: 'history',
      label: 'ประวัติการขาย',
      icon: History,
      description: 'ค้นหาการขาย'
    },
    {
      id: 'pricehistory',
      label: 'ประวัติราคา',
      icon: TrendingUp,
      description: 'การเปลี่ยนราคา'
    },
    {
      id: 'shortcuts',
      label: 'จัดการปุ่มลัด',
      icon: Settings,
      description: 'จัดเรียงสินค้าขายบ่อย'
    },
    {
      id: 'settings',
      label: 'ตั้งค่าร้านค้า',
      icon: Settings,
      description: 'ข้อมูลร้าน'
    }
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={(page) => setCurrentPage(page as PageType)} shop={shop} />;
      case 'sales':
        return <SalesForm />;
      case 'customers':
        return <CustomerManagement />;
      case 'inventory':
        return <InventoryManagement />;
      case 'reports':
        return <Reports />;
      case 'closeday':
        return <CloseDay />;
      case 'settings':
        return <ShopSettings />;
      case 'history':
        return <SalesHistory />;
      case 'pricehistory':
        return <PriceHistory />;
      case 'shortcuts':
        return <ProductShortcutsManager products={[]} onSave={() => {}} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border shadow-sm flex flex-col">
        {/* Logo/Header */}
        <div className="p-6 border-b border-sidebar-border">
          <h1 className="text-2xl font-bold text-sidebar-primary">Thai Smart</h1>
          <p className="text-sm text-sidebar-foreground/60 mt-1">ไทย สมาร์ต</p>
          {shop && (
            <p className="text-xs text-sidebar-foreground/50 mt-2 truncate">{shop.shopName}</p>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id as PageType)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/20'
                }`}
              >
                <Icon className="w-5 h-5" />
                <div className="text-left">
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="text-xs opacity-70">{item.description}</div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Footer Info */}
        <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/10 text-center">
          <p className="text-xs text-sidebar-foreground/60">
            v2.0 - Backend Ready
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto flex flex-col">
        {/* Top Bar with Notifications */}
        <div className="bg-card border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {user && (
              <span className="text-sm text-foreground/70">
                {user.name || user.email}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <NotificationCenter onNavigate={(page) => setCurrentPage(page as PageType)} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              <LogOutIcon className="w-4 h-4 mr-2" />
              ออกจากระบบ
            </Button>
          </div>
        </div>
        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {renderPage()}
          </div>
        </div>
      </main>
      
      {/* AI Sidebar - Temporarily disabled for debugging */}
      {/* <AISidebar 
        sales={sales} 
        customers={customers} 
        products={products}
        isDarkMode={isDarkMode}
      /> */}
    </div>
  );
}
