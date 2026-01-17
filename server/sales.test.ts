import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import type { User } from "../drizzle/schema";

function createAuthContext(userId: number = 1): TrpcContext {
  const user: User = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("sales.create", () => {
  it("creates a sale with items successfully", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // First, create a shop
    const shopResult = await caller.shop.createShop({
      shopName: "Test Shop",
      shopPhone: "0812345678",
      shopAddress: "123 Main St",
    });

    expect(shopResult).toBeDefined();
    expect(shopResult.shopName).toBe("Test Shop");

    // Create a customer
    const customerResult = await caller.customer.create({
      customerName: "Test Customer",
      customerPhone: "0987654321",
      customerAddress: "456 Oak Ave",
      debtLimit: "10000",
    });

    expect(customerResult).toBeDefined();
    expect(customerResult.customerName).toBe("Test Customer");

    // Create a product
    const productResult = await caller.product.create({
      productName: "Test Product",
      productCategory: "Test Category",
      productUnit: "ชิ้น",
      costPrice: "100",
      sellingPrice: "150",
      minStock: "10",
    });

    expect(productResult).toBeDefined();
    expect(productResult.productName).toBe("Test Product");

    // Create a sale
    const saleResult = await caller.sales.create({
      customerId: customerResult.id,
      paymentMethod: "cash",
      totalAmount: "150",
      paidAmount: "150",
      debtAmount: "0",
      items: [
        {
          productId: productResult.id,
          quantity: "1",
          unitPrice: "150",
          totalPrice: "150",
        },
      ],
    });

    expect(saleResult).toBeDefined();
    expect(saleResult.totalAmount).toBe("150");
    expect(saleResult.paymentMethod).toBe("cash");
  });

  it("creates a sale with credit payment", async () => {
    const ctx = createAuthContext(4);
    const caller = appRouter.createCaller(ctx);

    // Create a shop
    const shopResult = await caller.shop.createShop({
      shopName: "Test Shop 2",
      shopPhone: "0812345678",
      shopAddress: "123 Main St",
    });

    // Create a customer
    const customerResult = await caller.customer.create({
      customerName: "Test Customer 2",
      customerPhone: "0987654321",
      customerAddress: "456 Oak Ave",
      debtLimit: "10000",
    });

    // Create a product
    const productResult = await caller.product.create({
      productName: "Test Product 2",
      productCategory: "Test Category",
      productUnit: "ชิ้น",
      costPrice: "100",
      sellingPrice: "150",
      minStock: "10",
    });

    // Create a credit sale
    const saleResult = await caller.sales.create({
      customerId: customerResult.id,
      paymentMethod: "credit",
      totalAmount: "300",
      paidAmount: "0",
      debtAmount: "300",
      items: [
        {
          productId: productResult.id,
          quantity: "2",
          unitPrice: "150",
          totalPrice: "300",
        },
      ],
    });

    expect(saleResult).toBeDefined();
    expect(saleResult.totalAmount).toBe("300");
    expect(saleResult.debtAmount).toBe("300");
    expect(saleResult.paymentMethod).toBe("credit");
  });

  it("lists sales for a shop", async () => {
    const ctx = createAuthContext(5);
    const caller = appRouter.createCaller(ctx);

    // Create a shop
    const shopResult = await caller.shop.createShop({
      shopName: "Test Shop 3",
      shopPhone: "0812345678",
      shopAddress: "123 Main St",
    });

    // Create a customer
    const customerResult = await caller.customer.create({
      customerName: "Test Customer 3",
      customerPhone: "0987654321",
      customerAddress: "456 Oak Ave",
      debtLimit: "10000",
    });

    // Create a product
    const productResult = await caller.product.create({
      productName: "Test Product 3",
      productCategory: "Test Category",
      productUnit: "ชิ้น",
      costPrice: "100",
      sellingPrice: "150",
      minStock: "10",
    });

    // Create a sale
    await caller.sales.create({
      customerId: customerResult.id,
      paymentMethod: "cash",
      totalAmount: "150",
      paidAmount: "150",
      debtAmount: "0",
      items: [
        {
          productId: productResult.id,
          quantity: "1",
          unitPrice: "150",
          totalPrice: "150",
        },
      ],
    });

    // List sales
    const salesList = await caller.sales.list();

    expect(Array.isArray(salesList)).toBe(true);
    expect(salesList.length).toBeGreaterThan(0);
  });
});
