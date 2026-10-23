/**
 * Kishan Bhai - Universal Client API Interceptor & Static Proxy
 * Automatically catches /api/* requests when deployed statically on Netlify
 * (where there is no Node/Express server and Netlify returns index.html for unknown routes)
 * or when offline, and routes them directly to the client-side Real Sector APIs engine!
 */

import { executeMockApiFallback } from './mockApiFallback';

if (typeof window !== 'undefined' && !(window as any).__KB_FETCH_INTERCEPTOR_ACTIVE__) {
  (window as any).__KB_FETCH_INTERCEPTOR_ACTIVE__ = true;

  try {
    const nativeFetch = typeof window.fetch === 'function' ? window.fetch.bind(window) : undefined;

    if (nativeFetch) {
      const interceptedFetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
        const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

        // Only intercept /api/ requests
        const isApiRequest = url.startsWith('/api') || url.includes('/api/');

        if (!isApiRequest) {
          return nativeFetch(input, init);
        }

        try {
          const response = await nativeFetch(input, init);
          const contentType = response.headers.get('content-type') || '';

          // On Netlify static hosting, /* is redirected to /index.html with status 200,
          // which sends back HTML instead of JSON for API requests!
          // Also catch 404, 502, 503, 504 server errors.
          const isNetlifyHtmlFallback = response.status === 200 && contentType.includes('text/html');
          const isServerErrorOrMissing = response.status === 404 || response.status >= 500;

          if (isNetlifyHtmlFallback || isServerErrorOrMissing) {
            return handleFallback(url, init);
          }

          return response;
        } catch {
          // Offline, network drop, or unreachable backend on static host
          return handleFallback(url, init);
        }
      };

      // Safely install fetch interceptor without throwing if window.fetch has only a getter
      let installed = false;
      try {
        Object.defineProperty(window, 'fetch', {
          value: interceptedFetch,
          writable: true,
          configurable: true,
          enumerable: true,
        });
        installed = true;
      } catch {
        try {
          Object.defineProperty(window, 'fetch', {
            get: () => interceptedFetch,
            configurable: true,
            enumerable: true,
          });
          installed = true;
        } catch {
          // window.fetch is protected or non-configurable in this iframe/sandbox environment.
          // Keep native fetch untouched; requests will be directly handled by server.ts.
          installed = false;
        }
      }

      if (installed && typeof globalThis !== 'undefined' && (globalThis as any).fetch !== interceptedFetch) {
        try {
          Object.defineProperty(globalThis, 'fetch', {
            value: interceptedFetch,
            writable: true,
            configurable: true,
          });
        } catch {
          // Ignore if globalThis cannot be redefined
        }
      }
    }
  } catch (err) {
    // Prevent any interception failure from blocking the application bundle initialization
    console.info('[apiInterceptor] Standard fetch active:', err);
  }
}

async function handleFallback(url: string, init?: RequestInit): Promise<Response> {
  let bodyObj: any;
  if (init?.body && typeof init.body === 'string') {
    try {
      bodyObj = JSON.parse(init.body);
    } catch {
      bodyObj = init.body;
    }
  }

  const method = (init?.method || 'GET').toUpperCase();
  const result = await executeMockApiFallback(url, method, bodyObj);

  return new Response(JSON.stringify(result.data), {
    status: result.status,
    headers: {
      'Content-Type': 'application/json',
      'X-Kishan-Bhai-Netlify-Engine': 'true',
    },
  });
}
