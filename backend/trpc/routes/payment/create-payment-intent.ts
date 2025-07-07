import { z } from "zod";
import { publicProcedure } from "../../create-context";
import Stripe from 'stripe';
import { STRIPE_CONFIG } from "@/constants/stripe";

const stripe = new Stripe(STRIPE_CONFIG.secretKey, {
  apiVersion: '2025-06-30.basil',
});

export default publicProcedure
  .input(z.object({
    planId: z.string(),
    amount: z.number(),
    currency: z.string().default('usd'),
    customerInfo: z.object({
      email: z.string().email(),
      name: z.string()
    })
  }))
  .mutation(async ({ input }) => {
    try {
      console.log('Creating payment intent for:', input);

      // Create or retrieve customer
      const customers = await stripe.customers.list({
        email: input.customerInfo.email,
        limit: 1
      });

      let customer;
      if (customers.data.length > 0) {
        customer = customers.data[0];
        console.log('Found existing customer:', customer.id);
      } else {
        customer = await stripe.customers.create({
          email: input.customerInfo.email,
          name: input.customerInfo.name,
          metadata: {
            planId: input.planId
          }
        });
        console.log('Created new customer:', customer.id);
      }

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: input.amount,
        currency: input.currency,
        customer: customer.id,
        metadata: {
          planId: input.planId,
          customerEmail: input.customerInfo.email
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      console.log('Payment intent created:', paymentIntent.id);

      return {
        success: true,
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        customerId: customer.id
      };
    } catch (error) {
      console.error('Payment intent creation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create payment intent'
      };
    }
  });