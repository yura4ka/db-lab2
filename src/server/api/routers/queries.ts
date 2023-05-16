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
  third: publicProcedure
    .input(validString)
    .mutation(({ ctx, input: restaurant }) => {
      return ctx.prisma.$queryRaw<{ name: string }[]>`
        SELECT DISTINCT r.name
        FROM "Restaurant" as r
        INNER JOIN "RestaurantToCategory" as rtc
        ON r.id = rtc."restaurantId"
        WHERE rtc."categoryId" IN
          (SELECT rtc2."categoryId" 
          FROM "Restaurant" as r2
          INNER JOIN "RestaurantToCategory" as rtc2 
          ON r2.id = rtc2."restaurantId"
          WHERE r2.name = ${restaurant})
        GROUP BY r.name
        HAVING COUNT(rtc.id) = (
            SELECT COUNT(rtc3.id)
            FROM "Restaurant" as r3 
            INNER JOIN "RestaurantToCategory" as rtc3
            ON r3.id = rtc3."restaurantId"
            WHERE r3.name = ${restaurant}
        );`;
    }),
  fourth: publicProcedure
    .input(validString)
    .mutation(({ ctx, input: restaurant }) => {
      return ctx.prisma.$queryRaw<{ name: string }[]>`
        SELECT DISTINCT r.name
        FROM "Restaurant" as r
        INNER JOIN "RestaurantToCategory" as rtc
        ON r.id = rtc."restaurantId"
        GROUP BY r.name
        HAVING COUNT(rtc.id) = (
          SELECT COUNT(rtc2.id)
          FROM "Restaurant" as r2 
          INNER JOIN "RestaurantToCategory" as rtc2
          ON r2.id = rtc2."restaurantId"
          WHERE r2.name = ${restaurant}
        )
        INTERSECT
        SELECT DISTINCT r3.name
        FROM "Restaurant" as r3
        INNER JOIN "RestaurantToCategory" as rtc3
        ON r3.id = rtc3."restaurantId"
        WHERE rtc3."categoryId" IN
          (SELECT rtc4."categoryId" 
          FROM "Restaurant" as r4
          INNER JOIN "RestaurantToCategory" as rtc4
          ON r4.id = rtc4."restaurantId"
          WHERE r4.name = ${restaurant});`;
    }),
});
