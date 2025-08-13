const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
    console.log('🛒 Stripe checkout function called');
    
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: {
                'Access-Control-Allow-Origin': 'https://iamlookingforvintage.com',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    // Handle OPTIONS request for CORS
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': 'https://iamlookingforvintage.com',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: ''
        };
    }

    try {
        const { items, successUrl, cancelUrl } = JSON.parse(event.body);
        
        console.log('📦 Processing checkout for items:', items.length);
        
        if (!items || items.length === 0) {
            throw new Error('No items provided for checkout');
        }

        // Convert items to Stripe line items format
        // Limit description length to prevent URL issues
        const line_items = items.map(item => {
            // Truncate long descriptions to prevent URL length issues
            const truncatedDescription = item.description && item.description.length > 100 
                ? item.description.substring(0, 100) + '...' 
                : item.description || 'Vintage item';

            return {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: item.name,
                        description: truncatedDescription,
                        // Don't include images in line items to reduce URL length
                    },
                    unit_amount: Math.round(item.price * 100), // Convert to cents
                },
                quantity: 1,
            };
        });

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: line_items,
            mode: 'payment',
            success_url: successUrl,
            cancel_url: cancelUrl,
            
            // Configure customer email collection - set to 'never' to remove prompt
            customer_creation: 'if_required',
            // Remove email collection prompt
            
            // Shipping configuration for physical products
            shipping_address_collection: {
                allowed_countries: ['US', 'CA'], // Add countries as needed
            },
            
            // Set automatic tax calculation if configured
            automatic_tax: { enabled: false }, // Set to true if you have tax configured
            
            // Add metadata for tracking
            metadata: {
                source: 'iamlookingforvintage_website',
                item_count: items.length.toString(),
            }
        });

        console.log('✅ Checkout session created:', session.id);

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': 'https://iamlookingforvintage.com',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: JSON.stringify({ 
                success: true, 
                url: session.url,
                sessionId: session.id 
            })
        };

    } catch (error) {
        console.error('❌ Stripe checkout error:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': 'https://iamlookingforvintage.com',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: JSON.stringify({ 
                success: false, 
                message: error.message || 'Internal server error' 
            })
        };
    }
};