import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GripVertical, Trash2, Plus, Save, Palette } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Design Philosophy: Rural Warmth
 * - Manage product shortcuts with color coding
 * - Drag and drop reordering
 * - Easy to customize and categorize
 */

interface Product {
  id: string;
  name: string;
  unit: string;
  price: number;
}

interface ShortcutItem {
  productId: string;
  color: string;
}

interface ProductShortcutsManagerProps {
  products: Product[];
  onSave: (shortcuts: ShortcutItem[]) => void;
}

const COLOR_OPTIONS = [
  { value: 'bg-primary', label: 'น้ำเงิน', textColor: 'text-primary-foreground' },
  { value: 'bg-red-500', label: 'แดง', textColor: 'text-white' },
  { value: 'bg-green-500', label: 'เขียว', textColor: 'text-white' },
  { value: 'bg-yellow-500', label: 'เหลือง', textColor: 'text-black' },
  { value: 'bg-purple-500', label: 'ม่วง', textColor: 'text-white' },
  { value: 'bg-orange-500', label: 'ส้ม', textColor: 'text-white' },
  { value: 'bg-pink-500', label: 'ชมพู', textColor: 'text-white' },
  { value: 'bg-cyan-500', label: 'ฟ้า', textColor: 'text-white' }
];

export default function ProductShortcutsManager({ products, onSave }: ProductShortcutsManagerProps) {
  const [shortcuts, setShortcuts] = useState<ShortcutItem[]>(() => {
    const saved = localStorage.getItem('agri_product_shortcuts_with_colors');
    if (saved) {
      return JSON.parse(saved);
    }
    // Migration from old format
    const oldSaved = localStorage.getItem('agri_product_shortcuts');
    if (oldSaved) {
      const oldShortcuts = JSON.parse(oldSaved);
      return oldShortcuts.map((id: string) => ({ productId: id, color: 'bg-primary' }));
    }
    return [];
  });
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [editingColorIndex, setEditingColorIndex] = useState<number | null>(null);

  const shortcutProducts = shortcuts
    .map(item => {
      const product = products.find(p => p.id === item.productId);
      return product ? { ...product, color: item.color } : null;
    })
    .filter(Boolean) as (Product & { color: string })[];

  const availableProducts = products.filter(p => !shortcuts.some(s => s.productId === p.id));

  const handleAddShortcut = () => {
    if (!selectedProductId) {
      toast.error('กรุณาเลือกสินค้า');
      return;
    }
    if (shortcuts.some(s => s.productId === selectedProductId)) {
      toast.error('สินค้านี้มีอยู่แล้วในปุ่มลัด');
      return;
    }
    setShortcuts([...shortcuts, { productId: selectedProductId, color: 'bg-primary' }]);
    setSelectedProductId('');
  };

  const handleRemoveShortcut = (index: number) => {
    setShortcuts(shortcuts.filter((_, i) => i !== index));
  };

  const handleChangeColor = (index: number, newColor: string) => {
    const newShortcuts = [...shortcuts];
    newShortcuts[index].color = newColor;
    setShortcuts(newShortcuts);
    setEditingColorIndex(null);
  };

  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (draggedItem === null || draggedItem === index) return;

    const newShortcuts = [...shortcuts];
    const draggedShortcut = newShortcuts[draggedItem];
    newShortcuts.splice(draggedItem, 1);
    newShortcuts.splice(index, 0, draggedShortcut);

    setShortcuts(newShortcuts);
    setDraggedItem(null);
  };

  const handleSave = () => {
    localStorage.setItem('agri_product_shortcuts_with_colors', JSON.stringify(shortcuts));
    // Also update old format for backward compatibility
    localStorage.setItem('agri_product_shortcuts', JSON.stringify(shortcuts.map(s => s.productId)));
    onSave(shortcuts);
    toast.success('บันทึกปุ่มลัดสำเร็จ');
  };

  const getColorOption = (colorValue: string) => {
    return COLOR_OPTIONS.find(c => c.value === colorValue) || COLOR_OPTIONS[0];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground">จัดการปุ่มลัดสินค้า</h1>
        <p className="text-muted-foreground mt-2">จัดเรียงลำดับและกำหนดสีสินค้าที่ขายบ่อยตามความต้องการของคุณ</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add New Shortcut */}
        <Card className="p-6 bg-card border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">เพิ่มปุ่มลัดใหม่</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">เลือกสินค้า</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
              >
                <option value="">-- เลือกสินค้า --</option>
                {availableProducts.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.price} บาท/{product.unit})
                  </option>
                ))}
              </select>
            </div>
            <Button
              onClick={handleAddShortcut}
              className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90"
            >
              <Plus className="w-5 h-5 mr-2" />
              เพิ่มปุ่มลัด
            </Button>
          </div>
        </Card>

        {/* Current Shortcuts */}
        <Card className="p-6 bg-card border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">ปุ่มลัดปัจจุบัน</h2>
          <p className="text-sm text-muted-foreground mb-4">
            ({shortcutProducts.length} รายการ) - ลากเพื่อจัดเรียงลำดับ
          </p>
          {shortcutProducts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">ยังไม่มีปุ่มลัด</p>
          ) : (
            <div className="space-y-2">
              {shortcutProducts.map((product, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(index)}
                  className={`p-3 border border-border rounded-lg flex items-center gap-3 cursor-move transition-all ${
                    draggedItem === index ? 'bg-primary/20 border-primary' : 'bg-muted/50 hover:bg-muted'
                  }`}
                >
                  <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {product.price.toLocaleString()} บาท/{product.unit}
                    </p>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setEditingColorIndex(editingColorIndex === index ? null : index)}
                      className={`p-2 rounded transition-colors flex-shrink-0 ${product.color} text-white`}
                      title="เปลี่ยนสี"
                    >
                      <Palette className="w-4 h-4" />
                    </button>
                    {editingColorIndex === index && (
                      <div className="absolute right-0 top-full mt-2 bg-card border border-border rounded-lg p-3 z-50 shadow-lg">
                        <p className="text-xs font-semibold text-foreground mb-2">เลือกสี:</p>
                        <div className="grid grid-cols-2 gap-2">
                          {COLOR_OPTIONS.map(color => (
                            <button
                              key={color.value}
                              onClick={() => handleChangeColor(index, color.value)}
                              className={`px-3 py-2 rounded text-sm font-medium transition-all ${
                                product.color === color.value
                                  ? `${color.value} ${color.textColor} ring-2 ring-offset-2 ring-foreground`
                                  : `${color.value} ${color.textColor} opacity-70 hover:opacity-100`
                              }`}
                            >
                              {color.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveShortcut(index)}
                    className="p-2 hover:bg-red-100 rounded text-red-600 transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex gap-3">
        <Button
          onClick={handleSave}
          className="flex-1 h-12 text-base font-semibold bg-primary hover:bg-primary/90"
        >
          <Save className="w-5 h-5 mr-2" />
          บันทึกการจัดเรียง
        </Button>
      </div>

      {/* Preview */}
      {shortcutProducts.length > 0 && (
        <Card className="p-6 bg-primary/5 border border-primary/20">
          <h2 className="text-lg font-semibold text-foreground mb-4">ตัวอย่างปุ่มลัด</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {shortcutProducts.map((product, index) => (
              <div
                key={index}
                className={`p-3 text-left ${product.color} text-white rounded-lg font-medium`}
              >
                <p className="text-sm font-semibold">{product.name}</p>
                <p className="text-xs opacity-90 mt-1">
                  {product.price.toLocaleString()} บาท/{product.unit}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Color Legend */}
      <Card className="p-6 bg-card border border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">ตัวอย่างสี</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {COLOR_OPTIONS.map(color => (
            <div key={color.value} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded ${color.value}`}></div>
              <span className="text-sm text-foreground">{color.label}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
