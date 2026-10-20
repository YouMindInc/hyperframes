import type { StudioApiAdapter } from "../types.js";

export function buildStudioApiPath(
  adapter: Pick<StudioApiAdapter, "apiBaseUrl">,
  suffix: string,
): string {
  return `${(adapter.apiBaseUrl ?? "/api").replace(/\/+$/u, "")}/${suffix.replace(/^\/+/u, "")}`;
}
