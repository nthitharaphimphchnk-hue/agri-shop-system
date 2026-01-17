import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { Label } from '@/components/ui/label';

interface SalesItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
  total: number;
}

export default function SalesForm() {
  const [items, setItems] = useState<SalesItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | 'credit'>('cash');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch data from API
  const { data: customers = [] } = trpc.customer.list.useQuery();
  const { data: products = [] } = trpc.product.list.useQuery();
  const createSaleMutation = trpc.sales.create.useMutation();

  // Filter products by search term
  const filteredProducts = products.filter(p =>
    p.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addItem = (product: typeof products[0]) => {
    const sellingPrice = typeof product.sellingPrice === 'string' 
      ? parseFloat(product.sellingPrice) 
      : (product.sellingPrice || 0);

    const existingItem = items.find(i => i.id === product.id.toString());
    if (existingItem) {
      setItems(items.map(i =>
        i.id === product.id.toString()
          ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * sellingPrice }
          : i
      ));
    } else {
      setItems([...items, {
        id: product.id.toString(),
        name: product.productName,
        quantity: 1,
        unit: product.productUnit || 'ชิ้น',
        price: sellingPrice,
        total: sellingPrice
      }]);
    }
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems(items.map(i =>
      i.id === id
        ? { ...i, quantity, total: quantity * i.price }
        : i
    ));
  };

  const updatePrice = (id: string, price: number) => {
    setItems(items.map(i =>
      i.id === id
        ? { ...i, price, total: i.quantity * price }
        : i
    ));
  };

  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

  const handleSave = async () => {
    if (!selectedCustomer) {
      toast.error('กรุณาเลือกลูกค้า');
      return;
    }

    if (items.length === 0) {
      toast.error('กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ');
      return;
    }

    setIsSubmitting(true);
    try {
      const saleData = {
        customerId: parseInt(selectedCustomer),
        paymentMethod: paymentMethod,
        totalAmount: totalAmount.toString(),
        paidAmount: paymentMethod === 'credit' ? '0' : totalAmount.toString(),
        debtAmount: paymentMethod === 'credit' ? totalAmount.toString() : '0',
        saleDate: new Date(),
        items: items.map(item => ({
          productId: parseInt(item.id),
          quantity: item.quantity.toString(),
          unitPrice: item.price.toString(),
          totalPrice: item.total.toString()
        }))
      };

      await createSaleMutation.mutateAsync(saleData);
      
      toast.success(`บันทึกการขาย ${totalAmount.toLocaleString('th-TH')} บาท สำเร็จ`);
      
      // Reset form
      setItems([]);
      setSelectedCustomer('');
      setPaymentMethod('cash');
      setSearchTerm('');
    } catch (error) {
      toast.error('เกิดข้อผิดพลาด: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground">ระบบขาย</h1>
        <p className="text-muted-foreground mt-2">บันทึกการขายสินค้า</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Selection */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search Products */}
          <Card className="p-6 bg-card border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">ค้นหาสินค้า</h2>
            <Input
              type="text"
              placeholder="ค้นหาชื่อสินค้า..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-base h-12"
            />
          </Card>

          {/* Product List */}
          <Card className="p-6 bg-card border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">สินค้า</h2>
            {filteredProducts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">ไม่พบสินค้า</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredProducts.map(product => {
                  const sellingPrice = typeof product.sellingPrice === 'string' 
                    ? parseFloat(product.sellingPrice) 
                    : (product.sellingPrice || 0);
                  
                  return (
                    <button
                      key={product.id}
                      onClick={() => addItem(product)}
                      className="p-4 text-left border border-border rounded-lg hover:bg-muted/50 hover:border-primary transition-all"
                    >
                      <p className="font-medium text-foreground">{product.productName}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {sellingPrice.toLocaleString('th-TH')} บาท/{product.productUnit || 'ชิ้น'}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Sales Items */}
          <Card className="p-6 bg-card border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">รายการสินค้า</h2>
            {items.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">ยังไม่มีสินค้าในรายการ</p>
            ) : (
              <div className="space-y-3">
                {items.map(item => (
                  <div key={item.id} className="p-4 bg-muted/50 rounded-lg border border-border">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium text-foreground">{item.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          ราคา: {item.price.toLocaleString('th-TH')} บาท/{item.unit}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 hover:bg-red-100 rounded text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground">จำนวน</label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">ราคา</label>
                        <Input
                          type="number"
                          min="0"
                          value={item.price}
                          onChange={(e) => updatePrice(item.id, parseFloat(e.target.value) || 0)}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-right font-semibold text-foreground">
                        รวม: {item.total.toLocaleString('th-TH')} บาท
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Customer Selection */}
          <Card className="p-6 bg-card border border-border">
            <Label className="text-base font-semibold mb-3 block">เลือกลูกค้า</Label>
            <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="เลือกลูกค้า" />
              </SelectTrigger>
              <SelectContent>
                {customers.map(customer => (
                  <SelectItem key={customer.id} value={customer.id.toString()}>
                    {customer.customerName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>

          {/* Payment Method */}
          <Card className="p-6 bg-card border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">วิธีชำระเงิน</h2>
            <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
              <SelectTrigger className="h-12 text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">เงินสด</SelectItem>
                <SelectItem value="transfer">โอนเงิน</SelectItem>
                <SelectItem value="credit">เชื่อ</SelectItem>
              </SelectContent>
            </Select>
          </Card>

          {/* Total and Actions */}
          <Card className="p-6 bg-primary/5 border border-primary/20">
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-2">ยอดรวม</p>
              <p className="text-4xl font-bold text-primary">{totalAmount.toLocaleString('th-TH')}</p>
              <p className="text-sm text-muted-foreground">บาท</p>
            </div>
            <Button
              onClick={handleSave}
              disabled={isSubmitting || items.length === 0}
              className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 mr-2" />
                  บันทึกการขาย
                </>
              )}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
