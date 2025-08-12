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
      case 'update_product':
        return await updateProduct(data, { apiBase, headers: githubHeaders, owner, repo, branch, responseHeaders: headers });
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
    const productSize = JSON.stringify(productData).length;
    console.log('📦 Product data size:', productSize, 'bytes');
    
    // Warn about large product sizes
    if (productSize > 5000000) { // 5MB
      console.log('⚠️  Very large product data (>5MB) - this may cause issues');
    } else if (productSize > 2000000) { // 2MB
      console.log('⚠️  Large product data (>2MB) - consider optimizing images');
    }
    
    // Get current products.json file - try Contents API first, fallback to Git Data API for large files
    console.log('📥 Fetching current products.json...');
    let fileData;
    let currentSha;
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      attempts++;
      console.log(`📥 Attempt ${attempts}/${maxAttempts} to fetch products.json`);
      
      // Try Contents API first
      const fileResponse = await fetch(`${config.apiBase}/repos/${config.owner}/${config.repo}/contents/products.json`, {
        headers: config.headers
      });
      
      console.log('📥 Contents API response status:', fileResponse.status);
      
      if (fileResponse.ok) {
        const responseText = await fileResponse.text();
        const responseData = JSON.parse(responseText);
        
        // Check if file is too large for Contents API
        if (!responseData.content && responseData.size > 1000000) {
          console.log('📥 File too large for Contents API, using Git Data API...');
          // Use Git Data API for large files
          const blobResponse = await fetch(`${config.apiBase}/repos/${config.owner}/${config.repo}/git/blobs/${responseData.sha}`, {
            headers: config.headers
          });
          
          if (blobResponse.ok) {
            const blobData = await blobResponse.json();
            fileData = {
              content: blobData.content,
              encoding: blobData.encoding,
              sha: responseData.sha,
              size: responseData.size
            };
            currentSha = responseData.sha;
            console.log('📥 Successfully fetched via Git Data API');
            break;
          } else {
            throw new Error(`Failed to fetch blob via Git Data API: ${blobResponse.statusText}`);
          }
        } else if (responseData.content) {
          // Normal Contents API response
          fileData = responseData;
          currentSha = responseData.sha;
          console.log('📥 Successfully fetched via Contents API');
          break;
        } else {
          throw new Error('No content available in GitHub response');
        }
      }
      
      if (attempts === maxAttempts) {
        console.error('❌ Failed to fetch products.json after', maxAttempts, 'attempts:', fileResponse.statusText);
        throw new Error(`Failed to fetch products.json: ${fileResponse.statusText}`);
      }
      
      // Check for rate limiting
      if (fileResponse.status === 403) {
        const rateLimitReset = fileResponse.headers.get('X-RateLimit-Reset');
        if (rateLimitReset) {
          const resetTime = new Date(parseInt(rateLimitReset) * 1000);
          console.log('⏱️  Rate limit hit, reset at:', resetTime);
        }
      }
      
      // Wait before retry with exponential backoff
      const waitTime = Math.min(1000 * Math.pow(2, attempts - 1), 10000); // Max 10s
      console.log(`⏳ Waiting ${waitTime}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    // fileData should now be populated from the fetch logic above
    if (!fileData) {
      throw new Error('Failed to obtain file data from GitHub API');
    }
    
    console.log('📋 GitHub file data keys:', Object.keys(fileData));
    console.log('📋 Content length from GitHub:', fileData.content ? fileData.content.length : 'undefined');
    console.log('📋 File size:', fileData.size || 'undefined');
    console.log('📋 File encoding:', fileData.encoding || 'undefined');
    
    console.log('📋 Decoding base64 content...');
    let currentContent;
    try {
      // Check if content exists in GitHub response
      if (!fileData.content) {
        console.error('❌ No content field in GitHub response');
        console.error('❌ Available fields:', Object.keys(fileData));
        console.error('❌ Response size:', fileData.size || 'undefined');
        console.error('❌ File encoding:', fileData.encoding || 'undefined');
        console.error('❌ Full response object:', JSON.stringify(fileData, null, 2));
        
        // GitHub might truncate large files - check if this is a truncation issue
        if (fileData.size && fileData.size > 1000000) { // > 1MB
          throw new Error(`File too large for GitHub Contents API (${Math.round(fileData.size/1024/1024*100)/100}MB). Attempting Git Data API fallback...`);
        }
        
        throw new Error('No content field in GitHub API response. This may indicate the file is too large or corrupted.');
      }
      
      const decodedContent = Buffer.from(fileData.content, 'base64').toString('utf8');
      console.log('📋 Decoded content length:', decodedContent.length);
      console.log('📋 First 200 chars:', decodedContent.substring(0, 200));
      console.log('📋 Last 200 chars:', decodedContent.substring(decodedContent.length - 200));
      
      // Validate JSON structure before parsing
      if (!decodedContent.trim()) {
        console.error('❌ Decoded content is empty - this should not happen');
        console.error('❌ This indicates a serious issue with GitHub API or file corruption');
        throw new Error('Empty file content from GitHub API - refusing to overwrite data');
      }
      
      currentContent = JSON.parse(decodedContent);
      
      // Validate structure
      if (!currentContent.products || !Array.isArray(currentContent.products)) {
        console.error('❌ Invalid JSON structure detected');
        console.error('❌ Current content:', JSON.stringify(currentContent, null, 2).substring(0, 500));
        
        // Try to repair structure if possible
        if (currentContent.products && !Array.isArray(currentContent.products)) {
          console.log('🔧 Attempting to repair non-array products field');
          currentContent.products = [];
        } else if (!currentContent.products) {
          console.log('🔧 Adding missing products array to existing content');
          currentContent.products = [];
        } else {
          throw new Error('Invalid JSON structure: unable to repair products array');
        }
      }
      
      console.log('📋 Successfully parsed JSON with', currentContent.products.length, 'products');
    } catch (decodeError) {
      console.error('❌ Failed to decode/parse products.json content:', decodeError);
      console.error('❌ Raw content preview:', fileData.content ? fileData.content.substring(0, 200) : 'undefined');
      
      // NEVER create empty fallback - this causes data loss
      throw new Error(`Failed to decode products.json: ${decodeError.message}. Refusing to proceed to prevent data loss.`);
    }
    
    // Verify we have valid data before adding new product
    if (!currentContent.products || !Array.isArray(currentContent.products)) {
      throw new Error('Invalid products array - refusing to proceed to prevent data loss');
    }
    
    const originalProductCount = currentContent.products.length;
    console.log('📋 Adding product to existing', originalProductCount, 'products');
    console.log('📋 Existing product IDs:', currentContent.products.map(p => p.id));
    
    // Add new product to the products array
    currentContent.products.push(productData);
    
    const newProductCount = currentContent.products.length;
    console.log('📋 After adding new product, total products:', newProductCount);
    
    // Safety check: ensure we're not losing data
    if (newProductCount <= originalProductCount) {
      throw new Error(`Data loss detected: started with ${originalProductCount} products, now have ${newProductCount}`);
    }
    
    if (newProductCount !== originalProductCount + 1) {
      throw new Error(`Unexpected product count: expected ${originalProductCount + 1}, got ${newProductCount}`);
    }
    
    // Generate the new JSON content
    const newJsonContent = JSON.stringify(currentContent, null, 2);
    const newContentSize = Buffer.byteLength(newJsonContent, 'utf8');
    
    console.log('📊 New content size:', newContentSize, 'bytes');
    
    // Check if the new content exceeds reasonable limits (GitHub has 100MB file limit)
    // With 1000 images at 2MB each = ~200MB, but with compression should be much less
    if (newContentSize > 150 * 1024 * 1024) { // 150MB limit for business needs
      throw new Error(`File size too large: ${Math.round(newContentSize / (1024 * 1024))}MB. Maximum allowed: 150MB`);
    }
    
    if (newContentSize > 50 * 1024 * 1024) { // Warn at 50MB
      console.log(`⚠️  Large file warning: ${Math.round(newContentSize / (1024 * 1024))}MB`);
    }
    
    // Commit the updated file
    const commitPayload = {
      message: `Add new product: ${productData.name}`,
      content: Buffer.from(newJsonContent).toString('base64'),
      sha: currentSha || fileData.sha,
      branch: config.branch
    };
    
    console.log('📤 Committing with SHA:', currentSha || fileData.sha);
    console.log('📤 Commit message:', commitPayload.message);
    console.log('📤 Content preview (first 100 chars):', newJsonContent.substring(0, 100));
    
    const commitResponse = await fetch(`${config.apiBase}/repos/${config.owner}/${config.repo}/contents/products.json`, {
      method: 'PUT',
      headers: config.headers,
      body: JSON.stringify(commitPayload)
    });
    
    console.log('📤 Commit response status:', commitResponse.status);
    
    if (!commitResponse.ok) {
      console.error('❌ Commit failed with status:', commitResponse.status);
      let errorMessage = `Failed to commit with status ${commitResponse.status}`;
      try {
        const errorText = await commitResponse.text();
        console.error('❌ Raw commit error response:', errorText);
        
        const error = JSON.parse(errorText);
        errorMessage = `Failed to commit: ${error.message}`;
        console.error('❌ Commit error details:', error);
        
        // If it's a SHA mismatch, this could indicate a race condition
        if (error.message && error.message.includes('sha')) {
          console.error('❌ SHA mismatch detected - possible race condition');
          console.error('❌ Used SHA:', fileData.sha);
        }
      } catch (parseError) {
        console.error('❌ Could not parse commit error response:', parseError);
      }
      throw new Error(errorMessage);
    }
    
    console.log('✅ Successfully committed to GitHub');
    console.log('✅ Final product count in committed file:', currentContent.products.length);
    console.log('✅ Product IDs in committed file:', currentContent.products.map(p => `${p.name} (${p.id})`));
    
    return {
      statusCode: 200,
      headers: config.responseHeaders,
      body: JSON.stringify({ 
        success: true, 
        message: `Product "${productData.name}" added and committed to repository. Total products: ${currentContent.products.length}` 
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
    console.log('🏷️ Server: Starting sold status update for ID:', updateData.id);
    console.log('🏷️ Server: New sold status:', updateData.sold);
    
    // Add delay for cold starts to ensure proper initialization
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Use the same robust file fetching as other functions for large files
    let fileData;
    let currentSha;
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      attempts++;
      console.log(`📥 SoldStatus: Attempt ${attempts}/${maxAttempts} to fetch products.json`);
      
      // Try Contents API first with error handling for cold starts
      let fileResponse;
      try {
        fileResponse = await fetch(`${config.apiBase}/repos/${config.owner}/${config.repo}/contents/products.json`, {
          headers: config.headers
        });
      } catch (fetchError) {
        console.error(`❌ SoldStatus: Fetch error on attempt ${attempts}:`, fetchError.message);
        if (attempts === maxAttempts) {
          throw new Error(`GitHub API fetch failed after ${maxAttempts} attempts: ${fetchError.message}`);
        }
        await new Promise(resolve => setTimeout(resolve, 2000 * attempts));
        continue;
      }
      
      console.log('📥 SoldStatus: Contents API response status:', fileResponse.status);
      
      if (fileResponse.ok) {
        const responseText = await fileResponse.text();
        const responseData = JSON.parse(responseText);
        
        // Check if file is too large for Contents API
        if (!responseData.content && responseData.size > 1000000) {
          console.log('📥 SoldStatus: File too large for Contents API, using Git Data API...');
          let blobResponse;
          try {
            blobResponse = await fetch(`${config.apiBase}/repos/${config.owner}/${config.repo}/git/blobs/${responseData.sha}`, {
              headers: config.headers
            });
          } catch (blobFetchError) {
            console.error(`❌ SoldStatus: Git Data API fetch error:`, blobFetchError.message);
            throw new Error(`Git Data API fetch failed: ${blobFetchError.message}`);
          }
          
          if (blobResponse.ok) {
            const blobData = await blobResponse.json();
            fileData = {
              content: blobData.content,
              encoding: blobData.encoding,
              sha: responseData.sha,
              size: responseData.size
            };
            currentSha = responseData.sha;
            console.log('📥 SoldStatus: Successfully fetched via Git Data API');
            break;
          } else {
            throw new Error(`Failed to fetch blob via Git Data API: ${blobResponse.statusText}`);
          }
        } else if (responseData.content) {
          // Normal Contents API response
          fileData = responseData;
          currentSha = responseData.sha;
          console.log('📥 SoldStatus: Successfully fetched via Contents API');
          break;
        } else {
          throw new Error('No content available in GitHub response');
        }
      }
      
      if (attempts === maxAttempts) {
        console.error('❌ SoldStatus: Failed to fetch products.json after', maxAttempts, 'attempts:', fileResponse.statusText);
        throw new Error(`Failed to fetch products.json: ${fileResponse.statusText}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
    }
    
    console.log('📋 SoldStatus: Decoding base64 content...');
    const currentContent = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf8'));
    console.log('📋 SoldStatus: Current products count:', currentContent.products.length);
    
    // Find and update product
    const product = currentContent.products.find(p => p.id === updateData.id);
    if (!product) {
      throw new Error(`Product with ID ${updateData.id} not found`);
    }
    
    const oldStatus = product.sold;
    product.sold = updateData.sold;
    console.log(`📋 SoldStatus: Updated product "${product.name}" from ${oldStatus} to ${updateData.sold}`);
    
    // Commit the updated file with error handling for cold starts
    const newJsonContent = JSON.stringify(currentContent, null, 2);
    let commitResponse;
    try {
      commitResponse = await fetch(`${config.apiBase}/repos/${config.owner}/${config.repo}/contents/products.json`, {
        method: 'PUT',
        headers: config.headers,
        body: JSON.stringify({
          message: `Mark "${product.name}" as ${updateData.sold ? 'sold' : 'available'}`,
          content: Buffer.from(newJsonContent).toString('base64'),
          sha: currentSha || fileData.sha,
          branch: config.branch
        })
      });
    } catch (commitFetchError) {
      console.error('❌ SoldStatus: Commit fetch error:', commitFetchError.message);
      throw new Error(`GitHub commit fetch failed: ${commitFetchError.message}`);
    }
    
    console.log('📤 SoldStatus: Commit response status:', commitResponse.status);
    
    if (!commitResponse.ok) {
      console.error('❌ SoldStatus: Commit failed with status:', commitResponse.status);
      let errorMessage = `Failed to commit sold status with status ${commitResponse.status}`;
      try {
        const errorText = await commitResponse.text();
        console.error('❌ SoldStatus: Raw commit error response:', errorText);
        
        const error = JSON.parse(errorText);
        errorMessage = `Failed to commit sold status: ${error.message}`;
        console.error('❌ SoldStatus: Commit error details:', error);
      } catch (parseError) {
        console.error('❌ SoldStatus: Could not parse commit error response:', parseError);
      }
      throw new Error(errorMessage);
    }
    
    console.log('✅ SoldStatus: Successfully committed to GitHub');
    console.log('✅ SoldStatus: Product marked as:', updateData.sold ? 'sold' : 'available');
    
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

