import { Prisma, type Customer } from "@prisma/client";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { validEmail, validId, validString } from "~/utils/schemas";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

type TCustomer = Omit<Customer, "password">;
type TCustomerFull = TCustomer & { reviewCount: number; favoriteCount: number };
type TCustomerRow = TCustomer & {
  likedId: number | null;
  likedName: string | null;
};

const userSchema = z.object({
  name: validString,
  email: validEmail,
  likedRestaurants: z.array(validId),
});

export const usersRouter = createTRPCRouter({
  get: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.prisma.$queryRaw<TCustomerFull[]>`
      SELECT c.id, c.name, c.email, 
        COUNT(DISTINCT r.id) AS "reviewCount", COUNT(DISTINCT l.id) AS "favoriteCount"
      FROM "Customer" as c
      LEFT JOIN "Review" as r
      ON c.id = r."customerId"
      LEFT JOIN "LikedRestaurants" as l
      ON c.id = l."customerId"
      GROUP BY c.id
      ORDER BY c.name;`;
    return result.map((r) => ({
      ...r,
      reviewCount: Number(r.reviewCount),
      favoriteCount: Number(r.favoriteCount),
    }));
  }),
  create: publicProcedure.input(userSchema).mutation(async ({ ctx, input }) => {
    const defaultPassword = "1234";
    const [{ id }] = await ctx.prisma.$queryRaw<[{ id: number }]>`
      INSERT INTO "Customer" (name, email, password)
      VALUES (${input.name}, ${input.email}, ${defaultPassword})
      RETURNING id;`;
    await ctx.prisma.$executeRaw(Prisma.sql`
    INSERT INTO "LikedRestaurants" ("customerId", "restaurantId")
    VALUES ${Prisma.join(
      input.likedRestaurants.map((r) => Prisma.sql`(${Prisma.join([id, r])})`)
    )};`);
    return id;
  }),
  update: publicProcedure
    .input(userSchema.extend({ id: validId }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.$transaction([
        ctx.prisma.$executeRaw`
          DELETE FROM "LikedRestaurants"
          WHERE "customerId" = ${input.id};`,
        ctx.prisma.$executeRaw`
          UPDATE "Customer"
          SET name = ${input.name}, email = ${input.email}
          WHERE id = ${input.id};`,
        ctx.prisma.$executeRaw(Prisma.sql`
          INSERT INTO "LikedRestaurants" ("customerId", "restaurantId")
          VALUES ${Prisma.join(
            input.likedRestaurants.map(
              (r) => Prisma.sql`(${Prisma.join([input.id, r])})`
            )
          )};`),
      ]);
      return true;
    }),
  remove: publicProcedure
    .input(validId)
    .mutation(async ({ ctx, input: id }) => {
      await ctx.prisma.$executeRaw`
        DELETE FROM "Customer"
        WHERE id = ${id};`;
      return true;
    }),
  getById: publicProcedure.input(validId).query(async ({ ctx, input: id }) => {
    const rows = await ctx.prisma.$queryRaw<TCustomerRow[]>`
      SELECT c.name, c.email, r.id as "likedId", r.name as "likedName"
      FROM "Customer" as c
      LEFT JOIN "LikedRestaurants" as l
      ON c.id = l."customerId"
      LEFT JOIN "Restaurant" as r
      ON l."restaurantId" = r.id
      WHERE c.id = ${id};`;

    const likedRestaurants = [];
    for (const r of rows) {
      if (r.likedId && r.likedName)
        likedRestaurants.push({ id: r.likedId, name: r.likedName });
    }

    console.log(rows);

    const row = rows[0];
    if (!row) throw new TRPCError({ code: "BAD_REQUEST" });

    return {
      name: row.name,
      email: row.email,
      likedRestaurants,
    };
  }),
});
