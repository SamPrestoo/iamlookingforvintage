/**
 * Netlify Function for Stripe Webhooks
 * Handles payment confirmations and sends SMS notifications
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
  console.log('🔔 Stripe webhook received');
  
  const sig = event.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, endpointSecret);
    console.log('✅ Webhook signature verified');
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return {
      statusCode: 400,
      body: `Webhook Error: ${err.message}`
    };
  }

  console.log('📧 Event type:', stripeEvent.type);

  try {
    // Handle the event
    switch (stripeEvent.type) {
      case 'checkout.session.completed':
        const session = stripeEvent.data.object;
        console.log('🛒 Checkout session completed:', session.id);
        await handleSuccessfulPayment(session);
        break;
        
      case 'payment_intent.succeeded':
        const paymentIntent = stripeEvent.data.object;
        console.log('💰 Payment succeeded:', paymentIntent.id);
        break;
        
      default:
        console.log('🤷 Unhandled event type:', stripeEvent.type);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true })
    };

  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Webhook processing failed' })
    };
  }
};

async function handleSuccessfulPayment(session) {
  try {
    console.log('🎉 Processing successful payment...');
    
    // Get session details
    const customerEmail = session.customer_email || session.metadata?.customerEmail || 'Unknown';
    const itemIds = session.metadata?.itemIds || '';
    const itemCount = session.metadata?.itemCount || '0';
    const amountTotal = session.amount_total / 100; // Convert from cents
    
    console.log('📊 Order details:', {
      sessionId: session.id,
      customerEmail,
      itemCount,
      amountTotal,
      itemIds: itemIds.substring(0, 50) + (itemIds.length > 50 ? '...' : '')
    });

    // Send SMS notification if Twilio is configured
    if (process.env.TWILIO_ACCOUNT_SID && process.env.NOTIFICATION_PHONE_NUMBER) {
      await sendSMSNotification({
        sessionId: session.id,
        customerEmail,
        itemCount,
        amountTotal,
        itemIds
      });
    } else {
      console.log('📱 SMS notification skipped - Twilio not configured');
    }

    // Here you could also:
    // - Mark items as sold in your products.json
    // - Send confirmation email to customer
    // - Update inventory
    // - Log to analytics
    
    console.log('✅ Payment processing completed');

  } catch (error) {
    console.error('❌ Error processing successful payment:', error);
    throw error;
  }
}

async function sendSMSNotification(orderDetails) {
  try {
    console.log('📱 Sending SMS notification...');
    
    // Import Twilio (only when needed)
    const twilio = require('twilio')(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const message = `🎉 NEW SALE! 
Customer: ${orderDetails.customerEmail}
Items: ${orderDetails.itemCount}
Total: $${orderDetails.amountTotal}
Session: ${orderDetails.sessionId}

Check your Stripe dashboard for details!`;

    const result = await twilio.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: process.env.NOTIFICATION_PHONE_NUMBER
    });

    console.log('✅ SMS sent successfully:', result.sid);
    
  } catch (error) {
    console.error('❌ SMS sending failed:', error);
    // Don't throw error - payment was successful even if SMS fails
  }
}