import { z } from "zod";
import { publicProcedure } from "../../create-context";
import Stripe from 'stripe';
import { STRIPE_CONFIG } from "@/constants/stripe";

const stripe = new Stripe(STRIPE_CONFIG.secretKey, {
  apiVersion: '2024-12-18.acacia',
});

export default publicProcedure
  .input(z.object({
    paymentIntentId: z.string(),
    paymentMethodData: z.object({
      cardNumber: z.string(),
      expiryMonth: z.string(),
      expiryYear: z.string(),
      cvv: z.string(),
      cardholderName: z.string()
    })
  }))
  .mutation(async ({ input }) => {
    try {
      // In a real implementation, you would use Stripe Elements on the frontend
      // This is a simplified version for demo purposes
      
      // Create payment method
      const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
          number: input.paymentMethodData.cardNumber,
          exp_month: parseInt(input.paymentMethodData.expiryMonth),
          exp_year: parseInt(`20${input.paymentMethodData.expiryYear}`),
          cvc: input.paymentMethodData.cvv,
        },
        billing_details: {
          name: input.paymentMethodData.cardholderName,
        },
      });

      // Confirm payment intent
      const confirmedPayment = await stripe.paymentIntents.confirm(input.paymentIntentId, {
        payment_method: paymentMethod.id,
        return_url: 'https://your-app.com/return', // This would be your app's return URL
      });

      if (confirmedPayment.status === 'succeeded') {
        return {
          success: true,
          paymentIntentId: confirmedPayment.id,
          status: confirmedPayment.status
        };
      } else {
        return {
          success: false,
          error: 'Payment requires additional authentication',
          status: confirmedPayment.status
        };
      }
    } catch (error) {
      console.error('Payment confirmation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed'
      };
    }
  });