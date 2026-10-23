/**
 * Production-Grade Client-Side Request Queuing & Rate-Limiting Engine
 * With 429 Quota Handling, Exponential Backoff, User Retry Notifications,
 * and Seamless Netlify Static / Offline Autonomous Fallback.
 */

import { executeMockApiFallback } from './mockApiFallback';

// Capture native fetch reference immediately to avoid recursion
const nativeFetch = typeof window !== 'undefined' && window.fetch ? window.fetch.bind(window) : fetch;

export interface ApiCallOptions extends Omit<RequestInit, 'priority'> {
  priority?: 'high' | 'normal' | 'low';
  maxRetries?: number;
  skipQueue?: boolean;
  timeoutMs?: number;
  onRetry?: (attempt: number, delayMs: number, reason: string) => void;
}

export interface RetryEventDetail {
  id: string;
  url: string;
  attempt: number;
  maxRetries: number;
  delayMs: number;
  reason: string;
  status: 'retrying' | 'succeeded' | 'exhausted';
}

export interface QueueStatus {
  pending: number;
  inFlight: number;
  rateLimitActive: boolean;
  lastRateLimitReset?: number;
}

class ApiClientQueueManager {
  private queue: Array<{
    id: string;
    url: string;
    options: ApiCallOptions;
    resolve: (value: Response) => void;
    reject: (reason?: any) => void;
    priority: number;
    enqueuedAt: number;
  }> = [];

  private inFlightCount = 0;
  private maxConcurrency = 2; // Controlled concurrency to respect free-tier quotas
  private minIntervalMs = 120; // 120ms spacing between outgoing network requests
  private lastRequestTime = 0;
  private isProcessing = false;

  // Sliding window rate limiter (tracks requests in last 60 seconds)
  private requestTimestamps: number[] = [];
  private maxRequestsPerMinute = 40; // Soft throttle to protect free APIs

  // Backoff state for global 429 throttling
  private globalThrottleUntil = 0;

