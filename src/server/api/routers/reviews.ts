import { Prisma, type Review } from "@prisma/client";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import { validId, validScore, validString } from "~/utils/schemas";
import { TRPCError } from "@trpc/server";

type TReview = Omit<Review, "customerId" | "restaurantId"> & {
  restaurant: string;
  customer: string;
};

type TReviewRow = TReview & {
  dishScore: number | null;
  dish: string | null;
  dishComment: string | null;
};

type TReviewResponse = TReview & {
  dishes: { name: string; score: number; comment: string }[];
};

type TReviewInfo = Review & {
  restaurantName: string;
  customerName: string;
  customerEmail: string;
  dishId: number | null;
  dishName: string | null;
  dishComment: string | null;
  dishScore: number | null;
};

const reviewSchema = z.object({
  text: validString,
  score: validScore,
  restaurantId: validId,
  customerId: validId,
  dishes: z.array(
    z.object({
      id: validId,
      score: validScore,
      comment: validString.max(100),
    })
  ),
});

export const reviewRouter = createTRPCRouter({
  get: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.prisma.$queryRaw<TReviewRow[]>`
      SELECT rev.id, rev.text, rev.score, rev."createdAt",
        r.name as restaurant, c.name as customer,
        dr.score as "dishScore", dr.comment as "dishComment", d.name as dish
      FROM "Review" as rev
      LEFT JOIN "Restaurant" as r
      ON rev."restaurantId" = r.id
      LEFT JOIN "Customer" as c
      ON rev."customerId" = c.id
      LEFT JOIN "DishReview" as dr
      ON rev.id = dr."reviewId"
      LEFT JOIN "Dish" as d
      ON dr."dishId" = d.id
      ORDER BY rev."createdAt" DESC, r.name;`;

    const map = new Map<number, TReviewResponse>();
    for (const r of result) {
      if (!map.has(r.id)) {
        map.set(r.id, {
          id: r.id,
          text: r.text,
          score: r.score,
          createdAt: r.createdAt,
          restaurant: r.restaurant,
          customer: r.customer,
          dishes: [],
        });
      }

      if (r.dishScore && r.dish && r.dishComment)
        map.get(r.id)?.dishes.push({
          name: r.dish,
          score: r.dishScore,
          comment: r.dishComment,
        });
    }

    return Array.from(map.values());
  }),
  create: publicProcedure
    .input(reviewSchema)
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.$transaction(async (tx) => {
        const [{ id }] = await tx.$queryRaw<[{ id: number }]>`
          INSERT INTO "Review" (text, score, "restaurantId", "customerId")
          VALUES (${input.text}, ${input.score}, ${input.restaurantId}, ${input.customerId})
          RETURNING id;`;
        await tx.$executeRaw(Prisma.sql`
          INSERT INTO "DishReview" ("reviewId" ,"dishId", score, comment)
          VALUES ${Prisma.join(
            input.dishes.map(
              (d) =>
                Prisma.sql`(${Prisma.join([id, d.id, d.score, d.comment])})`
            )
          )};`);
        return id;
      });
    }),
  update: publicProcedure
    .input(reviewSchema.extend({ id: validId }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.$transaction([
        ctx.prisma.$executeRaw`
          DELETE FROM "DishReview"
          WHERE "reviewId" = ${input.id};`,
        ctx.prisma.$executeRaw`
          UPDATE "Review"
          SET text = ${input.text}, score = ${input.score}, "restaurantId" = ${input.restaurantId}, "customerId" = ${input.customerId}
          WHERE id = ${input.id};`,
        ctx.prisma.$executeRaw(Prisma.sql`
          INSERT INTO "DishReview" ("reviewId" ,"dishId", score, comment)
          VALUES ${Prisma.join(
            input.dishes.map(
              (d) =>
                Prisma.sql`(${Prisma.join([
                  input.id,
                  d.id,
                  d.score,
                  d.comment,
                ])})`
            )
          )};`),
      ]);
      return true;
    }),
  remove: publicProcedure
    .input(validId)
    .mutation(async ({ ctx, input: id }) => {
      await ctx.prisma.$executeRaw`
        DELETE FROM "Review"
        WHERE id = ${id};`;
      return true;
    }),
  getById: publicProcedure.input(validId).query(async ({ ctx, input: id }) => {
    const rows = await ctx.prisma.$queryRaw<TReviewInfo[]>`
      SELECT rev.text, rev.score, rev."restaurantId", rev."customerId", 
        c.name as "customerName", c.email as "customerEmail", r.name as "restaurantName",
        dr.score as "dishScore", dr.comment as "dishComment", d.id as "dishId", d.name as "dishName"
      FROM "Review" as rev
      INNER JOIN "Customer" as c
      ON rev."customerId" = c.id
      INNER JOIN "Restaurant" as r
      ON rev."restaurantId" = r.id
      INNER JOIN "DishReview" as dr
      ON rev.id = dr."reviewId"
      INNER JOIN "Dish" as d
      ON dr."dishId" = d.id
      WHERE rev.id = ${id};`;

    if (rows.length === 0) throw new TRPCError({ code: "BAD_REQUEST" });

    const dishes = [];
    for (const r of rows) {
      if (r.dishId && r.dishName && r.dishComment && r.dishScore)
        dishes.push({
          id: r.dishId,
          name: r.dishName,
          comment: r.dishComment,
          score: r.dishScore,
        });
    }

    const row = rows[0] as TReviewInfo;
    return {
      text: row.text,
      score: row.score,
      restaurant: { id: row.restaurantId, name: row.restaurantName },
      customer: {
        id: row.customerId,
        name: row.customerName,
        email: row.customerEmail,
      },
      dishes,
    };
  }),
});
