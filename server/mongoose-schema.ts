import mongoose, { Schema, Model, Document } from 'mongoose';

// ==================== USER SCHEMA ====================
export interface IUser extends Document {
  openId: string;
  name?: string;
  email?: string;
  loginMethod?: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
}

const UserSchema = new Schema<IUser>({
  openId: { type: String, required: true, unique: true, maxlength: 64 },
  name: String,
  email: { type: String, maxlength: 320 },
  loginMethod: { type: String, maxlength: 64 },
  role: { type: String, enum: ['user', 'admin'], default: 'user', required: true },
  createdAt: { type: Date, default: Date.now, required: true },
  updatedAt: { type: Date, default: Date.now, required: true },
  lastSignedIn: { type: Date, default: Date.now, required: true },
}, { timestamps: true });

UserSchema.index({ openId: 1 });

export const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);

// ==================== SHOP SCHEMA ====================
export interface IShop extends Document {
  userId: mongoose.Types.ObjectId;
  shopName: string;
  shopPhone?: string;
  shopAddress?: string;
  shopProvince?: string;
  shopDistrict?: string;
  shopSubDistrict?: string;
  shopPostalCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ShopSchema = new Schema<IShop>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  shopName: { type: String, required: true, maxlength: 255 },
  shopPhone: { type: String, maxlength: 20 },
  shopAddress: String,
  shopProvince: { type: String, maxlength: 100 },
  shopDistrict: { type: String, maxlength: 100 },
  shopSubDistrict: { type: String, maxlength: 100 },
  shopPostalCode: { type: String, maxlength: 10 },
  createdAt: { type: Date, default: Date.now, required: true },
  updatedAt: { type: Date, default: Date.now, required: true },
}, { timestamps: true });

ShopSchema.index({ userId: 1 });

export const Shop: Model<IShop> = mongoose.model<IShop>('Shop', ShopSchema);

// ==================== PRODUCT SCHEMA ====================
export interface IProduct extends Document {
  shopId: mongoose.Types.ObjectId;
  productName: string;
  productCode?: string;
  productCategory?: string;
  productUnit?: string;
  costPrice?: number;
  sellingPrice?: number;
  currentStock: number;
  minimumStock: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
  productName: { type: String, required: true, maxlength: 255 },
  productCode: { type: String, maxlength: 100 },
  productCategory: { type: String, maxlength: 100 },
  productUnit: { type: String, maxlength: 50 },
  costPrice: { type: Number, min: 0 },
  sellingPrice: { type: Number, min: 0 },
  currentStock: { type: Number, default: 0 },
  minimumStock: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now, required: true },
  updatedAt: { type: Date, default: Date.now, required: true },
}, { timestamps: true });

ProductSchema.index({ shopId: 1 });

export const Product: Model<IProduct> = mongoose.model<IProduct>('Product', ProductSchema);

