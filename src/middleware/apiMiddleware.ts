// This middleware intercepts API requests and redirects them to the FastAPI backend

// The base URL for the FastAPI backend
const FASTAPI_BASE_URL = 'https://api.thinkv.space';

// This function redirects API requests to the FastAPI backend
export async function handleApiRequest(endpoint: string, method: string, headers: Record<string, string>, body?: any) {
  console.log(`API Request: ${method} ${endpoint}`, { headers });
  
  try {
    // Parse URL to get parts
    const url = new URL(endpoint, window.location.origin);
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    // Construct the FastAPI URL
    let fastApiUrl = `${FASTAPI_BASE_URL}`;
    
    // Special case for channel creation API
    if (endpoint.includes('/api/channels/api')) {
      fastApiUrl = `${FASTAPI_BASE_URL}/channels/api`;
      console.log(`Channel creation endpoint detected. Using: ${fastApiUrl}`);
    }
    // Keep the original path but ensure we don't duplicate /api
    else if (pathParts[0] === 'api' && pathParts.length > 1) {
      // Add all path parts except the initial 'api'
      fastApiUrl += `/${pathParts.slice(1).join('/')}`;
    } else if (pathParts[0] === 'api') {
      // Handle case where /api is the only path part
      fastApiUrl += '/';
    } else {
      throw new Error(`Invalid API path: ${url.pathname}`);
    }
    
    // Add query parameters if they exist
    if (url.search) {
      fastApiUrl += url.search;
    }
    
    console.log(`Redirecting to FastAPI: ${fastApiUrl}`);
    
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      // Perform the actual fetch to the FastAPI backend
      const response = await fetch(fastApiUrl, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`FastAPI error (${response.status}): ${errorText || response.statusText}`);
      }
      
      const responseData = await response.json();
      
      // Store data points in Supabase if this is a data-related endpoint
      if (pathParts.includes('data') || pathParts.includes('update')) {
        // You could add logic here to store data in Supabase
        console.log('Data endpoint accessed - data should be stored in Supabase');
      }
      
      return responseData;
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
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