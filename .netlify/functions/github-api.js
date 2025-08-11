/**
 * Netlify Function for secure GitHub API operations
 * Handles product updates and commits using environment variables
 */

// Native fetch is available in Node 18+ (Netlify default)

exports.handler = async (event, context) => {
  console.log('🔧 GitHub API function called');
  console.log('📍 HTTP Method:', event.httpMethod);
  console.log('📍 Headers:', event.headers);
  console.log('📍 Body length:', event.body ? event.body.length : 0);
  
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Validate request body
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Request body is required' })
      };
    }

    let requestData;
    try {
      requestData = JSON.parse(event.body);
    } catch (parseError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid JSON in request body' })
      };
    }

    const { action, data } = requestData;
    
    if (!action) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Action is required' })
      };
    }
    
    // Get GitHub credentials from environment variables
    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER || 'SamPrestoo';
    const repo = process.env.GITHUB_REPO || 'iamlookingforvintage';
    const branch = process.env.GITHUB_BRANCH || 'main';
    
    console.log('🔑 Environment check:');
    console.log('- GITHUB_TOKEN exists:', !!token);
    console.log('- GITHUB_TOKEN length:', token ? token.length : 0);
    console.log('- GITHUB_OWNER:', owner);
    console.log('- GITHUB_REPO:', repo);
    console.log('- GITHUB_BRANCH:', branch);
    
    if (!token) {
      console.error('❌ No GitHub token found in environment variables');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'GitHub token not configured in environment variables' })
      };
    }

    const apiBase = 'https://api.github.com';
    const githubHeaders = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'iamlookingforvintage-admin'
    };

    switch (action) {
      case 'add_product':
        return await addProduct(data, { apiBase, headers: githubHeaders, owner, repo, branch, responseHeaders: headers });
      case 'update_sold_status':
        return await updateSoldStatus(data, { apiBase, headers: githubHeaders, owner, repo, branch, responseHeaders: headers });
      case 'delete_product':
        return await deleteProduct(data, { apiBase, headers: githubHeaders, owner, repo, branch, responseHeaders: headers });
      case 'test_connection':
        console.log('🧪 Testing connection...');
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            success: true, 
            message: 'GitHub connection successful',
            config: {
              owner,
              repo,
              branch,
              hasToken: !!token,
              nodeVersion: process.version,
              hasNativeFetch: typeof fetch !== 'undefined'
            }
          })
        };
      case 'debug':
        console.log('🐛 Debug endpoint called');
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: 'Debug endpoint working',
            request: {
              method: event.httpMethod,
              hasBody: !!event.body,
              bodyLength: event.body ? event.body.length : 0,
              headers: Object.keys(event.headers || {})
            },
            environment: {
              nodeVersion: process.version,
              hasToken: !!token,
              hasNativeFetch: typeof fetch !== 'undefined'
            }
          })
        };
      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid action' })
        };
    }
  } catch (error) {
    console.error('❌ GitHub API Error:', error);
    console.error('❌ Error stack:', error.stack);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error', 
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};

