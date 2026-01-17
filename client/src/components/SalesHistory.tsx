import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSalesHistory } from '@/contexts/SalesHistoryContext';
import { useShop } from '@/contexts/ShopContext';
import { printReceipt } from '@/lib/receipt';
import { Search, Printer, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Design Philosophy: Rural Warmth
 * - Easy to search and view sales history
 * - Quick reprint of receipts
 * - Clear display of sales information
 */

export default function SalesHistory() {
  const { salesRecords, searchSalesRecords } = useSalesHistory();
  const { shopSettings } = useShop();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const displayRecords = searchTerm ? searchSalesRecords(searchTerm) : salesRecords;

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleReprintReceipt = (recordId: string) => {
    const record = displayRecords.find(r => r.id === recordId);
    if (!record) {
      toast.error('ไม่พบรายการขาย');
      return;
    }

    printReceipt({
      shopName: shopSettings.name,
      date: record.date,
      time: record.time,
      items: record.items,
      totalAmount: record.totalAmount,
      paymentMethod: record.paymentMethod,
      customerName: record.customerName,
      notes: record.notes,
      receiptFooter: shopSettings.receiptFooter
    });

    toast.success('เปิดหน้าต่างพิมพ์ใบเสร็จ');
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: 'เงินสด',
      transfer: 'โอนเงิน',
      credit: 'ขายเชื่อ'
    };
    return labels[method] || method;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground">ประวัติการขาย</h1>
        <p className="text-muted-foreground mt-2">ค้นหาและพิมพ์ใบเสร็จซ้ำ</p>
      </div>

      {/* Search Bar */}
      <Card className="p-4 bg-card border border-border">
        <div className="relative">
          <Search className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="ค้นหาจากวันที่ ชื่อลูกค้า หรือสินค้า..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>
        {searchTerm && (
          <p className="text-xs text-muted-foreground mt-2">
            พบ {displayRecords.length} รายการ
          </p>
        )}
      </Card>

      {/* Sales Records List */}
      <div className="space-y-3">
        {displayRecords.length === 0 ? (
          <Card className="p-8 bg-card border border-border text-center">
            <p className="text-muted-foreground">ไม่พบรายการขาย</p>
          </Card>
        ) : (
          displayRecords.map((record) => (
            <Card
              key={record.id}
              className="bg-card border border-border overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Record Header */}
              <div
                className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleExpand(record.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-semibold text-foreground">
                          {record.date} เวลา {record.time}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {record.customerName || 'ขายทั่วไป'} • {record.items.length} รายการ
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right mr-4">
                    <p className="text-2xl font-bold text-primary">
                      {record.totalAmount.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getPaymentMethodLabel(record.paymentMethod)}
                    </p>
                  </div>
                  {expandedId === record.id ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Record Details */}
              {expandedId === record.id && (
                <div className="border-t border-border bg-muted/30 p-4 space-y-4">
                  {/* Items List */}
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-3">รายการสินค้า</p>
                    <div className="space-y-2">
                      {record.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <div>
                            <p className="text-foreground">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.quantity} {item.unit} × {item.price.toLocaleString()} บาท
                            </p>
                          </div>
                          <p className="font-medium text-foreground">
                            {item.total.toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between mb-2">
                      <p className="text-sm text-muted-foreground">รวมทั้งสิ้น</p>
                      <p className="font-bold text-primary">
                        {record.totalAmount.toLocaleString()} บาท
                      </p>
                    </div>
                    {record.notes && (
                      <div className="mt-2 p-2 bg-background rounded text-xs text-muted-foreground">
                        หมายเหตุ: {record.notes}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-3 border-t border-border">
                    <Button
                      onClick={() => handleReprintReceipt(record.id)}
                      className="flex-1 h-10 text-sm font-semibold bg-primary hover:bg-primary/90"
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      พิมพ์ใบเสร็จ
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Info Card */}
      {salesRecords.length > 0 && (
        <Card className="p-4 bg-blue-50 border border-blue-200">
          <p className="text-sm text-blue-800">
            💡 คลิกที่รายการเพื่อดูรายละเอียด และพิมพ์ใบเสร็จซ้ำได้ทุกเมื่อ
          </p>
        </Card>
      )}
    </div>
  );
}
