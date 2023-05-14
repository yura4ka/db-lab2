import { type Customer } from "@prisma/client";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { validId } from "~/utils/schemas";

type TCustomer = Customer & { reviewCount: number; favoriteCount: number };

export const usersRouter = createTRPCRouter({
  get: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.prisma.$queryRaw<TCustomer[]>`
      SELECT c.id, c.name, c.email, COUNT(r.id) AS "reviewCount", COUNT(l.id) AS "favoriteCount"
      FROM "Customer" as c
      LEFT JOIN "Review" as r
      ON c.id = r."customerId"
      LEFT JOIN "LikedRestaurants" as l
      ON c.id = l."customerId"
      GROUP BY c.id
    `;
    return result.map((r) => ({
      ...r,
      reviewCount: Number(r.reviewCount),
      favoriteCount: Number(r.favoriteCount),
    }));
  }),
  remove: publicProcedure
    .input(validId)
    .mutation(async ({ ctx, input: id }) => {
      await ctx.prisma.$executeRaw`
        DELETE FROM "Customer"
        WHERE id = ${id};`;
      return true;
    }),
});
