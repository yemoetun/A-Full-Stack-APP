import { PAGINATION } from "@projectflow/config";

export interface PaginationParams {
  page: number;
  pageSize: number;
  offset: number;
}

export function parsePagination(query: Record<string, unknown>): PaginationParams {
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(
    PAGINATION.maxPageSize,
    Math.max(1, Number(query.pageSize) || PAGINATION.defaultPageSize)
  );
  return { page, pageSize, offset: (page - 1) * pageSize };
}

export function buildPaginationMeta(total: number, page: number, pageSize: number) {
  return {
    total,
    page,
    pageSize,
    hasMore: page * pageSize < total,
  };
}
