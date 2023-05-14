import { type Customer } from "@prisma/client";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { validEmail, validId, validString } from "~/utils/schemas";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

type TCustomer = Omit<Customer, "password">;
type TCustomerFull = TCustomer & { reviewCount: number; favoriteCount: number };

const userSchema = z.object({
  name: validString,
  email: validEmail,
});

export const usersRouter = createTRPCRouter({
  get: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.prisma.$queryRaw<TCustomerFull[]>`
      SELECT c.id, c.name, c.email, 
        COUNT(DISTINCT r.id) AS "reviewCount", COUNT(DISTINCT l.id) AS "favoriteCount"
      FROM "Customer" as c
      LEFT JOIN "Review" as r
      ON c.id = r."customerId"
      LEFT JOIN "LikedRestaurants" as l
      ON c.id = l."customerId"
      GROUP BY c.id
      ORDER BY c.name;`;
    return result.map((r) => ({
      ...r,
      reviewCount: Number(r.reviewCount),
      favoriteCount: Number(r.favoriteCount),
    }));
  }),
  create: publicProcedure.input(userSchema).mutation(async ({ ctx, input }) => {
    const defaultPassword = "1234";
    const [{ id }] = await ctx.prisma.$queryRaw<[{ id: number }]>`
      INSERT INTO "Customer" (name, email, password)
      VALUES (${input.name}, ${input.email}, ${defaultPassword})
      RETURNING id;`;
    return id;
  }),
  update: publicProcedure
    .input(userSchema.extend({ id: validId }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.$executeRaw`
        UPDATE "Customer"
        SET name = ${input.name}, email = ${input.email}
        WHERE id = ${input.id};`;
      return true;
    }),
  remove: publicProcedure
    .input(validId)
    .mutation(async ({ ctx, input: id }) => {
      await ctx.prisma.$executeRaw`
        DELETE FROM "Customer"
        WHERE id = ${id};`;
      return true;
    }),
  getById: publicProcedure.input(validId).query(async ({ ctx, input: id }) => {
    const [row] = await ctx.prisma.$queryRaw<[TCustomer | undefined]>`
      SELECT * FROM "Customer"
      WHERE id = ${id};`;
    if (!row) throw new TRPCError({ code: "BAD_REQUEST" });
    return row;
  }),
});