// ==================== CUSTOMER SCHEMA ====================
export interface ICustomer extends Document {
  shopId: mongoose.Types.ObjectId;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  customerProvince?: string;
  customerDistrict?: string;
  totalDebt: number;
  totalPaid: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>({
  shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
  customerName: { type: String, required: true, maxlength: 255 },
  customerPhone: { type: String, maxlength: 20 },
  customerAddress: String,
  customerProvince: { type: String, maxlength: 100 },
  customerDistrict: { type: String, maxlength: 100 },
  totalDebt: { type: Number, default: 0, min: 0 },
  totalPaid: { type: Number, default: 0, min: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now, required: true },
  updatedAt: { type: Date, default: Date.now, required: true },
}, { timestamps: true });

CustomerSchema.index({ shopId: 1 });

export const Customer: Model<ICustomer> = mongoose.model<ICustomer>('Customer', CustomerSchema);

// ==================== SALE SCHEMA ====================
export interface ISale extends Document {
  shopId: mongoose.Types.ObjectId;
  customerId?: mongoose.Types.ObjectId;
  saleDate: Date;
  totalAmount: number;
  paidAmount: number;
  debtAmount: number;
  paymentMethod: 'cash' | 'credit' | 'transfer' | 'other';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SaleSchema = new Schema<ISale>({
  shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', index: true },
  saleDate: { type: Date, default: Date.now, required: true, index: true },
  totalAmount: { type: Number, required: true, min: 0 },
  paidAmount: { type: Number, default: 0, min: 0 },
  debtAmount: { type: Number, default: 0, min: 0 },
  paymentMethod: { type: String, enum: ['cash', 'credit', 'transfer', 'other'], default: 'cash' },
  notes: String,
  createdAt: { type: Date, default: Date.now, required: true },
  updatedAt: { type: Date, default: Date.now, required: true },
}, { timestamps: true });

SaleSchema.index({ shopId: 1 });
SaleSchema.index({ customerId: 1 });
SaleSchema.index({ saleDate: 1 });

export const Sale: Model<ISale> = mongoose.model<ISale>('Sale', SaleSchema);

// ==================== SALE ITEM SCHEMA ====================
export interface ISaleItem extends Document {
  saleId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: Date;
}

const SaleItemSchema = new Schema<ISaleItem>({
  saleId: { type: Schema.Types.ObjectId, ref: 'Sale', required: true, index: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  quantity: { type: Number, required: true, min: 0 },
  unitPrice: { type: Number, required: true, min: 0 },
  totalPrice: { type: Number, required: true, min: 0 },
  createdAt: { type: Date, default: Date.now, required: true },
}, { timestamps: false });

SaleItemSchema.index({ saleId: 1 });
SaleItemSchema.index({ productId: 1 });

export const SaleItem: Model<ISaleItem> = mongoose.model<ISaleItem>('SaleItem', SaleItemSchema);

// ==================== PRICE HISTORY SCHEMA ====================
export interface IPriceHistory extends Document {
  productId: mongoose.Types.ObjectId;
  oldPrice: number;
  newPrice: number;
  changedBy: mongoose.Types.ObjectId;
  changeDate: Date;
  notes?: string;
  createdAt: Date;
}

const PriceHistorySchema = new Schema<IPriceHistory>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  oldPrice: { type: Number, required: true, min: 0 },
  newPrice: { type: Number, required: true, min: 0 },
  changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  changeDate: { type: Date, default: Date.now, required: true, index: true },
  notes: String,
  createdAt: { type: Date, default: Date.now, required: true },
}, { timestamps: false });

PriceHistorySchema.index({ productId: 1 });
PriceHistorySchema.index({ changeDate: 1 });

export const PriceHistory: Model<IPriceHistory> = mongoose.model<IPriceHistory>('PriceHistory', PriceHistorySchema);

// ==================== DAILY CLOSE SCHEMA ====================
export interface IDailyClose extends Document {
  shopId: mongoose.Types.ObjectId;
  closeDate: Date;
  totalSales: number;
  totalCash: number;
  totalCredit: number;
  totalTransactions: number;
  notes?: string;
  closedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const DailyCloseSchema = new Schema<IDailyClose>({
  shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
  closeDate: { type: Date, required: true, index: true },
  totalSales: { type: Number, default: 0, min: 0 },
  totalCash: { type: Number, default: 0, min: 0 },
  totalCredit: { type: Number, default: 0, min: 0 },
  totalTransactions: { type: Number, default: 0, min: 0 },
  notes: String,
  closedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now, required: true },
}, { timestamps: false });

DailyCloseSchema.index({ shopId: 1 });
DailyCloseSchema.index({ closeDate: 1 });

export const DailyClose: Model<IDailyClose> = mongoose.model<IDailyClose>('DailyClose', DailyCloseSchema);

// ==================== DEBT TRANSACTION SCHEMA ====================
export interface IDebtTransaction extends Document {
  customerId: mongoose.Types.ObjectId;
  saleId?: mongoose.Types.ObjectId;
  debtAmount: number;
  paidAmount: number;
  paymentDate: Date;
  paymentMethod: 'cash' | 'transfer' | 'check' | 'other';
  notes?: string;
  createdAt: Date;
}

const DebtTransactionSchema = new Schema<IDebtTransaction>({
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
  saleId: { type: Schema.Types.ObjectId, ref: 'Sale' },
  debtAmount: { type: Number, required: true, min: 0 },
  paidAmount: { type: Number, required: true, min: 0 },
  paymentDate: { type: Date, default: Date.now, required: true, index: true },
  paymentMethod: { type: String, enum: ['cash', 'transfer', 'check', 'other'], default: 'cash' },
  notes: String,
  createdAt: { type: Date, default: Date.now, required: true },
}, { timestamps: false });

DebtTransactionSchema.index({ customerId: 1 });
DebtTransactionSchema.index({ paymentDate: 1 });

export const DebtTransaction: Model<IDebtTransaction> = mongoose.model<IDebtTransaction>('DebtTransaction', DebtTransactionSchema);

// Type exports for compatibility with existing code
export type InsertUser = Omit<IUser, '_id' | 'createdAt' | 'updatedAt'> & { _id?: mongoose.Types.ObjectId; createdAt?: Date; updatedAt?: Date };
export type InsertShop = Omit<IShop, '_id' | 'createdAt' | 'updatedAt'> & { _id?: mongoose.Types.ObjectId; createdAt?: Date; updatedAt?: Date };
export type InsertProduct = Omit<IProduct, '_id' | 'createdAt' | 'updatedAt'> & { _id?: mongoose.Types.ObjectId; createdAt?: Date; updatedAt?: Date };
export type InsertCustomer = Omit<ICustomer, '_id' | 'createdAt' | 'updatedAt'> & { _id?: mongoose.Types.ObjectId; createdAt?: Date; updatedAt?: Date };
export type InsertSale = Omit<ISale, '_id' | 'createdAt' | 'updatedAt'> & { _id?: mongoose.Types.ObjectId; createdAt?: Date; updatedAt?: Date };
export type InsertSaleItem = Omit<ISaleItem, '_id' | 'createdAt'> & { _id?: mongoose.Types.ObjectId; createdAt?: Date };
export type InsertPriceHistory = Omit<IPriceHistory, '_id' | 'createdAt'> & { _id?: mongoose.Types.ObjectId; createdAt?: Date };
export type InsertDailyClose = Omit<IDailyClose, '_id' | 'createdAt'> & { _id?: mongoose.Types.ObjectId; createdAt?: Date };
export type InsertDebtTransaction = Omit<IDebtTransaction, '_id' | 'createdAt'> & { _id?: mongoose.Types.ObjectId; createdAt?: Date };
