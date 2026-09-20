import { afterEach, describe, expect, it } from "vitest";
import {
  configureStudioApiBaseUrl,
  projectPathFromPreviewUrl,
  buildStudioApiPath,
  buildProjectApiPath,
  buildProjectHash,
  parseProjectIdFromHash,
} from "./projectRouting";
afterEach(() => configureStudioApiBaseUrl());
describe("host-mounted Studio routing", () => {
  it("preserves an absolute API origin, mount path, query, and encoded nested project", () => {
    configureStudioApiBaseUrl("http://localhost:4321/hyperframes-studio/api?token=demo");
    expect(buildProjectApiPath("work/demo #1", "/files/index.html?v=2")).toBe(
      "http://localhost:4321/hyperframes-studio/api/projects/work%2Fdemo%20%231/files/index.html?token=demo&v=2",
    );
    expect(buildStudioApiPath("/events")).toBe(
      "http://localhost:4321/hyperframes-studio/api/events?token=demo",
    );
    expect(parseProjectIdFromHash(buildProjectHash("work/demo"))).toBe("work/demo");
  });
  it("preserves a browser proxy mount path", () => {
    configureStudioApiBaseUrl("/c/test/hyperframes-studio/api/");
    expect(buildProjectApiPath("demo", "/preview")).toBe(
      "/c/test/hyperframes-studio/api/projects/demo/preview",
    );
  });
});

it("normalizes runtime sub-composition URLs at the host API mount", () => {
  configureStudioApiBaseUrl("http://localhost:4321/hyperframes-studio/api");
  expect(
    projectPathFromPreviewUrl(
      "http://localhost:4321/hyperframes-studio/api/projects/work%2Fdemo/preview/compositions/scene%201.html",
    ),
  ).toBe("compositions/scene 1.html");
  expect(projectPathFromPreviewUrl("compositions/scene.html")).toBe("compositions/scene.html");
  expect(projectPathFromPreviewUrl("https://example.com/scene.html")).toBe(
    "https://example.com/scene.html",
  );
});
