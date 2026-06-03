const PROJECT_HASH_PREFIX = "#project/";
const DEFAULT_STUDIO_API_BASE_URL = "/api";
let configuredStudioApiBaseUrl = DEFAULT_STUDIO_API_BASE_URL;

export interface ProjectHashRoute {
  projectId: string;
  params: URLSearchParams;
}

function decodeHashProjectId(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function normalizeHashParams(
  params?: URLSearchParams | Record<string, string | null | undefined>,
): URLSearchParams {
  if (!params) return new URLSearchParams();
  if (params instanceof URLSearchParams) return params;

  const next = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (!key || value == null || value === "") continue;
    next.set(key, value);
  }
  return next;
}

export function encodeProjectId(projectId: string): string {
  return encodeURIComponent(projectId);
}

export function buildProjectHash(
  projectId: string,
  params?: URLSearchParams | Record<string, string | null | undefined>,
): string {
  const search = normalizeHashParams(params).toString();
  return `${PROJECT_HASH_PREFIX}${encodeProjectId(projectId)}${search ? `?${search}` : ""}`;
}

export function parseProjectHashRoute(hash: string): ProjectHashRoute | null {
  if (!hash.startsWith(PROJECT_HASH_PREFIX)) return null;

  const route = hash.slice(PROJECT_HASH_PREFIX.length);
  const queryIndex = route.indexOf("?");
  const encodedProjectId = queryIndex >= 0 ? route.slice(0, queryIndex) : route;
  if (!encodedProjectId || encodedProjectId.includes("/")) return null;

  const rawParams = queryIndex >= 0 ? route.slice(queryIndex + 1) : "";
  return {
    projectId: decodeHashProjectId(encodedProjectId),
    params: new URLSearchParams(rawParams),
  };
}

export function parseProjectIdFromHash(hash: string): string | null {
  return parseProjectHashRoute(hash)?.projectId ?? null;
}

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

export function configureStudioApiBaseUrl(apiBaseUrl?: string): void {
  configuredStudioApiBaseUrl = normalizeApiBaseUrl(apiBaseUrl);
}

export function buildStudioApiPath(suffix = "", apiBaseUrl = configuredStudioApiBaseUrl): string {
  const normalizedBase = normalizeApiBaseUrl(apiBaseUrl);
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

export function buildProjectApiPath(
  projectId: string,
  suffix = "",
  apiBaseUrl = configuredStudioApiBaseUrl,
): string {
  const normalizedSuffix = suffix && !suffix.startsWith("/") ? `/${suffix}` : suffix;
  return buildStudioApiPath(
    `/projects/${encodeProjectId(projectId)}${normalizedSuffix}`,
    apiBaseUrl,
  );
}
