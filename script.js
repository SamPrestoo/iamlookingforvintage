// Modern JavaScript for vintage website
document.addEventListener('DOMContentLoaded', function() {
    
    // Smooth fade-in animation for page elements
    function fadeInElements() {
        const elements = document.querySelectorAll('.hero, .feature-item, .product-card, .product-item, .about-section');
        
        elements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            
            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
    
    // Enhanced filter and sort functionality for shop page
    let currentCategory = 'all';
    let currentSort = 'default';
    
    function initializeFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const sortSelect = document.getElementById('sortSelect');
        
        // Category filter buttons
        if (filterButtons.length > 0) {
            filterButtons.forEach(button => {
                button.addEventListener('click', function() {
                    currentCategory = this.getAttribute('data-category');
                    
                    // Update active button
                    filterButtons.forEach(btn => btn.classList.remove('active'));
                    this.classList.add('active');
                    
                    // Apply filters and sorting
                    applyFiltersAndSort();
                });
            });
        }
        
        // Sort dropdown
        if (sortSelect) {
            sortSelect.addEventListener('change', function() {
                currentSort = this.value;
                
                // Apply filters and sorting
                applyFiltersAndSort();
            });
        }
    }
    
    function applyFiltersAndSort() {
        const productItems = document.querySelectorAll('.product-item');
        
        if (productItems.length === 0) return;
        
        // First, filter by category
        let visibleProducts = Array.from(productItems).filter(item => {
            const itemCategory = item.getAttribute('data-category');
            return currentCategory === 'all' || itemCategory === currentCategory;
        });
        
        // Hide all products first
        productItems.forEach(item => {
            item.style.display = 'none';
            item.style.opacity = '0';
        });
        
        // Sort visible products if needed
        if (currentSort !== 'default') {
            visibleProducts.sort((a, b) => {
                const priceA = parseFloat(a.querySelector('.product-price').textContent.replace('$', ''));
                const priceB = parseFloat(b.querySelector('.product-price').textContent.replace('$', ''));
                
                if (currentSort === 'price-low') {
                    return priceA - priceB;
                } else if (currentSort === 'price-high') {
                    return priceB - priceA;
                }
                return 0;
            });
            
            // Reorder DOM elements
            const container = document.getElementById('products-container');
            visibleProducts.forEach(item => {
                container.appendChild(item);
            });
        }
        
        // Show filtered products with animation
        visibleProducts.forEach((item, index) => {
            item.style.display = 'block';
            
            setTimeout(() => {
                item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                item.style.opacity = '1';
                item.style.transform = 'scale(1)';
            }, index * 50);
        });
    }
    
    // Add to cart animation
    function initializeCartButtons() {
        const addToCartButtons = document.querySelectorAll('.add-to-cart');
        
        addToCartButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Create a temporary feedback element
                const feedback = document.createElement('span');
                feedback.textContent = '✓ Added!';
                feedback.style.position = 'absolute';
                feedback.style.background = '#8b7355';
                feedback.style.color = '#ffffff';
                feedback.style.padding = '5px 10px';
                feedback.style.borderRadius = '3px';
                feedback.style.fontSize = '12px';
                feedback.style.pointerEvents = 'none';
                feedback.style.zIndex = '1000';
                feedback.style.opacity = '0';
                feedback.style.transform = 'translateY(10px)';
                feedback.style.transition = 'all 0.3s ease';
                
                // Position relative to button
                const rect = this.getBoundingClientRect();
                feedback.style.left = rect.left + 'px';
                feedback.style.top = (rect.top - 40) + 'px';
                
                document.body.appendChild(feedback);
                
                // Animate in
                setTimeout(() => {
                    feedback.style.opacity = '1';
                    feedback.style.transform = 'translateY(0)';
                }, 10);
                
                // Animate out and remove
                setTimeout(() => {
                    feedback.style.opacity = '0';
                    feedback.style.transform = 'translateY(-10px)';
                }, 1000);
                
                setTimeout(() => {
                    document.body.removeChild(feedback);
                }, 1300);
                
                // Button feedback
                const originalText = this.textContent;
                this.textContent = 'Added!';
                this.style.background = '#6d5a43';
                
                setTimeout(() => {
                    this.textContent = originalText;
                    this.style.background = '#8b7355';
                }, 1000);
            });
        });
    }
    
    // Enhanced hover effects for product cards
    function initializeHoverEffects() {
        const productCards = document.querySelectorAll('.product-card, .product-item');
        
        productCards.forEach(card => {
            const productImage = card.querySelector('.product-image');
            
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-8px) scale(1.02)';
                this.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                
                if (productImage) {
                    productImage.style.background = 'linear-gradient(45deg, #f5f5f5, #f9f9f9)';
                }
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
                this.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                
                if (productImage) {
                    productImage.style.background = '#f5f5f5';
                }
            });
        });
    }
    
    // Navigation link animations
    function initializeNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            });
            
            link.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = 'none';
            });
        });
    }
    
    // Contact form enhancement
    function initializeContactForm() {
        const contactForm = document.querySelector('form');
        
        if (contactForm) {
            contactForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const submitBtn = this.querySelector('.submit-btn');
                const originalText = submitBtn.textContent;
                
                // Button animation
                submitBtn.textContent = 'Sending...';
                submitBtn.style.background = '#6d5a43';
                submitBtn.disabled = true;
                
                // Simulate form submission
                setTimeout(() => {
                    submitBtn.textContent = 'Message Sent!';
                    submitBtn.style.background = '#8b7355';
                }, 1500);
                
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.style.background = '#8b7355';
                    submitBtn.disabled = false;
                    this.reset();
                }, 3000);
            });
            
            // Input focus effects
            const inputs = contactForm.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                input.addEventListener('focus', function() {
                    this.style.borderColor = '#8b7355';
                    this.style.boxShadow = '0 0 8px rgba(139, 115, 85, 0.2)';
                    this.style.transform = 'scale(1.02)';
                });
                
                input.addEventListener('blur', function() {
                    this.style.borderColor = '#e0e0e0';
                    this.style.boxShadow = 'none';
                    this.style.transform = 'scale(1)';
                });
            });
        }
    }
    
    // Smooth scrolling for internal links
    function initializeSmoothScrolling() {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
    
    // Scroll-triggered animations
    function initializeScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);
        
        // Observe elements that should animate on scroll
        const animateElements = document.querySelectorAll('.feature-item, .about-section');
        animateElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }
    
    // Page loading animation
    function initializePageLoad() {
        const container = document.querySelector('.container');
        
        container.style.opacity = '0';
        container.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            container.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            container.style.opacity = '1';
            container.style.transform = 'translateY(0)';
        }, 100);
    }
    
    // Shopping cart functionality
    let cart = JSON.parse(localStorage.getItem('vintageCart')) || [];
    
    function updateCartCount() {
        const cartCountElement = document.getElementById('cartCount');
        if (cartCountElement) {
            const totalItems = cart.length;
            cartCountElement.textContent = totalItems;
        }
    }
    
    function addToCart(product, quantity = 1) {
        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem) {
            // Item already in cart - show notification but don't add again
            showCartNotification('Item already in cart!');
            return;
        } else {
            // Handle both string and object formats for images
            let productImage = null;
            if (product.images && product.images.length > 0) {
                const thumbIndex = product.thumbnailIndex || 0;
                const imageData = product.images[thumbIndex];
                productImage = typeof imageData === 'string' ? imageData : imageData.data;
                console.log('🖼️ Adding product to cart:', {
                    name: product.name,
                    thumbIndex,
                    imageDataType: typeof imageData,
                    hasImageData: !!productImage,
                    imageStart: productImage ? productImage.substring(0, 50) + '...' : 'none'
                });
            } else {
                console.log('⚠️ No images found for product:', product.name, product.images);
            }
            
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: productImage
            });
        }
        
        localStorage.setItem('vintageCart', JSON.stringify(cart));
        updateCartCount();
        showCartNotification();
    }
    
    function showCartNotification(message = 'Item added to cart!') {
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #8b7355;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 1000;
            font-family: 'Workbench', Arial, sans-serif;
            transform: translateX(400px);
            transition: transform 0.3s;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Global variables for pagination
    let allProducts = [];
    let displayedProducts = [];
    let productsPerPage = 24; // Show 24 products initially
    let currentPage = 1;
    let isLoading = false;

    // Load products from local JSON and admin products
    function loadProducts() {
        const productsContainer = document.getElementById('products-container');
        if (!productsContainer) return;

        // Show loading state
        productsContainer.innerHTML = '<div class="loading-message">Loading products...</div>';
        isLoading = true;

        // Clear localStorage cache to prevent stale data
        localStorage.removeItem('adminProducts');

        // Add cache-busting parameter to prevent browser caching
        const timestamp = new Date().getTime();
        fetch(`products.json?v=${timestamp}`)
            .then(response => response.json())
            .then(data => {
                // Use products from JSON file only (no localStorage cache)
                const jsonProducts = data.products || [];
                
                allProducts = jsonProducts;
                console.log(`Loaded ${allProducts.length} products from JSON`);
                displayProductsPaginated();
            })
            .catch(error => {
                console.error('Failed to load products.json:', error);
                const productsContainer = document.getElementById('products-container');
                if (productsContainer) {
                    productsContainer.innerHTML = '<div class="error-message">Unable to load products. Please try again later.</div>';
                }
            });
        
        isLoading = false;
    }


    // Display products with pagination
    function displayProductsPaginated() {
        const startIndex = 0;
        const endIndex = productsPerPage;
        displayedProducts = allProducts.slice(startIndex, endIndex);
        displayProducts(displayedProducts);
        
        // Add load more button if there are more products
        if (allProducts.length > productsPerPage) {
            addLoadMoreButton();
        }
        
        // Set up infinite scroll
        setupInfiniteScroll();
    }

    // Add load more button
    function addLoadMoreButton() {
        const productsContainer = document.getElementById('products-container');
        if (!productsContainer) return;
        
        const existingButton = document.getElementById('load-more-btn');
        if (existingButton) existingButton.remove();
        
        const loadMoreContainer = document.createElement('div');
        loadMoreContainer.className = 'load-more-container';
        loadMoreContainer.innerHTML = `
            <button id="load-more-btn" class="load-more-btn">
                Load More Products (${Math.min(productsPerPage, allProducts.length - displayedProducts.length)} more)
            </button>
        `;
        
        productsContainer.parentNode.insertBefore(loadMoreContainer, productsContainer.nextSibling);
        
        document.getElementById('load-more-btn').addEventListener('click', loadMoreProducts);
    }

    // Load more products
    function loadMoreProducts() {
        if (isLoading || displayedProducts.length >= allProducts.length) return;
        
        isLoading = true;
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.textContent = 'Loading...';
            loadMoreBtn.disabled = true;
        }
        
        setTimeout(() => {
            const startIndex = displayedProducts.length;
            const endIndex = Math.min(startIndex + productsPerPage, allProducts.length);
            const newProducts = allProducts.slice(startIndex, endIndex);
            
            displayedProducts = [...displayedProducts, ...newProducts];
            appendProducts(newProducts);
            
            // Update or remove load more button
            if (displayedProducts.length >= allProducts.length) {
                const loadMoreContainer = document.querySelector('.load-more-container');
                if (loadMoreContainer) loadMoreContainer.remove();
            } else {
                updateLoadMoreButton();
            }
            
            isLoading = false;
        }, 500); // Small delay for better UX
    }

    // Update load more button text
    function updateLoadMoreButton() {
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
            const remaining = allProducts.length - displayedProducts.length;
            loadMoreBtn.textContent = `Load More Products (${Math.min(productsPerPage, remaining)} more)`;
            loadMoreBtn.disabled = false;
        }
    }

    // Setup infinite scroll
    function setupInfiniteScroll() {
        let scrollTimeout;
        
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                if (isLoading || displayedProducts.length >= allProducts.length) return;
                
                const scrollPosition = window.innerHeight + window.scrollY;
                const documentHeight = document.documentElement.offsetHeight;
                
                // Load more when user scrolls to within 200px of bottom
                if (scrollPosition >= documentHeight - 200) {
                    loadMoreProducts();
                }
            }, 100);
        });
    }

    // Append new products to existing grid
    function appendProducts(products) {
        const productsContainer = document.getElementById('products-container');
        if (!productsContainer) return;

        products.forEach(product => {
            // Get thumbnail image - handle both Shopify and local formats
            let thumbnailImage;
            if (product.image) {
                thumbnailImage = product.image;
            } else if (product.images && product.images.length > 0) {
                thumbnailImage = product.images[product.thumbnailIndex || 0].data || product.images[0].url;
            } else {
                thumbnailImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik04NyA3NEg2NEMlOC42IDc0IDU0IDc4LjYgNTQgODRWMTM2QzU0IDE0MS40IDU4LjYgMTQ2IDY0IDE0Nkg4N0M5Mi40IDE0NiA5NyAxNDEuNCA5NyAxMzZWODRDOTcgNzguNiA5Mi40IDc0IDg3IDc0WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
            }

            const clickAction = product.productUrl 
                ? `window.open('${product.productUrl}', '_blank')` 
                : `viewProduct('${product.id}')`;
            
            const productElement = document.createElement('div');
            productElement.className = 'product-item';
            productElement.setAttribute('data-category', product.category);
            productElement.onclick = () => eval(clickAction);
            productElement.style.cursor = 'pointer';
            productElement.style.opacity = '0';
            productElement.style.transform = 'translateY(20px)';
            
            productElement.innerHTML = `
                <div class="product-image">
                    <img src="${thumbnailImage}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 6px;" loading="lazy">
                    ${product.productUrl ? '<div class="shopify-badge">View on Shopify</div>' : ''}
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="product-description">${product.description ? (product.description.length > 100 ? product.description.substring(0, 100) + '...' : product.description) : 'Premium vintage item'}</p>
                    <p class="product-price">$${product.price.toFixed(2)}</p>
                    ${product.originalPrice ? `<p class="original-price">Originally $${product.originalPrice.toFixed(2)}</p>` : ''}
                    ${product.productUrl ? 
                        `<button class="view-on-shopify" onclick="event.stopPropagation(); window.open('${product.productUrl}', '_blank')">
                            View on Shopify
                        </button>` :
                        `<button class="add-to-cart" onclick="event.stopPropagation(); addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                            Add to Cart
                        </button>`
                    }
                </div>
            `;
            
            productsContainer.appendChild(productElement);
            
            // Animate in
            setTimeout(() => {
                productElement.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                productElement.style.opacity = '1';
                productElement.style.transform = 'translateY(0)';
            }, 50);
        });
        
        // Re-initialize interactive features for new products
        initializeCartButtons();
        initializeHoverEffects();
    }

    // Display products in the UI
    function displayProducts(products) {
        const productsContainer = document.getElementById('products-container');
        if (!productsContainer) return;

        productsContainer.innerHTML = '';
        
        products.forEach(product => {
            // Get thumbnail image - handle both string and object formats
            let thumbnailImage;
            if (product.images && product.images.length > 0) {
                const thumbIndex = product.thumbnailIndex || 0;
                const imageData = product.images[thumbIndex];
                thumbnailImage = typeof imageData === 'string' ? imageData : imageData.data;
            } else {
                thumbnailImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik04NyA3NEg2NEMlOC42IDc0IDU0IDc4LjYgNTQgODRWMTM2QzU0IDE0MS40IDU4LjYgMTQ2IDY0IDE0Nkg4N0M5Mi40IDE0NiA5NyAxNDEuNCA5NyAxMzZWODRDOTcgNzguNiA5Mi40IDc0IDg3IDc0WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
            }
            
            const productHTML = `
                <div class="product-item ${product.sold ? 'sold-out' : ''}" data-category="${product.category}" onclick="viewProduct('${product.id}')" style="cursor: pointer;">
                    <div class="product-image">
                        <img src="${thumbnailImage}" alt="${product.name}" loading="lazy">
                        ${product.sold ? '<div class="sold-badge">SOLD OUT</div>' : ''}
                    </div>
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <div class="product-details">
                            <p class="product-type">${product.type} • ${product.size}</p>
                        </div>
                        <p class="product-price">$${product.price.toFixed(2)}</p>
                        <div class="product-buttons">
                            ${product.sold ? 
                                `<button class="sold-out-btn" disabled>
                                    Sold Out
                                </button>` :
                                `<button class="add-to-cart" onclick="event.stopPropagation(); addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                                    Add to Cart
                                </button>
                                <button class="view-details" onclick="event.stopPropagation(); viewProduct('${product.id}')">
                                    View Details
                                </button>`
                            }
                        </div>
                    </div>
                </div>
            `;
            productsContainer.innerHTML += productHTML;
        });
        
        // Re-initialize interactive features for new products
        initializeCartButtons();
        initializeHoverEffects();
        
        // Initialize filters after products are loaded (only for shop page)
        if (document.querySelector('.filter-btn')) {
            initializeFilters();
        }
    }
    
    // Navigate to product detail page
    function viewProduct(productId) {
        window.location.href = `product.html?id=${productId}`;
    }
    
    // Buy now function - adds to cart and goes to checkout
    function buyNow(productId) {
        fetch('products.json')
            .then(response => response.json())
            .then(data => {
                const product = data.products.find(p => p.id === productId);
                if (product && !product.sold) {
                    addToCart(product);
                    window.location.href = 'cart.html';
                }
            })
            .catch(error => {
                console.error('Error loading product:', error);
            });
    }
    
    // Make functions globally available
    window.addToCart = addToCart;
    window.viewProduct = viewProduct;
    window.buyNow = buyNow;

    // Load featured products for home page
    function loadFeaturedProducts() {
        const homeProductsContainer = document.getElementById('home-products-container');
        if (!homeProductsContainer) return;

        // Show loading state
        homeProductsContainer.innerHTML = '<div class="loading-message">Loading latest arrivals...</div>';

        // Load admin products from localStorage
        let adminProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]');

        fetch('products.json')
            .then(response => response.json())
            .then(data => {
                // Merge admin products with products.json products
                const jsonProducts = data.products || [];
                const adminProductIds = new Set(adminProducts.map(p => p.id));
                const filteredJsonProducts = jsonProducts.filter(p => !adminProductIds.has(p.id));
                
                const allProducts = [...adminProducts, ...filteredJsonProducts];
                
                // Filter available products and take first 6 as featured
                const availableProducts = allProducts.filter(product => !product.sold);
                const featuredProducts = availableProducts.slice(0, 6);
                console.log(`Loaded ${featuredProducts.length} featured products from ${allProducts.length} total`);
                displayFeaturedProducts(featuredProducts);
            })
            .catch(error => {
                console.error('Failed to load products.json, using admin products only:', error);
                const availableProducts = adminProducts.filter(product => !product.sold);
                const featuredProducts = availableProducts.slice(0, 6);
                if (featuredProducts.length > 0) {
                    console.log(`Loaded ${featuredProducts.length} featured admin products`);
                    displayFeaturedProducts(featuredProducts);
                } else {
                    const homeProductsContainer = document.getElementById('home-products-container');
                    if (homeProductsContainer) {
                        homeProductsContainer.innerHTML = '<div class="error-message">Unable to load latest arrivals.</div>';
                    }
                }
            });
    }

    // Display featured products on home page
    function displayFeaturedProducts(products) {
        const homeProductsContainer = document.getElementById('home-products-container');
        if (!homeProductsContainer) return;

        homeProductsContainer.innerHTML = '';
        
        products.forEach(product => {
            // Get thumbnail image - handle both string and object formats
            let thumbnailImage;
            if (product.images && product.images.length > 0) {
                const thumbIndex = product.thumbnailIndex || 0;
                const imageData = product.images[thumbIndex];
                thumbnailImage = typeof imageData === 'string' ? imageData : imageData.data;
            } else {
                thumbnailImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ci8+CjxwYXRoIGQ9Ik04NyA3NEg2NEMlOC42IDc0IDU0IDc4LjYgNTQgODRWMTM2QzU0IDE0MS40IDU4LjYgMTQ2IDY0IDE0Nkg4N0M5Mi40IDE0NiA5NyAxNDEuNCA5NyAxMzZWODRDOTcgNzguNiA5Mi40IDc0IDg3IDc0WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
            }
            
            const productHTML = `
                <div class="product-card" onclick="viewProduct('${product.id}')" style="cursor: pointer;">
                    <div class="product-image">
                        <img src="${thumbnailImage}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 6px;" loading="lazy">
                    </div>
                    <div class="product-info">
                        <h4>${product.name}</h4>
                        <p class="product-price">$${product.price.toFixed(2)}</p>
                        <div class="product-buttons">
                            ${product.sold ? 
                                `<button class="sold-out-btn" disabled>
                                    Sold Out
                                </button>` :
                                `<button class="add-to-cart" onclick="event.stopPropagation(); addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                                    Add to Cart
                                </button>
                                <button class="view-details" onclick="event.stopPropagation(); viewProduct('${product.id}')">
                                    View Details
                                </button>`
                            }
                        </div>
                    </div>
                </div>
            `;
            homeProductsContainer.innerHTML += productHTML;
        });
        
        // Re-initialize interactive features for new products
        initializeCartButtons();
        initializeHoverEffects();
    }

    // Initialize all functions
    initializePageLoad();
    setTimeout(() => {
        fadeInElements();
        
        // Load different products based on page
        if (document.getElementById('home-products-container')) {
            loadFeaturedProducts(); // Load featured products for home page
        } else {
            loadProducts(); // Load all products for shop page
        }
        
        updateCartCount(); // Update cart count on page load
        initializeCartButtons();
        initializeHoverEffects();
        initializeNavigation();
        initializeContactForm();
        initializeSmoothScrolling();
        initializeScrollAnimations();
    }, 200);
    
    // Add some retro cursor effects for fun
    document.addEventListener('mousemove', function(e) {
        // Create a subtle trailing effect on buttons
        const hoveredButton = e.target.closest('button, .nav-link, .cta-button');
        if (hoveredButton) {
            hoveredButton.style.cursor = 'pointer';
        }
    });
    
    console.log('🕰️ iamlookingforvintage website loaded successfully!');
}); 