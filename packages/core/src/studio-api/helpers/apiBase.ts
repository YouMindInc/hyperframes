import type { StudioApiAdapter } from "../types.js";

const DEFAULT_STUDIO_API_BASE_URL = "/api";

function normalizeApiBaseUrl(apiBaseUrl?: string): string {
  const next = apiBaseUrl?.trim() || DEFAULT_STUDIO_API_BASE_URL;
  return next.replace(/\/+(?=($|\?))/, "");
}

function normalizeApiSuffix(suffix = ""): string {
  const normalizedSuffix = suffix && !suffix.startsWith("/") ? `/${suffix}` : suffix;
  return normalizedSuffix || "/";
}

function joinApiPath(basePath: string, suffixPath: string): string {
  const normalizedBase = basePath.replace(/\/+$/, "");
  const normalizedSuffix = suffixPath.startsWith("/") ? suffixPath : `/${suffixPath}`;
  return `${normalizedBase}${normalizedSuffix}`.replace(/\/{2,}/g, "/");
}

function isAbsoluteApiBaseUrl(apiBaseUrl: string): boolean {
  return /^[a-z][a-z\d+.-]*:\/\//i.test(apiBaseUrl);
}

export function buildStudioApiPath(adapter: StudioApiAdapter, suffix = ""): string {
  const normalizedBase = normalizeApiBaseUrl(adapter.apiBaseUrl);
  const normalizedSuffix = normalizeApiSuffix(suffix);
  const baseUrl = new URL(normalizedBase, "http://hyperframes.local");
  const suffixUrl = new URL(normalizedSuffix, "http://hyperframes.local");
  baseUrl.pathname = joinApiPath(baseUrl.pathname, suffixUrl.pathname);
  const search = new URLSearchParams(baseUrl.search);
  suffixUrl.searchParams.forEach((value, key) => search.append(key, value));
  baseUrl.search = search.toString();
  baseUrl.hash = suffixUrl.hash;

  if (isAbsoluteApiBaseUrl(normalizedBase)) return baseUrl.toString();
  return `${baseUrl.pathname}${baseUrl.search}${baseUrl.hash}`;
}
