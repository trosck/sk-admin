import { useCallback, useEffect, useMemo, useState } from "react";
import { httpClient } from "./httpClient";
import { withCache, clearCache, clearCacheByPrefix } from "./cache";

export interface Channel {
  // Extend when backend contract is known
  id: string | number;
  [key: string]: unknown;
}

const CACHE_KEY = "channels";

export type ChannelQueryParams = Record<
  string,
  string | number | boolean | null | undefined
>;

function serializeParams(params?: ChannelQueryParams): string {
  if (!params) return "";
  const normalized = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null)
    .sort(([a], [b]) => a.localeCompare(b))
    .reduce<Record<string, string | number | boolean>>((acc, [key, value]) => {
      acc[key] = value as string | number | boolean;
      return acc;
    }, {});
  return JSON.stringify(normalized);
}

function buildCacheKey(params?: ChannelQueryParams) {
  const serialized = serializeParams(params);
  return serialized ? `${CACHE_KEY}::${serialized}` : CACHE_KEY;
}

export async function getPromoCatChannel() {
  const { data } = await httpClient.get<Channel>(`/channels/promo-cat/`);

  return data;
}

export async function setPromoCatChannel(id: string) {
  const { data } = await httpClient.post(`/channels/promo-cat/${id}`);

  return data;
}

export async function fetchChannels(options?: {
  forceRefresh?: boolean;
  ttlMs?: number;
  params?: ChannelQueryParams;
}): Promise<Channel[]> {
  const { forceRefresh = false, ttlMs = 60_000, params } = options ?? {};
  const cacheKey = buildCacheKey(params);

  return withCache<Channel[]>(
    cacheKey,
    async () => {
      const { data } = await httpClient.get<Channel[]>("/channels", {
        params,
      });
      return data;
    },
    { ttlMs, forceRefresh }
  );
}

export function clearChannelsCache(options?: {
  params?: ChannelQueryParams;
  all?: boolean;
}) {
  if (options?.all || !options?.params) {
    clearCacheByPrefix(CACHE_KEY);
    return;
  }
  clearCache(buildCacheKey(options.params));
}

export function useChannels(options?: {
  enabled?: boolean;
  forceRefresh?: boolean;
  ttlMs?: number;
  params?: ChannelQueryParams;
}) {
  const { enabled = true, forceRefresh = false, ttlMs, params } = options ?? {};
  const [data, setData] = useState<Channel[] | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<unknown>(null);
  const paramsKey = useMemo(() => serializeParams(params), [params]);

  const refetch = useCallback(
    async (extra?: { forceRefresh?: boolean }) => {
      if (!enabled) return;
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchChannels({
          forceRefresh: extra?.forceRefresh ?? forceRefresh,
          ttlMs,
          params,
        });
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    },
    [enabled, forceRefresh, params, ttlMs, paramsKey]
  );

  useEffect(() => {
    if (!enabled) return;
    void refetch();
  }, [enabled, refetch, paramsKey]);

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}
