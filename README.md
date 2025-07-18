# 🎽 iamlookingforvintage

A beautiful vintage clothing website with a custom admin interface for easy product management.

## 🌟 Features

### E-commerce Functionality
- **Product Catalog**: Browse products with beautiful image galleries
- **Individual Product Pages**: Detailed views with multiple images and descriptions
- **Shopping Cart**: Add items to cart with localStorage persistence
- **Image Gallery**: Navigate through multiple product images with thumbnails
- **Quantity Selection**: Choose quantities with easy +/- controls
- **Mobile Responsive**: Perfect shopping experience on all devices

### Admin Management
- **Password-Protected Admin**: Secure access to product management
- **Multiple Image Upload**: Up to 10 images per product with thumbnail selection
- **Easy Product Management**: Add, edit, and delete products with visual interface
- **Real-time Preview**: See changes immediately in the admin panel
- **JSON Export**: Download updated product data for deployment

### Design & Performance
- **Beautiful Vintage Aesthetic**: Mid-2000s inspired design with modern functionality
- **Fast & Lightweight**: Static HTML with optimized performance
- **No Dependencies**: Self-contained with no external services required

## 🛠️ Admin Interface

### How to Access Admin

1. **Visit Admin Login**: Go to `/admin/login.html` on your website  
2. **Enter Password**: `vintage2024` (change this in production!)
3. **Access Dashboard**: You'll be redirected to the admin panel

### How to Manage Products

1. **Add Products**: Click "Add New Product" and fill in the details
2. **Upload Images**: Add up to 10 images per product (max 5MB each)
3. **Set Thumbnail**: Click "Set as Thumbnail" to choose main display image
4. **Edit Products**: Click the "Edit" button on any product card
5. **Delete Products**: Click the "Delete" button on any product card
6. **Save Changes**: Click "Download Updated products.json" when finished
7. **Update Website**: Replace the products.json file in your website folder

### Security Features
- **Password Protection**: Admin area is protected with session-based authentication
- **24-hour Sessions**: Login sessions expire after 24 hours for security
- **Local Storage**: Images are stored as base64 data in the JSON file

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
├── product.html        # Individual product details
├── about.html          # Business information
├── style.css           # All styling
├── script.js           # Interactive features & cart
├── products.json       # Product data with images
├── admin/
│   ├── login.html      # Password-protected login
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