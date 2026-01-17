// Demo data for AI Sidebar
export const DEMO_SALES = [
  {
    id: '1',
    date: new Date().toISOString(),
    customerId: 'cust1',
    total: 5200,
    paymentMethod: 'cash',
    items: [
      { productId: 'prod1', name: 'ปุ๋ยยูเรีย', quantity: 5, price: 800 },
      { productId: 'prod2', name: 'ปุ๋ยเคมี', quantity: 3, price: 600 },
    ],
  },
  {
    id: '2',
    date: new Date().toISOString(),
    customerId: 'cust2',
    total: 3800,
    paymentMethod: 'credit',
    items: [
      { productId: 'prod3', name: 'เมล็ดพันธุ์ข้าว', quantity: 10, price: 380 },
    ],
  },
  {
    id: '3',
    date: new Date().toISOString(),
    customerId: 'cust3',
    total: 2100,
    paymentMethod: 'cash',
    items: [
      { productId: 'prod4', name: 'สารเคมีป้องกันศัตรูพืช', quantity: 2, price: 1050 },
    ],
  },
];

export const DEMO_CUSTOMERS = [
  {
    id: 'cust1',
    name: 'สมชาย ชาวไร่',
    phone: '0812345678',
    address: 'บ้านเลขที่ 123 หมู่ 1 ต.ท่าม่วง อ.เมืองชัยภูมิ จ.ชัยภูมิ',
    debt: 0,
    createdAt: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
  },
  {
    id: 'cust2',
    name: 'สมหญิง เกษตรกร',
    phone: '0823456789',
    address: 'บ้านเลขที่ 456 หมู่ 2 ต.ท่าม่วง อ.เมืองชัยภูมิ จ.ชัยภูมิ',
    debt: 3800,
    createdAt: new Date(new Date().getFullYear(), new Date().getMonth(), 5).toISOString(),
  },
  {
    id: 'cust3',
    name: 'สมศักดิ์ ผู้ปลูก',
    phone: '0834567890',
    address: 'บ้านเลขที่ 789 หมู่ 3 ต.ท่าม่วง อ.เมืองชัยภูมิ จ.ชัยภูมิ',
    debt: 5200,
    createdAt: new Date(new Date().getFullYear(), new Date().getMonth(), 10).toISOString(),
  },
];

export const DEMO_PRODUCTS = [
  {
    id: 'prod1',
    name: 'ปุ๋ยยูเรีย',
    category: 'ปุ๋ย',
    unit: 'กระสอบ',
    stock: 3,
    price: 800,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod2',
    name: 'ปุ๋ยเคมี',
    category: 'ปุ๋ย',
    unit: 'กระสอบ',
    stock: 8,
    price: 600,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod3',
    name: 'เมล็ดพันธุ์ข้าว',
    category: 'เมล็ดพันธุ์',
    unit: 'กิโลกรัม',
    stock: 25,
    price: 380,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod4',
    name: 'สารเคมีป้องกันศัตรูพืช',
    category: 'สารเคมี',
    unit: 'ลิตร',
    stock: 2,
    price: 1050,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod5',
    name: 'ปุ๋ยอินทรีย์',
    category: 'ปุ๋ย',
    unit: 'กระสอบ',
    stock: 15,
    price: 450,
    createdAt: new Date().toISOString(),
  },
];

export const initializeDemoData = () => {
  // เช็คว่า localStorage มีข้อมูลหรือไม่
  const hasSales = localStorage.getItem('sales');
  const hasCustomers = localStorage.getItem('customers');
  const hasProducts = localStorage.getItem('products');
  const isLoggedIn = localStorage.getItem('isLoggedIn');

  // ถ้าไม่มีข้อมูล ให้เพิ่ม Demo Data เฉพาะเมื่อผู้ใช้เข้าสู่ระบบแล้ว
  if (isLoggedIn === 'true') {
    if (!hasSales) {
      localStorage.setItem('sales', JSON.stringify(DEMO_SALES));
    }
    if (!hasCustomers) {
      localStorage.setItem('customers', JSON.stringify(DEMO_CUSTOMERS));
    }
    if (!hasProducts) {
      localStorage.setItem('products', JSON.stringify(DEMO_PRODUCTS));
    }
  }
};
