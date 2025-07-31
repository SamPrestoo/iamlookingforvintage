// Shopify Configuration
// Update these values to connect to your Shopify store
// For production, these can be overridden via Netlify environment variables

const SHOPIFY_CONFIG = {
    // Your Shopify store domain (without https://)
    // Can be overridden with SHOPIFY_STORE_DOMAIN env variable
    storeDomain: window.SHOPIFY_STORE_DOMAIN || '0zm835-67.myshopify.com',
    
    // Your Shopify Storefront API Access Token
    // Can be overridden with SHOPIFY_STOREFRONT_TOKEN env variable
    // To get this token:
    // 1. Go to your Shopify Admin
    // 2. Settings > Apps and sales channels
    // 3. Develop apps > Create an app
    // 4. Configure Storefront API access
    // 5. Generate a public access token
    publicAccessToken: window.SHOPIFY_STOREFRONT_TOKEN || 'YOUR_STOREFRONT_ACCESS_TOKEN_HERE',
    
    // API Version (current version as of 2025)
    apiVersion: '2025-01',
    
    // Your store's public URL for product links
    // Can be overridden with SHOPIFY_STORE_URL env variable
    storeUrl: window.SHOPIFY_STORE_URL || 'https://0zm835-67.myshopify.com'
};

// Export configuration for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SHOPIFY_CONFIG;
} else {
    window.SHOPIFY_CONFIG = SHOPIFY_CONFIG;
}