/**
 * Netlify Function for secure GitHub API operations
 * Handles product updates and commits using environment variables
 */

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { action, data } = JSON.parse(event.body);
    
    // Get GitHub credentials from environment variables
    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER || 'SamPrestoo';
    const repo = process.env.GITHUB_REPO || 'iamlookingforvintage';
    const branch = process.env.GITHUB_BRANCH || 'main';
    
    if (!token) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'GitHub token not configured in environment variables' })
      };
    }

    const apiBase = 'https://api.github.com';
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'iamlookingforvintage-admin'
    };

    switch (action) {
      case 'add_product':
        return await addProduct(data, { apiBase, headers, owner, repo, branch });
      case 'update_sold_status':
        return await updateSoldStatus(data, { apiBase, headers, owner, repo, branch });
      case 'delete_product':
        return await deleteProduct(data, { apiBase, headers, owner, repo, branch });
      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Invalid action' })
        };
    }
  } catch (error) {
    console.error('GitHub API Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

async function addProduct(productData, config) {
  try {
    // Get current products.js file
    const fileResponse = await fetch(`${config.apiBase}/repos/${config.owner}/${config.repo}/contents/products.js`, {
      headers: config.headers
    });
    
    if (!fileResponse.ok) {
      throw new Error(`Failed to fetch products.js: ${fileResponse.statusText}`);
    }
    
    const fileData = await fileResponse.json();
    const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');
    
    // Parse products from current file
    const productsMatch = currentContent.match(/const products = (\[[\s\S]*?\]);/);
    if (!productsMatch) {
      throw new Error('Could not find products array in products.js');
    }
    
    const products = JSON.parse(productsMatch[1]);
    
    // Add new product
    products.push(productData);
    
    // Update file content
    const newContent = currentContent.replace(
      /const products = \[[\s\S]*?\];/,
      `const products = ${JSON.stringify(products, null, 4)};`
    );
    
    // Commit the updated file
    const commitResponse = await fetch(`${config.apiBase}/repos/${config.owner}/${config.repo}/contents/products.js`, {
      method: 'PUT',
      headers: config.headers,
      body: JSON.stringify({
        message: `Add new product: ${productData.title}`,
        content: Buffer.from(newContent).toString('base64'),
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
      body: JSON.stringify({ 
        success: true, 
        message: `Product "${productData.title}" added and committed to repository` 
      })
    };
    
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}

async function updateSoldStatus(updateData, config) {
  try {
    // Get current products.js file
    const fileResponse = await fetch(`${config.apiBase}/repos/${config.owner}/${config.repo}/contents/products.js`, {
      headers: config.headers
    });
    
    if (!fileResponse.ok) {
      throw new Error(`Failed to fetch products.js: ${fileResponse.statusText}`);
    }
    
    const fileData = await fileResponse.json();
    const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');
    
    // Parse products from current file
    const productsMatch = currentContent.match(/const products = (\[[\s\S]*?\]);/);
    if (!productsMatch) {
      throw new Error('Could not find products array in products.js');
    }
    
    const products = JSON.parse(productsMatch[1]);
    
    // Find and update product
    const product = products.find(p => p.id === updateData.id);
    if (!product) {
      throw new Error(`Product with ID ${updateData.id} not found`);
    }
    
    product.sold = updateData.sold;
    
    // Update file content
    const newContent = currentContent.replace(
      /const products = \[[\s\S]*?\];/,
      `const products = ${JSON.stringify(products, null, 4)};`
    );
    
    // Commit the updated file
    const commitResponse = await fetch(`${config.apiBase}/repos/${config.owner}/${config.repo}/contents/products.js`, {
      method: 'PUT',
      headers: config.headers,
      body: JSON.stringify({
        message: `Mark "${product.title}" as ${updateData.sold ? 'sold' : 'available'}`,
        content: Buffer.from(newContent).toString('base64'),
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
      body: JSON.stringify({ 
        success: true, 
        message: `Product "${product.title}" marked as ${updateData.sold ? 'sold' : 'available'}` 
      })
    };
    
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}

async function deleteProduct(deleteData, config) {
  try {
    // Get current products.js file
    const fileResponse = await fetch(`${config.apiBase}/repos/${config.owner}/${config.repo}/contents/products.js`, {
      headers: config.headers
    });
    
    if (!fileResponse.ok) {
      throw new Error(`Failed to fetch products.js: ${fileResponse.statusText}`);
    }
    
    const fileData = await fileResponse.json();
    const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');
    
    // Parse products from current file
    const productsMatch = currentContent.match(/const products = (\[[\s\S]*?\]);/);
    if (!productsMatch) {
      throw new Error('Could not find products array in products.js');
    }
    
    const products = JSON.parse(productsMatch[1]);
    
    // Find product to delete
    const productIndex = products.findIndex(p => p.id === deleteData.id);
    if (productIndex === -1) {
      throw new Error(`Product with ID ${deleteData.id} not found`);
    }
    
    const productTitle = products[productIndex].title;
    products.splice(productIndex, 1);
    
    // Update file content
    const newContent = currentContent.replace(
      /const products = \[[\s\S]*?\];/,
      `const products = ${JSON.stringify(products, null, 4)};`
    );
    
    // Commit the updated file
    const commitResponse = await fetch(`${config.apiBase}/repos/${config.owner}/${config.repo}/contents/products.js`, {
      method: 'PUT',
      headers: config.headers,
      body: JSON.stringify({
        message: `Delete product: ${productTitle}`,
        content: Buffer.from(newContent).toString('base64'),
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
      body: JSON.stringify({ 
        success: true, 
        message: `Product "${productTitle}" deleted from repository` 
      })
    };
    
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}