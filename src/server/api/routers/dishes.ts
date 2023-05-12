import { type Dish } from "@prisma/client";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import { validId, validString } from "~/utils/schemas";
import { TRPCError } from "@trpc/server";

const dishSchema = z.object({
  name: validString,
  price: z.number().positive(),
  description: validString,
  isMain: z.boolean(),
  restaurantId: validId,
  categoryId: validId,
});

type DishQuery = Dish & {
  categoryId: number;
  categoryName: string;
  restaurantId: number;
  restaurantName: string;
};

function formatDishResult(dishResult: DishQuery) {
  return {
    id: dishResult.id,
    name: dishResult.name,
    price: dishResult.price,
    description: dishResult.description,
    isMain: dishResult.isMain,
    category: { id: dishResult.categoryId, name: dishResult.categoryName },
    restaurant: {
      id: dishResult.restaurantId,
      name: dishResult.restaurantName,
    },
  };
}

export const dishesRouter = createTRPCRouter({
  get: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.prisma.$queryRaw<DishQuery[]>`
      SELECT d.id, d.name, d.price, d.description, d."isMain", c.id as "categoryId", c.name as "categoryName", r.id as "restaurantId", r.name as "restaurantName"
      FROM "Dish" as d
      INNER JOIN "Category" as c
      ON d."categoryId" = c.id
      INNER JOIN "Restaurant" as r
      ON d."restaurantId" = r.id`;
    return result.map((r) => formatDishResult(r));
  }),
  create: publicProcedure.input(dishSchema).mutation(async ({ ctx, input }) => {
    const [{ id }] = await ctx.prisma.$queryRaw<[{ id: number }]>`
      INSERT INTO "Dish" (name, price, description, "isMain", "restaurantId", "categoryId")
      VALUES (${input.name}, ${input.price}, ${input.description}, ${input.isMain}, ${input.restaurantId}, ${input.categoryId})
      RETURNING id`;
    return id;
  }),
  update: publicProcedure
    .input(dishSchema.extend({ id: validId }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.$executeRaw`
        UPDATE "Dish"
        SET name = ${input.name}, price = ${input.price}, description = ${input.description}, "isMain" = ${input.isMain}, "restaurantId" = ${input.restaurantId}, "categoryId" = ${input.categoryId} 
        WHERE id = ${input.id}
      `;
      return true;
    }),
  remove: publicProcedure
    .input(validId)
    .mutation(async ({ ctx, input: id }) => {
      await ctx.prisma.$executeRaw`
        DELETE FROM "Dish" WHERE id = ${id};
      `;
      return true;
    }),
  getById: publicProcedure.input(validId).query(async ({ ctx, input: id }) => {
    const [result] = await ctx.prisma.$queryRaw<[DishQuery | undefined]>`
      SELECT d.id, d.name, d.price, d.description, d."isMain", c.id as "categoryId", c.name as "categoryName", r.id as "restaurantId", r.name as "restaurantName"
      FROM "Dish" as d
      INNER JOIN "Category" as c
      ON d."categoryId" = c.id
      INNER JOIN "Restaurant" as r
      ON d."restaurantId" = r.id
      WHERE d.id = ${id}
      `;

    if (!result) throw new TRPCError({ code: "BAD_REQUEST" });
    return formatDishResult(result);
  }),
});
