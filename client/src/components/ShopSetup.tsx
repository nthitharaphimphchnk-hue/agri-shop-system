import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ShopSetupProps {
  onSetupComplete: () => void;
}

export default function ShopSetup({ onSetupComplete }: ShopSetupProps) {
  const [formData, setFormData] = useState({
    shopName: '',
    shopPhone: '',
    shopAddress: '',
    shopProvince: '',
    shopDistrict: '',
    shopSubDistrict: '',
    shopPostalCode: '',
  });

  const createShopMutation = trpc.shop.createShop.useMutation({
    onSuccess: () => {
      toast.success('ตั้งค่าร้านค้าสำเร็จ!');
      onSetupComplete();
    },
    onError: (error) => {
      toast.error(error.message || 'เกิดข้อผิดพลาด');
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.shopName.trim()) {
      toast.error('กรุณากรอกชื่อร้านค้า');
      return;
    }

    createShopMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">ยินดีต้อนรับสู่ Thai Smart</h1>
            <p className="text-gray-600">ตั้งค่าข้อมูลร้านค้าของคุณ</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Shop Name */}
            <div>
              <Label htmlFor="shopName" className="text-gray-700 font-semibold">
                ชื่อร้านค้า <span className="text-red-500">*</span>
              </Label>
              <Input
                id="shopName"
                name="shopName"
                placeholder="เช่น ร้านเกษตรชุมชน"
                value={formData.shopName}
                onChange={handleInputChange}
                className="mt-2"
                required
              />
            </div>

            {/* Shop Phone */}
            <div>
              <Label htmlFor="shopPhone" className="text-gray-700 font-semibold">
                เบอร์โทรศัพท์
              </Label>
              <Input
                id="shopPhone"
                name="shopPhone"
                placeholder="เช่น 08-1234-5678"
                value={formData.shopPhone}
                onChange={handleInputChange}
                className="mt-2"
              />
            </div>

            {/* Shop Address */}
            <div>
              <Label htmlFor="shopAddress" className="text-gray-700 font-semibold">
                ที่อยู่
              </Label>
              <Textarea
                id="shopAddress"
                name="shopAddress"
                placeholder="เช่น 123 หมู่ 5 ซ.สุขสวัสดิ์"
                value={formData.shopAddress}
                onChange={handleInputChange}
                className="mt-2"
                rows={3}
              />
            </div>

            {/* Location Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="shopProvince" className="text-gray-700 font-semibold">
                  จังหวัด
                </Label>
                <Input
                  id="shopProvince"
                  name="shopProvince"
                  placeholder="เช่น กรุงเทพมหานคร"
                  value={formData.shopProvince}
                  onChange={handleInputChange}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="shopDistrict" className="text-gray-700 font-semibold">
                  เขต/อำเภอ
                </Label>
                <Input
                  id="shopDistrict"
                  name="shopDistrict"
                  placeholder="เช่น ดุสิต"
                  value={formData.shopDistrict}
                  onChange={handleInputChange}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="shopSubDistrict" className="text-gray-700 font-semibold">
                  แขวง/ตำบล
                </Label>
                <Input
                  id="shopSubDistrict"
                  name="shopSubDistrict"
                  placeholder="เช่น ดุสิต"
                  value={formData.shopSubDistrict}
                  onChange={handleInputChange}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="shopPostalCode" className="text-gray-700 font-semibold">
                  รหัสไปรษณีย์
                </Label>
                <Input
                  id="shopPostalCode"
                  name="shopPostalCode"
                  placeholder="เช่น 10300"
                  value={formData.shopPostalCode}
                  onChange={handleInputChange}
                  className="mt-2"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={createShopMutation.isPending}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {createShopMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    กำลังตั้งค่า...
                  </>
                ) : (
                  'ตั้งค่าร้านค้า'
                )}
              </Button>
            </div>
          </form>

          {/* Info */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">💡 เคล็ดลับ:</span> คุณสามารถแก้ไขข้อมูลร้านค้าได้ตลอดเวลาในส่วนตั้งค่า
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
