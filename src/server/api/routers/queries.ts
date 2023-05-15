import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { validString } from "~/utils/schemas";

export const queriesRouter = createTRPCRouter({
  first: publicProcedure
    .input(z.object({ category: validString, score: z.number().positive() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.$queryRaw<{ name: string }[]>`
        SELECT r.name
        FROM "Restaurant" AS r
        LEFT JOIN "Review" AS rev
        ON r.id = rev."restaurantId"
        LEFT JOIN "DishReview" AS dr
        ON rev.id = dr."reviewId"
        LEFT JOIN "Dish" AS d
        ON dr."dishId" = d.id
        LEFT JOIN "Category" as c
        ON d."categoryId" = c.id
        WHERE c.name = ${input.category}
        GROUP BY r.name
        HAVING AVG(dr.score) >= ${input.score};`;
    }),
});
