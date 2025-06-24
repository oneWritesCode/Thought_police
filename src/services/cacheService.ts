interface CacheEntry {
  data: any;
  timestamp: number;
  expiresAt: number;
}

class CacheService {
  private cache = new Map<string, CacheEntry>();
  private readonly DEFAULT_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

  /**
   * Store analysis result in cache
   */
  setAnalysis(username: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    const key = this.getAnalysisKey(username);
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl
    };
    
    this.cache.set(key, entry);
    console.log(`Cached analysis for user: ${username}, expires in ${Math.round(ttl / (24 * 60 * 60 * 1000))} days`);
    
    // Clean up expired entries periodically
    this.cleanupExpired();
  }

  /**
   * Get cached analysis result
   */
  getAnalysis(username: string): any | null {
    const key = this.getAnalysisKey(username);
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      console.log(`Cache expired for user: ${username}`);
      return null;
    }
    
    console.log(`Cache hit for user: ${username}, age: ${Math.round((Date.now() - entry.timestamp) / (60 * 60 * 1000))} hours`);
    return entry.data;
  }

  /**
   * Check if analysis is cached and still valid
   */
  hasValidAnalysis(username: string): boolean {
    return this.getAnalysis(username) !== null;
  }

  /**
   * Clear cache for specific user
   */
  clearAnalysis(username: string): void {
    const key = this.getAnalysisKey(username);
    this.cache.delete(key);
    console.log(`Cleared cache for user: ${username}`);
  }

  /**
   * Clear all cached data
   */
  clearAll(): void {
    this.cache.clear();
    console.log('Cleared all cached analyses');
  }

  /**
   * Get cache statistics
   */
  getStats(): { totalEntries: number; validEntries: number; expiredEntries: number } {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;
    
    this.cache.forEach(entry => {
      if (now <= entry.expiresAt) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    });
    
    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries
    };
  }

  private getAnalysisKey(username: string): string {
    return `analysis:${username.toLowerCase()}`;
  }

  private cleanupExpired(): void {
    const now = Date.now();
    let cleanedCount = 0;
    
    this.cache.forEach((entry, key) => {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleanedCount++;
      }
    });
    
    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} expired cache entries`);
    }
  }
}

export const cacheService = new CacheService();