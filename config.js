/**
 * Configuration for GitHub Auto-Update
 * This module loads environment variables and provides configuration for GitHub integration
 * 
 * IMPORTANT: Since this runs in the browser, we'll use a different approach.
 * We'll embed the configuration directly here for simplicity and security.
 */

// GitHub Configuration
// Replace these values with your actual GitHub details
const GITHUB_CONFIG = {
    // TODO: Replace with your actual GitHub Personal Access Token
    // Generate at: https://github.com/settings/tokens
    // Permissions needed: repo (full control)
    // Expiration: No expiration (for seamless admin experience)
    token: 'ghp_YOUR_ACTUAL_TOKEN_HERE',
    
    // Repository details (these are correct for your repo)
    owner: 'SamPrestoo',
    repo: 'iamlookingforvintage',
    branch: 'main'
};

/**
 * Get GitHub configuration
 * @returns {Object} GitHub configuration object
 */
function getGitHubConfig() {
    // Validate configuration
    if (!GITHUB_CONFIG.token || GITHUB_CONFIG.token === 'ghp_YOUR_ACTUAL_TOKEN_HERE') {
        console.warn('GitHub token not configured in config.js. Auto-commits will be disabled.');
        return null;
    }
    
    if (!GITHUB_CONFIG.token.startsWith('ghp_') && !GITHUB_CONFIG.token.startsWith('github_pat_')) {
        console.error('Invalid GitHub token format in config.js');
        return null;
    }
    
    return {
        token: GITHUB_CONFIG.token,
        owner: GITHUB_CONFIG.owner,
        repo: GITHUB_CONFIG.repo,
        branch: GITHUB_CONFIG.branch,
        apiBase: 'https://api.github.com'
    };
}

/**
 * Check if GitHub integration is properly configured
 * @returns {boolean} True if GitHub is configured and ready
 */
function isGitHubConfigured() {
    const config = getGitHubConfig();
    return config !== null && config.token !== 'ghp_YOUR_ACTUAL_TOKEN_HERE';
}

// Make functions globally available
window.getGitHubConfig = getGitHubConfig;
window.isGitHubConfigured = isGitHubConfigured;