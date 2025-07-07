import { z } from "zod";
import { publicProcedure } from "../../create-context";
import Stripe from 'stripe';
import { STRIPE_CONFIG } from "@/constants/stripe";

const stripe = new Stripe(STRIPE_CONFIG.secretKey, {
  apiVersion: '2024-12-18.acacia',
});

// This endpoint will handle Stripe webhooks
export default publicProcedure
  .input(z.object({
    body: z.string(),
    signature: z.string()
  }))
  .mutation(async ({ input }) => {
    try {
      // Verify webhook signature
      // Note: You'll need to set your webhook endpoint secret in Stripe dashboard
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_webhook_secret';
      
      const event = stripe.webhooks.constructEvent(
        input.body,
        input.signature,
        webhookSecret
      );

      // Handle the event
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          console.log('Payment succeeded:', paymentIntent.id);
          
          // Here you would update your database to mark the subscription as active
          // For now, we'll just log it
          break;
          
        case 'payment_intent.payment_failed':
          const failedPayment = event.data.object as Stripe.PaymentIntent;
          console.log('Payment failed:', failedPayment.id);
          break;
          
        case 'customer.subscription.created':
          const subscription = event.data.object as Stripe.Subscription;
          console.log('Subscription created:', subscription.id);
          break;
          
        case 'customer.subscription.updated':
          const updatedSubscription = event.data.object as Stripe.Subscription;
          console.log('Subscription updated:', updatedSubscription.id);
          break;
          
        case 'customer.subscription.deleted':
          const deletedSubscription = event.data.object as Stripe.Subscription;
          console.log('Subscription cancelled:', deletedSubscription.id);
          break;
          
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      return { success: true, received: true };
    } catch (error) {
      console.error('Webhook error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Webhook processing failed'
      };
    }
  });