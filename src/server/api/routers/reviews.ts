import { type Review } from "@prisma/client";
import { createTRPCRouter, publicProcedure } from "../trpc";

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
      ORDER BY rev."createdAt", r.name;`;

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
});
