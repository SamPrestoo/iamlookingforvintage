exports.handler = async (event, context) => {
    console.log('🔐 Admin authentication request received');
    
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
        const { username, password } = JSON.parse(event.body);
        
        // Get credentials from environment variables
        const validUsername = process.env.ADMIN_USERNAME || 'admin';
        const validPassword = process.env.ADMIN_PASSWORD || 'vintage123';
        
        console.log('🔍 Validating credentials for user:', username);
        
        // Validate credentials
        if (username === validUsername && password === validPassword) {
            console.log('✅ Authentication successful');
            
            // Generate a simple session token (in production, use JWT or similar)
            const sessionToken = generateSessionToken();
            const loginTime = Date.now();
            
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': 'https://iamlookingforvintage.com',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS'
                },
                body: JSON.stringify({ 
                    success: true,
                    sessionToken: sessionToken,
                    loginTime: loginTime,
                    user: username,
                    message: 'Authentication successful'
                })
            };
        } else {
            console.log('❌ Authentication failed for user:', username);
            
            return {
                statusCode: 401,
                headers: {
                    'Access-Control-Allow-Origin': 'https://iamlookingforvintage.com',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS'
                },
                body: JSON.stringify({ 
                    success: false,
                    message: 'Invalid credentials'
                })
            };
        }

    } catch (error) {
        console.error('❌ Authentication error:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': 'https://iamlookingforvintage.com',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: JSON.stringify({ 
                success: false,
                message: 'Internal server error'
            })
        };
    }
};

// Simple session token generator (in production, use a proper JWT library)
function generateSessionToken() {
    return 'session_' + Math.random().toString(36).substr(2) + Date.now().toString(36);
}