  constructor() {
    // Listen for storage sync or network events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.processQueue());
    }
  }

  public getStatus(): QueueStatus {
    return {
      pending: this.queue.length,
      inFlight: this.inFlightCount,
      rateLimitActive: Date.now() < this.globalThrottleUntil,
      lastRateLimitReset: this.globalThrottleUntil > Date.now() ? this.globalThrottleUntil : undefined,
    };
  }

  /**
   * Enqueue an API request
   */
  public enqueue(url: string, options: ApiCallOptions = {}): Promise<Response> {
    if (options.skipQueue) {
      return this.executeDirect(url, options);
    }

    return new Promise<Response>((resolve, reject) => {
      const priorityWeights = { high: 3, normal: 2, low: 1 };
      const priority = priorityWeights[options.priority || 'normal'] || 2;

      this.queue.push({
        id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        url,
        options,
        resolve,
        reject,
        priority,
        enqueuedAt: Date.now(),
      });

      // Sort queue by priority (descending) and enqueue time (ascending)
      this.queue.sort((a, b) => b.priority - a.priority || a.enqueuedAt - b.enqueuedAt);

      this.notifyQueueEvent();
      this.processQueue();
    });
  }

  /**
   * Process items in the queue with concurrency and rate-limiting controls
   */
  private async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      while (this.queue.length > 0 && this.inFlightCount < this.maxConcurrency) {
        const now = Date.now();

        // 1. Check if global 429 throttle is in effect
        if (now < this.globalThrottleUntil) {
          const waitTime = this.globalThrottleUntil - now;
          await new Promise((r) => setTimeout(r, Math.min(waitTime, 1000)));
          continue;
        }

        // 2. Check sliding window rate limit
        this.requestTimestamps = this.requestTimestamps.filter((t) => now - t < 60000);
        if (this.requestTimestamps.length >= this.maxRequestsPerMinute) {
          const oldest = this.requestTimestamps[0];
          const waitTime = Math.max(100, 60000 - (now - oldest) + 50);
          await new Promise((r) => setTimeout(r, waitTime));
          continue;
        }

        // 3. Enforce minimum request spacing
        const timeSinceLast = now - this.lastRequestTime;
        if (timeSinceLast < this.minIntervalMs) {
          await new Promise((r) => setTimeout(r, this.minIntervalMs - timeSinceLast));
        }

        const item = this.queue.shift();
        if (!item) break;

        this.inFlightCount++;
        this.lastRequestTime = Date.now();
        this.requestTimestamps.push(this.lastRequestTime);
        this.notifyQueueEvent();

        // Execute asynchronously
        this.executeWithRetry(item.id, item.url, item.options)
          .then((res) => item.resolve(res))
          .catch((err) => item.reject(err))
          .finally(() => {
            this.inFlightCount--;
            this.notifyQueueEvent();
            this.processQueue();
          });
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Execute request with exponential backoff & 429 retry notification
   */
  private async executeWithRetry(
    id: string,
    url: string,
    options: ApiCallOptions,
    attempt = 1
  ): Promise<Response> {
    const maxRetries = options.maxRetries ?? 3;
    const timeoutMs = options.timeoutMs ?? 20000;

    try {
      // Setup timeout controller
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const { priority: _p, maxRetries: _m, skipQueue: _s, timeoutMs: _t, onRetry: _o, ...cleanInit } = options;
      const requestInit: RequestInit = {
        ...cleanInit,
        signal: options.signal || controller.signal,
      };

      let response: Response;
      try {
        response = await nativeFetch(url, requestInit);
      } finally {
        clearTimeout(timeoutId);
      }

      // Netlify / Static Fallback detection:
      // If the endpoint is an /api route and returns 404 or text/html (Netlify SPA redirect /* to /index.html 200),
      // seamlessly execute client-side real sector APIs fallback engine!
      const contentType = response.headers.get('content-type') || '';
      if (url.startsWith('/api') && (response.status === 404 || (response.status === 200 && contentType.includes('text/html')) || response.status >= 500)) {
        return this.createMockResponse(url, options);
      }

      // Check for 429 Too Many Requests or 503 Service Unavailable
      if (response.status === 429 || response.status === 503) {
        const retryAfterHeader = response.headers.get('Retry-After');
        let delayMs = 1500 * Math.pow(2, attempt) + Math.random() * 500;

        if (retryAfterHeader) {
          const parsedSec = parseInt(retryAfterHeader, 10);
          if (!isNaN(parsedSec)) {
            delayMs = parsedSec * 1000;
          }
        }

        // Set global throttle to avoid hitting the wall repeatedly
        this.globalThrottleUntil = Date.now() + delayMs;

        if (attempt <= maxRetries) {
          const reason = response.status === 429 ? 'Rate limit / Free quota active' : 'Service temporarily busy';
          this.emitRetryEvent({
            id,
            url,
            attempt,
            maxRetries,
            delayMs,
            reason,
            status: 'retrying',
          });

          if (options.onRetry) {
            options.onRetry(attempt, delayMs, reason);
          }

          await new Promise((r) => setTimeout(r, delayMs));
          return this.executeWithRetry(id, url, options, attempt + 1);
        } else {
          // Quota exhausted after max retries: fall back gracefully to mock engine
          this.emitRetryEvent({
            id,
            url,
            attempt,
            maxRetries,
            delayMs: 0,
            reason: 'Quota limit reached — switching to offline agronomy engine',
            status: 'exhausted',
          });
          return this.createMockResponse(url, options);
        }
      }

      // If response body contains rate limit or resource exhausted message
      if (!response.ok && response.status >= 400 && response.status < 500) {
        const clone = response.clone();
        try {
          const errorJson = await clone.json();
          const errText = JSON.stringify(errorJson).toLowerCase();
          if (errText.includes('resource_exhausted') || errText.includes('rate_limit') || errText.includes('quota')) {
            if (attempt <= maxRetries) {
              const delayMs = 2000 * Math.pow(2, attempt) + Math.random() * 500;
              this.globalThrottleUntil = Date.now() + delayMs;
              this.emitRetryEvent({
                id,
                url,
                attempt,
                maxRetries,
                delayMs,
                reason: 'Free quota burst — auto-retrying with safe delay',
                status: 'retrying',
              });
              await new Promise((r) => setTimeout(r, delayMs));
              return this.executeWithRetry(id, url, options, attempt + 1);
            } else {
              return this.createMockResponse(url, options);
            }
          }
        } catch {
          // Non-JSON response, continue normally
        }
      }

      return response;
    } catch (err: any) {
      // Network failure or abort on Netlify / offline
      if (attempt <= maxRetries && err.name !== 'AbortError') {
        const delayMs = 1200 * Math.pow(2, attempt);
        this.emitRetryEvent({
          id,
          url,
          attempt,
          maxRetries,
          delayMs,
          reason: 'Network reconnecting',
          status: 'retrying',
        });
        await new Promise((r) => setTimeout(r, delayMs));
        return this.executeWithRetry(id, url, options, attempt + 1);
      }

      // If network is unreachable or Netlify static host, fall back cleanly
      if (url.startsWith('/api')) {
        return this.createMockResponse(url, options);
      }

      throw err;
    }
  }

  /**
   * Direct execution without queue (for streaming / ping)
   */
  private async executeDirect(url: string, options: ApiCallOptions): Promise<Response> {
    try {
      const { priority: _p, maxRetries: _m, skipQueue: _s, timeoutMs: _t, onRetry: _o, ...cleanInit } = options;
      const res = await nativeFetch(url, cleanInit);
      const contentType = res.headers.get('content-type') || '';
      if (url.startsWith('/api') && (res.status === 404 || (res.status === 200 && contentType.includes('text/html')) || res.status >= 500)) {
        return this.createMockResponse(url, options);
      }
      return res;
    } catch {
      if (url.startsWith('/api')) {
        return this.createMockResponse(url, options);
      }
      throw new Error(`Failed to fetch ${url}`);
    }
  }

  /**
   * Create a standard browser Response from the mock fallback engine
   */
  private async createMockResponse(url: string, options: ApiCallOptions): Promise<Response> {
    let bodyObj: any = undefined;
    if (options.body && typeof options.body === 'string') {
      try {
        bodyObj = JSON.parse(options.body);
      } catch {
        bodyObj = options.body;
      }
    }

    const mockResult = await executeMockApiFallback(url, options.method || 'GET', bodyObj);

    return new Response(JSON.stringify(mockResult.data), {
      status: mockResult.status,
      headers: {
        'Content-Type': 'application/json',
        'X-Kishan-Bhai-Fallback': 'true',
      },
    });
  }

  private emitRetryEvent(detail: RetryEventDetail) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kishan-api-retry', { detail }));
    }
  }

  private notifyQueueEvent() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kishan-api-queue', { detail: this.getStatus() }));
    }
  }
}

// Export singleton instance
export const apiQueue = new ApiClientQueueManager();

/**
 * Universal Drop-in fetch replacement with rate-limiting, queuing, and Netlify resilience
 */
export async function apiFetch(input: RequestInfo | URL, init?: ApiCallOptions): Promise<Response> {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
  return apiQueue.enqueue(url, init);
}

/**
 * Convenience helper to fetch and parse JSON with type safety
 */
export async function apiFetchJson<T = any>(input: RequestInfo | URL, init?: ApiCallOptions): Promise<T> {
  const response = await apiFetch(input, init);
  if (!response.ok) {
    let errMsg = `API Error: HTTP ${response.status}`;
    try {
      const errData = await response.json();
      errMsg = errData.error || errData.message || errMsg;
    } catch {
      // Ignored
    }
    throw new Error(errMsg);
  }
  return response.json() as Promise<T>;
}
