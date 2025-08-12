# 💳 Stripe Payment & SMS Setup Guide

This guide will help you set up Stripe payments and SMS notifications for your vintage clothing website.

## 🏦 Phase 1: Stripe Account Setup

### Step 1: Create Stripe Account
1. Go to [https://stripe.com](https://stripe.com)
2. Click "Start now" and sign up with your business email
3. Complete business verification with your bank account details
4. **IMPORTANT**: Switch to "Test mode" (toggle in top right) for testing

### Step 2: Get API Keys
1. In Stripe Dashboard, go to **Developers → API Keys**
2. Copy these keys (keep them secure!):
   - **Publishable key**: `pk_test_...` (safe to use in frontend)
   - **Secret key**: `sk_test_...` (keep secret!)

### Step 3: Set up Webhooks
1. Go to **Developers → Webhooks**
2. Click "Add endpoint"
3. Endpoint URL: `https://[your-site-name].netlify.app/.netlify/functions/stripe-webhook`
4. Select these events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
5. Click "Add endpoint"
6. Copy the **Signing secret**: `whsec_...`

## 📱 Phase 2: Twilio SMS Setup (Optional but Recommended)

### Step 1: Create Twilio Account
1. Go to [https://twilio.com](https://twilio.com)
2. Sign up for free account (gets you $15 credit)
3. Verify your phone number

### Step 2: Get Twilio Credentials
1. In Twilio Console, go to **Account → Keys & Credentials**
2. Copy these values:
   - **Account SID**: `AC...`
   - **Auth Token**: `[click to show]`

### Step 3: Get Phone Number
1. In Twilio Console, go to **Phone Numbers → Manage → Buy a number**
2. Choose a number (costs ~$1/month)
3. Copy the phone number: `+1...`

## ⚙️ Phase 3: Environment Variables Setup

### In Netlify Dashboard:
1. Go to your site's dashboard
2. Navigate to **Site settings → Environment variables**
3. Add these variables one by one:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_[your_secret_key_here]
STRIPE_PUBLISHABLE_KEY=pk_test_[your_publishable_key_here] 
STRIPE_WEBHOOK_SECRET=whsec_[your_webhook_secret_here]

# Twilio Configuration (for SMS notifications)
TWILIO_ACCOUNT_SID=AC[your_account_sid_here]
TWILIO_AUTH_TOKEN=[your_auth_token_here]
TWILIO_PHONE_NUMBER=+1[your_twilio_number_here]

# Your notification phone number
NOTIFICATION_PHONE_NUMBER=+1[your_personal_phone_number]
```

### Important Notes:
- **Never** commit these keys to Git
- Use Test keys (`pk_test_` and `sk_test_`) until you're ready for production
- The webhook secret is different for each endpoint you create

## 🚀 Phase 4: Deploy and Test

### Step 1: Install Dependencies
Run this command in your project directory:
```bash
npm install
```

### Step 2: Deploy to Netlify
```bash
git add .
git commit -m "Add Stripe payment integration"
git push
```

### Step 3: Test the Integration

#### Test with Stripe Test Cards:
- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`
- **Requires 3D Secure**: `4000 0025 0000 3155`

#### Use any:
- **Expiry**: Any future date
- **CVC**: Any 3 digits
- **ZIP**: Any 5 digits

### Step 4: Verify Everything Works
1. Add items to cart on your site
2. Click "Proceed to Checkout"
3. Complete payment with test card
4. Check you receive SMS notification
5. Verify order in Stripe dashboard

## 🔧 Troubleshooting

### Common Issues:

**"Stripe is not defined" error:**
- Check that environment variables are set in Netlify
- Redeploy after adding environment variables

**Webhook not working:**
- Verify webhook URL is correct
- Check that webhook secret matches
- Look at webhook delivery logs in Stripe

**SMS not working:**
- Verify Twilio credentials are correct
- Check Twilio console for error logs
- Ensure phone number is in correct format (+1...)

**Payment failing:**
- Check browser console for errors
- Verify test card numbers are correct
- Check Stripe dashboard for payment logs

### Need Help?
- Check browser console for detailed error messages
- Look at Netlify function logs
- Check Stripe dashboard → Events for webhook deliveries
- Review Twilio console → Monitor → Logs for SMS issues

## 💰 Going Live (Production)

When ready for real payments:

1. **Switch to Live Mode** in Stripe dashboard
2. **Get Live API Keys** (start with `pk_live_` and `sk_live_`)
3. **Update Environment Variables** in Netlify with live keys
4. **Test with small real transaction**
5. **Set up business bank account** in Stripe for payouts

## 📊 What's Included

### Features Implemented:
- ✅ **Secure Checkout**: Full Stripe integration with test/live mode support
- ✅ **Cart Validation**: Prevents checkout of sold items
- ✅ **Order Confirmation**: Success page with order details
- ✅ **SMS Notifications**: Instant alerts when sales are made
- ✅ **Webhook Security**: Verified webhooks for order processing
- ✅ **Mobile Responsive**: Works on all devices
- ✅ **Error Handling**: Comprehensive error messages and recovery

### Payment Flow:
1. Customer adds items to cart
2. Cart validates items are still available
3. Customer clicks "Proceed to Checkout"
4. Stripe checkout session created
5. Customer redirected to Stripe payment page
6. Payment processed securely by Stripe
7. Customer redirected to success page
8. Webhook triggers SMS notification
9. Cart cleared automatically

You're all set! 🎉