async function addProduct(productData, config) {
  try {
    console.log('🏗️ Adding product:', productData.name);
    console.log('📦 Product data size:', JSON.stringify(productData).length, 'bytes');
    
    // Get current products.json file with retry logic
    console.log('📥 Fetching current products.json...');
    let fileResponse;
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      attempts++;
      console.log(`📥 Attempt ${attempts}/${maxAttempts} to fetch products.json`);
      
      fileResponse = await fetch(`${config.apiBase}/repos/${config.owner}/${config.repo}/contents/products.json`, {
        headers: config.headers
      });
      
      console.log('📥 File fetch response status:', fileResponse.status);
      
      if (fileResponse.ok) {
        break;
      }
      
      if (attempts === maxAttempts) {
        console.error('❌ Failed to fetch products.json after', maxAttempts, 'attempts:', fileResponse.statusText);
        throw new Error(`Failed to fetch products.json: ${fileResponse.statusText}`);
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
    }
    
    console.log('📋 Parsing GitHub response...');
    let fileData;
    try {
      fileData = await fileResponse.json();
    } catch (jsonError) {
      console.error('❌ Failed to parse GitHub response as JSON:', jsonError);
      throw new Error(`Failed to parse GitHub response: ${jsonError.message}`);
    }
    
    console.log('📋 Decoding base64 content...');
    let currentContent;
    try {
      const decodedContent = Buffer.from(fileData.content, 'base64').toString('utf8');
      console.log('📋 Decoded content length:', decodedContent.length);
      console.log('📋 First 200 chars:', decodedContent.substring(0, 200));
      console.log('📋 Last 200 chars:', decodedContent.substring(decodedContent.length - 200));
      
      // Validate JSON structure before parsing
      if (!decodedContent.trim()) {
        throw new Error('Empty file content');
      }
      
      currentContent = JSON.parse(decodedContent);
      
      // Validate structure
      if (!currentContent.products || !Array.isArray(currentContent.products)) {
        throw new Error('Invalid JSON structure: missing or invalid products array');
      }
      
      console.log('📋 Successfully parsed JSON with', currentContent.products.length, 'products');
    } catch (decodeError) {
      console.error('❌ Failed to decode/parse products.json content:', decodeError);
      throw new Error(`Failed to decode products.json: ${decodeError.message}`);
    }
    
    // Add new product to the products array
    currentContent.products.push(productData);
    
    // Generate the new JSON content
    const newJsonContent = JSON.stringify(currentContent, null, 2);
    const newContentSize = Buffer.byteLength(newJsonContent, 'utf8');
    
    console.log('📊 New content size:', newContentSize, 'bytes');
    
    // Check if the new content exceeds reasonable limits
    if (newContentSize > 100 * 1024 * 1024) { // 100MB limit
      throw new Error(`File size too large: ${Math.round(newContentSize / (1024 * 1024))}MB. Maximum allowed: 100MB`);
    }
    
    // Commit the updated file
    const commitResponse = await fetch(`${config.apiBase}/repos/${config.owner}/${config.repo}/contents/products.json`, {
      method: 'PUT',
      headers: config.headers,
      body: JSON.stringify({
        message: `Add new product: ${productData.name}`,
        content: Buffer.from(newJsonContent).toString('base64'),
        sha: fileData.sha,
        branch: config.branch
      })
    });
    
    console.log('📤 Commit response status:', commitResponse.status);
    
    if (!commitResponse.ok) {
      console.error('❌ Commit failed with status:', commitResponse.status);
      let errorMessage = `Failed to commit with status ${commitResponse.status}`;
      try {
        const error = await commitResponse.json();
        errorMessage = `Failed to commit: ${error.message}`;
        console.error('❌ Commit error details:', error);
      } catch (parseError) {
        console.error('❌ Could not parse commit error response:', parseError);
      }
      throw new Error(errorMessage);
    }
    
    console.log('✅ Successfully committed to GitHub');
    
    return {
      statusCode: 200,
      headers: config.responseHeaders,
      body: JSON.stringify({ 
        success: true, 
        message: `Product "${productData.name}" added and committed to repository` 
      })
    };
    
  } catch (error) {
    return {
      statusCode: 500,
      headers: config.responseHeaders,
      body: JSON.stringify({ error: error.message })
    };
  }
}

