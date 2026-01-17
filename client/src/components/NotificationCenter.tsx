import { useState, useEffect } from 'react';
import { Bell, AlertCircle, AlertTriangle, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * Design Philosophy: Rural Warmth
 * - Simple notification system
 * - Clear alerts for low stock and overdue debts
 * - Easy to dismiss and manage
 */

export interface Notification {
  id: string;
  type: 'low_stock' | 'overdue_debt';
  title: string;
  message: string;
  severity: 'warning' | 'critical';
  timestamp: Date;
  read: boolean;
}

interface NotificationCenterProps {
  onNavigate?: (page: string) => void;
}

export default function NotificationCenter({ onNavigate }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    // Load from localStorage
    const saved = localStorage.getItem('notifications');
    if (saved) {
      try {
        return JSON.parse(saved).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
      } catch {
        return [];
      }
    }
    return [];
  });

  const [isOpen, setIsOpen] = useState(false);

  // Save notifications to localStorage
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Generate notifications based on current data
  useEffect(() => {
    const generateNotifications = () => {
      const newNotifications: Notification[] = [];

      // Check for low stock items
      const lowStockItems = [
        { name: 'ปุ๋ยยูเรีย (ถุง 25 กก.)', current: 3, warning: 5 },
        { name: 'ยาฆ่าแมลง (ขวด 500 มล.)', current: 2, warning: 5 },
        { name: 'เครื่องพ่นยา (ตัว)', current: 1, warning: 2 }
      ];

      lowStockItems.forEach((item) => {
        if (item.current <= item.warning / 2) {
          newNotifications.push({
            id: `low_stock_${item.name}`,
            type: 'low_stock',
            title: 'สินค้าใกล้หมด!',
            message: `${item.name} เหลือเพียง ${item.current} ชิ้น`,
            severity: 'critical',
            timestamp: new Date(),
            read: false
          });
        } else if (item.current <= item.warning) {
          newNotifications.push({
            id: `low_stock_${item.name}`,
            type: 'low_stock',
            title: 'สินค้าใกล้หมด',
            message: `${item.name} เหลือ ${item.current} ชิ้น`,
            severity: 'warning',
            timestamp: new Date(),
            read: false
          });
        }
      });

      // Check for overdue debts
      const debtCustomers = [
        { name: 'สมชาย ชาวไร่', debt: 5000, daysOverdue: 15 },
        { name: 'สมหญิง ชาวสวน', debt: 3000, daysOverdue: 8 },
        { name: 'สมศักดิ์ เกษตรกร', debt: 2000, daysOverdue: 0 }
      ];

      debtCustomers.forEach((customer) => {
        if (customer.daysOverdue > 7) {
          newNotifications.push({
            id: `overdue_${customer.name}`,
            type: 'overdue_debt',
            title: 'ลูกค้าค้างชำระนาน',
            message: `${customer.name} ค้างชำระ ${customer.debt.toLocaleString()} บาท มากกว่า ${customer.daysOverdue} วัน`,
            severity: 'critical',
            timestamp: new Date(),
            read: false
          });
        } else if (customer.daysOverdue > 0) {
          newNotifications.push({
            id: `overdue_${customer.name}`,
            type: 'overdue_debt',
            title: 'ลูกค้าค้างชำระ',
            message: `${customer.name} ค้างชำระ ${customer.debt.toLocaleString()} บาท ${customer.daysOverdue} วัน`,
            severity: 'warning',
            timestamp: new Date(),
            read: false
          });
        }
      });

      // Only add new notifications that don't already exist
      const existingIds = new Set(notifications.map(n => n.id));
      const uniqueNewNotifications = newNotifications.filter(n => !existingIds.has(n.id));

      if (uniqueNewNotifications.length > 0) {
        setNotifications(prev => [...uniqueNewNotifications, ...prev]);
      }
    };

    generateNotifications();
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;
  const criticalCount = notifications.filter(n => n.severity === 'critical' && !n.read).length;

  const handleDismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleNavigate = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="ghost"
        size="sm"
        className="relative text-foreground hover:bg-muted"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className={`absolute top-0 right-0 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-white ${
            criticalCount > 0 ? 'bg-red-500' : 'bg-yellow-500'
          }`}>
            {unreadCount}
          </span>
        )}
      </Button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-card border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 p-4 border-b border-border bg-card flex items-center justify-between">
            <h3 className="font-semibold text-foreground">แจ้งเตือน</h3>
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="sm"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Notifications List */}
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              ไม่มีแจ้งเตือน
            </div>
          ) : (
            <div className="space-y-2 p-2">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`p-3 border ${
                    notification.severity === 'critical'
                      ? 'border-red-200 bg-red-50'
                      : 'border-yellow-200 bg-yellow-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {notification.severity === 'critical' ? (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm ${
                        notification.severity === 'critical'
                          ? 'text-red-900'
                          : 'text-yellow-900'
                      }`}>
                        {notification.title}
                      </p>
                      <p className={`text-xs mt-1 ${
                        notification.severity === 'critical'
                          ? 'text-red-800'
                          : 'text-yellow-800'
                      }`}>
                        {notification.message}
                      </p>
                      <div className="flex gap-2 mt-2">
                        {notification.type === 'low_stock' && (
                          <Button
                            onClick={() => handleNavigate('inventory')}
                            size="sm"
                            variant="outline"
                            className="text-xs h-7"
                          >
                            ไปจัดการสต็อก
                          </Button>
                        )}
                        {notification.type === 'overdue_debt' && (
                          <Button
                            onClick={() => handleNavigate('customers')}
                            size="sm"
                            variant="outline"
                            className="text-xs h-7"
                          >
                            ไปจัดการลูกค้า
                          </Button>
                        )}
                        <Button
                          onClick={() => handleDismiss(notification.id)}
                          size="sm"
                          variant="ghost"
                          className="text-xs h-7"
                        >
                          ปิด
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
