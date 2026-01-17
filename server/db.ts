import { eq, and, desc, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  shops, InsertShop,
  products, InsertProduct,
  customers, InsertCustomer,
  sales, InsertSale,
  saleItems, InsertSaleItem,
  priceHistory, InsertPriceHistory,
  dailyClose, InsertDailyClose,
  debtTransactions, InsertDebtTransaction
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
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
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
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

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ==================== SHOP QUERIES ====================

export async function getShopByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(shops).where(eq(shops.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createShop(shopData: InsertShop) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(shops).values(shopData);
  return result;
}

export async function updateShop(shopId: number, shopData: Partial<InsertShop>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(shops).set(shopData).where(eq(shops.id, shopId));
}

// ==================== PRODUCT QUERIES ====================

export async function getProductsByShop(shopId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(products).where(eq(products.shopId, shopId));
}

export async function getProductById(productId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(products).where(eq(products.id, productId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createProduct(productData: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(products).values(productData);
  return result;
}

export async function updateProduct(productId: number, productData: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(products).set(productData).where(eq(products.id, productId));
}

// ==================== CUSTOMER QUERIES ====================

export async function getCustomersByShop(shopId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(customers).where(eq(customers.shopId, shopId));
}

export async function getCustomerById(customerId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(customers).where(eq(customers.id, customerId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCustomer(customerData: InsertCustomer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(customers).values(customerData);
  return result;
}

export async function updateCustomer(customerId: number, customerData: Partial<InsertCustomer>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(customers).set(customerData).where(eq(customers.id, customerId));
}

// ==================== SALES QUERIES ====================

export async function getSalesByShop(shopId: number, limit = 100) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(sales)
    .where(eq(sales.shopId, shopId))
    .orderBy(desc(sales.saleDate))
    .limit(limit);
}

export async function getSaleById(saleId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(sales).where(eq(sales.id, saleId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createSale(saleData: InsertSale) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(sales).values(saleData);
  return result;
}

export async function updateSale(saleId: number, saleData: Partial<InsertSale>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(sales).set(saleData).where(eq(sales.id, saleId));
}

// ==================== SALE ITEMS QUERIES ====================

export async function getSaleItems(saleId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(saleItems).where(eq(saleItems.saleId, saleId));
}

export async function createSaleItem(saleItemData: InsertSaleItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(saleItems).values(saleItemData);
  return result;
}

// ==================== PRICE HISTORY QUERIES ====================

export async function getPriceHistory(productId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(priceHistory)
    .where(eq(priceHistory.productId, productId))
    .orderBy(desc(priceHistory.changeDate))
    .limit(limit);
}

export async function createPriceHistory(priceData: InsertPriceHistory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(priceHistory).values(priceData);
  return result;
}

// ==================== DAILY CLOSE QUERIES ====================

export async function getDailyCloseByDate(shopId: number, closeDate: Date) {
  const db = await getDb();
  if (!db) return undefined;
  
  const startOfDay = new Date(closeDate);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(closeDate);
  endOfDay.setHours(23, 59, 59, 999);
  
  const result = await db.select().from(dailyClose)
    .where(and(
      eq(dailyClose.shopId, shopId),
      gte(dailyClose.closeDate, startOfDay),
      lte(dailyClose.closeDate, endOfDay)
    ))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function getDailyCloseHistory(shopId: number, limit = 30) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(dailyClose)
    .where(eq(dailyClose.shopId, shopId))
    .orderBy(desc(dailyClose.closeDate))
    .limit(limit);
}

export async function createDailyClose(closeData: InsertDailyClose) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(dailyClose).values(closeData);
  return result;
}

// ==================== DEBT TRANSACTION QUERIES ====================

export async function getDebtTransactions(customerId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(debtTransactions)
    .where(eq(debtTransactions.customerId, customerId))
    .orderBy(desc(debtTransactions.paymentDate))
    .limit(limit);
}

export async function createDebtTransaction(debtData: InsertDebtTransaction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(debtTransactions).values(debtData);
  return result;
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
  
  const todaySales = await db.select().from(sales)
    .where(and(
      eq(sales.shopId, shopId),
      gte(sales.saleDate, startOfDay),
      lte(sales.saleDate, endOfDay)
    ));
  
  const totalSales = todaySales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount.toString()), 0);
  const totalCash = todaySales.filter(s => s.paymentMethod === 'cash')
    .reduce((sum, sale) => sum + parseFloat((sale.paidAmount ?? 0).toString()), 0);
  const totalCredit = todaySales.filter(s => s.paymentMethod === 'credit')
    .reduce((sum, sale) => sum + parseFloat((sale.debtAmount ?? 0).toString()), 0);
  
  // Monthly stats
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  endOfMonth.setHours(23, 59, 59, 999);
  
  const monthlySales = await db.select().from(sales)
    .where(and(
      eq(sales.shopId, shopId),
      gte(sales.saleDate, startOfMonth),
      lte(sales.saleDate, endOfMonth)
    ));
  
  const monthlyTotal = monthlySales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount.toString()), 0);
  
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
