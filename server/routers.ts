import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ==================== SHOP ENDPOINTS ====================
  shop: router({
    getMyShop: protectedProcedure.query(async ({ ctx }) => {
      return await db.getShopByUserId(ctx.user.id);
    }),

    createShop: protectedProcedure
      .input(z.object({
        shopName: z.string().min(1),
        shopPhone: z.string().optional(),
        shopAddress: z.string().optional(),
        shopProvince: z.string().optional(),
        shopDistrict: z.string().optional(),
        shopSubDistrict: z.string().optional(),
        shopPostalCode: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const existingShop = await db.getShopByUserId(ctx.user.id);
        if (existingShop) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'User already has a shop',
          });
        }
        return await db.createShop({
          userId: ctx.user.id,
          ...input,
        });
      }),

    updateShop: protectedProcedure
      .input(z.object({
        shopName: z.string().optional(),
        shopPhone: z.string().optional(),
        shopAddress: z.string().optional(),
        shopProvince: z.string().optional(),
        shopDistrict: z.string().optional(),
        shopSubDistrict: z.string().optional(),
        shopPostalCode: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const shop = await db.getShopByUserId(ctx.user.id);
        if (!shop) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Shop not found',
          });
        }
        return await db.updateShop(shop.id, input);
      }),
  }),

  // ==================== PRODUCT ENDPOINTS ====================
  product: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const shop = await db.getShopByUserId(ctx.user.id);
      if (!shop) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Shop not found',
        });
      }
      return await db.getProductsByShop(shop.id);
    }),

    get: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ input }) => {
        return await db.getProductById(input.productId);
      }),

    create: protectedProcedure
      .input(z.object({
        productName: z.string().min(1),
        productCode: z.string().optional(),
        productCategory: z.string().optional(),
        productUnit: z.string().optional(),
        costPrice: z.string(),
        sellingPrice: z.string(),
        currentStock: z.number().default(0),
        minimumStock: z.number().default(0),
      }))
      .mutation(async ({ ctx, input }) => {
        const shop = await db.getShopByUserId(ctx.user.id);
        if (!shop) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Shop not found',
          });
        }
        return await db.createProduct({
          shopId: shop.id,
          ...input,
        });
      }),

    update: protectedProcedure
      .input(z.object({
        productId: z.number(),
        productName: z.string().optional(),
        productCode: z.string().optional(),
        productCategory: z.string().optional(),
        productUnit: z.string().optional(),
        costPrice: z.string().optional(),
        sellingPrice: z.string().optional(),
        currentStock: z.number().optional(),
        minimumStock: z.number().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const shop = await db.getShopByUserId(ctx.user.id);
        if (!shop) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Shop not found',
          });
        }
        const product = await db.getProductById(input.productId);
        if (!product || product.shopId !== shop.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Product not found or access denied',
          });
        }
        const { productId, ...updateData } = input;
        return await db.updateProduct(productId, updateData);
      }),
  }),

  // ==================== CUSTOMER ENDPOINTS ====================
  customer: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const shop = await db.getShopByUserId(ctx.user.id);
      if (!shop) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Shop not found',
        });
      }
      return await db.getCustomersByShop(shop.id);
    }),

    get: protectedProcedure
      .input(z.object({ customerId: z.number() }))
      .query(async ({ input }) => {
        return await db.getCustomerById(input.customerId);
      }),

    create: protectedProcedure
      .input(z.object({
        customerName: z.string().min(1),
        customerPhone: z.string().optional(),
        customerAddress: z.string().optional(),
        customerProvince: z.string().optional(),
        customerDistrict: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const shop = await db.getShopByUserId(ctx.user.id);
        if (!shop) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Shop not found',
          });
        }
        return await db.createCustomer({
          shopId: shop.id,
          totalDebt: "0",
          totalPaid: "0",
          ...input,
        });
      }),

    update: protectedProcedure
      .input(z.object({
        customerId: z.number(),
        customerName: z.string().optional(),
        customerPhone: z.string().optional(),
        customerAddress: z.string().optional(),
        customerProvince: z.string().optional(),
        customerDistrict: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const shop = await db.getShopByUserId(ctx.user.id);
        if (!shop) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Shop not found',
          });
        }
        const customer = await db.getCustomerById(input.customerId);
        if (!customer || customer.shopId !== shop.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Customer not found or access denied',
          });
        }
        const { customerId, ...updateData } = input;
        return await db.updateCustomer(customerId, updateData);
      }),
  }),

  // ==================== SALES ENDPOINTS ====================
  sales: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const shop = await db.getShopByUserId(ctx.user.id);
      if (!shop) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Shop not found',
        });
      }
      return await db.getSalesByShop(shop.id);
    }),

    get: protectedProcedure
      .input(z.object({ saleId: z.number() }))
      .query(async ({ input }) => {
        const sale = await db.getSaleById(input.saleId);
        const items = await db.getSaleItems(input.saleId);
        return { ...sale, items };
      }),

    create: protectedProcedure
      .input(z.object({
        customerId: z.number().optional(),
        totalAmount: z.string(),
        paidAmount: z.string().optional(),
        debtAmount: z.string().optional(),
        paymentMethod: z.enum(["cash", "credit", "transfer", "other"]).default("cash"),
        notes: z.string().optional(),
        items: z.array(z.object({
          productId: z.number(),
          quantity: z.string(),
          unitPrice: z.string(),
          totalPrice: z.string(),
        })),
      }))
      .mutation(async ({ ctx, input }) => {
        const shop = await db.getShopByUserId(ctx.user.id);
        if (!shop) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Shop not found',
          });
        }

        const sale = await db.createSale({
          shopId: shop.id,
          customerId: input.customerId,
          totalAmount: input.totalAmount,
          paidAmount: input.paidAmount || "0",
          debtAmount: input.debtAmount || "0",
          paymentMethod: input.paymentMethod,
          notes: input.notes,
        });

        // Create sale items
        if (sale && 'insertId' in sale) {
          for (const item of input.items) {
            await db.createSaleItem({
              saleId: sale.insertId as number,
              ...item,
            });
          }
        }

        return sale;
      }),
  }),

  // ==================== DASHBOARD ENDPOINTS ====================
  dashboard: router({
    stats: protectedProcedure
      .input(z.object({ date: z.date().optional() }))
      .query(async ({ ctx, input }) => {
        const shop = await db.getShopByUserId(ctx.user.id);
        if (!shop) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Shop not found',
          });
        }
        const date = input.date || new Date();
        return await db.getDashboardStats(shop.id, date);
      }),
  }),

  // ==================== PRICE HISTORY ENDPOINTS ====================
  priceHistory: router({
    list: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ input }) => {
        return await db.getPriceHistory(input.productId);
      }),

    create: protectedProcedure
      .input(z.object({
        productId: z.number(),
        oldPrice: z.string(),
        newPrice: z.string(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const shop = await db.getShopByUserId(ctx.user.id);
        if (!shop) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Shop not found',
          });
        }
        return await db.createPriceHistory({
          productId: input.productId,
          oldPrice: input.oldPrice,
          newPrice: input.newPrice,
          changedBy: ctx.user.id,
          notes: input.notes,
        });
      }),
  }),

  // ==================== DAILY CLOSE ENDPOINTS ====================
  dailyClose: router({
    get: protectedProcedure
      .input(z.object({ date: z.date().optional() }))
      .query(async ({ ctx, input }) => {
        const shop = await db.getShopByUserId(ctx.user.id);
        if (!shop) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Shop not found',
          });
        }
        const date = input.date || new Date();
        return await db.getDailyCloseByDate(shop.id, date);
      }),

    history: protectedProcedure.query(async ({ ctx }) => {
      const shop = await db.getShopByUserId(ctx.user.id);
      if (!shop) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Shop not found',
        });
      }
      return await db.getDailyCloseHistory(shop.id);
    }),

    create: protectedProcedure
      .input(z.object({
        totalSales: z.string(),
        totalCash: z.string(),
        totalCredit: z.string(),
        totalTransactions: z.number(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const shop = await db.getShopByUserId(ctx.user.id);
        if (!shop) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Shop not found',
          });
        }
        return await db.createDailyClose({
          shopId: shop.id,
          closeDate: new Date(),
          totalSales: input.totalSales,
          totalCash: input.totalCash,
          totalCredit: input.totalCredit,
          totalTransactions: input.totalTransactions,
          notes: input.notes,
          closedBy: ctx.user.id,
        });
      }),
  }),

  // ==================== DEBT TRANSACTION ENDPOINTS ====================
  debtTransaction: router({
    list: protectedProcedure
      .input(z.object({ customerId: z.number() }))
      .query(async ({ input }) => {
        return await db.getDebtTransactions(input.customerId);
      }),

    create: protectedProcedure
      .input(z.object({
        customerId: z.number(),
        saleId: z.number().optional(),
        debtAmount: z.string(),
        paidAmount: z.string(),
        paymentMethod: z.enum(["cash", "transfer", "check", "other"]).default("cash"),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const shop = await db.getShopByUserId(ctx.user.id);
        if (!shop) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Shop not found',
          });
        }
        return await db.createDebtTransaction({
          customerId: input.customerId,
          saleId: input.saleId,
          debtAmount: input.debtAmount,
          paidAmount: input.paidAmount,
          paymentMethod: input.paymentMethod,
          notes: input.notes,
        });
      }),
  }),
});

export type AppRouter = typeof appRouter;
