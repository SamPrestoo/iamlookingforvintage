# Admin System Instructions

## How to Add Products That Persist

Your admin system has been updated to properly handle product additions. Here's how it works:

### Current System
- Products added through the admin are stored in **localStorage** (temporary)
- The main site now loads products from **both** localStorage and products.json
- This means admin products will show up immediately on your site

### Making Changes Permanent

Since your site updates from the Git repository, you need to update the `products.json` file to make changes permanent:

#### Method 1: Export Products JSON (Recommended)
1. Go to your admin dashboard
2. Click the **"Export Products JSON"** button
3. This downloads a complete `products.json` file with all your products
4. Replace the `products.json` file in your repository with the downloaded file
5. Commit and push to GitHub

#### Method 2: Manual Addition
1. When you add a product, a JSON file is automatically downloaded
2. Copy the product data from that file
3. Manually add it to the `products` array in `products.json`
4. Commit and push to GitHub

### Step-by-Step Process

1. **Add Product via Admin**
   - Products appear immediately on your site
   - Data stored in browser localStorage

2. **Export and Update**
   - Click "Export Products JSON" in admin dashboard
   - Download the complete products.json file
   - Replace your repository's products.json file
   - Commit and push changes

3. **Deploy**
   - Your hosting platform will update with new products
   - Products are now permanent and survive site redeployments

### Important Notes

- **Immediate visibility**: Admin products show up on your site right away
- **Persistence**: Products need to be exported to products.json to survive redeployments  
- **Admin products take precedence**: If there's an ID conflict, admin products override products.json items
- **Mark as sold**: This also updates localStorage and can be exported to products.json

### Troubleshooting

If admin products don't show up:
1. Check browser console for errors
2. Make sure you're logged into the admin system
3. Clear browser cache and try again
4. Verify localStorage has your products (check browser dev tools)

### Future Improvements

For a fully automated system, you would need:
- A backend API server
- Database for product storage  
- Automated Git commits via server-side code
- GitHub Actions for automatic deployments

The current system provides a good interim solution that works with your static site hosting.