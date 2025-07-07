export const STRIPE_CONFIG = {
  publishableKey: 'pk_test_51RiLi6RO0vrMnRNfI7vo5yn5JcMWKGn4DH3vd77Wq1I8i8PIs84VacjvMcVWzSltVi3OFNcMBnJ948pfj18wrCi300DfyvKTJ0',
  secretKey: 'sk_test_51RiLi6RO0vrMnRNfkufnFeMQFA5HyjadeLqB3s3RWQy9HgtQyNWA3G9SvBWOSYVoTeJGxRownxPqKZ1SCPvJgCMc00P2cQFSm7',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
};