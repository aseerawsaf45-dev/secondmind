/**
 * Sliding-window in-memory Rate Limiter
 * Limits incoming requests by IP or user identifier to protect against brute-force attacks and abuse.
 */

interface RateLimitRecord {
  timestamps: number[];
}

class InMemoryRateLimiter {
  private store = new Map<string, RateLimitRecord>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Automatically purge expired entries every 5 minutes
    if (typeof setInterval !== 'undefined') {
      this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
      if (this.cleanupInterval.unref) {
        this.cleanupInterval.unref();
      }
    }
  }

  /**
   * Check if a request exceeds rate limit
   * @param key Unique key (e.g. IP address or userId)
   * @param limit Max allowed requests within window
   * @param windowMs Window duration in milliseconds
   */
  public check(
    key: string,
    limit: number,
    windowMs: number
  ): { success: boolean; limit: number; remaining: number; reset: number } {
    const now = Date.now();
    const windowStart = now - windowMs;

    let record = this.store.get(key);
    if (!record) {
      record = { timestamps: [] };
      this.store.set(key, record);
    }

    // Filter out timestamps outside window
    record.timestamps = record.timestamps.filter(ts => ts > windowStart);

    if (record.timestamps.length >= limit) {
      const oldest = record.timestamps[0];
      const resetTime = oldest + windowMs;
      return {
        success: false,
        limit,
        remaining: 0,
        reset: Math.ceil((resetTime - now) / 1000),
      };
    }

    record.timestamps.push(now);

    return {
      success: true,
      limit,
      remaining: limit - record.timestamps.length,
      reset: Math.ceil(windowMs / 1000),
    };
  }

  private cleanup() {
    const now = Date.now();
    const maxWindow = 60 * 60 * 1000; // 1 hour max
    for (const [key, record] of this.store.entries()) {
      record.timestamps = record.timestamps.filter(ts => ts > now - maxWindow);
      if (record.timestamps.length === 0) {
        this.store.delete(key);
      }
    }
  }
}

export const rateLimiter = new InMemoryRateLimiter();

/**
 * Standard preset rate limits:
 * - Auth endpoints (login / signup / password reset): 5 requests per minute per IP
 * - API extraction: 30 requests per minute per IP
 */
export function checkAuthRateLimit(ip: string) {
  return rateLimiter.check(`auth:${ip}`, 5, 60 * 1000);
}

export function checkApiRateLimit(ip: string) {
  return rateLimiter.check(`api:${ip}`, 30, 60 * 1000);
}
