# Stripe & Domain Setup Guide for iamlookingforvintage.com

## 🌐 Domain Configuration

Your website is now live at: **https://iamlookingforvintage.com**

## 🔧 Netlify Environment Variables

1. Go to your Netlify dashboard: https://app.netlify.com
2. Select your `iamlookingforvintage` site
3. Go to **Site settings** → **Environment variables**
4. Add the following environment variables:

```
STRIPE_SECRET_KEY = sk_test_... (your Stripe secret key)
STRIPE_PUBLISHABLE_KEY = pk_test_... (your Stripe publishable key)
GITHUB_TOKEN = ghp_... (existing - don't change)
GITHUB_OWNER = SamPrestoo (existing - don't change)
GITHUB_REPO = iamlookingforvintage (existing - don't change)
GITHUB_BRANCH = main (existing - don't change)
```

## 💳 Stripe Dashboard Settings

1. Go to your Stripe Dashboard: https://dashboard.stripe.com
2. Navigate to **Settings** → **Customer Portal**
3. Update the following domain settings:

### Business Settings
- **Business Name**: iamlookingforvintage
- **Website**: https://iamlookingforvintage.com

### Checkout Settings
1. Go to **Settings** → **Checkout**
2. Add your domain to **Allowed Domains**: 
   - `iamlookingforvintage.com`
3. Set Success URL pattern: `https://iamlookingforvintage.com/success.html?session_id={CHECKOUT_SESSION_ID}`
4. Set Cancel URL: `https://iamlookingforvintage.com/cart.html`

### Webhook Endpoints (if using)
1. Go to **Developers** → **Webhooks**
2. Add endpoint: `https://iamlookingforvintage.com/.netlify/functions/stripe-webhook`
3. Select events you want to listen for

## 🔒 Security Settings

### CORS Configuration
The following CORS settings are already configured in your code:
- **Allowed Origin**: `https://iamlookingforvintage.com`
- **Allowed Methods**: `POST, OPTIONS`
- **Allowed Headers**: `Content-Type`

## ✅ What Was Fixed

1. **✅ Removed email prompt** - Customers no longer get prompted for email during checkout
2. **✅ Fixed domain URLs** - All checkout URLs now use `https://iamlookingforvintage.com`
3. **✅ Created missing Stripe function** - `/netlify/functions/stripe-checkout.js` was missing and has been created
4. **✅ Fixed URL length issues** - Product descriptions are now truncated to prevent 2048 character URL limit
5. **✅ Added proper CORS headers** - Domain-specific CORS settings for security
6. **✅ Removed image URLs** - Images are not included in Stripe line items to reduce payload size

## 🧪 Testing Checkout

After deploying these changes:

1. Add items to your cart on https://iamlookingforvintage.com
2. Click "Proceed to Checkout"
3. You should be redirected to Stripe's checkout page without email prompt
4. Complete a test purchase (use Stripe test card: 4242 4242 4242 4242)
5. Verify redirect to success page: `https://iamlookingforvintage.com/success.html`

## 🚨 Important Notes

- Make sure to update your Stripe webhook URLs if you're using webhooks
- Test with Stripe test keys before going live
- Update to live Stripe keys when ready for production
- Ensure your domain SSL certificate is valid

## 📞 Support

If you encounter issues:
1. Check the browser console for JavaScript errors
2. Check Netlify function logs in your Netlify dashboard
3. Verify all environment variables are set correctly
4. Test with Stripe test cards first