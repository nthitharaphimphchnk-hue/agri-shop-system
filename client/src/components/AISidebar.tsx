import React, { useState, useRef, useEffect } from 'react';
import { X, Send, MessageCircle } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface AISidebarProps {
  sales?: any[];
  customers?: any[];
  products?: any[];
  isDarkMode?: boolean;
}

interface LowStockAlert {
  id: string;
  productName: string;
  currentStock: number;
  unit: string;
  timestamp: Date;
}

const CHAT_HISTORY_KEY = 'aiSidebarChatHistory';

const saveChatHistory = (messages: Message[]) => {
  try {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
  } catch (error) {
    console.error('Failed to save chat history:', error);
  }
};

const loadChatHistory = (): Message[] => {
  try {
    const saved = localStorage.getItem(CHAT_HISTORY_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load chat history:', error);
  }
  return [];
};

const clearChatHistory = () => {
  try {
    localStorage.removeItem(CHAT_HISTORY_KEY);
  } catch (error) {
    console.error('Failed to clear chat history:', error);
  }
};

export const AISidebar: React.FC<AISidebarProps> = ({
  sales: propSales,
  customers: propCustomers,
  products: propProducts,
  isDarkMode: propIsDarkMode,
}) => {
  // ดึงข้อมูลจาก props หรือ localStorage
  const [sales, setSales] = useState<any[]>(propSales || []);
  const [customers, setCustomers] = useState<any[]>(propCustomers || []);
  const [products, setProducts] = useState<any[]>(propProducts || []);
  const isDarkMode = propIsDarkMode !== undefined ? propIsDarkMode : false;

  // โหลดข้อมูลจาก localStorage ถ้าไม่มี props
  useEffect(() => {
    if (!propSales) {
      const saved = localStorage.getItem('sales');
      if (saved) setSales(JSON.parse(saved));
    }
    if (!propCustomers) {
      const saved = localStorage.getItem('customers');
      if (saved) setCustomers(JSON.parse(saved));
    }
    if (!propProducts) {
      const saved = localStorage.getItem('products');
      if (saved) setProducts(JSON.parse(saved));
    }
  }, [propSales, propCustomers, propProducts]);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => loadChatHistory());
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lowStockAlerts, setLowStockAlerts] = useState<LowStockAlert[]>([]);
  const [showAlerts, setShowAlerts] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const suggestionsList = [
    'สรุปวันนี้',
    'ดูลูกหนี้',
    'ของใกล้หมด',
    'ยอดเดือนนี้',
    'ขายดี',
    'ลูกค้าใหม่',
    'วิธีการคิด',
    'วิธีการขาย',
    'วิธีตรวจสอบสินค้า',
    'วิธีจัดการลูกค้า',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // บันทึกประวัติเมื่อ messages เปลี่ยน
  useEffect(() => {
    if (messages.length > 0) {
      saveChatHistory(messages);
    }
  }, [messages]);

  // ฟิลเตอร์ Suggestions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (value.trim().length > 0) {
      const filtered = suggestionsList.filter((suggestion) =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    }
  };

  // เลือก Suggestion
  const handleSelectSuggestion = (suggestion: string) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
    setFilteredSuggestions([]);
  };

  // ตรวจสอบสินค้าใกล้หมด
  const checkLowStockProducts = () => {
    const lowStockThreshold = 5;
    const newAlerts: LowStockAlert[] = [];

    products.forEach((product) => {
      if (product.stock && product.stock <= lowStockThreshold && product.stock > 0) {
        const existingAlert = lowStockAlerts.find((a) => a.id === product.id);
        if (!existingAlert) {
          newAlerts.push({
            id: product.id,
            productName: product.name,
            currentStock: product.stock,
            unit: product.unit || 'ชิ้น',
            timestamp: new Date(),
          });
        }
      }
    });

    if (newAlerts.length > 0) {
      setLowStockAlerts((prev) => [...prev, ...newAlerts]);
    }
  };

  // ตั้ง interval สำหรับตรวจสอบสินค้าใกล้หมด
  useEffect(() => {
    checkLowStockProducts();
    checkIntervalRef.current = setInterval(() => {
      checkLowStockProducts();
    }, 30000);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [products, lowStockAlerts]);

  // ลบแจ้งเตือน
  const dismissAlert = (alertId: string) => {
    setLowStockAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  // ลบแจ้งเตือนทั้งหมด
  const dismissAllAlerts = () => {
    setLowStockAlerts([]);
  };

  // คำนวณสรุปวันนี้
  const getSummaryToday = () => {
    const today = new Date().toDateString();
    const todaySales = sales.filter(
      (s) => new Date(s.date).toDateString() === today
    );

    const totalSales = todaySales.reduce((sum, s) => sum + (s.total || 0), 0);
    const totalItems = todaySales.reduce(
      (sum, s) => sum + (s.items?.length || 0),
      0
    );
    const uniqueCustomers = new Set(todaySales.map((s) => s.customerId)).size;
    const cashPayment = todaySales
      .filter((s) => s.paymentMethod === 'cash')
      .reduce((sum, s) => sum + (s.total || 0), 0);
    const creditPayment = todaySales
      .filter((s) => s.paymentMethod === 'credit')
      .reduce((sum, s) => sum + (s.total || 0), 0);

    return {
      totalSales,
      totalItems,
      uniqueCustomers,
      cashPayment,
      creditPayment,
    };
  };

  // ดูลูกหนี้
  const getDebtors = () => {
    return customers
      .filter((c) => c.debt && c.debt > 0)
      .sort((a, b) => b.debt - a.debt)
      .slice(0, 5);
  };

  // ของใกล้หมด
  const getLowStockProducts = () => {
    const lowStockThreshold = 5;
    return products
      .filter((p) => p.stock && p.stock <= lowStockThreshold)
      .sort((a, b) => (a.stock || 0) - (b.stock || 0))
      .slice(0, 5);
  };

  // สินค้าขายดีที่สุด
  const getTopSellingProducts = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthSales = sales.filter((s) => {
      const saleDate = new Date(s.date);
      return (
        saleDate.getMonth() === currentMonth &&
        saleDate.getFullYear() === currentYear
      );
    });

    const productSales: { [key: string]: { quantity: number; name: string } } = {};
    monthSales.forEach((sale) => {
      sale.items?.forEach((item: any) => {
        if (!productSales[item.productId]) {
          const product = products.find((p) => p.id === item.productId);
          productSales[item.productId] = {
            quantity: 0,
            name: product?.name || 'ไม่ทราบ',
          };
        }
        productSales[item.productId].quantity += item.quantity || 0;
      });
    });

    const topProducts = Object.entries(productSales)
      .map(([id, data]) => ({
        id,
        name: data.name,
        quantity: data.quantity,
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return topProducts;
  };

  // ลูกค้าใหม่
  const getNewCustomers = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const newCustomers = customers
      .filter((c) => {
        if (!c.createdAt) return false;
        const createdDate = new Date(c.createdAt);
        return (
          createdDate.getMonth() === currentMonth &&
          createdDate.getFullYear() === currentYear
        );
      })
      .slice(0, 5);

    return newCustomers;
  };

  // ยอดเดือนนี้
  const getMonthlyReport = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthSales = sales.filter((s) => {
      const saleDate = new Date(s.date);
      return (
        saleDate.getMonth() === currentMonth &&
        saleDate.getFullYear() === currentYear
      );
    });

    const totalMonthSales = monthSales.reduce((sum, s) => sum + (s.total || 0), 0);

    // ยอดเดือนที่แล้ว
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthSales = sales.filter((s) => {
      const saleDate = new Date(s.date);
      return (
        saleDate.getMonth() === lastMonthDate.getMonth() &&
        saleDate.getFullYear() === lastMonthDate.getFullYear()
      );
    });

    const totalLastMonthSales = lastMonthSales.reduce(
      (sum, s) => sum + (s.total || 0),
      0
    );

    // สินค้าขายดีสุด
    const productSales: { [key: string]: number } = {};
    monthSales.forEach((sale) => {
      sale.items?.forEach((item: any) => {
        productSales[item.productId] =
          (productSales[item.productId] || 0) + (item.quantity || 0);
      });
    });

    const topProduct = Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])[0];

    const topProductName = topProduct
      ? products.find((p) => p.id === topProduct[0])?.name || 'ไม่ทราบ'
      : 'ไม่มี';

    const percentChange =
      totalLastMonthSales > 0
        ? ((totalMonthSales - totalLastMonthSales) / totalLastMonthSales) * 100
        : 0;

    return {
      totalMonthSales,
      totalLastMonthSales,
      percentChange,
      topProductName,
      newCustomers: customers.filter(
        (c) =>
          c.createdAt &&
          new Date(c.createdAt).getMonth() === currentMonth &&
          new Date(c.createdAt).getFullYear() === currentYear
      ).length,
    };
  };

  // ประมวลผลคำถาม AI
  const processAIResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();

    // สินค้าขายดี
    if (
      lowerQuestion.includes('ขายดี') ||
      lowerQuestion.includes('สินค้าขายดี') ||
      lowerQuestion.includes('ของขายดี')
    ) {
      const topProducts = getTopSellingProducts();
      if (topProducts.length === 0) {
        return 'ยังไม่มีข้อมูลการขายเดือนนี้ครับ';
      }

      let response = 'สินค้าขายดีที่สุดเดือนนี้ครับ:\n\n';
      topProducts.forEach((product, index) => {
        response += `${index + 1}. **${product.name}**: ขายได้ ${product.quantity} ชิ้น\n`;
      });
      return response;
    }

    // ลูกค้าใหม่
    if (
      lowerQuestion.includes('ลูกค้าใหม่') ||
      lowerQuestion.includes('ลูกค้าใหม่เดือนนี้')
    ) {
      const newCustomers = getNewCustomers();
      if (newCustomers.length === 0) {
        return 'ยังไม่มีลูกค้าใหม่เดือนนี้ครับ';
      }

      let response = `มีลูกค้าใหม่ ${newCustomers.length} คนเดือนนี้ครับ:\n\n`;
      newCustomers.forEach((customer, index) => {
        response += `${index + 1}. ${customer.name}\n`;
      });
      return response;
    }

    // สรุปวันนี้
    if (
      lowerQuestion.includes('สรุป') ||
      lowerQuestion.includes('วันนี้') ||
      lowerQuestion.includes('ขายได้')
    ) {
      const summary = getSummaryToday();
      return `วันนี้ขายได้ดีเลยครับ:

💰 **ยอดขายสุทธิ:** ${summary.totalSales.toLocaleString()} บาท
📦 **ขายได้:** ${summary.totalItems} รายการ
👥 **ลูกค้า:** ${summary.uniqueCustomers} คน
💳 **เงินสด:** ${summary.cashPayment.toLocaleString()} บาท
💸 **ขายเชื่อ:** ${summary.creditPayment.toLocaleString()} บาท`;
    }

    // ดูลูกหนี้
    if (
      lowerQuestion.includes('ลูกหนี้') ||
      lowerQuestion.includes('ค้าง') ||
      lowerQuestion.includes('ใครค้าง')
    ) {
      const debtors = getDebtors();
      if (debtors.length === 0) {
        return 'ดีเลยครับ ไม่มีลูกค้าค้างเงิน ทุกคนชำระครบแล้ว';
      }

      let response = 'ลูกค้าค้างเงินอยู่ ' + debtors.length + ' คนครับ:\n\n';
      debtors.forEach((debtor, index) => {
        response += `${index + 1}. **${debtor.name}** → ค้าง ${debtor.debt.toLocaleString()} บาท\n`;
      });

      const totalDebt = debtors.reduce((sum, d) => sum + d.debt, 0);
      response += `\nรวมทั้งหมด: ${totalDebt.toLocaleString()} บาท`;
      return response;
    }

    // ของใกล้หมด
    if (
      lowerQuestion.includes('ของใกล้หมด') ||
      lowerQuestion.includes('สต็อก') ||
      lowerQuestion.includes('เหลือ')
    ) {
      const lowStockProducts = getLowStockProducts();
      if (lowStockProducts.length === 0) {
        return 'สินค้าทั้งหมดเพียงพอครับ ไม่มีสินค้าใกล้หมด';
      }

      let response = 'สินค้าที่ใกล้หมดสต็อกครับ:\n\n';
      lowStockProducts.forEach((product) => {
        const icon = product.stock <= 2 ? '🔴' : '🟡';
        response += `${icon} **${product.name}**: เหลือ ${product.stock} ${product.unit || 'ชิ้น'}\n`;
      });

      response += '\n⚠️ ควรสั่งซื้อเพิ่มครับ';
      return response;
    }

    // ยอดเดือนนี้
    if (
      lowerQuestion.includes('เดือน') ||
      lowerQuestion.includes('ยอดขาย') ||
      lowerQuestion.includes('ยอด')
    ) {
      const report = getMonthlyReport();
      const trend = report.percentChange > 0 ? '↑' : '↓';
      const trendText =
        report.percentChange > 0 ? 'ขึ้น' : 'ลดลง';

      return `สรุปเดือนนี้ครับ:

💰 **ยอดขายรวม:** ${report.totalMonthSales.toLocaleString()} บาท
📈 **เทียบเดือนที่แล้ว:** ${trend} ${Math.abs(report.percentChange).toFixed(1)}% (${trendText})
🏆 **สินค้าขายดีสุด:** ${report.topProductName}
👥 **ลูกค้าใหม่:** ${report.newCustomers} คน

${report.percentChange > 0 ? 'ยอดขายดีขึ้นเดือนนี้ครับ' : 'ยอดขายลดลงเดือนนี้ครับ'}`;
    }

    return `ขอโทษครับ ผมไม่เข้าใจคำถามของคุณ 😅

ลองถามผมเรื่องนี้ครับ:
📊 สรุปวันนี้
💳 ดูลูกหนี้
📦 ของใกล้หมด
📈 ยอดเดือนนี้
🏆 ขายดี
👥 ลูกค้าใหม่`;
  };

  // ส่งข้อความ
  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;
    setShowSuggestions(false);
    setFilteredSuggestions([]);

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => {
      const updated = [...prev, userMessage];
      saveChatHistory(updated);
      return updated;
    });
    setInputValue('');
    setIsLoading(true);

    // จำลองการหน่วงเวลา
    setTimeout(() => {
      const aiResponse = processAIResponse(inputValue);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => {
        const updated = [...prev, aiMessage];
        saveChatHistory(updated);
        return updated;
      });
      setIsLoading(false);
    }, 500);
  };

  // ปุ่มลัด
  const handleQuickButton = (action: string) => {
    let response = '';

    switch (action) {
      case 'summary':
        response = processAIResponse('สรุปวันนี้');
        break;
      case 'debtors':
        response = processAIResponse('ลูกหนี้');
        break;
      case 'lowstock':
        response = processAIResponse('ของใกล้หมด');
        break;
      case 'monthly':
        response = processAIResponse('เดือนนี้');
        break;
      case 'topselling':
        response = processAIResponse('ขายดี');
        break;
      case 'newcustomers':
        response = processAIResponse('ลูกค้าใหม่');
        break;
    }

    const aiMessage: Message = {
      id: Date.now().toString(),
      type: 'ai',
      content: response,
      timestamp: new Date(),
    };

    setMessages((prev) => {
      const updated = [...prev, aiMessage];
      saveChatHistory(updated);
      return updated;
    });
    setShowSuggestions(false);
    setFilteredSuggestions([]);
  };

  // ล้างประวัติ
  const handleClearHistory = () => {
    if (window.confirm('คุณต้องการล้างประวัติการสนทนาทั้งหมดหรือไม่?')) {
      clearChatHistory();
      setMessages([]);
    }
  };

  const handleDownloadHistory = () => {
    if (messages.length === 0) {
      alert('ยังไม่มีประวัติการสนทนา');
      return;
    }

    let content = 'ประวัติการสนทนากับ AI ผู้ช่วยร้านเกษตร\n';
    content += '='.repeat(50) + '\n\n';
    content += `วันที่: ${new Date().toLocaleString('th-TH')}\n`;
    content += '\n' + '='.repeat(50) + '\n\n';

    messages.forEach((msg) => {
      const time = new Date(msg.timestamp).toLocaleTimeString('th-TH');
      const sender = msg.type === 'user' ? 'คุณ' : 'ปุ่มช่วย';
      content += `[${time}] ${sender}:\n`;
      content += `${msg.content}\n\n`;
    });

    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    element.download = `chat_history_${dateStr}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // นับจำนวนแจ้งเตือนที่ยังไม่ได้ปิด
  const unreadAlertsCount = lowStockAlerts.length;

  const bgColor = isDarkMode
    ? 'bg-slate-900 border-slate-700'
    : 'bg-white border-blue-200';
  const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
  const inputBg = isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-gray-50 border-gray-300';

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center justify-center transition-transform hover:scale-110 relative"
          title="เปิด AI Assistant"
        >
          <div className="flex flex-col items-center justify-center">
            <MessageCircle size={24} />
            <span className="text-xs mt-1 font-bold">ปุ่มช่วย</span>
          </div>
          {unreadAlertsCount > 0 && (
            <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {unreadAlertsCount}
            </div>
          )}
        </button>
      )}

      {/* Sidebar */}
      {isOpen && (
        <div
          className={`fixed bottom-0 right-0 top-0 w-96 ${bgColor} border-l shadow-2xl z-50 flex flex-col`}
        >
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold">
                ป
              </div>
              <div>
                <h3 className="font-bold text-lg">ปุ่มช่วย</h3>
                <p className="text-xs text-blue-100">ผู้ช่วยอบรับ</p>
                {unreadAlertsCount > 0 && (
                  <p className="text-xs text-red-200">⚠️ มีแจ้งเตือน {unreadAlertsCount} รายการ</p>
                )}
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-blue-700 rounded transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Alerts Section */}
          {lowStockAlerts.length > 0 && showAlerts && (
            <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-red-700 dark:text-red-300">⚠️ สินค้าใกล้หมด</h4>
                <button
                  onClick={() => setShowAlerts(false)}
                  className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                >
                  ซ่อน
                </button>
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {lowStockAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="bg-white dark:bg-slate-800 p-2 rounded text-xs flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{alert.productName}</p>
                      <p className="text-red-600 dark:text-red-400">เหลือ {alert.currentStock} {alert.unit}</p>
                    </div>
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              {lowStockAlerts.length > 0 && (
                <button
                  onClick={dismissAllAlerts}
                  className="w-full text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 py-1"
                >
                  ปิดทั้งหมด
                </button>
              )}
            </div>
          )}

          {/* Show Alerts Button */}
          {lowStockAlerts.length > 0 && !showAlerts && (
            <button
              onClick={() => setShowAlerts(true)}
              className="w-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-2 text-xs font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition"
            >
              แสดงแจ้งเตือน ({lowStockAlerts.length})
            </button>
          )}

          {/* Quick Buttons */}
          <div className="p-4 space-y-2 border-b border-gray-200 dark:border-slate-700">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleQuickButton('summary')}
                className="px-3 py-2 bg-blue-100 dark:bg-slate-800 text-blue-700 dark:text-blue-300 rounded font-medium text-sm hover:bg-blue-200 dark:hover:bg-slate-700 transition"
              >
                สรุปวันนี้
              </button>
              <button
                onClick={() => handleQuickButton('debtors')}
                className="px-3 py-2 bg-blue-100 dark:bg-slate-800 text-blue-700 dark:text-blue-300 rounded font-medium text-sm hover:bg-blue-200 dark:hover:bg-slate-700 transition"
              >
                ดูลูกหนี้
              </button>
              <button
                onClick={() => handleQuickButton('lowstock')}
                className="px-3 py-2 bg-blue-100 dark:bg-slate-800 text-blue-700 dark:text-blue-300 rounded font-medium text-sm hover:bg-blue-200 dark:hover:bg-slate-700 transition"
              >
                ของใกล้หมด
              </button>
              <button
                onClick={() => handleQuickButton('monthly')}
                className="px-3 py-2 bg-blue-100 dark:bg-slate-800 text-blue-700 dark:text-blue-300 rounded font-medium text-sm hover:bg-blue-200 dark:hover:bg-slate-700 transition"
              >
                ยอดเดือนนี้
              </button>
              <button
                onClick={() => handleQuickButton('topselling')}
                className="px-3 py-2 bg-green-100 dark:bg-slate-800 text-green-700 dark:text-green-300 rounded font-medium text-sm hover:bg-green-200 dark:hover:bg-slate-700 transition"
              >
                ขายดี
              </button>
              <button
                onClick={() => handleQuickButton('newcustomers')}
                className="px-3 py-2 bg-purple-100 dark:bg-slate-800 text-purple-700 dark:text-purple-300 rounded font-medium text-sm hover:bg-purple-200 dark:hover:bg-slate-700 transition"
              >
                ลูกค้าใหม่
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDownloadHistory}
                className="flex-1 px-3 py-2 bg-green-100 dark:bg-slate-800 text-green-700 dark:text-green-300 rounded font-medium text-xs hover:bg-green-200 dark:hover:bg-slate-700 transition"
              >
                ดาวน์โหลด
              </button>
              <button
                onClick={handleClearHistory}
                className="flex-1 px-3 py-2 bg-red-100 dark:bg-slate-800 text-red-700 dark:text-red-300 rounded font-medium text-xs hover:bg-red-200 dark:hover:bg-slate-700 transition"
              >
                ล้างประวัติ
              </button>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className={`text-center text-gray-500 dark:text-gray-400 mt-8`}>
                <p className="text-sm">สวัสดีครับ ผมคือปุ่มช่วย</p>
                <p className="text-xs mt-2">พร้อมช่วยเหลือคุณได้ทุกเวลา</p>
                <p className="text-xs mt-4 text-gray-400">ประวัติการสนทนาจะถูกบันทึกโดยอัตโนมัติ</p>
                {lowStockAlerts.length > 0 && (
                    <p className="text-xs mt-3 text-red-500">มีสินค้า {lowStockAlerts.length} รายการใกลหมด</p>
                )}
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${
                  message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div className="flex-shrink-0">
                  {message.type === 'user' ? (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                      คุณ
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-lg">
                      🤖
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <div
                    className={`max-w-xs px-4 py-3 rounded-lg shadow-sm transition-all ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none hover:bg-blue-700'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white rounded-bl-none hover:bg-gray-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 px-2">
                    {typeof message.timestamp === 'string'
                      ? message.timestamp
                      : message.timestamp.toLocaleTimeString('th-TH', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 dark:bg-slate-700 px-4 py-3 rounded-lg rounded-bl-none">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: '0.1s' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className={`p-4 border-t border-gray-200 dark:border-slate-700 ${bgColor}`}>
            <div className="flex gap-2 relative">
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                onFocus={() => {
                  if (inputValue.trim().length > 0 && filteredSuggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                placeholder="พิมพ์คำถาม..."
                className={`flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputBg} ${textColor}`}
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition flex items-center justify-center"
              >
                <Send size={18} />
              </button>

              {/* Suggestions Dropdown */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute bottom-full left-0 right-12 mb-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
                  {filteredSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className="w-full text-left px-3 py-2 hover:bg-blue-100 dark:hover:bg-slate-700 text-gray-900 dark:text-white text-sm transition"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
