import type { Restaurant } from "@prisma/client";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { validId, validString, validUrl } from "~/utils/schemas";

export const restaurantsRouter = createTRPCRouter({
  get: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.$queryRaw<Restaurant[]>`SELECT * FROM Restaurant;`;
  }),
  create: publicProcedure
    .input(
      z.object({
        name: validString,
        address: validString,
        website: validUrl,
        description: validString,
        price: z.number().positive(),
        categories: z.array(validId),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const id = await ctx.prisma.$executeRaw`
        INSERT INTO Restaurant (name, address, website, description, price)
        VALUES (${input.name}, ${input.address}, ${input.website}, ${input.description}, ${input.price})
        RETURNING id;`;

      await ctx.prisma.$executeRaw`
        INSERT INTO RestaurantToCategory (restaurantId, categoryId)
        VALUES ${input.categories.map((c) => `(${id}, ${c})`).join(", ")}`;
      return true;
    }),
});
