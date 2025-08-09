// Environment variables - Add your GitHub token in Netlify dashboard
// Go to Netlify dashboard > Site settings > Environment variables
// Add: GITHUB_TOKEN with your GitHub personal access token

// For local testing, you can create a .env file in netlify/functions/ directory
// But NEVER commit actual tokens to the repository

// The Netlify function will use these environment variables:
// - GITHUB_TOKEN (required)
// - GITHUB_OWNER (defaults to 'SamPrestoo')  
// - GITHUB_REPO (defaults to 'iamlookingforvintage')
// - GITHUB_BRANCH (defaults to 'main')