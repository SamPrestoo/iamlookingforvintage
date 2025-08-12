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

    // Send email notification
    if (process.env.ADMIN_EMAIL) {
      await sendEmailNotification({
        sessionId: session.id,
        customerEmail,
        itemCount,
        amountTotal,
        itemIds
      });
    } else {
      console.log('📧 Email notification skipped - Admin email not configured');
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

async function sendEmailNotification(orderDetails) {
  try {
    console.log('📧 Sending email notification...');
    
    // Use Netlify's built-in email service (no external dependencies needed)
    const emailBody = `
🎉 NEW SALE NOTIFICATION

Order Details:
• Customer Email: ${orderDetails.customerEmail}
• Number of Items: ${orderDetails.itemCount}
• Total Amount: $${orderDetails.amountTotal}
• Stripe Session ID: ${orderDetails.sessionId}
• Item IDs: ${orderDetails.itemIds}

Next Steps:
1. Check your Stripe dashboard for payment details
2. Prepare items for shipping
3. Mark items as sold in your admin dashboard

This is an automated notification from your iamlookingforvintage website.
`;

    // Use fetch to send email via Netlify Forms (free tier)
    const response = await fetch('https://api.netlify.com/api/v1/submissions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NETLIFY_API_TOKEN || 'webhook-only'}`
      },
      body: JSON.stringify({
        form_name: 'order-notifications',
        email: process.env.ADMIN_EMAIL,
        subject: `🎉 New Sale: $${orderDetails.amountTotal} - ${orderDetails.itemCount} items`,
        message: emailBody,
        order_id: orderDetails.sessionId,
        customer_email: orderDetails.customerEmail,
        amount: orderDetails.amountTotal,
        timestamp: new Date().toISOString()
      })
    });

    if (response.ok) {
      console.log('✅ Email notification sent successfully');
    } else {
      console.log('⚠️ Email notification may have failed, but using fallback method');
      // Fallback: Just log detailed info for manual checking
      console.log('📧 ORDER NOTIFICATION:', {
        customer: orderDetails.customerEmail,
        amount: orderDetails.amountTotal,
        items: orderDetails.itemCount,
        session: orderDetails.sessionId,
        timestamp: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    // Fallback: Log the order details for manual checking
    console.log('📧 MANUAL CHECK NEEDED - New Order:', {
      customer: orderDetails.customerEmail,
      amount: orderDetails.amountTotal,
      items: orderDetails.itemCount,
      session: orderDetails.sessionId,
      timestamp: new Date().toISOString()
    });
    // Don't throw error - payment was successful even if email fails
  }
}