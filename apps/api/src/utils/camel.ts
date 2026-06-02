// Convert snake_case DB rows to camelCase for API responses

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function rowToCamel<T = Record<string, unknown>>(row: Record<string, unknown>): T {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(row)) {
    result[toCamelCase(key)] = row[key];
  }
  return result as T;
}

export function rowsToCamel<T = Record<string, unknown>>(rows: Record<string, unknown>[]): T[] {
  return rows.map(rowToCamel<T>);
}
