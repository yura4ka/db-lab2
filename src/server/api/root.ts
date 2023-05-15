import { createTRPCRouter } from "~/server/api/trpc";
import { restaurantsRouter } from "./routers/restaurants";
import { categoriesRouter } from "./routers/categories";
import { dishesRouter } from "./routers/dishes";
import { usersRouter } from "./routers/users";
import { reviewRouter } from "./routers/reviews";
import { queriesRouter } from "./routers/queries";

export const appRouter = createTRPCRouter({
  restaurants: restaurantsRouter,
  categories: categoriesRouter,
  dishes: dishesRouter,
  users: usersRouter,
  reviews: reviewRouter,
  queries: queriesRouter,
});

export type AppRouter = typeof appRouter;
