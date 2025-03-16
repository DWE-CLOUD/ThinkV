// This middleware intercepts API requests and redirects them to the FastAPI backend

// The base URL for the FastAPI backend
const FASTAPI_BASE_URL = 'http://82.25.104.223';

// This function redirects API requests to the FastAPI backend
export async function handleApiRequest(endpoint: string, method: string, headers: Record<string, string>, body?: any) {
  console.log(`API Request: ${method} ${endpoint}`, { headers });
  
  try {
    // Parse URL to get parts
    const url = new URL(endpoint, window.location.origin);
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    // Construct the FastAPI URL
    let fastApiUrl = `${FASTAPI_BASE_URL}`;
    
    // Keep the original path from /api/v1/...
    if (pathParts[0] === 'api' && pathParts.length > 1) {
      // Add all path parts to construct the full path
      for (let i = 0; i < pathParts.length; i++) {
        fastApiUrl += `/${pathParts[i]}`;
      }
    } else {
      throw new Error(`Invalid API path: ${url.pathname}`);
    }
    
    // Add query parameters if they exist
    if (url.search) {
      fastApiUrl += url.search;
    }
    
    console.log(`Redirecting to FastAPI: ${fastApiUrl}`);
    
    // Perform the actual fetch to the FastAPI backend
    const response = await fetch(fastApiUrl, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`FastAPI error (${response.status}): ${errorText}`);
    }
    
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

// Create a fetch intercept to handle API requests
export function setupFetchInterceptor() {
  const originalFetch = window.fetch;
  
  window.fetch = async function(input: RequestInfo | URL, init?: RequestInit) {
    const inputUrl = typeof input === 'string' ? input : input.url;
    
    // Check if this URL is already a direct call to the FastAPI backend
    if (inputUrl.startsWith(FASTAPI_BASE_URL)) {
      // Don't intercept direct calls to the FastAPI server
      return originalFetch.apply(window, [input, init]);
    }
    
    const url = new URL(inputUrl, window.location.origin);
    
    // Only intercept API requests to our own backend
    if (url.pathname.startsWith('/api/')) {
      try {
        console.log('Intercepting API request:', url.toString());
        
        // Extract method, headers, and body
        const method = init?.method || 'GET';
        const headers = init?.headers ? Object.fromEntries(
          Object.entries(init.headers as Record<string, string>)
        ) : {};
        
        // Parse body if it exists
        let body = undefined;
        if (init?.body) {
          if (typeof init.body === 'string') {
            try {
              body = JSON.parse(init.body);
            } catch (e) {
              console.error('Error parsing request body:', e);
            }
          } else {
            body = init.body;
          }
        }
        
        // Handle the API request
        const response = await handleApiRequest(url.toString(), method, headers, body);
        
        // Create a simulated successful response
        return new Response(JSON.stringify(response), {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.error('API request handling error:', error);
        
        // Create a simulated error response
        return new Response(JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error'
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
    }
    
    // For non-API requests, use the original fetch
    return originalFetch.apply(window, [input, init]);
  };
  
  console.log('API fetch interceptor has been set up to redirect to FastAPI backend');
}