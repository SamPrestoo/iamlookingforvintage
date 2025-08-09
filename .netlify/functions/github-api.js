/**
 * Netlify Function for secure GitHub API operations
 * Handles product updates and commits using environment variables
 */

exports.handler = async (event, context) => {
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
    
    if (!token) {
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
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: 'GitHub connection successful' })
        };
      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid action' })
        };
    }
  } catch (error) {
    console.error('GitHub API Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

async function addProduct(productData, config) {
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
    
    // Add new product to the products array
    currentContent.products.push(productData);
    
    // Commit the updated file
    const commitResponse = await fetch(`${config.apiBase}/repos/${config.owner}/${config.repo}/contents/products.json`, {
      method: 'PUT',
      headers: config.headers,
      body: JSON.stringify({
        message: `Add new product: ${productData.name}`,
        content: Buffer.from(JSON.stringify(currentContent, null, 2)).toString('base64'),
        sha: fileData.sha,
        branch: config.branch
      })
    });
    
    if (!commitResponse.ok) {
      const error = await commitResponse.json();
      throw new Error(`Failed to commit: ${error.message}`);
    }
    
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
    
    if (!commitResponse.ok) {
      const error = await commitResponse.json();
      throw new Error(`Failed to commit: ${error.message}`);
    }
    
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
    
    if (!commitResponse.ok) {
      const error = await commitResponse.json();
      throw new Error(`Failed to commit: ${error.message}`);
    }
    
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