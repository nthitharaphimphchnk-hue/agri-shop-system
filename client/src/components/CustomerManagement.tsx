import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Phone, MapPin } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Design Philosophy: Rural Warmth
 * - Easy customer lookup
 * - Clear debt tracking
 * - Purchase history
 * - Payment history
 */

interface Customer {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  debt: number;
  purchases: number;
  lastPurchase?: string;
}

interface Payment {
  id: string;
  customerId: string;
  date: string;
  amount: number;
  method: string;
}

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([
    { id: 'c1', name: 'สมชาย ชาวไร่', phone: '081-234-5678', address: 'บ้าน 123 ม.1', debt: 5000, purchases: 12, lastPurchase: '2024-01-15' },
    { id: 'c2', name: 'สมหญิง ชาวสวน', phone: '082-345-6789', address: 'บ้าน 456 ม.2', debt: 3000, purchases: 8, lastPurchase: '2024-01-14' },
    { id: 'c3', name: 'สมศักดิ์ เกษตรกร', phone: '083-456-7890', address: 'บ้าน 789 ม.3', debt: 2000, purchases: 6, lastPurchase: '2024-01-13' },
    { id: 'c4', name: 'สมบัติ ชาวไร่', phone: '084-567-8901', address: 'บ้าน 111 ม.4', debt: 1500, purchases: 5, lastPurchase: '2024-01-12' },
    { id: 'c5', name: 'สมพร ชาวสวน', phone: '085-678-9012', address: 'บ้าน 222 ม.5', debt: 1000, purchases: 3, lastPurchase: '2024-01-11' }
  ]);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm)
  );

  const handlePayment = () => {
    if (!selectedCustomer || !paymentAmount) {
      toast.error('กรุณากรอกจำนวนเงิน');
      return;
    }

    const amount = parseInt(paymentAmount);
    if (amount <= 0) {
      toast.error('จำนวนเงินต้องมากกว่า 0');
      return;
    }

    if (amount > selectedCustomer.debt) {
      toast.error('จำนวนเงินเกินยอดค้าง');
      return;
    }

    // Update customer debt
    const updatedCustomers = customers.map(c =>
      c.id === selectedCustomer.id
        ? { ...c, debt: c.debt - amount }
        : c
    );
    setCustomers(updatedCustomers);
    setSelectedCustomer({
      ...selectedCustomer,
      debt: selectedCustomer.debt - amount
    });

    toast.success(`บันทึกการชำระเงิน ${amount.toLocaleString()} บาท สำเร็จ`);
    setPaymentAmount('');
    setShowPaymentForm(false);
  };

  const handleAddCustomer = () => {
    toast.info('ฟีเจอร์เพิ่มลูกค้าใหม่กำลังพัฒนา');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground">จัดการลูกค้า</h1>
          <p className="text-muted-foreground mt-2">ดูข้อมูลลูกค้าและบันทึกการชำระเงิน</p>
        </div>
        <Button
          onClick={handleAddCustomer}
          className="h-12 px-6 text-base font-semibold bg-primary hover:bg-primary/90"
        >
          <Plus className="w-5 h-5 mr-2" />
          เพิ่มลูกค้า
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search */}
          <Card className="p-6 bg-card border border-border">
            <Input
              type="text"
              placeholder="ค้นหาชื่อหรือเบอร์โทร..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-base h-12"
            />
          </Card>

          {/* Customer List */}
          <div className="space-y-3">
            {filteredCustomers.map(customer => (
              <Card
                key={customer.id}
                onClick={() => setSelectedCustomer(customer)}
                className={`p-6 bg-card border-2 cursor-pointer transition-all ${
                  selectedCustomer?.id === customer.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{customer.name}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      {customer.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {customer.phone}
                        </div>
                      )}
                      {customer.address && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {customer.address}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-accent">{customer.debt.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">ค้างชำระ</p>
                  </div>
                </div>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>ซื้อ {customer.purchases} ครั้ง</span>
                  {customer.lastPurchase && <span>ซื้อล่าสุด {customer.lastPurchase}</span>}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Customer Details */}
        <div className="space-y-4">
          {selectedCustomer ? (
            <>
              {/* Customer Info */}
              <Card className="p-6 bg-card border border-border">
                <h2 className="text-lg font-semibold text-foreground mb-4">ข้อมูลลูกค้า</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground">ชื่อ</p>
                    <p className="text-base font-medium text-foreground">{selectedCustomer.name}</p>
                  </div>
                  {selectedCustomer.phone && (
                    <div>
                      <p className="text-xs text-muted-foreground">เบอร์โทร</p>
                      <p className="text-base font-medium text-foreground">{selectedCustomer.phone}</p>
                    </div>
                  )}
                  {selectedCustomer.address && (
                    <div>
                      <p className="text-xs text-muted-foreground">ที่อยู่</p>
                      <p className="text-base font-medium text-foreground">{selectedCustomer.address}</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Debt Summary */}
              <Card className="p-6 bg-accent text-accent-foreground border border-accent">
                <p className="text-sm opacity-80 mb-2">ยอดค้างชำระ</p>
                <p className="text-4xl font-bold">{selectedCustomer.debt.toLocaleString()}</p>
                <p className="text-sm opacity-80 mt-2">บาท</p>
              </Card>

              {/* Payment Form */}
              {!showPaymentForm ? (
                <Button
                  onClick={() => setShowPaymentForm(true)}
                  disabled={selectedCustomer.debt === 0}
                  className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90"
                >
                  บันทึกการชำระเงิน
                </Button>
              ) : (
                <Card className="p-6 bg-card border border-border">
                  <h3 className="font-semibold text-foreground mb-4">บันทึกการชำระเงิน</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground">จำนวนเงิน (บาท)</label>
                      <Input
                        type="number"
                        min="0"
                        max={selectedCustomer.debt}
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder="0"
                        className="h-10 text-base"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handlePayment}
                        className="flex-1 h-10 bg-primary hover:bg-primary/90"
                      >
                        ยืนยัน
                      </Button>
                      <Button
                        onClick={() => {
                          setShowPaymentForm(false);
                          setPaymentAmount('');
                        }}
                        variant="outline"
                        className="flex-1 h-10"
                      >
                        ยกเลิก
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Purchase History */}
              <Card className="p-6 bg-card border border-border">
                <h3 className="font-semibold text-foreground mb-4">ประวัติการซื้อ</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">ซื้อทั้งหมด {selectedCustomer.purchases} ครั้ง</p>
                  {selectedCustomer.lastPurchase && (
                    <p className="text-muted-foreground">ซื้อล่าสุด {selectedCustomer.lastPurchase}</p>
                  )}
                </div>
              </Card>
            </>
          ) : (
            <Card className="p-6 bg-muted/50 border border-border text-center">
              <p className="text-muted-foreground">เลือกลูกค้าเพื่อดูรายละเอียด</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
