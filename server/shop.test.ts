import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import type { User } from "../drizzle/schema";

function createAuthContext(userId: number = 1): { ctx: TrpcContext } {
  const user: User = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "test",
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

  return { ctx };
}

describe("Thai Smart Shop Router", () => {
  it("should get user auth context", async () => {
    const { ctx } = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);
    
    const user = await caller.auth.me();
    expect(user).toBeDefined();
    expect(user?.id).toBe(1);
    expect(user?.openId).toBe("test-user-1");
  });

  it("should handle shop creation", async () => {
    const { ctx } = createAuthContext(2);
    const caller = appRouter.createCaller(ctx);
    
    // Test that the router is callable
    expect(caller.shop).toBeDefined();
    expect(caller.shop.createShop).toBeDefined();
  });

  it("should handle product operations", async () => {
    const { ctx } = createAuthContext(3);
    const caller = appRouter.createCaller(ctx);
    
    // Test that the router is callable
    expect(caller.product).toBeDefined();
    expect(caller.product.list).toBeDefined();
    expect(caller.product.create).toBeDefined();
    expect(caller.product.update).toBeDefined();
  });

  it("should handle customer operations", async () => {
    const { ctx } = createAuthContext(4);
    const caller = appRouter.createCaller(ctx);
    
    // Test that the router is callable
    expect(caller.customer).toBeDefined();
    expect(caller.customer.list).toBeDefined();
    expect(caller.customer.create).toBeDefined();
    expect(caller.customer.update).toBeDefined();
  });

  it("should handle sales operations", async () => {
    const { ctx } = createAuthContext(5);
    const caller = appRouter.createCaller(ctx);
    
    // Test that the router is callable
    expect(caller.sales).toBeDefined();
    expect(caller.sales.list).toBeDefined();
    expect(caller.sales.create).toBeDefined();
  });

  it("should handle dashboard stats", async () => {
    const { ctx } = createAuthContext(6);
    const caller = appRouter.createCaller(ctx);
    
    // Test that the router is callable
    expect(caller.dashboard).toBeDefined();
    expect(caller.dashboard.stats).toBeDefined();
  });

  it("should handle price history operations", async () => {
    const { ctx } = createAuthContext(7);
    const caller = appRouter.createCaller(ctx);
    
    // Test that the router is callable
    expect(caller.priceHistory).toBeDefined();
    expect(caller.priceHistory.list).toBeDefined();
    expect(caller.priceHistory.create).toBeDefined();
  });

  it("should handle daily close operations", async () => {
    const { ctx } = createAuthContext(8);
    const caller = appRouter.createCaller(ctx);
    
    // Test that the router is callable
    expect(caller.dailyClose).toBeDefined();
    expect(caller.dailyClose.get).toBeDefined();
    expect(caller.dailyClose.history).toBeDefined();
    expect(caller.dailyClose.create).toBeDefined();
  });

  it("should handle debt transaction operations", async () => {
    const { ctx } = createAuthContext(9);
    const caller = appRouter.createCaller(ctx);
    
    // Test that the router is callable
    expect(caller.debtTransaction).toBeDefined();
    expect(caller.debtTransaction.list).toBeDefined();
    expect(caller.debtTransaction.create).toBeDefined();
  });

  it("should logout successfully", async () => {
    const { ctx } = createAuthContext(10);
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
  });
});
