import { createTRPCRouter } from "~/server/api/trpc";
import { restaurantsRouter } from "./routers/restaurants";
import { categoriesRouter } from "./routers/categories";

export const appRouter = createTRPCRouter({
  restaurants: restaurantsRouter,
  categories: categoriesRouter,
});

export type AppRouter = typeof appRouter;
