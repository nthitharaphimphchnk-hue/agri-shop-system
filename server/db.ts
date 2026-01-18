import mongoose from "mongoose";
import { ENV } from './_core/env';
import {
  User,
  Shop,
  Product,
  Customer,
  Sale,
  SaleItem,
  PriceHistory,
  DailyClose,
  DebtTransaction,
  IUser,
  IShop,
  IProduct,
  ICustomer,
  ISale,
  ISaleItem,
  IPriceHistory,
  IDailyClose,
  IDebtTransaction,
  InsertUser,
  InsertShop,
  InsertProduct,
  InsertCustomer,
  InsertSale,
  InsertSaleItem,
  InsertPriceHistory,
  InsertDailyClose,
  InsertDebtTransaction,
} from './mongoose-schema';

let _isConnected = false;

// Connect to MongoDB
export async function getDb() {
  if (!_isConnected && process.env.DATABASE_URL) {
    try {
      await mongoose.connect(process.env.DATABASE_URL);
      _isConnected = true;
      console.log("[Database] Connected to MongoDB");
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _isConnected = false;
    }
  }
  return _isConnected ? mongoose.connection : null;
}

// Helper to convert MongoDB ObjectId to string for compatibility
function toId(value: mongoose.Types.ObjectId | string | number | undefined): string | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  return value.toString();
}

// Helper to convert to ObjectId
// Handles both ObjectId strings (24 hex chars) and numeric IDs (for legacy compatibility)
function toObjectId(value: string | number | mongoose.Types.ObjectId | undefined): mongoose.Types.ObjectId | undefined {
  if (!value) return undefined;
  if (value instanceof mongoose.Types.ObjectId) return value;
  if (typeof value === 'string') {
    // Check if it's a valid ObjectId format (24 hex characters)
    if (/^[0-9a-fA-F]{24}$/.test(value)) {
      return new mongoose.Types.ObjectId(value);
    }
    // If it's not a valid ObjectId, treat as undefined (will need to handle this case)
    return undefined;
  }
  if (typeof value === 'number') {
    // For numeric IDs, we can't convert to ObjectId directly
    // This should only happen during migration - in production all IDs should be ObjectIds
    return undefined;
  }
  return undefined;
}

// Helper to convert ObjectId to string ID for API responses
function toIdString(obj: mongoose.Types.ObjectId | string | number | undefined): string | undefined {
  if (!obj) return undefined;
  if (typeof obj === 'string') return obj;
  if (typeof obj === 'number') return obj.toString();
  return obj.toString();
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const updateSet: Partial<IUser> = {
      lastSignedIn: user.lastSignedIn ?? new Date(),
    };

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    textFields.forEach((field) => {
      const value = user[field];
      if (value !== undefined) {
        updateSet[field] = value ?? undefined;
      }
    });

    if (user.role !== undefined) {
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      updateSet.role = 'admin';
    }

    await User.findOneAndUpdate(
      { openId: user.openId },
      { $set: updateSet },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const user = await User.findOne({ openId });
  if (!user) return undefined;
  
  // Convert to plain object with id as string for compatibility
  const result = user.toObject();
  return {
    ...result,
    id: user._id.toString(),
  } as any;
}

// ==================== SHOP QUERIES ====================

export async function getShopByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  // For MongoDB, userId should be stored as ObjectId
  // If userId is a number, we need to find by ObjectId string
  const userIdObjId = typeof userId === 'number' 
    ? undefined 
    : toObjectId(userId.toString());
  
  const shop = userIdObjId 
    ? await Shop.findOne({ userId: userIdObjId })
    : await Shop.findOne({ userId: userId.toString() });
    
  if (!shop) return undefined;
  
  const result = shop.toObject();
  return {
    ...result,
    id: shop._id.toString(),
    userId: toIdString(shop.userId) || userId,
  } as any;
}

export async function createShop(shopData: InsertShop) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const userId = typeof shopData.userId === 'string' || shopData.userId instanceof mongoose.Types.ObjectId
    ? toObjectId(shopData.userId.toString()) || shopData.userId
    : shopData.userId;
    
  const shop = new Shop({
    ...shopData,
    userId: userId,
  });
  await shop.save();
  return shop;
}

export async function updateShop(shopId: number, shopData: Partial<InsertShop>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: any = { ...shopData };
  if (updateData.userId) {
    updateData.userId = toObjectId(updateData.userId.toString());
  }
  
  const shop = await Shop.findByIdAndUpdate(toObjectId(shopId.toString()), { $set: updateData }, { new: true });
  return shop;
}

// ==================== PRODUCT QUERIES ====================

export async function getProductsByShop(shopId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const products = await Product.find({ shopId: toObjectId(shopId.toString()) });
  return products.map(p => {
    const obj = p.toObject();
    return {
      ...obj,
      id: p._id.toString(),
      shopId: Number(shopId),
    };
  }) as any[];
}

