import { createTRPCRouter } from "~/server/api/trpc";
import { restaurantsRouter } from "./routers/restaurants";
import { categoriesRouter } from "./routers/categories";
import { dishesRouter } from "./routers/dishes";

export const appRouter = createTRPCRouter({
  restaurants: restaurantsRouter,
  categories: categoriesRouter,
  dishes: dishesRouter,
});

export type AppRouter = typeof appRouter;
