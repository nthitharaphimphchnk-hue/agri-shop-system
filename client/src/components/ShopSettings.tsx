import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useShop } from '@/contexts/ShopContext';
import { Save, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import type { ShopSettings } from '@/contexts/ShopContext';

/**
 * Design Philosophy: Rural Warmth
 * - Simple shop settings form
 * - Easy to edit and save
 * - Clear labels and input fields
 */

export default function ShopSettings() {
  const { shopSettings, updateShopSettings } = useShop();
  const [formData, setFormData] = useState(shopSettings);
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error('กรุณากรอกชื่อร้าน');
      return;
    }

    if (!formData.phone.trim()) {
      toast.error('กรุณากรอกเบอร์โทรศัพท์');
      return;
    }

    updateShopSettings(formData);
    setIsEditing(false);
    toast.success('บันทึกข้อมูลร้านสำเร็จ');
  };

  const handleReset = () => {
    setFormData(shopSettings);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground">ตั้งค่าร้านค้า</h1>
        <p className="text-muted-foreground mt-2">แก้ไขข้อมูลร้านสำหรับใบเสร็จและรายงาน</p>
      </div>

      {/* Shop Settings Form */}
      <Card className="p-8 bg-card border border-border max-w-2xl">
        <div className="space-y-6">
          {/* Shop Name */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">
              ชื่อร้าน
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              disabled={!isEditing}
              placeholder="กรอกชื่อร้าน"
              className="h-12 text-base"
            />
            <p className="text-xs text-muted-foreground mt-2">
              ชื่อนี้จะปรากฏในใบเสร็จและรายงาน
            </p>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">
              ที่อยู่
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              disabled={!isEditing}
              placeholder="กรอกที่อยู่ร้าน"
              className="w-full p-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted/50 disabled:text-muted-foreground"
              rows={4}
            />
            <p className="text-xs text-muted-foreground mt-2">
              ตัวอย่าง: บ้าน 123 ม.1 ตำบลสุขสวัสดิ์ อำเภอเมือง จังหวัดนครสวรรค์
            </p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">
              เบอร์โทรศัพท์
            </label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              disabled={!isEditing}
              placeholder="กรอกเบอร์โทรศัพท์"
              className="h-12 text-base"
            />
            <p className="text-xs text-muted-foreground mt-2">
              ตัวอย่าง: 081-234-5678
            </p>
          </div>

          {/* Receipt Footer */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">
              หมายเหตุท้ายใบเสร็จ
            </label>
            <textarea
              value={formData.receiptFooter || ''}
              onChange={(e) => handleChange('receiptFooter', e.target.value)}
              disabled={!isEditing}
              placeholder="กรุณาใส่หมายเหตุท้ายใบเสร็จ"
              className="w-full p-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted/50 disabled:text-muted-foreground"
              rows={3}
            />
            <p className="text-xs text-muted-foreground mt-2">
              ตัวอย่าง: ขอบคุณที่ใช้บริการ หรือ เงื่อไขการรับประกัน
            </p>
          </div>

          {/* Preview */}
          <div className="p-4 bg-muted/50 rounded-lg border border-border">
            <p className="text-xs text-muted-foreground mb-3">ตัวอย่างใบเสร็จ</p>
            <div className="text-center space-y-2 border-b border-border pb-3 mb-3">
              <p className="font-bold text-foreground">{formData.name}</p>
              <p className="text-xs text-foreground whitespace-pre-wrap">{formData.address}</p>
              <p className="text-xs text-foreground">{formData.phone}</p>
            </div>
            {formData.receiptFooter && (
              <div className="text-center">
                <p className="text-xs text-foreground whitespace-pre-wrap">{formData.receiptFooter}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-border">
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                className="flex-1 h-12 text-base font-semibold bg-primary hover:bg-primary/90"
              >
                แก้ไขข้อมูล
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleSave}
                  className="flex-1 h-12 text-base font-semibold bg-primary hover:bg-primary/90"
                >
                  <Save className="w-5 h-5 mr-2" />
                  บันทึก
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="flex-1 h-12 text-base font-semibold border-2 border-primary text-primary hover:bg-primary/10"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  ยกเลิก
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Info Card */}
      <Card className="p-6 bg-blue-50 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">💡 ข้อมูลเพิ่มเติม</h3>
        <p className="text-sm text-blue-800">
          ข้อมูลที่คุณแก้ไขที่นี่จะถูกใช้ในใบเสร็จและรายงาน ข้อมูลจะถูกบันทึกไว้ในเครื่องของคุณ
        </p>
      </Card>
    </div>
  );
}
