import { useState } from 'react';
import { Link } from 'wouter';
import { Leaf, Eye, EyeOff, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [shopName, setShopName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      return;
    }

    setIsLoading(true);
    
    // จำลองการสมัครสมาชิก
    setTimeout(() => {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('shopName', shopName);
      window.location.href = '/';
      setIsLoading(false);
    }, 1000);
  };

  const passwordStrength = password.length > 0 ? Math.min((password.length / 8) * 100, 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Leaf className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Thai Smart</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">ไทย สมาร์ต</p>
            </div>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mt-4">สมัครสมาชิกใหม่</p>
        </div>

        {/* Sign Up Form */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
          <form onSubmit={handleSignUp} className="space-y-5">
            {/* Shop Name */}
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                ชื่อร้าน
              </label>
              <Input
                type="text"
                placeholder="ร้านเกษตรของฉัน"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                required
                className="w-full"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                อีเมล
              </label>
              <Input
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                รหัสผ่าน
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {/* Password Strength */}
              <div className="mt-2">
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      passwordStrength < 33
                        ? 'bg-red-500'
                        : passwordStrength < 66
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${passwordStrength}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                ยืนยันรหัสผ่าน
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
              </div>
            )}

            {/* Terms */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                required
                className="w-4 h-4 rounded border-slate-300 mt-1"
              />
              <label htmlFor="terms" className="text-sm text-slate-600 dark:text-slate-400">
                ฉันยอมรับ{' '}
                <a href="#" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                  เงื่อนไขการใช้บริการ
                </a>{' '}
                และ{' '}
                <a href="#" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                  นโยบายความเป็นส่วนตัว
                </a>
              </label>
            </div>

            {/* Sign Up Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2"
            >
              {isLoading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300 dark:border-slate-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-slate-800 text-slate-500">หรือ</span>
            </div>
          </div>

          {/* Login Link */}
          <p className="text-center text-slate-600 dark:text-slate-400">
            มีบัญชีอยู่แล้ว?{' '}
            <Link href="/login">
              <a className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold">
                เข้าสู่ระบบ
              </a>
            </Link>
          </p>
        </div>

        {/* Features */}
        <div className="mt-6 space-y-3">
          {['ฟรีตลอดไป', 'ไม่ต้องใส่บัตรเครดิต', 'เข้าใช้งานได้ทันที'].map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Check className="w-5 h-5 text-green-600" />
              {feature}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
