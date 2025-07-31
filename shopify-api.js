// Shopify API Service
// Handles all interactions with Shopify Storefront API

class ShopifyAPI {
    constructor(config) {
        this.config = config;
        this.client = null;
        this.initialized = false;
    }

    // Initialize the Shopify client
    async initialize() {
        if (!this.config.publicAccessToken || this.config.publicAccessToken === 'YOUR_STOREFRONT_ACCESS_TOKEN_HERE') {
            console.warn('Shopify access token not configured. Please update shopify-config.js');
            return false;
        }

        try {
            // Import the Shopify client dynamically
            const { createStorefrontApiClient } = await import('https://cdn.skypack.dev/@shopify/storefront-api-client');
            
            this.client = createStorefrontApiClient({
                storeDomain: `https://${this.config.storeDomain}`,
                apiVersion: this.config.apiVersion,
                publicAccessToken: this.config.publicAccessToken,
            });
            
            this.initialized = true;
            console.log('Shopify API initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize Shopify API:', error);
            return false;
        }
    }

    // Fetch all products from Shopify
    async fetchProducts(limit = 20) {
        if (!this.initialized) {
            const success = await this.initialize();
            if (!success) {
                return { products: [], error: 'Failed to initialize Shopify API' };
            }
        }

        const query = `
            query getProducts($first: Int!) {
                products(first: $first) {
                    edges {
                        node {
                            id
                            title
                            description
                            handle
                            createdAt
                            updatedAt
                            productType
                            vendor
                            tags
                            images(first: 5) {
                                edges {
                                    node {
                                        id
                                        url
                                        altText
                                        width
                                        height
                                    }
                                }
                            }
                            variants(first: 1) {
                                edges {
                                    node {
                                        id
                                        title
                                        price {
                                            amount
                                            currencyCode
                                        }
                                        compareAtPrice {
                                            amount
                                            currencyCode
                                        }
                                        availableForSale
                                    }
                                }
                            }
                        }
                    }
                }
            }
        `;

        try {
            const response = await this.client.request(query, {
                variables: { first: limit }
            });

            if (response.errors) {
                console.error('GraphQL errors:', response.errors);
                return { products: [], error: 'GraphQL query failed' };
            }

            const products = this.transformProducts(response.data.products.edges);
            return { products, error: null };
        } catch (error) {
            console.error('Error fetching products:', error);
            return { products: [], error: error.message };
        }
    }

    // Transform Shopify product data to match our existing format
    transformProducts(productEdges) {
        return productEdges.map(({ node: product }) => {
            const firstVariant = product.variants.edges[0]?.node;
            const firstImage = product.images.edges[0]?.node;
            
            // Create product URL for your Shopify store
            const productUrl = `${this.config.storeUrl}/products/${product.handle}`;

            return {
                id: product.id,
                name: product.title,
                description: product.description || 'Premium vintage item',
                price: firstVariant ? parseFloat(firstVariant.price.amount) : 0,
                originalPrice: firstVariant?.compareAtPrice ? parseFloat(firstVariant.compareAtPrice.amount) : null,
                category: this.categorizeProduct(product.productType, product.tags),
                image: firstImage?.url || null,
                images: product.images.edges.map(({ node }) => ({
                    url: node.url,
                    alt: node.altText || product.title,
                    width: node.width,
                    height: node.height
                })),
                shopifyId: product.id,
                handle: product.handle,
                productUrl: productUrl,
                availableForSale: firstVariant?.availableForSale || false,
                vendor: product.vendor,
                productType: product.productType,
                tags: product.tags,
                createdAt: product.createdAt,
                updatedAt: product.updatedAt
            };
        });
    }

    // Categorize products based on productType and tags
    categorizeProduct(productType, tags) {
        const type = productType?.toLowerCase() || '';
        const tagString = tags?.join(' ').toLowerCase() || '';
        
        if (type.includes('clothing') || type.includes('apparel') || 
            tagString.includes('shirt') || tagString.includes('jacket') || 
            tagString.includes('dress') || tagString.includes('pants')) {
            return 'clothing';
        }
        
        if (type.includes('accessories') || type.includes('jewelry') ||
            tagString.includes('bag') || tagString.includes('watch') ||
            tagString.includes('sunglasses') || tagString.includes('belt')) {
            return 'accessories';
        }
        
        if (type.includes('home') || type.includes('decor') ||
            tagString.includes('vintage') || tagString.includes('collectible')) {
            return 'collectibles';
        }
        
        return 'miscellaneous';
    }

    // Fetch a single product by handle
    async fetchProduct(handle) {
        if (!this.initialized) {
            const success = await this.initialize();
            if (!success) {
                return { product: null, error: 'Failed to initialize Shopify API' };
            }
        }

        const query = `
            query getProduct($handle: String!) {
                product(handle: $handle) {
                    id
                    title
                    description
                    handle
                    createdAt
                    updatedAt
                    productType
                    vendor
                    tags
                    images(first: 10) {
                        edges {
                            node {
                                id
                                url
                                altText
                                width
                                height
                            }
                        }
                    }
                    variants(first: 10) {
                        edges {
                            node {
                                id
                                title
                                price {
                                    amount
                                    currencyCode
                                }
                                compareAtPrice {
                                    amount
                                    currencyCode
                                }
                                availableForSale
                                selectedOptions {
                                    name
                                    value
                                }
                            }
                        }
                    }
                }
            }
        `;

        try {
            const response = await this.client.request(query, {
                variables: { handle }
            });

            if (response.errors) {
                console.error('GraphQL errors:', response.errors);
                return { product: null, error: 'Product not found' };
            }

            if (!response.data.product) {
                return { product: null, error: 'Product not found' };
            }

            const product = this.transformProducts([{ node: response.data.product }])[0];
            return { product, error: null };
        } catch (error) {
            console.error('Error fetching product:', error);
            return { product: null, error: error.message };
        }
    }
}

// Create and export a global instance
const shopifyAPI = new ShopifyAPI(window.SHOPIFY_CONFIG || {});

// Make it available globally
if (typeof window !== 'undefined') {
    window.shopifyAPI = shopifyAPI;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ShopifyAPI;
}