async function updateProduct(productData, config) {
  try {
    console.log('📝 Server: Starting product update for ID:', productData.id);
    console.log('📝 Server: Product name:', productData.name);
    
    // Add delay for cold starts to ensure proper initialization
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Use the same robust file fetching as addProduct for large files
    let fileData;
    let currentSha;
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      attempts++;
      console.log(`📥 Update: Attempt ${attempts}/${maxAttempts} to fetch products.json`);
      
      // Try Contents API first with error handling for cold starts
      let fileResponse;
      try {
        fileResponse = await fetch(`${config.apiBase}/repos/${config.owner}/${config.repo}/contents/products.json`, {
          headers: config.headers
        });
      } catch (fetchError) {
        console.error(`❌ Update: Fetch error on attempt ${attempts}:`, fetchError.message);
        if (attempts === maxAttempts) {
          throw new Error(`GitHub API fetch failed after ${maxAttempts} attempts: ${fetchError.message}`);
        }
        // Wait longer on fetch failures (likely cold start issues)
        await new Promise(resolve => setTimeout(resolve, 2000 * attempts));
        continue;
      }
      
      console.log('📥 Update: Contents API response status:', fileResponse.status);
      
      if (fileResponse.ok) {
        const responseText = await fileResponse.text();
        const responseData = JSON.parse(responseText);
        
        // Check if file is too large for Contents API
        if (!responseData.content && responseData.size > 1000000) {
          console.log('📥 Update: File too large for Contents API, using Git Data API...');
          // Use Git Data API for large files with error handling
          let blobResponse;
          try {
            blobResponse = await fetch(`${config.apiBase}/repos/${config.owner}/${config.repo}/git/blobs/${responseData.sha}`, {
              headers: config.headers
            });
          } catch (blobFetchError) {
            console.error(`❌ Update: Git Data API fetch error:`, blobFetchError.message);
            throw new Error(`Git Data API fetch failed: ${blobFetchError.message}`);
          }
          
          if (blobResponse.ok) {
            const blobData = await blobResponse.json();
            fileData = {
              content: blobData.content,
              encoding: blobData.encoding,
              sha: responseData.sha,
              size: responseData.size
            };
            currentSha = responseData.sha;
            console.log('📥 Update: Successfully fetched via Git Data API');
            break;
          } else {
            throw new Error(`Failed to fetch blob via Git Data API: ${blobResponse.statusText}`);
          }
        } else if (responseData.content) {
          // Normal Contents API response
          fileData = responseData;
          currentSha = responseData.sha;
          console.log('📥 Update: Successfully fetched via Contents API');
          break;
        } else {
          throw new Error('No content available in GitHub response');
        }
      }
      
      if (attempts === maxAttempts) {
        console.error('❌ Update: Failed to fetch products.json after', maxAttempts, 'attempts:', fileResponse.statusText);
        throw new Error(`Failed to fetch products.json: ${fileResponse.statusText}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
    }
    
    console.log('📋 Update: Decoding base64 content...');
    const currentContent = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf8'));
    console.log('📋 Update: Current products count:', currentContent.products.length);
    
    // Find product to update
    const productIndex = currentContent.products.findIndex(p => p.id === productData.id);
    if (productIndex === -1) {
      throw new Error(`Product with ID ${productData.id} not found`);
    }
    
    const oldProduct = currentContent.products[productIndex];
    console.log('📋 Update: Found product to update:', oldProduct.name);
    
    // Update the product while preserving images and other data
    const updatedProduct = {
      ...oldProduct,
      ...productData,
      // Preserve images and thumbnailIndex from original product
      images: oldProduct.images,
      thumbnailIndex: oldProduct.thumbnailIndex
    };
    
    currentContent.products[productIndex] = updatedProduct;
    console.log('📋 Update: Product updated in array');
    
    // Commit the updated file with error handling for cold starts
    const newJsonContent = JSON.stringify(currentContent, null, 2);
    let commitResponse;
    try {
      commitResponse = await fetch(`${config.apiBase}/repos/${config.owner}/${config.repo}/contents/products.json`, {
        method: 'PUT',
        headers: config.headers,
        body: JSON.stringify({
          message: `Update product: ${productData.name}`,
          content: Buffer.from(newJsonContent).toString('base64'),
          sha: currentSha || fileData.sha,
          branch: config.branch
        })
      });
    } catch (commitFetchError) {
      console.error('❌ Update: Commit fetch error:', commitFetchError.message);
      throw new Error(`GitHub commit fetch failed: ${commitFetchError.message}`);
    }
    
    console.log('📤 Update: Commit response status:', commitResponse.status);
    
    if (!commitResponse.ok) {
      console.error('❌ Update: Commit failed with status:', commitResponse.status);
      let errorMessage = `Failed to commit update with status ${commitResponse.status}`;
      try {
        const errorText = await commitResponse.text();
        console.error('❌ Update: Raw commit error response:', errorText);
        
        const error = JSON.parse(errorText);
        errorMessage = `Failed to commit update: ${error.message}`;
        console.error('❌ Update: Commit error details:', error);
      } catch (parseError) {
        console.error('❌ Update: Could not parse commit error response:', parseError);
      }
      throw new Error(errorMessage);
    }
    
    console.log('✅ Update: Successfully committed to GitHub');
    console.log('✅ Update: Product updated:', productData.name);
    
    return {
      statusCode: 200,
      headers: config.responseHeaders,
      body: JSON.stringify({ 
        success: true, 
        message: `Product "${productData.name}" updated successfully` 
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
    console.log('🗑️ Server: Starting product deletion for ID:', deleteData.id);
    console.log('🔧 Server: Environment check - Node version:', process.version);
    console.log('🔧 Server: Native fetch available:', typeof fetch !== 'undefined');
    
    // Add delay for cold starts to ensure proper initialization
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Use the same robust file fetching as addProduct for large files
    let fileData;
    let currentSha;
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      attempts++;
      console.log(`📥 Delete: Attempt ${attempts}/${maxAttempts} to fetch products.json`);
      
      // Try Contents API first with error handling for cold starts
      let fileResponse;
      try {
        fileResponse = await fetch(`${config.apiBase}/repos/${config.owner}/${config.repo}/contents/products.json`, {
          headers: config.headers
        });
      } catch (fetchError) {
        console.error(`❌ Delete: Fetch error on attempt ${attempts}:`, fetchError.message);
        if (attempts === maxAttempts) {
          throw new Error(`GitHub API fetch failed after ${maxAttempts} attempts: ${fetchError.message}`);
        }
        // Wait longer on fetch failures (likely cold start issues)
        await new Promise(resolve => setTimeout(resolve, 2000 * attempts));
        continue;
      }
      
      console.log('📥 Delete: Contents API response status:', fileResponse.status);
      
      if (fileResponse.ok) {
        const responseText = await fileResponse.text();
        const responseData = JSON.parse(responseText);
        
        // Check if file is too large for Contents API
        if (!responseData.content && responseData.size > 1000000) {
          console.log('📥 Delete: File too large for Contents API, using Git Data API...');
          // Use Git Data API for large files with error handling
          let blobResponse;
          try {
            blobResponse = await fetch(`${config.apiBase}/repos/${config.owner}/${config.repo}/git/blobs/${responseData.sha}`, {
              headers: config.headers
            });
          } catch (blobFetchError) {
            console.error(`❌ Delete: Git Data API fetch error:`, blobFetchError.message);
            throw new Error(`Git Data API fetch failed: ${blobFetchError.message}`);
          }
          
          if (blobResponse.ok) {
            const blobData = await blobResponse.json();
            fileData = {
              content: blobData.content,
              encoding: blobData.encoding,
              sha: responseData.sha,
              size: responseData.size
            };
            currentSha = responseData.sha;
            console.log('📥 Delete: Successfully fetched via Git Data API');
            break;
          } else {
            throw new Error(`Failed to fetch blob via Git Data API: ${blobResponse.statusText}`);
          }
        } else if (responseData.content) {
          // Normal Contents API response
          fileData = responseData;
          currentSha = responseData.sha;
          console.log('📥 Delete: Successfully fetched via Contents API');
          break;
        } else {
          throw new Error('No content available in GitHub response');
        }
      }
      
      if (attempts === maxAttempts) {
        console.error('❌ Delete: Failed to fetch products.json after', maxAttempts, 'attempts:', fileResponse.statusText);
        throw new Error(`Failed to fetch products.json: ${fileResponse.statusText}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
    }
    
    console.log('📋 Delete: Decoding base64 content...');
    const currentContent = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf8'));
    console.log('📋 Delete: Current products count:', currentContent.products.length);
    
    // Find product to delete
    const productIndex = currentContent.products.findIndex(p => p.id === deleteData.id);
    if (productIndex === -1) {
      throw new Error(`Product with ID ${deleteData.id} not found`);
    }
    
    const productName = currentContent.products[productIndex].name;
    currentContent.products.splice(productIndex, 1);
    
    console.log('📋 Delete: Product found, removing from array. New count will be:', currentContent.products.length - 1);
    
    // Commit the updated file with error handling for cold starts
    const newJsonContent = JSON.stringify(currentContent, null, 2);
    let commitResponse;
    try {
      commitResponse = await fetch(`${config.apiBase}/repos/${config.owner}/${config.repo}/contents/products.json`, {
        method: 'PUT',
        headers: config.headers,
        body: JSON.stringify({
          message: `Delete product: ${productName}`,
          content: Buffer.from(newJsonContent).toString('base64'),
          sha: currentSha || fileData.sha,
          branch: config.branch
        })
      });
    } catch (commitFetchError) {
      console.error('❌ Delete: Commit fetch error:', commitFetchError.message);
      throw new Error(`GitHub commit fetch failed: ${commitFetchError.message}`);
    }
    
    console.log('📤 Delete: Commit response status:', commitResponse.status);
    
    if (!commitResponse.ok) {
      console.error('❌ Delete: Commit failed with status:', commitResponse.status);
      let errorMessage = `Failed to commit deletion with status ${commitResponse.status}`;
      try {
        const errorText = await commitResponse.text();
        console.error('❌ Delete: Raw commit error response:', errorText);
        
        const error = JSON.parse(errorText);
        errorMessage = `Failed to commit deletion: ${error.message}`;
        console.error('❌ Delete: Commit error details:', error);
      } catch (parseError) {
        console.error('❌ Delete: Could not parse commit error response:', parseError);
      }
      throw new Error(errorMessage);
    }
    
    console.log('✅ Delete: Successfully committed to GitHub');
    console.log('✅ Delete: Final product count after deletion:', currentContent.products.length);
    
    return {
      statusCode: 200,
      headers: config.responseHeaders,
      body: JSON.stringify({ 
        success: true, 
        message: `Product "${productName}" deleted from repository. Total products: ${currentContent.products.length}` 
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