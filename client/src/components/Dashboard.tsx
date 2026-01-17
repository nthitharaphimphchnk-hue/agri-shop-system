import { Button } from '@/components/ui/button';
import { TrendingUp, AlertTriangle, Users, ChevronRight, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

/**
 * Design Philosophy: Rural Warmth
 * - Large numbers for sales data
 * - Card-based layout
 * - Warm colors and easy-to-read typography
 * - Shows store overview at a glance
 */

interface DashboardProps {
  onNavigate?: (page: string) => void;
  shop?: any; // Shop data from parent component
}

export default function Dashboard({ onNavigate, shop: shopFromProps }: DashboardProps) {
  // Use shop from props if available, otherwise fetch it
  const { data: shopFromQuery, isLoading: shopLoading, error: shopError } = trpc.shop.getMyShop.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !shopFromProps, // Only query if shop not provided from props
  });
  
  // Use shop from props or query
  const shop = shopFromProps || shopFromQuery;
  
  // Determine if we should wait for shop loading
  const isWaitingForShop = shopLoading && !shopFromProps;
  
  // Fetch dashboard stats from API - only when shop exists
  const { data: stats, isLoading: statsLoading, error: statsError } = trpc.dashboard.stats.useQuery(
    { date: new Date() },
    { 
      enabled: !!shop && !isWaitingForShop,
      retry: false,
      refetchOnWindowFocus: false,
    }
  );
  
  // Fetch products for low stock items - only when shop exists
  const { data: products = [], isLoading: productsLoading, error: productsError } = trpc.product.list.useQuery(
    undefined,
    { 
      enabled: !!shop && !isWaitingForShop,
      retry: false,
      refetchOnWindowFocus: false,
    }
  );
  
  // Fetch customers for debt list - only when shop exists
  const { data: customers = [], isLoading: customersLoading, error: customersError } = trpc.customer.list.useQuery(
    undefined,
    { 
      enabled: !!shop && !isWaitingForShop,
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  // Only show loading spinner if we're waiting for shop query (and not from props)
  if (isWaitingForShop) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // If shop doesn't exist, show message to create one (but don't block the whole page)
  if (!shop && !isWaitingForShop) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <p className="text-lg font-semibold text-foreground mb-2">ยังไม่มีร้านค้า</p>
          <p className="text-sm text-muted-foreground mb-4">กรุณาตั้งค่าร้านค้าก่อนใช้งานระบบ</p>
          <Button onClick={() => onNavigate?.('settings')}>
            ไปตั้งค่าร้านค้า
          </Button>
        </div>
      </div>
    );
  }

  // Show error if shop query failed
  if (shopError) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-semibold text-foreground mb-2">เกิดข้อผิดพลาด</p>
          <p className="text-sm text-muted-foreground mb-4">{shopError.message || 'ไม่สามารถโหลดข้อมูลร้านค้าได้'}</p>
        </div>
      </div>
    );
  }

  // Calculate today's sales from stats (with fallback to default values)
  // Don't wait for stats to load - show 0 if not available yet
  const todaySales = {
    cash: stats?.todayStats?.cashSales ?? 0,
    transfer: stats?.todayStats?.transferSales ?? 0,
    credit: stats?.todayStats?.creditSales ?? 0,
    total: stats?.todayStats?.totalSales ?? 0
  };

  const monthlySales = stats?.monthlySales ?? 0;

  // Get low stock items - handle empty or error cases
  const lowStockItems = (products || [])
    .filter(p => {
      const stock = typeof p.currentStock === 'number' ? p.currentStock : 0;
      const minStock = typeof p.minimumStock === 'number' ? p.minimumStock : 5;
      return stock < minStock;
    })
    .slice(0, 5)
    .map(p => ({
      name: p.productName,
      current: typeof p.currentStock === 'number' ? p.currentStock : 0,
      warning: typeof p.minimumStock === 'number' ? p.minimumStock : 5
    }));

  // Get debt customers - handle empty or error cases
  const debtCustomers = (customers || [])
    .filter(c => {
      const debt = typeof c.totalDebt === 'string' ? parseFloat(c.totalDebt) : (typeof c.totalDebt === 'number' ? c.totalDebt : 0);
      return debt > 0;
    })
    .sort((a, b) => {
      const debtA = typeof a.totalDebt === 'string' ? parseFloat(a.totalDebt) : (typeof a.totalDebt === 'number' ? a.totalDebt : 0);
      const debtB = typeof b.totalDebt === 'string' ? parseFloat(b.totalDebt) : (typeof b.totalDebt === 'number' ? b.totalDebt : 0);
      return debtB - debtA;
    })
    .slice(0, 5)
    .map(c => ({
      name: c.customerName,
      debt: typeof c.totalDebt === 'string' ? parseFloat(c.totalDebt) : (typeof c.totalDebt === 'number' ? c.totalDebt : 0)
    }));

  // Show loading indicator only for critical data (not blocking)
  const isDataLoading = statsLoading || productsLoading || customersLoading;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground">สถานการณ์ร้านวันนี้</h1>
        <p className="text-muted-foreground mt-2">
          {format(new Date(), 'EEEE, d MMMM yyyy', { locale: th })}
        </p>
        {/* Show loading indicator for data */}
        {isDataLoading && (
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>กำลังโหลดข้อมูล...</span>
          </div>
        )}
        {/* Show errors if any */}
        {(statsError || productsError || customersError) && (
          <div className="flex items-center gap-2 mt-2 text-sm text-orange-600">
            <AlertTriangle className="w-4 h-4" />
            <span>บางข้อมูลอาจโหลดไม่สำเร็จ</span>
          </div>
        )}
      </div>

      {/* Sales Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Cash Sales */}
        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-700">ขายเบียด</span>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-green-900">
            {todaySales.cash.toLocaleString('th-TH')}
          </div>
          <p className="text-xs text-green-600 mt-2">บาท</p>
        </Card>

        {/* Transfer Sales */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700">โอนเงิน</span>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-blue-900">
            {todaySales.transfer.toLocaleString('th-TH')}
          </div>
          <p className="text-xs text-blue-600 mt-2">บาท</p>
        </Card>

        {/* Credit Sales */}
        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-orange-700">ขายเงิน</span>
            <TrendingUp className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-3xl font-bold text-orange-900">
            {todaySales.credit.toLocaleString('th-TH')}
          </div>
          <p className="text-xs text-orange-600 mt-2">บาท</p>
        </Card>

        {/* Total Sales */}
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-700">รวมวันนี้</span>
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-purple-900">
            {todaySales.total.toLocaleString('th-TH')}
          </div>
          <p className="text-xs text-purple-600 mt-2">บาท</p>
        </Card>
      </div>

      {/* Monthly Sales */}
      <Card className="p-6 bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-700 mb-2">ยอดขายเดือนนี้</p>
            <div className="text-4xl font-bold text-indigo-900">
              {monthlySales.toLocaleString('th-TH')}
            </div>
            <p className="text-xs text-indigo-600 mt-2">บาท</p>
          </div>
          <TrendingUp className="w-12 h-12 text-indigo-300" />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Low Stock Items */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              สินค้าเหลือน้อย
            </h2>
            {lowStockItems.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate?.('inventory')}
              >
                ดูทั้งหมด <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>

          {lowStockItems.length > 0 ? (
            <div className="space-y-3">
              {lowStockItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div>
                    <p className="font-medium text-foreground text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      เหลือ {item.current} / ต่ำสุด {item.warning}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-600">{item.current}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">ไม่มีสินค้าเหลือน้อย ✓</p>
            </div>
          )}
        </Card>

        {/* Debt Customers */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Users className="w-5 h-5 text-red-500" />
              ลูกค้าค้างชำระ
            </h2>
            {debtCustomers.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate?.('customers')}
              >
                ดูทั้งหมด <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>

          {debtCustomers.length > 0 ? (
            <div className="space-y-3">
              {debtCustomers.map((customer, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div>
                    <p className="font-medium text-foreground text-sm">{customer.name}</p>
                    <p className="text-xs text-muted-foreground">ค้างชำระ</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-red-600">
                      {Math.round(customer.debt).toLocaleString('th-TH')}
                    </div>
                    <p className="text-xs text-red-600">บาท</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">ไม่มีลูกค้าค้างชำระ ✓</p>
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button
          variant="outline"
          className="h-24 flex flex-col items-center justify-center gap-2"
          onClick={() => onNavigate?.('sales')}
        >
          <TrendingUp className="w-6 h-6" />
          <span className="text-sm">บันทึกการขาย</span>
        </Button>
        <Button
          variant="outline"
          className="h-24 flex flex-col items-center justify-center gap-2"
          onClick={() => onNavigate?.('customers')}
        >
          <Users className="w-6 h-6" />
          <span className="text-sm">จัดการลูกค้า</span>
        </Button>
        <Button
          variant="outline"
          className="h-24 flex flex-col items-center justify-center gap-2"
          onClick={() => onNavigate?.('inventory')}
        >
          <AlertTriangle className="w-6 h-6" />
          <span className="text-sm">จัดการสินค้า</span>
        </Button>
        <Button
          variant="outline"
          className="h-24 flex flex-col items-center justify-center gap-2"
          onClick={() => onNavigate?.('closeday')}
        >
          <TrendingUp className="w-6 h-6" />
          <span className="text-sm">ปิดวัน</span>
        </Button>
      </div>
    </div>
  );
}
