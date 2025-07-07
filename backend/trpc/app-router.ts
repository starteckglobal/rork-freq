import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import createPaymentIntentRoute from "./routes/payment/create-payment-intent";
import confirmPaymentRoute from "./routes/payment/confirm-payment";
import webhookRoute from "./routes/payment/webhook";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  payment: createTRPCRouter({
    createPaymentIntent: createPaymentIntentRoute,
    confirmPayment: confirmPaymentRoute,
    webhook: webhookRoute,
  }),
});

export type AppRouter = typeof appRouter;