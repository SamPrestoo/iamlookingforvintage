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
    
    // Product filter functionality for shop page
    function initializeFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const productItems = document.querySelectorAll('.product-item');
        
        if (filterButtons.length > 0) {
            filterButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const category = this.getAttribute('data-category');
                    
                    // Update active button
                    filterButtons.forEach(btn => btn.classList.remove('active'));
                    this.classList.add('active');
                    
                    // Filter products with animation
                    productItems.forEach(item => {
                        const itemCategory = item.getAttribute('data-category');
                        
                        if (category === 'all' || itemCategory === category) {
                            item.style.display = 'block';
                            item.style.opacity = '0';
                            item.style.transform = 'scale(0.8)';
                            
                            setTimeout(() => {
                                item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                                item.style.opacity = '1';
                                item.style.transform = 'scale(1)';
                            }, 50);
                        } else {
                            item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                            item.style.opacity = '0';
                            item.style.transform = 'scale(0.8)';
                            
                            setTimeout(() => {
                                item.style.display = 'none';
                            }, 300);
                        }
                    });
                });
            });
        }
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
                    submitBtn.style.background = '#228b22';
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
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCountElement.textContent = totalItems;
        }
    }
    
    function addToCart(product, quantity = 1) {
        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.images && product.images.length > 0 
                    ? product.images[product.thumbnailIndex || 0].data 
                    : null,
                quantity: quantity
            });
        }
        
        localStorage.setItem('vintageCart', JSON.stringify(cart));
        updateCartCount();
        showCartNotification();
    }
    
    function showCartNotification() {
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 1000;
            font-family: 'Workbench', Arial, sans-serif;
            transform: translateX(400px);
            transition: transform 0.3s;
        `;
        notification.textContent = 'Item added to cart!';
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

    // Load products dynamically
    function loadProducts() {
        fetch('products.json')
            .then(response => response.json())
            .then(data => {
                const productsContainer = document.getElementById('products-container');
                if (productsContainer) {
                    productsContainer.innerHTML = '';
                    
                    data.products.forEach(product => {
                        // Get thumbnail image
                        const thumbnailImage = product.images && product.images.length > 0 
                            ? product.images[product.thumbnailIndex || 0].data 
                            : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik04NyA3NEg2NEMlOC42IDc0IDU0IDc4LjYgNTQgODRWMTM2QzU0IDE0MS40IDU4LjYgMTQ2IDY0IDE0Nkg4N0M5Mi40IDE0NiA5NyAxNDEuNCA5NyAxMzZWODRDOTcgNzguNiA5Mi40IDc0IDg3IDc0WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                        
                        const productHTML = `
                            <div class="product-item" data-category="${product.category}">
                                <div class="product-image">
                                    <img src="${thumbnailImage}" alt="${product.name}" onclick="viewProduct('${product.id}')" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; cursor: pointer;">
                                </div>
                                <div class="product-info">
                                    <h3>${product.name}</h3>
                                    <p class="product-description">${product.description ? product.description.substring(0, 100) + '...' : 'Premium vintage item'}</p>
                                    <p class="product-price">$${product.price.toFixed(2)}</p>
                                    <button class="add-to-cart" onclick="addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})"><img src="Frame 31.png" alt="Cart" class="cart-icon">Add to Cart</button>
                                    <button class="view-details" onclick="viewProduct('${product.id}')" style="font-family: "Workbench", sans-serif;font-optical-sizing: auto;font-weight: 400;font-style: normal;font-variation-settings:"BLED" 0,"SCAN" 0;margin-left: 10px; background: #8b7355; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">View Details</button>
                                </div>
                            </div>
                        `;
                        productsContainer.innerHTML += productHTML;
                    });
                    
                    // Re-initialize interactive features for new products
                    initializeCartButtons();
                    initializeHoverEffects();
                }
            })
            .catch(error => {
                console.log('Products will be loaded from CMS when deployed');
                // Fallback: keep existing products if JSON fails to load during development
            });
    }
    
    // Navigate to product detail page
    function viewProduct(productId) {
        window.location.href = `product.html?id=${productId}`;
    }
    
    // Make functions globally available
    window.addToCart = addToCart;
    window.viewProduct = viewProduct;

    // Initialize all functions
    initializePageLoad();
    setTimeout(() => {
        fadeInElements();
        loadProducts(); // Load products from JSON
        updateCartCount(); // Update cart count on page load
        initializeFilters();
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