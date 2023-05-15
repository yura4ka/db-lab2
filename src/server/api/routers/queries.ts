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
  second: publicProcedure
    .input(validString)
    .mutation(({ ctx, input: category }) => {
      return ctx.prisma.$queryRaw<{ name: string; email: string }[]>`
        SELECT DISTINCT c.email, c.name
        FROM "Customer" as c
        LEFT JOIN "LikedRestaurants" as l
        ON c.id = l."customerId"
        LEFT JOIN "Restaurant" as r
        ON l."restaurantId" = r.id
        LEFT JOIN "RestaurantToCategory" as rc
        ON r.id = rc."restaurantId"
        LEFT JOIN "Category" as cg
        ON rc."categoryId" = cg.id
        WHERE cg.name = ${category};`;
    }),
});
