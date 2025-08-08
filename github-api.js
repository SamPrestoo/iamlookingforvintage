/**
 * GitHub API Integration for Automatic Product Updates
 * This module handles secure automatic commits to the repository when products are added/updated
 */

class GitHubUpdater {
    constructor() {
        this.token = localStorage.getItem('github_token');
        this.repoOwner = 'SamPrestoo'; // Your GitHub username
        this.repoName = 'iamlookingforvintage'; // Your repository name
        this.branch = 'main';
        this.apiBase = 'https://api.github.com';
    }

    /**
     * Set the GitHub Personal Access Token
     * @param {string} token - GitHub Personal Access Token
     */
    setToken(token) {
        if (!token || typeof token !== 'string') {
            throw new Error('Invalid token provided');
        }
        
        // Basic token format validation
        if (!token.startsWith('ghp_') && !token.startsWith('github_pat_')) {
            throw new Error('Invalid GitHub token format');
        }
        
        this.token = token;
        localStorage.setItem('github_token', token);
    }

    /**
     * Check if token is configured
     */
    isConfigured() {
        return !!this.token;
    }

    /**
     * Get current products.json content from GitHub
     */
    async getCurrentProductsFile() {
        if (!this.token) {
            throw new Error('GitHub token not configured');
        }

        try {
            const response = await fetch(
                `${this.apiBase}/repos/${this.repoOwner}/${this.repoName}/contents/products.json`,
                {
                    headers: {
                        'Authorization': `token ${this.token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Invalid GitHub token or insufficient permissions');
                } else if (response.status === 404) {
                    throw new Error('Repository not found or token lacks access');
                } else {
                    throw new Error(`GitHub API error: ${response.status}`);
                }
            }

            const data = await response.json();
            const content = JSON.parse(atob(data.content));
            
            return {
                content: content,
                sha: data.sha // Required for updating the file
            };
        } catch (error) {
            console.error('Error fetching current products file:', error);
            throw error;
        }
    }

    /**
     * Update products.json file on GitHub
     * @param {Object} newProductsData - The complete products data
     * @param {string} commitMessage - Commit message
     */
    async updateProductsFile(newProductsData, commitMessage) {
        if (!this.token) {
            throw new Error('GitHub token not configured');
        }

        try {
            // Get current file to get SHA
            const currentFile = await this.getCurrentProductsFile();
            
            // Merge admin products with existing products
            const adminProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]');
            const existingProducts = currentFile.content.products || [];
            
            // Remove existing products that have same IDs as admin products
            const adminProductIds = new Set(adminProducts.map(p => p.id));
            const filteredExistingProducts = existingProducts.filter(p => !adminProductIds.has(p.id));
            
            // Create merged products array
            const allProducts = [...adminProducts, ...filteredExistingProducts];
            
            const updatedContent = {
                products: allProducts
            };

            // Encode content as base64
            const encodedContent = btoa(JSON.stringify(updatedContent, null, 2));

            // Update file on GitHub
            const response = await fetch(
                `${this.apiBase}/repos/${this.repoOwner}/${this.repoName}/contents/products.json`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `token ${this.token}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: commitMessage,
                        content: encodedContent,
                        sha: currentFile.sha,
                        branch: this.branch
                    })
                }
            );

            if (!response.ok) {
                let errorMessage = `GitHub API error: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage += ` - ${errorData.message}`;
                } catch (e) {
                    // Ignore JSON parsing errors for error responses
                }
                
                if (response.status === 401) {
                    errorMessage = 'Invalid GitHub token or token has expired';
                } else if (response.status === 403) {
                    errorMessage = 'GitHub token lacks sufficient permissions. Ensure "repo" scope is enabled.';
                } else if (response.status === 409) {
                    errorMessage = 'Conflict: File was modified by someone else. Please try again.';
                }
                
                throw new Error(errorMessage);
            }

            const result = await response.json();
            console.log('Successfully updated products.json:', result);
            
            return result;
        } catch (error) {
            console.error('Error updating products file:', error);
            throw error;
        }
    }

    /**
     * Add a new product and commit to repository
     * @param {Object} product - Product data
     */
    async addProduct(product) {
        try {
            const commitMessage = `Add new product: ${product.name}

🛍️ Added via admin dashboard
- Name: ${product.name}
- Price: $${product.price}
- Category: ${product.category}
- Type: ${product.type}
- Size: ${product.size}

🤖 Automated commit via GitHub API`;

            const result = await this.updateProductsFile(null, commitMessage);
            
            // Show success notification
            this.showNotification(`Product "${product.name}" added and committed to repository!`, 'success');
            
            return result;
        } catch (error) {
            this.showNotification(`Failed to commit product: ${error.message}`, 'error');
            throw error;
        }
    }

    /**
     * Mark product as sold and commit to repository
     * @param {string} productId - Product ID
     * @param {string} productName - Product name for commit message
     */
    async markProductSold(productId, productName) {
        try {
            const commitMessage = `Mark product as sold: ${productName}

📦 Product sold via admin dashboard
- Product ID: ${productId}
- Status: SOLD

🤖 Automated commit via GitHub API`;

            const result = await this.updateProductsFile(null, commitMessage);
            
            // Show success notification
            this.showNotification(`Product "${productName}" marked as sold and committed to repository!`, 'success');
            
            return result;
        } catch (error) {
            this.showNotification(`Failed to commit sold status: ${error.message}`, 'error');
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
        }, type === 'error' ? 8000 : 5000); // Show errors longer
    }

    /**
     * Test the GitHub API connection
     */
    async testConnection() {
        if (!this.token) {
            throw new Error('GitHub token not configured');
        }

        try {
            const response = await fetch(
                `${this.apiBase}/repos/${this.repoOwner}/${this.repoName}`,
                {
                    headers: {
                        'Authorization': `token ${this.token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Invalid GitHub token or token has expired');
                } else if (response.status === 404) {
                    throw new Error('Repository not found. Check repository name or token permissions.');
                } else {
                    throw new Error(`GitHub API error: ${response.status}`);
                }
            }

            const repoData = await response.json();
            this.showNotification(`✅ Connected to ${repoData.full_name}`, 'success');
            return true;
        } catch (error) {
            this.showNotification(`❌ Connection failed: ${error.message}`, 'error');
            throw error;
        }
    }
}

// Create global instance
window.githubUpdater = new GitHubUpdater();