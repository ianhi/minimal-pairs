export interface Env {
  ASSETS: Fetcher;
}

const BASE_PATH = '/language-learning/minimal-pairs';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    // Only serve requests that are within our base path
    if (!url.pathname.startsWith(BASE_PATH)) {
      return new Response('Not Found', { status: 404 });
    }

    // Remove the base path to get the actual file path
    const assetPath = url.pathname.slice(BASE_PATH.length) || '/';
    const assetUrl = new URL(assetPath, url.origin);
    assetUrl.search = url.search;

    try {
      // Try to fetch the static asset
      const assetResponse = await env.ASSETS.fetch(assetUrl);
      
      if (assetResponse.status === 200) {
        const response = new Response(assetResponse.body, assetResponse);
        
        // Add caching headers based on file type
        if (assetPath.startsWith('/assets/')) {
          // Cache static assets for 1 year
          response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
        } else if (assetPath.match(/\.(mp3|wav|json)$/)) {
          // Cache audio and data files for 24 hours
          response.headers.set('Cache-Control', 'public, max-age=86400');
          
          // Add CORS headers for audio files
          if (assetPath.match(/\.(mp3|wav)$/)) {
            response.headers.set('Access-Control-Allow-Origin', '*');
            response.headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
            response.headers.set('Access-Control-Allow-Headers', 'Range');
          }
        }
        
        // Add security headers
        addSecurityHeaders(response);
        
        return response;
      }
    } catch (error) {
      console.error('Error fetching asset:', error);
    }

    // If no static asset found, serve index.html for SPA routing
    try {
      const indexResponse = await env.ASSETS.fetch(new URL('/', url.origin));
      
      if (indexResponse.status === 200) {
        const response = new Response(indexResponse.body, {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=0, must-revalidate'
          }
        });
        
        addSecurityHeaders(response);
        return response;
      }
    } catch (error) {
      console.error('Error fetching index.html:', error);
    }

    return new Response('Not Found', { status: 404 });
  }
};

function addSecurityHeaders(response: Response): void {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Permissions policy for microphone access (for potential future audio recording features)
  response.headers.set('Permissions-Policy', 'microphone=(self)');
  
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "media-src 'self' data:; " +
    "connect-src 'self' https:; " +
    "font-src 'self' data:;"
  );
}