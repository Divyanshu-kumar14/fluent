
import { baseProcedure, createTRPCRouter } from '../init';
export const appRouter = createTRPCRouter({
  health: baseProcedure.query(async() => {

    // throw new Error("Something went wrong");

    return { status: "ok" };
  }),
});
// export type definition of API
export type AppRouter = typeof appRouter;