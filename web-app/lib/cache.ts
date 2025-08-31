import { promises as fs } from 'fs';
import { join } from 'path';

interface CacheEntry {
  data: unknown;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface CacheStats {
  hits: number;
  misses: number;
  lastAccess: number;
}

class IPLCache {
  private cache = new Map<string, CacheEntry>();
  private stats = new Map<string, CacheStats>();
  private cacheDir = join(process.cwd(), '.cache');

  constructor() {
    this.ensureCacheDir();
    this.loadFromDisk();
  }

  private async ensureCacheDir() {
    try {
      await fs.access(this.cacheDir);
    } catch {
      await fs.mkdir(this.cacheDir, { recursive: true });
    }
  }

  private async loadFromDisk() {
    try {
      const files = await fs.readdir(this.cacheDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const key = file.replace('.json', '');
          const filePath = join(this.cacheDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const entry: CacheEntry = JSON.parse(content);
          
          // Only load if not expired
          if (this.isValid(entry)) {
            this.cache.set(key, entry);
          } else {
            // Clean up expired file
            await fs.unlink(filePath).catch(() => {});
          }
        }
      }
      console.log(`🗄️ Loaded ${this.cache.size} cached entries from disk`);
    } catch {
      console.log('🗄️ No cache files found, starting fresh');
    }
  }

  private async saveToDisk(key: string, entry: CacheEntry) {
    try {
      const filePath = join(this.cacheDir, `${key}.json`);
      await fs.writeFile(filePath, JSON.stringify(entry, null, 2));
    } catch (error) {
      console.error(`❌ Failed to save cache to disk: ${error}`);
    }
  }

  private isValid(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  private updateStats(key: string, isHit: boolean) {
    const stat = this.stats.get(key) || { hits: 0, misses: 0, lastAccess: 0 };
    if (isHit) {
      stat.hits++;
    } else {
      stat.misses++;
    }
    stat.lastAccess = Date.now();
    this.stats.set(key, stat);
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.updateStats(key, false);
      return null;
    }

    if (!this.isValid(entry)) {
      // Remove expired entry
      this.cache.delete(key);
      this.updateStats(key, false);
      // Clean up disk file
      const filePath = join(this.cacheDir, `${key}.json`);
      await fs.unlink(filePath).catch(() => {});
      return null;
    }

    this.updateStats(key, true);
    return entry.data as T;
  }

  async set<T>(key: string, data: T, ttlMinutes: number = 10): Promise<void> {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000 // Convert minutes to milliseconds
    };

    this.cache.set(key, entry);
    await this.saveToDisk(key, entry);
    
    console.log(`💾 Cached ${key} for ${ttlMinutes} minutes`);
  }

  async invalidate(key: string): Promise<void> {
    this.cache.delete(key);
    const filePath = join(this.cacheDir, `${key}.json`);
    await fs.unlink(filePath).catch(() => {});
    console.log(`🗑️ Invalidated cache for ${key}`);
  }

  async clear(): Promise<void> {
    this.cache.clear();
    this.stats.clear();
    try {
      const files = await fs.readdir(this.cacheDir);
      await Promise.all(
        files.map(file => fs.unlink(join(this.cacheDir, file)))
      );
      console.log('🗑️ Cleared all cache');
    } catch (error) {
      console.error('❌ Error clearing cache:', error);
    }
  }

  getStats() {
    const totalHits = Array.from(this.stats.values()).reduce((sum, stat) => sum + stat.hits, 0);
    const totalMisses = Array.from(this.stats.values()).reduce((sum, stat) => sum + stat.misses, 0);
    const hitRate = totalHits + totalMisses > 0 ? (totalHits / (totalHits + totalMisses) * 100).toFixed(1) : '0';
    
    return {
      cacheSize: this.cache.size,
      totalHits,
      totalMisses,
      hitRate: `${hitRate}%`,
      entries: Object.fromEntries(this.stats.entries())
    };
  }

  getCacheStatus(key: string) {
    const entry = this.cache.get(key);
    if (!entry) return { status: 'miss', remainingTtl: 0 };
    
    const remainingMs = entry.ttl - (Date.now() - entry.timestamp);
    const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
    
    return {
      status: remainingMs > 0 ? 'hit' : 'expired',
      remainingTtl: remainingMinutes,
      age: Math.floor((Date.now() - entry.timestamp) / (60 * 1000))
    };
  }
}

// Singleton instance
export const iplCache = new IPLCache();