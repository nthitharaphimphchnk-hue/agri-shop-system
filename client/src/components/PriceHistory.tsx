import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { usePriceHistory } from '@/contexts/PriceHistoryContext';
import { toast } from 'sonner';

/**
 * Design Philosophy: Rural Warmth
 * - Price history tracking
 * - Easy to understand price changes
 * - Timeline view
 */

export default function PriceHistory() {
  const { getAllPriceHistory, getPriceHistory } = usePriceHistory();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const allHistory = getAllPriceHistory();
  
  // Get unique products from history
  const uniqueProducts = Array.from(
    new Map(
      allHistory.map(record => [record.productId, record.productName])
    ).entries()
  ).map(([id, name]) => ({ id, name }));

  // Filter history based on search and selection
  let filteredHistory = allHistory;
  if (selectedProductId) {
    filteredHistory = getPriceHistory(selectedProductId);
  } else if (searchTerm) {
    filteredHistory = allHistory.filter(record =>
      record.productName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Sort by date (newest first)
  filteredHistory = filteredHistory.sort((a, b) => 
    new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
  );

  const handleExportHistory = () => {
    if (allHistory.length === 0) {
      toast.error('ไม่มีประวัติราคาให้ส่งออก');
      return;
    }

    const csvContent = [
      ['ชื่อสินค้า', 'ราคาเก่า', 'ราคาใหม่', 'เปลี่ยนแปลง', 'วันที่', 'เหตุผล'],
      ...allHistory.map(record => [
        record.productName,
        record.oldPrice,
        record.newPrice,
        record.newPrice - record.oldPrice,
        new Date(record.changedAt).toLocaleString('th-TH'),
        record.reason || '-'
      ])
    ]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `price-history-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('ส่งออกประวัติราคาสำเร็จ');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground">ประวัติการเปลี่ยนแปลงราคา</h1>
          <p className="text-muted-foreground mt-2">ติดตามการเปลี่ยนแปลงราคาสินค้าทั้งหมด</p>
        </div>
        <Button
          onClick={handleExportHistory}
          className="h-12 px-6 text-base font-semibold bg-secondary hover:bg-secondary/90"
        >
          ส่งออก CSV
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="ค้นหาชื่อสินค้า..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedProductId(null);
            }}
            className="pl-10 h-12 text-base"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            onClick={() => {
              setSelectedProductId(null);
              setSearchTerm('');
            }}
            variant={selectedProductId === null && searchTerm === '' ? 'default' : 'outline'}
            className="whitespace-nowrap"
          >
            ทั้งหมด
          </Button>
          {uniqueProducts.slice(0, 5).map(product => (
            <Button
              key={product.id}
              onClick={() => {
                setSelectedProductId(product.id);
                setSearchTerm('');
              }}
              variant={selectedProductId === product.id ? 'default' : 'outline'}
              className="whitespace-nowrap text-sm"
            >
              {product.name.substring(0, 15)}...
            </Button>
          ))}
        </div>
      </div>

      {/* Statistics */}
      {filteredHistory.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 bg-muted/50 border border-border">
            <h3 className="text-sm text-muted-foreground mb-2">จำนวนการเปลี่ยนแปลง</h3>
            <p className="text-3xl font-bold text-primary">{filteredHistory.length}</p>
          </Card>
          <Card className="p-6 bg-muted/50 border border-border">
            <h3 className="text-sm text-muted-foreground mb-2">เพิ่มขึ้น</h3>
            <p className="text-3xl font-bold text-green-600">
              {filteredHistory.filter(r => r.newPrice > r.oldPrice).length}
            </p>
          </Card>
          <Card className="p-6 bg-muted/50 border border-border">
            <h3 className="text-sm text-muted-foreground mb-2">ลดลง</h3>
            <p className="text-3xl font-bold text-red-600">
              {filteredHistory.filter(r => r.newPrice < r.oldPrice).length}
            </p>
          </Card>
        </div>
      )}

      {/* Price History List */}
      <div className="space-y-3">
        {filteredHistory.length > 0 ? (
          filteredHistory.map(record => (
            <Card key={record.id} className="p-6 border border-border hover:bg-muted/30 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">{record.productName}</h3>
                    {record.newPrice > record.oldPrice ? (
                      <TrendingUp className="w-5 h-5 text-red-600" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(record.changedAt).toLocaleString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  {record.reason && (
                    <p className="text-sm text-muted-foreground">เหตุผล: {record.reason}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground mb-1">ราคาเก่า</div>
                  <p className="text-lg font-semibold text-muted-foreground line-through">
                    ฿{record.oldPrice.toFixed(2)}
                  </p>
                  <div className="text-sm text-muted-foreground mt-2 mb-1">ราคาใหม่</div>
                  <p className={`text-2xl font-bold ${
                    record.newPrice > record.oldPrice ? 'text-red-600' : 'text-green-600'
                  }`}>
                    ฿{record.newPrice.toFixed(2)}
                  </p>
                  <p className={`text-sm font-semibold mt-2 ${
                    record.newPrice > record.oldPrice ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {record.newPrice > record.oldPrice ? '+' : ''}{(record.newPrice - record.oldPrice).toFixed(2)}
                  </p>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-12 bg-muted/50 border border-border text-center">
            <p className="text-muted-foreground text-lg">ไม่มีประวัติการเปลี่ยนแปลงราคา</p>
          </Card>
        )}
      </div>
    </div>
  );
}
