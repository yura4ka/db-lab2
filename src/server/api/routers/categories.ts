import type { Category } from "@prisma/client";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { validId, validString } from "~/utils/schemas";

export const categoriesRouter = createTRPCRouter({
  get: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.$queryRaw<Category[]>`SELECT * FROM "Category";`;
  }),
  create: publicProcedure
    .input(validString)
    .mutation(async ({ ctx, input: name }) => {
      const id = await ctx.prisma.$queryRaw<[{ id: number }]>`
        INSERT INTO "Category" (name)
        VALUES (${name.trim()})
        RETURNING id`;
      return id;
    }),
  update: publicProcedure
    .input(z.object({ id: validId, name: validString }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.$executeRaw`
        UPDATE "Category" 
        SET name = ${input.name.trim()}
        WHERE id = ${input.id};`;
      return true;
    }),
  remove: publicProcedure
    .input(validId)
    .mutation(async ({ ctx, input: id }) => {
      await ctx.prisma.$executeRaw`
        DELETE FROM "Category"
        WHERE id = ${id};`;
      return true;
    }),
  getById: publicProcedure.input(validId).query(({ ctx, input: id }) => {
    return ctx.prisma.$queryRaw<[Category]>`
      SELECT * FROM "Category" 
      WHERE id = ${id};`;
  }),
});
