type CacheEntry<T> = {
  data: T;
  expiresAt: number;
};

const cache = new Map<string, CacheEntry<unknown>>();

type CacheOptions = {
  ttlMs?: number;
  forceRefresh?: boolean;
};

export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  { ttlMs = 60_000, forceRefresh = false }: CacheOptions = {}
): Promise<T> {
  const now = Date.now();
  const cached = cache.get(key) as CacheEntry<T> | undefined;

  if (!forceRefresh && cached && cached.expiresAt > now) {
    return cached.data;
  }

  const data = await fetcher();
  cache.set(key, { data, expiresAt: now + ttlMs });
  return data;
}

export function clearCache(key?: string) {
  if (key) {
    cache.delete(key);
    return;
  }
  cache.clear();
}

export function clearCacheByPrefix(prefix: string) {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}

