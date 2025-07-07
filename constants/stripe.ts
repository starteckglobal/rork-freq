// Stripe configuration
export const STRIPE_CONFIG = {
  publishableKey: 'pk_test_51RiLi6RO0vrMnRNfI7vo5yn5JcMWKGn4DH3vd77Wq1I8i8PIs84VacjvMcVWzSltVi3OFNcMBnJ948pfj18wrCi300DfyvKTJ0',
  secretKey: 'sk_test_51RiLi6RO0vrMnRNfkufnFeMQFA5HyjadeLqB3s3RWQy9HgtQyNWA3G9SvBWOSYVoTeJGxRownxPqKZ1SCPvJgCMc00P2cQFSm7',
  
  // Plan pricing (in cents)
  plans: {
    monthly: {
      priceId: 'price_monthly_synclab', // You'll need to create these in Stripe Dashboard
      amount: 999, // $9.99
      currency: 'usd',
      interval: 'month'
    },
    yearly: {
      priceId: 'price_yearly_synclab',
      amount: 10000, // $100.00
      currency: 'usd',
      interval: 'year'
    },
    premium: {
      priceId: 'price_premium_synclab',
      amount: 50000, // $500.00
      currency: 'usd',
      interval: 'year'
    }
  }
};