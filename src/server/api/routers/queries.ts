import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { validId, validString } from "~/utils/schemas";

type TSixQuery = {
  name: string;
  price: number;
  restaurant: string;
  score: number;
};

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
        HAVING AVG(CAST(dr.score as FLOAT)) >= ${input.score};`;
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
        GROUP BY r.id
        HAVING COUNT(rtc.id) = (
          SELECT COUNT(rtc3.id)
          FROM "Restaurant" as r3
          INNER JOIN "RestaurantToCategory" as rtc3
          ON r3.id = rtc3."restaurantId"
          WHERE r3.name = ${restaurant}
        ) AND r.id NOT IN (
          SELECT rtc2."restaurantId"
          FROM "RestaurantToCategory" as rtc2
          WHERE rtc2."categoryId" NOT IN (
            SELECT rtc3."categoryId"
            FROM "Restaurant" as r3 
            INNER JOIN "RestaurantToCategory" as rtc3
            ON r3.id = rtc3."restaurantId"
            WHERE r3.name = ${restaurant}
          )
        );`;
      ` -- SELECT DISTINCT r.name
        -- FROM "Restaurant" as r
        -- INNER JOIN "RestaurantToCategory" as rtc
        -- ON r.id = rtc."restaurantId"
        -- GROUP BY r.name
        -- HAVING COUNT(rtc.id) = (
        --   SELECT COUNT(rtc2.id)
        --   FROM "Restaurant" as r2 
        --   INNER JOIN "RestaurantToCategory" as rtc2
        --   ON r2.id = rtc2."restaurantId"
        --   WHERE r2.name = ${restaurant}
        -- )
        -- INTERSECT
        -- SELECT DISTINCT r3.name
        -- FROM "Restaurant" as r3
        -- INNER JOIN "RestaurantToCategory" as rtc3
        -- ON r3.id = rtc3."restaurantId"
        -- WHERE rtc3."categoryId" IN
        --   (SELECT rtc4."categoryId" 
        --   FROM "Restaurant" as r4
        --   INNER JOIN "RestaurantToCategory" as rtc4
        --   ON r4.id = rtc4."restaurantId"
        --   WHERE r4.name = ${restaurant});`;
    }),
  fifth: publicProcedure.mutation(({ ctx }) => {
    return ctx.prisma.$queryRaw<{ name: string; email: string }[]>`
      SELECT c.name, c.email
      FROM "Customer" as c
      LEFT JOIN "Review" as r
      ON c.id = r."customerId"
      LEFT JOIN "DishReview" as dr
      ON r.id = dr."reviewId"
      LEFT JOIN "Dish" as d
      ON dr."dishId" = d.id
      GROUP BY c.name, c.email
      HAVING COUNT(DISTINCT d."categoryId") = 
        (
          SELECT COUNT (ctg.id)
          FROM "Category" as ctg
        );`;
  }),
  sixth: publicProcedure
    .input(z.object({ categoryId: validId, score: z.number().positive() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.$queryRaw<TSixQuery[]>`
        SELECT d.name, d.price, r.name as "restaurant", AVG(CAST(dr.score as FLOAT)) as score
        FROM "Dish" as d
        LEFT JOIN "DishReview" as dr
        ON d.id = dr."dishId"
        LEFT JOIN "Restaurant" as r
        ON d."restaurantId" = r.id
        WHERE d."categoryId" = ${input.categoryId}
        GROUP BY r.name, d.id
        HAVING AVG(CAST(dr.score as FLOAT)) >= ${input.score}
        ORDER BY d.price
        LIMIT 1;`;
    }),
  seventh: publicProcedure
    .input(z.number().positive())
    .mutation(({ ctx, input: score }) => {
      return ctx.prisma.$queryRaw<{ name: string; email: string }[]>`
        SELECT c.name, c.email
        FROM "Customer" as c
        LEFT JOIN "Review" as r
        ON c.id = r."customerId"
        GROUP BY c.id
        HAVING AVG(CAST(r.score as FLOAT)) <= ${score};`;
    }),
  eighth: publicProcedure
    .input(z.object({ categoryId: validId, score: z.number().positive() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.$queryRaw<{ name: string; restaurant: string }[]>`
        SELECT DISTINCT d.name, r.name as restaurant
        FROM "Dish" as d
        LEFT JOIN "Restaurant" as r
        ON d."restaurantId" = r.id
        LEFT JOIN "Review" as rev
        ON r.id = rev."restaurantId"
        WHERE d."categoryId" = ${input.categoryId}
        GROUP BY d.id, r.name
        HAVING AVG(CAST(rev.score as FLOAT)) >= ${input.score};`;
    }),
});
