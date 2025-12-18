import type { DataProvider, GetListParams } from "@refinedev/core";
import simpleRestProvider from "@refinedev/simple-rest";
import { API_BASE_URL } from "./api/config";

const base = simpleRestProvider(API_BASE_URL);

const cursorStore = new Map<string, Map<number, string | null>>();

function makeCursorKey(resource: string, params: GetListParams) {
  const pageSize = params.pagination?.pageSize ?? 10;
  const sortKey = JSON.stringify(
    (params.sorters ?? []).map((s) => [s.field, s.order])
  );
  const filterKey = JSON.stringify(params.filters ?? []);
  return `${resource}::ps=${pageSize}::sort=${sortKey}::filter=${filterKey}`;
}

export const dataProvider: DataProvider = {
  ...base,

  async getList(params) {
    const { resource, pagination, sorters, filters, meta } = params;

    const page = pagination?.currentPage ?? 1;
    const limit = pagination?.pageSize ?? 10;

    const url = new URL(`${API_BASE_URL}/${resource}`);
    url.searchParams.set("limit", String(limit));

    const cursorKey = makeCursorKey(resource, params);
    if (!cursorStore.has(cursorKey))
      cursorStore.set(cursorKey, new Map([[1, null]]));
    const cursors = cursorStore.get(cursorKey)!;
    const cursor = cursors.get(page) ?? null;

    if (cursor) {
      url.searchParams.set("cursor", cursor);
    }

    const s = sorters?.[0];
    if (s?.field) {
      url.searchParams.set("sort", String(s.field));
      url.searchParams.set("order", s.order); // "asc" | "desc"
    }

    const res = await fetch(url.toString(), {
      headers: {
        ...(meta?.headers ?? {}),
      },
    });

    if (!res.ok) throw new Error(await res.text());

    const response = await res.json();

    const total = Number(response?.total) || 0;
    const data = response?.data ?? [];
    const nextCursor: string | null = response?.nextCursor ?? null;

    cursors.set(page + 1, nextCursor);

    return {
      total,
      data,
    };
  },
};
