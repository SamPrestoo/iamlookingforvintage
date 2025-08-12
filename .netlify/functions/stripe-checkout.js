/**
 * Netlify Function for Stripe Checkout
 * Creates a Stripe checkout session for vintage items
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
  console.log('🛒 Stripe checkout function called');
  console.log('📍 HTTP Method:', event.httpMethod);
  
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Validate request body
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Request body is required' })
      };
    }

    let requestData;
    try {
      requestData = JSON.parse(event.body);
    } catch (parseError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid JSON in request body' })
      };
    }

    const { items, customerEmail, successUrl, cancelUrl } = requestData;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Items array is required and cannot be empty' })
      };
    }

    console.log('🛍️ Processing checkout for', items.length, 'items');
    console.log('📧 Customer email:', customerEmail);

    // Transform cart items to Stripe line items
    const lineItems = items.map(item => {
      // Validate required fields
      if (!item.name || !item.price || !item.id) {
        throw new Error(`Invalid item: ${JSON.stringify(item)}`);
      }

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            description: `Vintage ${item.type || 'item'} • ${item.size || 'One size'}`,
            images: item.image ? [item.image] : [],
            metadata: {
              productId: item.id,
              category: item.category || 'vintage',
              type: item.type || 'item',
              size: item.size || 'N/A'
            }
          },
          unit_amount: Math.round(item.price * 100) // Convert to cents
        },
        quantity: 1
      };
    });

    console.log('💰 Total line items:', lineItems.length);
    console.log('💰 Total amount:', lineItems.reduce((sum, item) => sum + item.price_data.unit_amount, 0) / 100);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: customerEmail || undefined,
      success_url: successUrl || `${event.headers.origin || 'https://iamlookingforvintage.netlify.app'}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${event.headers.origin || 'https://iamlookingforvintage.netlify.app'}/cart.html`,
      metadata: {
        customerEmail: customerEmail || 'not-provided',
        itemCount: items.length.toString(),
        itemIds: items.map(item => item.id).join(','),
        source: 'iamlookingforvintage'
      },
      shipping_address_collection: {
        allowed_countries: ['US', 'CA'],
      },
      billing_address_collection: 'required',
      payment_intent_data: {
        metadata: {
          customerEmail: customerEmail || 'not-provided',
          itemIds: items.map(item => item.id).join(','),
          source: 'iamlookingforvintage'
        }
      }
    });

    console.log('✅ Stripe session created:', session.id);
    console.log('🔗 Checkout URL:', session.url);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        sessionId: session.id,
        url: session.url
      })
    };

  } catch (error) {
    console.error('❌ Stripe checkout error:', error);
    console.error('❌ Error stack:', error.stack);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to create checkout session',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};