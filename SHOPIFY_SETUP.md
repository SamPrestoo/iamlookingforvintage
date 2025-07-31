# Shopify Integration Setup Guide

This guide will walk you through connecting your website to your Shopify store.

## Step 1: Get Your Shopify Storefront API Access Token

1. **Log into your Shopify Admin Panel**
   - Go to: https://admin.shopify.com/store/0zm835-67 (your current test store)
   - Login with: sam.prestoooo@gmail.com

2. **Navigate to Apps and Sales Channels**
   - In your Shopify admin, go to `Settings` > `Apps and sales channels`

3. **Create a Custom App**
   - Click `Develop apps for your store`
   - If you see a message about enabling custom apps, click `Allow custom app development`
   - Click `Create an app`
   - Name it something like "Website Integration"

4. **Configure Storefront API Access**
   - Click on your newly created app
   - Go to the `Configuration` tab
   - Scroll down to `Storefront API access scopes`
   - Enable the following permissions:
     - `unauthenticated_read_product_listings`
     - `unauthenticated_read_products`
     - `unauthenticated_read_product_inventory`
     - `unauthenticated_read_collections`

5. **Generate Access Token**
   - Go to the `API credentials` tab
   - Under `Storefront API access token`, click `Generate token`
   - Copy this token - you'll need it in the next step

## Step 2: Update Your Configuration

### Option A: For Production (Recommended - Keeps secrets secure)

1. **Set Netlify Environment Variables**
   - Go to your Netlify dashboard
   - Navigate to: Site settings > Environment variables
   - Add these variables:
     - `SHOPIFY_STORE_DOMAIN` = `0zm835-67.myshopify.com`
     - `SHOPIFY_STOREFRONT_TOKEN` = `your_actual_token_here`
     - `SHOPIFY_STORE_URL` = `https://0zm835-67.myshopify.com`

2. **Deploy your site** - Netlify will automatically inject these variables

### Option B: For Local Development

1. **Edit the shopify-config.js file**
   - Open `shopify-config.js` in your project
   - Replace `YOUR_STOREFRONT_ACCESS_TOKEN_HERE` with the token you copied
   - Verify that `storeDomain` is correct: `0zm835-67.myshopify.com`

   Example:
   ```javascript
   const SHOPIFY_CONFIG = {
       storeDomain: '0zm835-67.myshopify.com',
       publicAccessToken: 'shpat_your_actual_token_here',
       apiVersion: '2025-01',
       storeUrl: 'https://0zm835-67.myshopify.com'
   };
   ```

**Note**: Using Netlify environment variables (Option A) is more secure and recommended for production.

## Step 3: Test the Integration

1. **Open your website locally**
   - Run `npm run serve` in your terminal
   - Visit `http://localhost:3000/shop.html` in your browser

2. **Check the Browser Console**
   - Open Developer Tools (F12)
   - Look for messages like "Loaded X products from Shopify"
   - If you see errors, check that your token is correct

## Step 4: Add Products to Your Shopify Store

1. **In your Shopify Admin**
   - Go to `Products` > `All products`
   - Click `Add product`
   - Fill in product details:
     - Title
     - Description  
     - Images (upload at least one image)
     - Price
     - Inventory tracking

2. **Make Products Available**
   - In the product editor, scroll to `Product availability`
   - Make sure your sales channel is checked
   - Save the product

## Switching to a Different Shopify Store

When you're ready to switch to your friend's store:

1. **Get their store domain**
   - It will be something like `their-store-name.myshopify.com`

2. **Set up API access on their store**
   - Follow steps 1-5 above on their Shopify admin

3. **Update shopify-config.js**
   - Change `storeDomain` to their store domain
   - Change `publicAccessToken` to their token
   - Change `storeUrl` to their store URL

## Troubleshooting

**Products not loading from Shopify?**
- Check browser console for error messages
- Verify your access token is correct
- Make sure products are published and available
- The website will automatically fall back to local products.json if Shopify fails

**CORS errors?**
- This should not happen with Storefront API, but if it does, make sure you're using the public access token (not private)

**Want to add more product information?**
- Edit the `transformProducts` function in `shopify-api.js`
- The GraphQL query can be modified to fetch additional fields

## Current Features

✅ **Automatic Shopify product loading**
✅ **Fallback to local products if Shopify fails**  
✅ **Product images from Shopify**
✅ **Direct links to Shopify product pages**
✅ **Easy store switching via config file**
✅ **Category filtering**
✅ **Responsive design**

Your website will now automatically sync with your Shopify store - when you add, remove, or update products in Shopify, they'll appear on your website!