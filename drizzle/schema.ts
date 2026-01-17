import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, index } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Shop/Store Information
 * เก็บข้อมูลร้านค้าของแต่ละผู้ใช้
 */
export const shops = mysqlTable("shops", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  shopName: varchar("shopName", { length: 255 }).notNull(),
  shopPhone: varchar("shopPhone", { length: 20 }),
  shopAddress: text("shopAddress"),
  shopProvince: varchar("shopProvince", { length: 100 }),
  shopDistrict: varchar("shopDistrict", { length: 100 }),
  shopSubDistrict: varchar("shopSubDistrict", { length: 100 }),
  shopPostalCode: varchar("shopPostalCode", { length: 10 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("shops_userId_idx").on(table.userId),
}));

export type Shop = typeof shops.$inferSelect;
export type InsertShop = typeof shops.$inferInsert;

/**
 * Products/Inventory
 * เก็บข้อมูลสินค้าของร้าน
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  shopId: int("shopId").notNull(),
  productName: varchar("productName", { length: 255 }).notNull(),
  productCode: varchar("productCode", { length: 100 }),
  productCategory: varchar("productCategory", { length: 100 }),
  productUnit: varchar("productUnit", { length: 50 }), // เช่น "กก", "ลิตร", "ชิ้น"
  costPrice: decimal("costPrice", { precision: 10, scale: 2 }), // ราคาต้นทุน
  sellingPrice: decimal("sellingPrice", { precision: 10, scale: 2 }), // ราคาขาย
  currentStock: int("currentStock").default(0), // จำนวนสต็อกปัจจุบัน
  minimumStock: int("minimumStock").default(0), // จำนวนสต็อกต่ำสุด
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  shopIdIdx: index("products_shopId_idx").on(table.shopId),
}));

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Customers
 * เก็บข้อมูลลูกค้าของร้าน
 */
export const customers = mysqlTable("customers", {
  id: int("id").autoincrement().primaryKey(),
  shopId: int("shopId").notNull(),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 20 }),
  customerAddress: text("customerAddress"),
  customerProvince: varchar("customerProvince", { length: 100 }),
  customerDistrict: varchar("customerDistrict", { length: 100 }),
  totalDebt: decimal("totalDebt", { precision: 12, scale: 2 }).default("0"), // ยอดหนี้รวม
  totalPaid: decimal("totalPaid", { precision: 12, scale: 2 }).default("0"), // ยอดชำระแล้ว
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  shopIdIdx: index("customers_shopId_idx").on(table.shopId),
}));

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

/**
 * Sales Transactions
 * เก็บข้อมูลการขายแต่ละรายการ
 */
export const sales = mysqlTable("sales", {
  id: int("id").autoincrement().primaryKey(),
  shopId: int("shopId").notNull(),
  customerId: int("customerId"), // NULL ถ้าเป็นการขายเงินสด
  saleDate: timestamp("saleDate").defaultNow().notNull(),
  totalAmount: decimal("totalAmount", { precision: 12, scale: 2 }).notNull(),
  paidAmount: decimal("paidAmount", { precision: 12, scale: 2 }).default("0"), // จำนวนที่ชำระแล้ว
  debtAmount: decimal("debtAmount", { precision: 12, scale: 2 }).default("0"), // จำนวนหนี้
  paymentMethod: mysqlEnum("paymentMethod", ["cash", "credit", "transfer", "other"]).default("cash"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  shopIdIdx: index("sales_shopId_idx").on(table.shopId),
  customerIdIdx: index("sales_customerId_idx").on(table.customerId),
  saleDateIdx: index("sales_saleDate_idx").on(table.saleDate),
}));

export type Sale = typeof sales.$inferSelect;
export type InsertSale = typeof sales.$inferInsert;

/**
 * Sale Items
 * เก็บรายละเอียดสินค้าในแต่ละรายการขาย
 */
export const saleItems = mysqlTable("saleItems", {
  id: int("id").autoincrement().primaryKey(),
  saleId: int("saleId").notNull(),
  productId: int("productId").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("totalPrice", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  saleIdIdx: index("saleItems_saleId_idx").on(table.saleId),
  productIdIdx: index("saleItems_productId_idx").on(table.productId),
}));

export type SaleItem = typeof saleItems.$inferSelect;
export type InsertSaleItem = typeof saleItems.$inferInsert;

/**
 * Price History
 * เก็บประวัติการเปลี่ยนแปลงราคาสินค้า
 */
export const priceHistory = mysqlTable("priceHistory", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  oldPrice: decimal("oldPrice", { precision: 10, scale: 2 }).notNull(),
  newPrice: decimal("newPrice", { precision: 10, scale: 2 }).notNull(),
  changedBy: int("changedBy").notNull(), // userId
  changeDate: timestamp("changeDate").defaultNow().notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  productIdIdx: index("priceHistory_productId_idx").on(table.productId),
  changeDateIdx: index("priceHistory_changeDate_idx").on(table.changeDate),
}));

export type PriceHistory = typeof priceHistory.$inferSelect;
export type InsertPriceHistory = typeof priceHistory.$inferInsert;

/**
 * Daily Close
 * เก็บข้อมูลการปิดวันแต่ละวัน
 */
export const dailyClose = mysqlTable("dailyClose", {
  id: int("id").autoincrement().primaryKey(),
  shopId: int("shopId").notNull(),
  closeDate: timestamp("closeDate").notNull(),
  totalSales: decimal("totalSales", { precision: 12, scale: 2 }).default("0"),
  totalCash: decimal("totalCash", { precision: 12, scale: 2 }).default("0"),
  totalCredit: decimal("totalCredit", { precision: 12, scale: 2 }).default("0"),
  totalTransactions: int("totalTransactions").default(0),
  notes: text("notes"),
  closedBy: int("closedBy").notNull(), // userId
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  shopIdIdx: index("dailyClose_shopId_idx").on(table.shopId),
  closeDateIdx: index("dailyClose_closeDate_idx").on(table.closeDate),
}));

export type DailyClose = typeof dailyClose.$inferSelect;
export type InsertDailyClose = typeof dailyClose.$inferInsert;

/**
 * Debt Transactions
 * เก็บข้อมูลการชำระหนี้ของลูกค้า
 */
export const debtTransactions = mysqlTable("debtTransactions", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull(),
  saleId: int("saleId"), // NULL ถ้าเป็นการชำระหนี้ทั่วไป
  debtAmount: decimal("debtAmount", { precision: 12, scale: 2 }).notNull(),
  paidAmount: decimal("paidAmount", { precision: 12, scale: 2 }).notNull(),
  paymentDate: timestamp("paymentDate").defaultNow().notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["cash", "transfer", "check", "other"]).default("cash"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  customerIdIdx: index("debtTransactions_customerId_idx").on(table.customerId),
  paymentDateIdx: index("debtTransactions_paymentDate_idx").on(table.paymentDate),
}));

export type DebtTransaction = typeof debtTransactions.$inferSelect;
export type InsertDebtTransaction = typeof debtTransactions.$inferInsert;
