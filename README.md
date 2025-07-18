# 🎽 iamlookingforvintage

A beautiful vintage clothing website with a custom admin interface for easy product management.

## 🌟 Features

- **Beautiful Vintage Design**: Mid-2000s inspired aesthetic with modern responsive layout
- **Product Filtering**: Browse by clothing, accessories, and collectibles
- **Custom Admin Interface**: Simple product management without complex setup
- **Mobile Responsive**: Works perfectly on all devices
- **Fast & Lightweight**: Static HTML with no heavy frameworks

## 🛠️ Admin Interface

### How to Manage Products

1. **Access Admin**: Visit `/admin/index.html` on your website
2. **Add Products**: Click "Add New Product" and fill in the details
3. **Edit Products**: Click the "Edit" button on any product card
4. **Delete Products**: Click the "Delete" button on any product card
5. **Save Changes**: Click "Download Updated products.json" when finished
6. **Update Website**: Replace the products.json file in your website folder

### Product Fields

- **Product ID**: Unique identifier (auto-generated)
- **Product Name**: Display name for the product
- **Description**: Product details and description
- **Price**: Product price in USD
- **Category**: clothing, accessories, or collectibles
- **Image URL**: Link to product image

## 🚀 Deployment

### Netlify (Current)
- Connected to GitHub repository
- Automatic deployments on push to main branch
- Live at: https://splendid-madeleine-249932.netlify.app

### Local Development
```bash
npm run serve
# Visit http://localhost:3000
```

## 📁 File Structure

```
iamlookingforvintage/
├── index.html          # Home page
├── shop.html           # Product catalog
├── about.html          # Business information
├── style.css           # All styling
├── script.js           # Interactive features
├── products.json       # Product data
├── admin/
│   └── index.html      # Product management interface
└── package.json        # Dependencies
```

## 🎨 Customization

### Colors
- Primary: #8b7355 (Vintage Brown)
- Background: #000000 (Black)
- Text: #ffffff (White)
- Accent: Various vintage-inspired colors

### Fonts
- **Workbench**: Custom vintage font for headings and buttons
- **Arial**: Fallback for maximum compatibility

## 💡 Why This Approach?

We originally tried TinaCMS but found it overcomplicated for a simple static website. This custom admin interface provides:

- ✅ **Simplicity**: No complex cloud setup or authentication
- ✅ **Reliability**: Works offline and doesn't depend on external services
- ✅ **Speed**: Lightweight and fast loading
- ✅ **Control**: Full control over the interface and functionality
- ✅ **Cost**: Completely free to use

## 🔧 Technical Details

- **Static HTML/CSS/JS**: No frameworks, maximum compatibility
- **JSON Data**: Simple file-based product storage
- **Responsive Design**: CSS Grid and Flexbox for modern layouts
- **Progressive Enhancement**: Works without JavaScript for basic functionality

## 📞 Support

For technical questions or customization requests, refer to the development history in this repository.

---

*Built with ❤️ for vintage clothing enthusiasts* 