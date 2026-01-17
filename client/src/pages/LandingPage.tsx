import { Link } from 'wouter';
import { Leaf, BarChart3, Users, TrendingUp, ShoppingCart, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {

  const features = [
    {
      icon: BarChart3,
      title: 'แดชบอร์ด',
      description: 'ดูข้อมูลการขายและสต็อกสินค้าแบบเรียลไทม์'
    },
    {
      icon: ShoppingCart,
      title: 'จัดการการขาย',
      description: 'บันทึกการขายและจัดการลูกค้าอย่างง่ายดาย'
    },
    {
      icon: Users,
      title: 'จัดการลูกค้า',
      description: 'เก็บข้อมูลลูกค้าและติดตามการชำระเงิน'
    },
    {
      icon: TrendingUp,
      title: 'รายงาน',
      description: 'วิเคราะห์ยอดขายและแนวโน้มธุรกิจ'
    },
    {
      icon: Zap,
      title: 'AI ผู้ช่วย',
      description: 'ถามคำถามกับ AI เพื่อได้คำตอบทันที'
    },
    {
      icon: Leaf,
      title: 'ง่ายต่อการใช้',
      description: 'ออกแบบมาสำหรับเจ้าของร้านเกษตร'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b border-blue-100 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Leaf className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Thai Smart</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">ไทย สมาร์ต</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/login">
              <Button
                variant="outline"
                className="border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-950"
              >
                เข้าสู่ระบบ
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                สมัครสมาชิก
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with Background Image */}
      <section 
        className="relative py-32 px-4 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/images/hero-agriculture-bg.jpg)',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40 dark:bg-black/50"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-6xl font-bold text-white mb-6 drop-shadow-lg">
              Thai Smart<br />
              <span className="text-3xl text-blue-100 drop-shadow-lg">ระบบช่วยดูแลร้าน ใช้ง่าย ไม่ต้องจำ</span>
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto drop-shadow-md">
              ระบบจัดการร้านที่ออกแบบมาสำหรับเจ้าของร้านเกษตรชุมชน ช่วยจัดการการขาย ลูกค้า และสต็อกสินค้าได้อย่างง่ายดาย
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 shadow-lg"
                >
                  เริ่มใช้งานฟรี
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-blue-50 px-8 shadow-lg font-semibold"
                >
                  เข้าสู่ระบบ
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 py-20">

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white dark:bg-slate-700 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-600 hover:shadow-md transition-shadow"
              >
                <Icon className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-3" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 rounded-lg p-12 text-center text-white">
          <h3 className="text-3xl font-bold mb-4">พร้อมที่จะเริ่มต้นกับ Thai Smart หรือยัง?</h3>
          <p className="text-lg mb-8 opacity-90">
            สมัครสมาชิกวันนี้และเริ่มจัดการร้านของคุณอย่างง่ายดาย
          </p>
          <Link href="/signup">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-slate-100 px-8 font-semibold"
            >
              สมัครสมาชิกฟรี
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 mt-20">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-slate-600 dark:text-slate-400">
          <p>&copy; 2025 Thai Smart (ไทย สมาร์ต). สงวนลิขสิทธิ์.</p>
        </div>
      </footer>
    </div>
  );
}
