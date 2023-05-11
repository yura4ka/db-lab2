import type { Restaurant } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { validId, validString, validUrl } from "~/utils/schemas";

const restaurantSchema = z.object({
  name: validString,
  address: validString,
  website: validUrl,
  description: validString,
  price: z.number().positive(),
  categories: z.array(validId),
});

export const restaurantsRouter = createTRPCRouter({
  get: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.$queryRaw<Restaurant[]>`SELECT * FROM "Restaurant";`;
  }),
  create: publicProcedure
    .input(restaurantSchema)
    .mutation(async ({ ctx, input }) => {
      const [{ id }] = await ctx.prisma.$queryRaw<[{ id: number }]>`
        INSERT INTO "Restaurant" (name, address, website, description, price)
        VALUES (${input.name}, ${input.address}, ${input.website}, ${input.description}, ${input.price})
        RETURNING id;`;

      await ctx.prisma.$executeRaw`
        INSERT INTO "RestaurantToCategory" (restaurantId, categoryId)
        VALUES ${input.categories.map((c) => `(${id}, ${c})`).join(", ")}`;
      return id;
    }),
  update: publicProcedure
    .input(restaurantSchema.extend({ id: validId }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.$executeRaw`
        DELETE FROM "RestaurantToCategory"
        WHERE restaurantId = ${input.id};`;

      await ctx.prisma.$executeRaw`
        UPDATE "Restaurant"
        SET name = ${input.name}, address = ${input.address}, website = ${input.website}, 
            description = ${input.description} price = ${input.price} 
        WHERE restaurantId = ${input.id};`;

      await ctx.prisma.$executeRaw`
        INSERT INTO "RestaurantToCategory" (restaurantId, categoryId)
        VALUES ${input.categories
          .map((c) => `(${input.id}, ${c})`)
          .join(", ")};`;

      return true;
    }),
  remove: publicProcedure
    .input(validId)
    .mutation(async ({ ctx, input: id }) => {
      await ctx.prisma.$executeRaw`
        DELETE FROM "Restaurant" 
        WHERE restaurantId = ${id};`;
      return true;
    }),
  getById: publicProcedure.input(validId).query(async ({ ctx, input: id }) => {
    const rows = await ctx.prisma.$queryRaw<
      (Restaurant & { categoryId: number; categoryName: string })[]
    >`
        SELECT r.id, r.name, r.address, r.website, r.description, r.price, c.id as "categoryId", c.name as "categoryName"
        FROM (("Restaurant" as r
          INNER JOIN "RestaurantToCategory" as rc
          ON r.id = rc."restaurantId")
            INNER JOIN "Category" as c
            ON rc."categoryId" = c.id)
        WHERE r.id = ${id};`;
    if (rows.length === 0) throw new TRPCError({ code: "BAD_REQUEST" });
    const categories = rows.map((r) => ({
      id: r.categoryId,
      name: r.categoryName,
    }));

    const r = rows[0] as Restaurant & {
      categoryId: number;
      categoryName: string;
    };

    return {
      id: r.id,
      name: r.name,
      address: r.address,
      website: r.website,
      description: r.description,
      price: r.price,
      categories,
    };
  }),
});