export async function getProductById(productId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const product = await Product.findById(toObjectId(productId.toString()));
  if (!product) return undefined;
  
  const result = product.toObject();
  return {
    ...result,
    id: product._id.toString(),
  } as any;
}

export async function createProduct(productData: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const product = new Product({
    ...productData,
    shopId: toObjectId(productData.shopId?.toString()) || productData.shopId,
  });
  await product.save();
  return product;
}

export async function updateProduct(productId: number, productData: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: any = { ...productData };
  if (updateData.shopId) {
    updateData.shopId = toObjectId(updateData.shopId.toString());
  }
  
  const product = await Product.findByIdAndUpdate(toObjectId(productId.toString()), { $set: updateData }, { new: true });
  return product;
}

// ==================== CUSTOMER QUERIES ====================

export async function getCustomersByShop(shopId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const customers = await Customer.find({ shopId: toObjectId(shopId.toString()) });
  return customers.map(c => {
    const obj = c.toObject();
    return {
      ...obj,
      id: c._id.toString(),
      shopId: Number(shopId),
    };
  }) as any[];
}

export async function getCustomerById(customerId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const customer = await Customer.findById(toObjectId(customerId.toString()));
  if (!customer) return undefined;
  
  const result = customer.toObject();
  return {
    ...result,
    id: customer._id.toString(),
  } as any;
}

export async function createCustomer(customerData: InsertCustomer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const customer = new Customer({
    ...customerData,
    shopId: toObjectId(customerData.shopId?.toString()) || customerData.shopId,
  });
  await customer.save();
  return customer;
}

export async function updateCustomer(customerId: number, customerData: Partial<InsertCustomer>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: any = { ...customerData };
  if (updateData.shopId) {
    updateData.shopId = toObjectId(updateData.shopId.toString());
  }
  
  const customer = await Customer.findByIdAndUpdate(toObjectId(customerId.toString()), { $set: updateData }, { new: true });
  return customer;
}

// ==================== SALES QUERIES ====================

export async function getSalesByShop(shopId: number, limit = 100) {
  const db = await getDb();
  if (!db) return [];
  
  const sales = await Sale.find({ shopId: toObjectId(shopId.toString()) })
    .sort({ saleDate: -1 })
    .limit(limit);
  
  return sales.map(s => {
    const obj = s.toObject();
    return {
      ...obj,
      id: s._id.toString(),
      shopId: Number(shopId),
      customerId: s.customerId ? Number(s.customerId) : undefined,
    };
  }) as any[];
}

export async function getSaleById(saleId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const sale = await Sale.findById(toObjectId(saleId.toString()));
  if (!sale) return undefined;
  
  const result = sale.toObject();
  return {
    ...result,
    id: sale._id.toString(),
    customerId: sale.customerId ? Number(sale.customerId) : undefined,
  } as any;
}

export async function createSale(saleData: InsertSale) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const sale = new Sale({
    ...saleData,
    shopId: toObjectId(saleData.shopId?.toString()) || saleData.shopId,
    customerId: saleData.customerId ? toObjectId(saleData.customerId.toString()) : undefined,
  });
  await sale.save();
  return sale;
}

export async function updateSale(saleId: number, saleData: Partial<InsertSale>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: any = { ...saleData };
  if (updateData.shopId) {
    updateData.shopId = toObjectId(updateData.shopId.toString());
  }
  if (updateData.customerId !== undefined) {
    updateData.customerId = updateData.customerId ? toObjectId(updateData.customerId.toString()) : undefined;
  }
  
  const sale = await Sale.findByIdAndUpdate(toObjectId(saleId.toString()), { $set: updateData }, { new: true });
  return sale;
}

// ==================== SALE ITEMS QUERIES ====================

export async function getSaleItems(saleId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const items = await SaleItem.find({ saleId: toObjectId(saleId.toString()) });
  return items.map(item => {
    const obj = item.toObject();
    return {
      ...obj,
      id: item._id.toString(),
      saleId: Number(saleId),
      productId: Number(item.productId),
    };
  }) as any[];
}

export async function createSaleItem(saleItemData: InsertSaleItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const item = new SaleItem({
    ...saleItemData,
    saleId: toObjectId(saleItemData.saleId?.toString()) || saleItemData.saleId,
    productId: toObjectId(saleItemData.productId?.toString()) || saleItemData.productId,
  });
  await item.save();
  return item;
}

// ==================== PRICE HISTORY QUERIES ====================

