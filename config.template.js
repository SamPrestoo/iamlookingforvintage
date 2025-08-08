/**
 * GitHub Configuration Template
 * 
 * SETUP INSTRUCTIONS:
 * 1. Copy this file to config.js
 * 2. Replace 'YOUR_ACTUAL_GITHUB_TOKEN_HERE' with your real GitHub token
 * 3. config.js is in .gitignore so your token stays private
 * 
 * TO GET A GITHUB TOKEN:
 * 1. Go to: https://github.com/settings/tokens
 * 2. Generate new token (classic)
 * 3. Name: iamlookingforvintage-auto-sync
 * 4. Expiration: No expiration
 * 5. Permissions: repo (Full control of private repositories)
 * 6. Copy the token (starts with ghp_)
 */

// GitHub Configuration
const GITHUB_CONFIG = {
    // REPLACE WITH YOUR ACTUAL TOKEN FROM .env FILE
    token: 'YOUR_ACTUAL_GITHUB_TOKEN_HERE',
    
    // Repository details (these are correct)
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
    if (!GITHUB_CONFIG.token || GITHUB_CONFIG.token === 'YOUR_ACTUAL_GITHUB_TOKEN_HERE') {
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
    return config !== null && config.token !== 'YOUR_ACTUAL_GITHUB_TOKEN_HERE';
}

// Make functions globally available
window.getGitHubConfig = getGitHubConfig;
window.isGitHubConfigured = isGitHubConfigured;