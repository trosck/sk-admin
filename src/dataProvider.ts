import type { DataProvider, GetListParams } from "@refinedev/core";
import simpleRestProvider from "@refinedev/simple-rest";
import { API_BASE_URL } from "./api/config";
import { httpClient } from "./api/httpClient";

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

    const cursorKey = makeCursorKey(resource, params);
    if (!cursorStore.has(cursorKey))
      cursorStore.set(cursorKey, new Map([[1, null]]));
    const cursors = cursorStore.get(cursorKey)!;
    const cursor = cursors.get(page) ?? null;

    const paramsObj: Record<string, string> = {
      limit: String(limit),
    };

    if (cursor) {
      paramsObj.cursor = cursor;
    }

    const s = sorters?.[0];
    if (s?.field) {
      paramsObj.sort = String(s.field);
      paramsObj.order = s.order ?? "asc";
    }

    const search = filters?.[0]?.value;
    if (search) {
      paramsObj.search = search;
    }

    const response = await httpClient.get(`/${resource}`, {
      params: paramsObj,
      headers: meta?.headers,
    });

    const total = Number(response.data?.total) || 0;
    const data = response.data?.data ?? [];
    const nextCursor: string | null = response.data?.nextCursor ?? null;

    cursors.set(page + 1, nextCursor);

    return {
      total,
      data,
    };
  },

  async getOne({ resource, id, meta }) {
    const response = await httpClient.get(`/${resource}/${id}`, {
      headers: meta?.headers,
    });

    return { data: response.data };
  },

  async getMany({ resource, ids, meta }) {
    const promises = ids.map((id) =>
      httpClient.get(`/${resource}/${id}`, {
        headers: meta?.headers,
      })
    );

    const responses = await Promise.all(promises);
    const data = responses.map((response) => response.data);

    return { data };
  },

  async create({ resource, variables, meta }) {
    const response = await httpClient.post(`/${resource}`, variables, {
      headers: meta?.headers,
    });

    return { data: response.data };
  },

  async update({ resource, id, variables, meta }) {
    const response = await httpClient.patch(`/${resource}/${id}`, variables, {
      headers: meta?.headers,
    });

    return { data: response.data };
  },

  async updateMany({ resource, ids, variables, meta }) {
    const promises = ids.map((id) =>
      httpClient.patch(`/${resource}/${id}`, variables, {
        headers: meta?.headers,
      })
    );

    const responses = await Promise.all(promises);
    const data = responses.map((response) => response.data);

    return { data };
  },

  async deleteOne({ resource, id, meta }) {
    const response = await httpClient.delete(`/${resource}/${id}`, {
      headers: meta?.headers,
    });

    return { data: response.data };
  },

  async deleteMany({ resource, ids, meta }) {
    const promises = ids.map((id) =>
      httpClient.delete(`/${resource}/${id}`, {
        headers: meta?.headers,
      })
    );

    const responses = await Promise.all(promises);
    const data = responses.map((response) => response.data);

    return { data };
  },

  getApiUrl() {
    return API_BASE_URL;
  },

  async custom({ url, method, filters, sorters, payload, query, headers, meta }) {
    const response = await httpClient.request({
      url,
      method: (method ?? "GET").toLowerCase() as any,
      data: payload,
      params: query,
      headers: { ...headers, ...meta?.headers },
    });

    return { data: response.data };
  },
};