export async function getPriceHistory(productId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  const history = await PriceHistory.find({ productId: toObjectId(productId.toString()) })
    .sort({ changeDate: -1 })
    .limit(limit);
  
  return history.map(h => {
    const obj = h.toObject();
    return {
      ...obj,
      id: h._id.toString(),
      productId: Number(productId),
      changedBy: Number(h.changedBy),
    };
  }) as any[];
}

export async function createPriceHistory(priceData: InsertPriceHistory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const history = new PriceHistory({
    ...priceData,
    productId: toObjectId(priceData.productId?.toString()) || priceData.productId,
    changedBy: toObjectId(priceData.changedBy?.toString()) || priceData.changedBy,
  });
  await history.save();
  return history;
}

// ==================== DAILY CLOSE QUERIES ====================

export async function getDailyCloseByDate(shopId: number, closeDate: Date) {
  const db = await getDb();
  if (!db) return undefined;
  
  const startOfDay = new Date(closeDate);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(closeDate);
  endOfDay.setHours(23, 59, 59, 999);
  
  const dailyClose = await DailyClose.findOne({
    shopId: toObjectId(shopId.toString()),
    closeDate: { $gte: startOfDay, $lte: endOfDay },
  });
  
  if (!dailyClose) return undefined;
  
  const result = dailyClose.toObject();
  return {
    ...result,
    id: dailyClose._id.toString(),
    shopId: Number(shopId),
    closedBy: Number(dailyClose.closedBy),
  } as any;
}

export async function getDailyCloseHistory(shopId: number, limit = 30) {
  const db = await getDb();
  if (!db) return [];
  
  const history = await DailyClose.find({ shopId: toObjectId(shopId.toString()) })
    .sort({ closeDate: -1 })
    .limit(limit);
  
  return history.map(h => {
    const obj = h.toObject();
    return {
      ...obj,
      id: h._id.toString(),
      shopId: Number(shopId),
      closedBy: Number(h.closedBy),
    };
  }) as any[];
}

export async function createDailyClose(closeData: InsertDailyClose) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const dailyClose = new DailyClose({
    ...closeData,
    shopId: toObjectId(closeData.shopId?.toString()) || closeData.shopId,
    closedBy: toObjectId(closeData.closedBy?.toString()) || closeData.closedBy,
  });
  await dailyClose.save();
  return dailyClose;
}

// ==================== DEBT TRANSACTION QUERIES ====================

export async function getDebtTransactions(customerId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  const transactions = await DebtTransaction.find({ customerId: toObjectId(customerId.toString()) })
    .sort({ paymentDate: -1 })
    .limit(limit);
  
  return transactions.map(t => {
    const obj = t.toObject();
    return {
      ...obj,
      id: t._id.toString(),
      customerId: Number(customerId),
      saleId: t.saleId ? Number(t.saleId) : undefined,
    };
  }) as any[];
}

export async function createDebtTransaction(debtData: InsertDebtTransaction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const transaction = new DebtTransaction({
    ...debtData,
    customerId: toObjectId(debtData.customerId?.toString()) || debtData.customerId,
    saleId: debtData.saleId ? toObjectId(debtData.saleId.toString()) : undefined,
  });
  await transaction.save();
  return transaction;
}

// ==================== DASHBOARD QUERIES ====================

export async function getDashboardStats(shopId: number, date: Date) {
  const db = await getDb();
  if (!db) {
    // Return default empty stats if database is not available
    return {
      todayStats: {
        cashSales: 0,
        transferSales: 0,
        creditSales: 0,
        totalSales: 0,
        transactions: 0
      },
      monthlySales: 0,
      totalSales: 0,
      totalCash: 0,
      totalCredit: 0,
      totalTransactions: 0
    };
  }
  
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const todaySales = await Sale.find({
    shopId: toObjectId(shopId.toString()),
    saleDate: { $gte: startOfDay, $lte: endOfDay },
  });
  
  const totalSales = todaySales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
  const totalCash = todaySales.filter(s => s.paymentMethod === 'cash')
    .reduce((sum, sale) => sum + (sale.paidAmount || 0), 0);
  const totalCredit = todaySales.filter(s => s.paymentMethod === 'credit')
    .reduce((sum, sale) => sum + (sale.debtAmount || 0), 0);
  
  // Monthly stats
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  endOfMonth.setHours(23, 59, 59, 999);
  
  const monthlySales = await Sale.find({
    shopId: toObjectId(shopId.toString()),
    saleDate: { $gte: startOfMonth, $lte: endOfMonth },
  });
  
  const monthlyTotal = monthlySales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
  
  return {
    todayStats: {
      cashSales: totalCash,
      transferSales: 0,
      creditSales: totalCredit,
      totalSales: totalSales,
      transactions: todaySales.length
    },
    monthlySales: monthlyTotal,
    totalSales,
    totalCash,
    totalCredit,
    totalTransactions: todaySales.length
  };
}
