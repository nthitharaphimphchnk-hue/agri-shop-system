import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Design Philosophy: Rural Warmth
 * - Simple end-of-day closing
 * - Clear summary of cash, transfers, and credit sales
 * - Easy confirmation
 */

interface DayClosing {
  date: string;
  cashSales: number;
  transferSales: number;
  creditSales: number;
  totalSales: number;
  cashCount: number;
  discrepancy: number;
  notes: string;
  closedAt?: string;
}

export default function CloseDay() {
  const [dayClosing, setDayClosing] = useState<DayClosing>({
    date: new Date().toISOString().split('T')[0],
    cashSales: 5200,
    transferSales: 3800,
    creditSales: 2100,
    totalSales: 11100,
    cashCount: 0,
    discrepancy: 0,
    notes: ''
  });

  const [isClosing, setIsClosing] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  const handleCashCountChange = (value: number) => {
    const discrepancy = value - dayClosing.cashSales;
    setDayClosing({
      ...dayClosing,
      cashCount: value,
      discrepancy: discrepancy
    });
  };

  const handleCloseDay = () => {
    if (dayClosing.cashCount === 0) {
      toast.error('กรุณากรอกจำนวนเงินสดที่นับได้');
      return;
    }

    setIsClosing(true);
    
    // Simulate closing process
    setTimeout(() => {
      setDayClosing({
        ...dayClosing,
        closedAt: new Date().toLocaleTimeString('th-TH')
      });
      setIsClosed(true);
      setIsClosing(false);
      toast.success('ปิดวันสำเร็จ');
    }, 1000);
  };

  const handleNewDay = () => {
    setDayClosing({
      date: new Date().toISOString().split('T')[0],
      cashSales: 0,
      transferSales: 0,
      creditSales: 0,
      totalSales: 0,
      cashCount: 0,
      discrepancy: 0,
      notes: ''
    });
    setIsClosed(false);
    toast.success('เตรียมพร้อมสำหรับวันใหม่');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground">ปิดวัน</h1>
        <p className="text-muted-foreground mt-2">สรุปยอดขายและนับเงิน</p>
      </div>

      {/* Date */}
      <Card className="p-6 bg-card border border-border">
        <p className="text-sm text-muted-foreground mb-2">วันที่</p>
        <p className="text-2xl font-bold text-foreground">
          {new Date(dayClosing.date).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </Card>

      {/* Sales Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-card border border-border">
          <p className="text-xs text-muted-foreground mb-2">เงินสด</p>
          <p className="text-3xl font-bold text-primary">{dayClosing.cashSales.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-2">บาท</p>
        </Card>

        <Card className="p-6 bg-card border border-border">
          <p className="text-xs text-muted-foreground mb-2">โอนเงิน</p>
          <p className="text-3xl font-bold text-secondary">{dayClosing.transferSales.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-2">บาท</p>
        </Card>

        <Card className="p-6 bg-card border border-border">
          <p className="text-xs text-muted-foreground mb-2">ขายเชื่อ</p>
          <p className="text-3xl font-bold text-accent">{dayClosing.creditSales.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-2">บาท</p>
        </Card>
      </div>

      {/* Total Sales */}
      <Card className="p-6 bg-primary text-primary-foreground border border-primary">
        <p className="text-sm opacity-80 mb-2">รวมยอดขายวันนี้</p>
        <p className="text-5xl font-bold">{dayClosing.totalSales.toLocaleString()}</p>
        <p className="text-sm opacity-80 mt-2">บาท</p>
      </Card>

      {/* Cash Counting */}
      {!isClosed && (
        <Card className="p-6 bg-card border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">นับเงินสด</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">ยอดเงินสดที่นับได้ (บาท)</label>
              <Input
                type="number"
                min="0"
                value={dayClosing.cashCount || ''}
                onChange={(e) => handleCashCountChange(parseInt(e.target.value) || 0)}
                placeholder="กรอกจำนวนเงิน"
                className="h-12 text-base"
              />
            </div>

            {dayClosing.cashCount > 0 && (
              <div className={`p-4 rounded-lg ${
                dayClosing.discrepancy === 0
                  ? 'bg-green-50 border border-green-200'
                  : dayClosing.discrepancy > 0
                  ? 'bg-blue-50 border border-blue-200'
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {dayClosing.discrepancy === 0 ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                  )}
                  <p className={`font-semibold ${
                    dayClosing.discrepancy === 0
                      ? 'text-green-900'
                      : dayClosing.discrepancy > 0
                      ? 'text-blue-900'
                      : 'text-red-900'
                  }`}>
                    {dayClosing.discrepancy === 0
                      ? 'เงินตรงกัน'
                      : dayClosing.discrepancy > 0
                      ? `เงินเกิน ${dayClosing.discrepancy.toLocaleString()} บาท`
                      : `เงินขาด ${Math.abs(dayClosing.discrepancy).toLocaleString()} บาท`}
                  </p>
                </div>
                <p className={`text-sm ${
                  dayClosing.discrepancy === 0
                    ? 'text-green-700'
                    : dayClosing.discrepancy > 0
                    ? 'text-blue-700'
                    : 'text-red-700'
                }`}>
                  ยอดคาดหวัง: {dayClosing.cashSales.toLocaleString()} บาท
                </p>
              </div>
            )}

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">หมายเหตุ</label>
              <textarea
                value={dayClosing.notes}
                onChange={(e) => setDayClosing({ ...dayClosing, notes: e.target.value })}
                placeholder="เพิ่มหมายเหตุ (ถ้ามี)"
                className="w-full p-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
              />
            </div>

            <Button
              onClick={handleCloseDay}
              disabled={dayClosing.cashCount === 0 || isClosing}
              className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90"
            >
              {isClosing ? 'กำลังปิดวัน...' : 'ปิดวัน'}
            </Button>
          </div>
        </Card>
      )}

      {/* Closed Summary */}
      {isClosed && (
        <>
          <Card className="p-6 bg-green-50 border border-green-200">
            <div className="flex items-center gap-3 mb-4">
              <Check className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold text-green-900">ปิดวันสำเร็จ</h2>
            </div>
            <div className="space-y-3 text-sm text-green-800">
              <p>ปิดเวลา: {dayClosing.closedAt}</p>
              <p>ยอดขายรวม: {dayClosing.totalSales.toLocaleString()} บาท</p>
              <p>เงินสดที่นับได้: {dayClosing.cashCount.toLocaleString()} บาท</p>
              {dayClosing.notes && <p>หมายเหตุ: {dayClosing.notes}</p>}
            </div>
          </Card>

          <Button
            onClick={handleNewDay}
            className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90"
          >
            เตรียมพร้อมสำหรับวันใหม่
          </Button>
        </>
      )}
    </div>
  );
}
