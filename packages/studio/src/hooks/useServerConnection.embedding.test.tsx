// @vitest-environment happy-dom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { configureStudioApiBaseUrl } from "../utils/projectRouting";
import { useServerConnection } from "./useServerConnection";

vi.mock("../utils/studioTelemetry", () => ({ trackStudioEvent: vi.fn() }));
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
afterEach(() => {
  configureStudioApiBaseUrl();
  vi.unstubAllGlobals();
});

it.each([200, 404])(
  "keeps the exact host project and route when its status is %s",
  async (status) => {
    configureStudioApiBaseUrl("/mounted/api");
    window.location.hash = "#host-route";
    let selected: string | null = null;
    const fetcher = vi.fn(async (url: string) =>
      url === "/mounted/api/projects"
        ? Response.json({ projects: [{ id: "other" }] })
        : new Response(null, { status }),
    );
    vi.stubGlobal("fetch", fetcher);
    function Probe() {
      selected = useServerConnection("videos/Demo #1").projectId;
      return null;
    }
    const root = createRoot(document.createElement("div"));
    try {
      await act(async () => {
        root.render(<Probe />);
      });
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });
      expect(selected).toBe("videos/Demo #1");
      expect(window.location.hash).toBe("#host-route");
      expect(fetcher).toHaveBeenCalledWith(
        "/mounted/api/projects/videos%2FDemo%20%231",
        expect.anything(),
      );
      window.location.hash = "#project/other";
      await act(async () => {
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      });
      expect(selected).toBe("videos/Demo #1");
    } finally {
      await act(async () => root.unmount());
    }
  },
);
