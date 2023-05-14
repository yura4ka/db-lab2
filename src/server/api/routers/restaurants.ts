import { Prisma, type Restaurant } from "@prisma/client";
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

type TRestaurant = Restaurant & {
  dishCount: number;
  reviewCount: number;
  likedCount: number;
};

type TRestaurantRow = TRestaurant & { category: string };
type TReturnRestaurant = TRestaurant & { categories: string[] };

export const restaurantsRouter = createTRPCRouter({
  get: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.prisma.$queryRaw<TRestaurantRow[]>`
      SELECT r.id as id, r.name as name, r.address as address,
        r.website as website, r.description as description, r.price as price,
        COUNT(DISTINCT d.id) as "dishCount", COUNT(DISTINCT rev.id) as "reviewCount", COUNT(DISTINCT lr.id) as "likedCount",
        c.name as "category"
      FROM "Restaurant" as r
      LEFT JOIN "Dish" as d
      ON r.id = d."restaurantId"
      LEFT JOIN "Review" as rev
      ON r.id = rev."restaurantId"
      LEFT JOIN "LikedRestaurants" as lr
      ON r.id = lr."restaurantId"
      LEFT JOIN "RestaurantToCategory" as rtc
      ON r.id = rtc."restaurantId"
      LEFT JOIN "Category" as c
      ON rtc."categoryId" = c.id
      GROUP BY r.id, c.id
      ORDER BY r.name;`;

    const restaurants = new Map<number, TReturnRestaurant>();

    for (const r of result) {
      const c = restaurants.get(r.id);
      if (c) {
        c.categories.push(r.category);
      } else {
        restaurants.set(r.id, {
          id: r.id,
          name: r.name,
          address: r.address,
          website: r.website,
          description: r.description,
          price: r.price,
          categories: [r.category],
          dishCount: Number(r.dishCount),
          reviewCount: Number(r.reviewCount),
          likedCount: Number(r.likedCount),
        });
      }
    }

    return Array.from(restaurants.values());
  }),
  create: publicProcedure
    .input(restaurantSchema)
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.$transaction(async (tx) => {
        const [{ id }] = await tx.$queryRaw<[{ id: number }]>`
          INSERT INTO "Restaurant" (name, address, website, description, price)
          VALUES (${input.name}, ${input.address}, ${input.website}, ${input.description}, ${input.price})
          RETURNING id;`;
        await tx.$executeRaw(Prisma.sql`
          INSERT INTO "RestaurantToCategory" ("restaurantId", "categoryId")
          VALUES ${Prisma.join(
            input.categories.map((c) => Prisma.sql`(${Prisma.join([id, c])})`)
          )};`);
        return id;
      });
    }),
  update: publicProcedure
    .input(restaurantSchema.extend({ id: validId }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.$transaction([
        ctx.prisma.$executeRaw`
          DELETE FROM "RestaurantToCategory"
          WHERE "restaurantId" = ${input.id};`,
        ctx.prisma.$executeRaw`
          UPDATE "Restaurant"
          SET name = ${input.name}, address = ${input.address}, website = ${input.website}, 
              description = ${input.description}, price = ${input.price} 
          WHERE id = ${input.id};`,
        ctx.prisma.$executeRaw(Prisma.sql`
          INSERT INTO "RestaurantToCategory" ("restaurantId", "categoryId")
          VALUES ${Prisma.join(
            input.categories.map(
              (c) => Prisma.sql`(${Prisma.join([input.id, c])})`
            )
          )};`),
      ]);

      return true;
    }),
  remove: publicProcedure
    .input(validId)
    .mutation(async ({ ctx, input: id }) => {
      await ctx.prisma.$executeRaw`
        DELETE FROM "Restaurant" 
        WHERE id = ${id};`;
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
