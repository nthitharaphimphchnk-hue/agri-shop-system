import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * Design Philosophy: Rural Warmth
 * - Easy to understand reports
 * - Visual charts for better understanding
 * - Profit and loss analysis
 */

export default function Reports() {
  // Sample data
  const dailySalesData = [
    { date: '10 ม.ค.', sales: 8500, profit: 2550 },
    { date: '11 ม.ค.', sales: 9200, profit: 2760 },
    { date: '12 ม.ค.', sales: 7800, profit: 2340 },
    { date: '13 ม.ค.', sales: 10200, profit: 3060 },
    { date: '14 ม.ค.', sales: 9800, profit: 2940 },
    { date: '15 ม.ค.', sales: 11100, profit: 3330 }
  ];

  const topSellingProducts = [
    { name: 'ปุ๋ยยูเรีย', sales: 45000, profit: 13500 },
    { name: 'ปุ๋ยสูตร 16-16-16', sales: 38500, profit: 11550 },
    { name: 'ยาฆ่าแมลง', sales: 28000, profit: 8400 },
    { name: 'เครื่องพ่นยา', sales: 24000, profit: 7200 },
    { name: 'ท่อน้ำ', sales: 18500, profit: 5550 }
  ];

  const monthlySummary = {
    totalSales: 245000,
    totalProfit: 73500,
    profitMargin: 30,
    transactions: 156,
    averageTransaction: 1570
  };

  const COLORS = ['#6B8E23', '#8BA82E', '#5A7A1F', '#4A6B1F', '#3A5C1B'];

  const pieData = topSellingProducts.map(p => ({
    name: p.name,
    value: p.sales
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground">รายงาน</h1>
        <p className="text-muted-foreground mt-2">วิเคราะห์ผลการขายและกำไร</p>
      </div>

      {/* Monthly Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-6 bg-card border border-border">
          <p className="text-xs text-muted-foreground mb-2">ยอดขายเดือนนี้</p>
          <p className="text-3xl font-bold text-primary">{monthlySummary.totalSales.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-2">บาท</p>
        </Card>

        <Card className="p-6 bg-card border border-border">
          <p className="text-xs text-muted-foreground mb-2">กำไรเดือนนี้</p>
          <p className="text-3xl font-bold text-secondary">{monthlySummary.totalProfit.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-2">บาท</p>
        </Card>

        <Card className="p-6 bg-card border border-border">
          <p className="text-xs text-muted-foreground mb-2">อัตรากำไร</p>
          <p className="text-3xl font-bold text-accent">{monthlySummary.profitMargin}%</p>
          <p className="text-xs text-muted-foreground mt-2">ของยอดขาย</p>
        </Card>

        <Card className="p-6 bg-card border border-border">
          <p className="text-xs text-muted-foreground mb-2">จำนวนรายการ</p>
          <p className="text-3xl font-bold text-primary">{monthlySummary.transactions}</p>
          <p className="text-xs text-muted-foreground mt-2">ครั้ง</p>
        </Card>

        <Card className="p-6 bg-card border border-border">
          <p className="text-xs text-muted-foreground mb-2">เฉลี่ยต่อรายการ</p>
          <p className="text-3xl font-bold text-secondary">{monthlySummary.averageTransaction.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-2">บาท</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Sales Chart */}
        <Card className="p-6 bg-card border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">ยอดขายรายวัน</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailySalesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E0" />
              <XAxis dataKey="date" stroke="#7A7A7A" />
              <YAxis stroke="#7A7A7A" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E8E0' }}
                formatter={(value) => value.toLocaleString()}
              />
              <Legend />
              <Bar dataKey="sales" fill="#6B8E23" name="ยอดขาย" />
              <Bar dataKey="profit" fill="#E8A76A" name="กำไร" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Top Selling Products */}
        <Card className="p-6 bg-card border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">สินค้าทำเงิน (Top 5)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${(value / 1000).toFixed(0)}k`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => value.toLocaleString()} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Top Products Table */}
      <Card className="p-6 bg-card border border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">สินค้าทำเงิน (รายละเอียด)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-foreground">สินค้า</th>
                <th className="text-right py-3 px-4 font-semibold text-foreground">ยอดขาย</th>
                <th className="text-right py-3 px-4 font-semibold text-foreground">กำไร</th>
                <th className="text-right py-3 px-4 font-semibold text-foreground">อัตรา</th>
              </tr>
            </thead>
            <tbody>
              {topSellingProducts.map((product, idx) => (
                <tr key={idx} className="border-b border-border hover:bg-muted/50">
                  <td className="py-3 px-4 text-foreground">{product.name}</td>
                  <td className="py-3 px-4 text-right font-medium text-primary">{product.sales.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-medium text-secondary">{product.profit.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-medium text-accent">
                    {((product.profit / product.sales) * 100).toFixed(0)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-green-50 border border-green-200">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-green-900">สินค้าดีที่สุด</h3>
          </div>
          <p className="text-lg font-bold text-green-900">ปุ๋ยยูเรีย</p>
          <p className="text-sm text-green-700 mt-1">ยอดขาย 45,000 บาท (18% ของรวม)</p>
        </Card>

        <Card className="p-6 bg-yellow-50 border border-yellow-200">
          <div className="flex items-center gap-3 mb-3">
            <TrendingDown className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-yellow-900">ต้องการส่งเสริม</h3>
          </div>
          <p className="text-lg font-bold text-yellow-900">ท่อน้ำ</p>
          <p className="text-sm text-yellow-700 mt-1">ยอดขาย 18,500 บาท (8% ของรวม)</p>
        </Card>
      </div>
    </div>
  );
}