async function updateSoldStatus(updateData, config) {
  try {
    // Get current products.json file
    const fileResponse = await fetch(`${config.apiBase}/repos/${config.owner}/${config.repo}/contents/products.json`, {
      headers: config.headers
    });
    
    if (!fileResponse.ok) {
      throw new Error(`Failed to fetch products.json: ${fileResponse.statusText}`);
    }
    
    const fileData = await fileResponse.json();
    const currentContent = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf8'));
    
    // Find and update product
    const product = currentContent.products.find(p => p.id === updateData.id);
    if (!product) {
      throw new Error(`Product with ID ${updateData.id} not found`);
    }
    
    product.sold = updateData.sold;
    
    // Commit the updated file
    const commitResponse = await fetch(`${config.apiBase}/repos/${config.owner}/${config.repo}/contents/products.json`, {
      method: 'PUT',
      headers: config.headers,
      body: JSON.stringify({
        message: `Mark "${product.name}" as ${updateData.sold ? 'sold' : 'available'}`,
        content: Buffer.from(JSON.stringify(currentContent, null, 2)).toString('base64'),
        sha: fileData.sha,
        branch: config.branch
      })
    });
    
    console.log('📤 Commit response status:', commitResponse.status);
    
    if (!commitResponse.ok) {
      console.error('❌ Commit failed with status:', commitResponse.status);
      let errorMessage = `Failed to commit with status ${commitResponse.status}`;
      try {
        const error = await commitResponse.json();
        errorMessage = `Failed to commit: ${error.message}`;
        console.error('❌ Commit error details:', error);
      } catch (parseError) {
        console.error('❌ Could not parse commit error response:', parseError);
      }
      throw new Error(errorMessage);
    }
    
    console.log('✅ Successfully committed to GitHub');
    
    return {
      statusCode: 200,
      headers: config.responseHeaders,
      body: JSON.stringify({ 
        success: true, 
        message: `Product "${product.name}" marked as ${updateData.sold ? 'sold' : 'available'}` 
      })
    };
    
  } catch (error) {
    return {
      statusCode: 500,
      headers: config.responseHeaders,
      body: JSON.stringify({ error: error.message })
    };
  }
}

async function deleteProduct(deleteData, config) {
  try {
    // Get current products.json file
    const fileResponse = await fetch(`${config.apiBase}/repos/${config.owner}/${config.repo}/contents/products.json`, {
      headers: config.headers
    });
    
    if (!fileResponse.ok) {
      throw new Error(`Failed to fetch products.json: ${fileResponse.statusText}`);
    }
    
    const fileData = await fileResponse.json();
    const currentContent = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf8'));
    
    // Find product to delete
    const productIndex = currentContent.products.findIndex(p => p.id === deleteData.id);
    if (productIndex === -1) {
      throw new Error(`Product with ID ${deleteData.id} not found`);
    }
    
    const productName = currentContent.products[productIndex].name;
    currentContent.products.splice(productIndex, 1);
    
    // Commit the updated file
    const commitResponse = await fetch(`${config.apiBase}/repos/${config.owner}/${config.repo}/contents/products.json`, {
      method: 'PUT',
      headers: config.headers,
      body: JSON.stringify({
        message: `Delete product: ${productName}`,
        content: Buffer.from(JSON.stringify(currentContent, null, 2)).toString('base64'),
        sha: fileData.sha,
        branch: config.branch
      })
    });
    
    console.log('📤 Commit response status:', commitResponse.status);
    
    if (!commitResponse.ok) {
      console.error('❌ Commit failed with status:', commitResponse.status);
      let errorMessage = `Failed to commit with status ${commitResponse.status}`;
      try {
        const error = await commitResponse.json();
        errorMessage = `Failed to commit: ${error.message}`;
        console.error('❌ Commit error details:', error);
      } catch (parseError) {
        console.error('❌ Could not parse commit error response:', parseError);
      }
      throw new Error(errorMessage);
    }
    
    console.log('✅ Successfully committed to GitHub');
    
    return {
      statusCode: 200,
      headers: config.responseHeaders,
      body: JSON.stringify({ 
        success: true, 
        message: `Product "${productName}" deleted from repository` 
      })
    };
    
  } catch (error) {
    return {
      statusCode: 500,
      headers: config.responseHeaders,
      body: JSON.stringify({ error: error.message })
    };
  }
}