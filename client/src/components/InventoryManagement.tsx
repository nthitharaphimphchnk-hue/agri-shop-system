import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, AlertTriangle, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { printSingleBarcode, printBarcodes, BarcodeItem } from '@/lib/barcode';

/**
 * Design Philosophy: Rural Warmth
 * - Simple stock tracking
 * - Low stock alerts
 * - Easy to understand layout
 */

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  unit: string;
  stock: number;
  warningLevel: number;
}

export default function InventoryManagement() {
  const [products, setProducts] = useState<Product[]>([
    { id: '1', name: 'ปุ๋ยยูเรีย (ถุง 25 กก.)', sku: 'UREA-25KG', category: 'ปุ๋ย', price: 300, unit: 'ถุง', stock: 3, warningLevel: 5 },
    { id: '2', name: 'ปุ๋ยสูตร 16-16-16 (ถุง 25 กก.)', sku: 'NPK-16-25KG', category: 'ปุ๋ย', price: 350, unit: 'ถุง', stock: 8, warningLevel: 5 },
    { id: '3', name: 'ยาฆ่าแมลง (ขวด 500 มล.)', sku: 'PEST-500ML', category: 'ยา', price: 150, unit: 'ขวด', stock: 2, warningLevel: 5 },
    { id: '4', name: 'เครื่องพ่นยา (ตัว)', sku: 'SPRAY-GUN', category: 'เครื่องมือ', price: 800, unit: 'ตัว', stock: 1, warningLevel: 2 },
    { id: '5', name: 'ท่อน้ำ (เมตร)', sku: 'HOSE-METER', category: 'อะไหล่', price: 50, unit: 'เมตร', stock: 10, warningLevel: 20 }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editStock, setEditStock] = useState('');

  const categories = ['ปุ๋ย', 'ยา', 'เครื่องมือ', 'อะไหล่'];

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockProducts = products.filter(p => p.stock <= p.warningLevel);

  const handleUpdateStock = () => {
    if (!selectedProduct || !editStock) {
      toast.error('กรุณากรอกจำนวน');
      return;
    }

    const newStock = parseInt(editStock);
    if (newStock < 0) {
      toast.error('จำนวนต้องไม่ติดลบ');
      return;
    }

    const updatedProducts = products.map(p =>
      p.id === selectedProduct.id
        ? { ...p, stock: newStock }
        : p
    );
    setProducts(updatedProducts);
    setSelectedProduct({
      ...selectedProduct,
      stock: newStock
    });

    toast.success('อัปเดตสต็อกสำเร็จ');
    setEditStock('');
  };

  const handleAddProduct = () => {
    toast.info('ฟีเจอร์เพิ่มสินค้าใหม่กำลังพัฒนา');
  };

  const handlePrintBarcode = (product: Product) => {
    const barcodeItem: BarcodeItem = {
      id: product.id,
      name: product.name,
      sku: product.sku,
      price: product.price,
      unit: product.unit
    };
    printSingleBarcode(barcodeItem);
    toast.success('เปิดหน้าต่างพิมพ์บาร์โค้ด');
  };

  const handlePrintAllBarcodes = () => {
    if (filteredProducts.length === 0) {
      toast.error('ไม่มีสินค้าให้พิมพ์');
      return;
    }
    const barcodeItems: BarcodeItem[] = filteredProducts.map(p => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      price: p.price,
      unit: p.unit
    }));
    printBarcodes(barcodeItems);
    toast.success('เปิดหน้าต่างพิมพ์บาร์โค้ด');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground">จัดการสินค้า</h1>
          <p className="text-muted-foreground mt-2">ตรวจสอบและอัปเดตสต็อกสินค้า</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handlePrintAllBarcodes}
            className="h-12 px-6 text-base font-semibold bg-secondary hover:bg-secondary/90"
          >
            <Printer className="w-5 h-5 mr-2" />
            พิมพ์บาร์โค้ด
          </Button>
          <Button
            onClick={handleAddProduct}
            className="h-12 px-6 text-base font-semibold bg-primary hover:bg-primary/90"
          >
            <Plus className="w-5 h-5 mr-2" />
            เพิ่มสินค้า
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search */}
          <Card className="p-6 bg-card border border-border">
            <Input
              type="text"
              placeholder="ค้นหาชื่อสินค้าหรือหมวด..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-base h-12"
            />
          </Card>

          {/* Product List */}
          <div className="space-y-3">
            {filteredProducts.map(product => {
              const isLowStock = product.stock <= product.warningLevel;
              return (
                <Card
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className={`p-6 bg-card border-2 cursor-pointer transition-all ${
                    selectedProduct?.id === product.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  } ${isLowStock ? 'bg-yellow-50' : ''}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-foreground">{product.name}</h3>
                        {isLowStock && (
                          <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{product.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{product.stock}</p>
                      <p className="text-xs text-muted-foreground">{product.unit}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">ราคา: {product.price.toLocaleString()} บาท</span>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      isLowStock
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {isLowStock ? 'ใกล้หมด' : 'พอ'}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Low Stock Alert */}
          {lowStockProducts.length > 0 && (
            <Card className="p-6 bg-yellow-50 border border-yellow-200">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <h2 className="text-lg font-semibold text-yellow-900">สินค้าใกล้หมด</h2>
              </div>
              <div className="space-y-2">
                {lowStockProducts.map(product => (
                  <div key={product.id} className="text-sm text-yellow-800">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs opacity-70">คงเหลือ {product.stock} {product.unit}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Product Details */}
          {selectedProduct ? (
            <>
              <Card className="p-6 bg-card border border-border">
                <h2 className="text-lg font-semibold text-foreground mb-4">ข้อมูลสินค้า</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground">ชื่อสินค้า</p>
                    <p className="text-base font-medium text-foreground">{selectedProduct.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">หมวด</p>
                    <p className="text-base font-medium text-foreground">{selectedProduct.category}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">ราคา</p>
                    <p className="text-base font-medium text-foreground">{selectedProduct.price.toLocaleString()} บาท/{selectedProduct.unit}</p>
                  </div>
                </div>
              </Card>

              {/* Stock Update */}
              <Card className="p-6 bg-card border border-border">
                <h3 className="font-semibold text-foreground mb-4">อัปเดตสต็อก</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">คงเหลือปัจจุบัน</p>
                    <p className="text-2xl font-bold text-primary">{selectedProduct.stock} {selectedProduct.unit}</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">จำนวนใหม่</label>
                    <Input
                      type="number"
                      min="0"
                      value={editStock}
                      onChange={(e) => setEditStock(e.target.value)}
                      placeholder="0"
                      className="h-10 text-base"
                    />
                  </div>
                  <Button
                    onClick={handleUpdateStock}
                    className="w-full h-10 bg-primary hover:bg-primary/90"
                  >
                    อัปเดต
                  </Button>
                  <Button
                    onClick={() => handlePrintBarcode(selectedProduct)}
                    variant="outline"
                    className="w-full h-10"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    พิมพ์บาร์โค้ด
                  </Button>
                </div>
              </Card>

              {/* Barcode Info */}
              <Card className="p-6 bg-muted/50 border border-border">
                <h3 className="font-semibold text-foreground mb-2">รหัสสินค้า</h3>
                <p className="text-lg font-mono text-primary">{selectedProduct.sku}</p>
                <p className="text-xs text-muted-foreground mt-2">ใช้สำหรับบาร์โค้ด</p>
              </Card>

              {/* Warning Level */}
              <Card className="p-6 bg-muted/50 border border-border">
                <h3 className="font-semibold text-foreground mb-2">ระดับเตือน</h3>
                <p className="text-2xl font-bold text-accent">{selectedProduct.warningLevel}</p>
                <p className="text-xs text-muted-foreground mt-2">เตือนเมื่อสต็อกต่ำกว่า</p>
              </Card>
            </>
          ) : (
            <Card className="p-6 bg-muted/50 border border-border text-center">
              <p className="text-muted-foreground">เลือกสินค้าเพื่อดูรายละเอียด</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
