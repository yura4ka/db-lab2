import { createTRPCRouter } from "~/server/api/trpc";
import { restaurantsRouter } from "./routers/restaurants";
import { categoriesRouter } from "./routers/categories";
import { dishesRouter } from "./routers/dishes";
import { usersRouter } from "./routers/users";

export const appRouter = createTRPCRouter({
  restaurants: restaurantsRouter,
  categories: categoriesRouter,
  dishes: dishesRouter,
  users: usersRouter,
});

export type AppRouter = typeof appRouter;
