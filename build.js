#!/usr/bin/env node

// Build script to inject environment variables into the client-side code
const fs = require('fs');
const path = require('path');

console.log('🔧 Building site with environment variables...');

// Read environment variables
const shopifyStoreDomain = process.env.SHOPIFY_STORE_DOMAIN;
const shopifyStorefrontToken = process.env.SHOPIFY_STOREFRONT_TOKEN;
const shopifyStoreUrl = process.env.SHOPIFY_STORE_URL;

// Only inject if environment variables are provided
if (shopifyStoreDomain || shopifyStorefrontToken || shopifyStoreUrl) {
    console.log('📦 Injecting Shopify environment variables...');
    
    // Create an environment script
    const envScript = `
// Environment variables injected at build time
${shopifyStoreDomain ? `window.SHOPIFY_STORE_DOMAIN = '${shopifyStoreDomain}';` : ''}
${shopifyStorefrontToken ? `window.SHOPIFY_STOREFRONT_TOKEN = '${shopifyStorefrontToken}';` : ''}
${shopifyStoreUrl ? `window.SHOPIFY_STORE_URL = '${shopifyStoreUrl}';` : ''}
`;

    // Write environment script
    fs.writeFileSync('env.js', envScript.trim());
    
    // Update HTML files to include env.js
    const htmlFiles = ['index.html', 'shop.html', 'product.html', 'about.html'];
    
    htmlFiles.forEach(file => {
        if (fs.existsSync(file)) {
            let content = fs.readFileSync(file, 'utf8');
            
            // Add env.js before shopify-config.js if it's not already there
            if (!content.includes('env.js') && content.includes('shopify-config.js')) {
                content = content.replace(
                    '<script src="shopify-config.js"></script>',
                    '<script src="env.js"></script>\\n    <script src="shopify-config.js"></script>'
                );
                fs.writeFileSync(file, content);
                console.log(`✅ Updated ${file} with environment variables`);
            }
        }
    });
    
    console.log('✅ Environment variables injected successfully!');
} else {
    console.log('ℹ️  No Shopify environment variables found, using defaults from config');
    
    // Create an empty env.js file
    fs.writeFileSync('env.js', '// No environment variables configured');
}

console.log('🎉 Build complete!');