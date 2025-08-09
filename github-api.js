/**
 * Secure GitHub API Integration using Netlify Functions
 * Handles automatic commits when products are added, updated, or sold
 * No tokens or credentials stored in client-side code
 */
class GitHubUpdater {
    constructor() {
        // Use secure Netlify Function endpoint
        this.functionEndpoint = '/.netlify/functions/github-api';
        this.configured = true; // Always configured with Netlify Functions
    }

    /**
     * Check if GitHub integration is properly configured
     */
    isConfigured() {
        return this.configured;
    }

    /**
     * Add a new product and commit to repository
     * @param {Object} product - Product data
     */
    async addProduct(product) {
        try {
            console.log('🚀 Attempting to add product:', product.name);
            console.log('📍 Function endpoint:', this.functionEndpoint);
            
            const requestBody = {
                action: 'add_product',
                data: product
            };
            console.log('📤 Request body:', requestBody);
            
            const response = await fetch(this.functionEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            
            console.log('📥 Response status:', response.status);
            console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

            let result;
            const responseText = await response.text();
            console.log('📥 Raw response text:', responseText);
            
            // Try to parse JSON, handle empty responses
            if (responseText) {
                try {
                    result = JSON.parse(responseText);
                    console.log('📥 Parsed response:', result);
                } catch (parseError) {
                    console.error('❌ JSON parse error:', parseError);
                    throw new Error(`Server returned invalid response: ${responseText}`);
                }
            } else {
                console.error('❌ Empty response received');
                throw new Error(`Server returned empty response with status ${response.status}`);
            }

            if (!response.ok) {
                throw new Error(result.error || `Server error: ${response.status}`);
            }

            // Show success notification
            this.showNotification(result.message, 'success');
            return result;
        } catch (error) {
            this.showNotification(`Failed to add product: ${error.message}`, 'error');
            throw error;
        }
    }

    /**
     * Update product sold status and commit to repository
     * @param {string} productId - Product ID
     * @param {boolean} sold - Sold status
     * @param {string} productTitle - Product title for display
     */
    async updateSoldStatus(productId, sold, productTitle) {
        try {
            const response = await fetch(this.functionEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'update_sold_status',
                    data: { id: productId, sold: sold }
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to update product status');
            }

            // Show success notification
            this.showNotification(result.message, 'success');
            return result;
        } catch (error) {
            this.showNotification(`Failed to update status: ${error.message}`, 'error');
            throw error;
        }
    }

    /**
     * Delete a product and commit to repository
     * @param {string} productId - Product ID
     * @param {string} productTitle - Product title for display
     */
    async deleteProduct(productId, productTitle) {
        try {
            const response = await fetch(this.functionEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'delete_product',
                    data: { id: productId }
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to delete product');
            }

            // Show success notification
            this.showNotification(result.message, 'success');
            return result;
        } catch (error) {
            this.showNotification(`Failed to delete product: ${error.message}`, 'error');
            throw error;
        }
    }

    /**
     * Test the connection to GitHub API via Netlify Function
     */
    async testConnection() {
        try {
            // Try a simple operation to test the connection
            const response = await fetch(this.functionEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'test_connection',
                    data: {}
                })
            });

            if (response.ok) {
                this.showNotification('✅ GitHub connection successful', 'success');
                return true;
            } else {
                throw new Error('Connection test failed');
            }
        } catch (error) {
            this.showNotification(`❌ Connection failed: ${error.message}`, 'error');
            throw error;
        }
    }

    /**
     * Show notification to user
     * @param {string} message - Notification message
     * @param {string} type - Notification type ('success' or 'error')
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-family: 'Workbench', Arial, sans-serif;
            font-weight: 500;
            z-index: 10000;
            max-width: 400px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            transform: translateX(450px);
            transition: transform 0.3s ease;
        `;

        // Set background color based on type
        switch (type) {
            case 'success':
                notification.style.background = '#28a745';
                break;
            case 'error':
                notification.style.background = '#dc3545';
                break;
            default:
                notification.style.background = '#8b7355';
        }

        notification.textContent = message;
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Animate out and remove
        setTimeout(() => {
            notification.style.transform = 'translateX(450px)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, type === 'error' ? 8000 : 5000);
    }
}

// Create global instance
window.githubUpdater = new GitHubUpdater();