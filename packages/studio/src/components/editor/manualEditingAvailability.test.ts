import { describe, expect, it } from "vitest";
import {
  STUDIO_INSPECTOR_PANELS_ENABLED,
  STUDIO_MOTION_PANEL_ENABLED,
  STUDIO_PREVIEW_MANUAL_EDITING_ENABLED,
  STUDIO_TIMELINE_LAYER_INSPECTOR_ENABLED,
  resolveStudioBooleanEnvFlag,
} from "./manualEditingAvailability";

describe("manual editing availability", () => {
  it("keeps direct preview manual editing disabled while timeline inspection stays available", () => {
    expect(STUDIO_PREVIEW_MANUAL_EDITING_ENABLED).toBe(false);
    expect(STUDIO_INSPECTOR_PANELS_ENABLED).toBe(true);
    expect(STUDIO_MOTION_PANEL_ENABLED).toBe(false);
    expect(STUDIO_TIMELINE_LAYER_INSPECTOR_ENABLED).toBe(true);
  });

  it("enables feature flags with explicit truthy env values", () => {
    expect(
      resolveStudioBooleanEnvFlag(
        { VITE_STUDIO_ENABLE_PREVIEW_MANUAL_DRAGGING: "true" },
        ["VITE_STUDIO_ENABLE_PREVIEW_MANUAL_DRAGGING"],
        false,
      ),
    ).toBe(true);
    expect(
      resolveStudioBooleanEnvFlag(
        { VITE_STUDIO_ENABLE_MOTION_PANEL: "1" },
        ["VITE_STUDIO_ENABLE_MOTION_PANEL"],
        false,
      ),
    ).toBe(true);
  });

  it("disables feature flags with explicit falsy env values", () => {
    expect(
      resolveStudioBooleanEnvFlag(
        { VITE_STUDIO_ENABLE_PREVIEW_MANUAL_DRAGGING: "off" },
        ["VITE_STUDIO_ENABLE_PREVIEW_MANUAL_DRAGGING"],
        true,
      ),
    ).toBe(false);
    expect(
      resolveStudioBooleanEnvFlag(
        { VITE_STUDIO_ENABLE_MOTION_PANEL: "0" },
        ["VITE_STUDIO_ENABLE_MOTION_PANEL"],
        true,
      ),
    ).toBe(false);
  });

  it("supports legacy flag aliases after the preferred name", () => {
    expect(
      resolveStudioBooleanEnvFlag(
        { VITE_STUDIO_PREVIEW_MANUAL_EDITING_ENABLED: "yes" },
        [
          "VITE_STUDIO_ENABLE_PREVIEW_MANUAL_DRAGGING",
          "VITE_STUDIO_PREVIEW_MANUAL_EDITING_ENABLED",
        ],
        false,
      ),
    ).toBe(true);
    expect(
      resolveStudioBooleanEnvFlag(
        { VITE_STUDIO_MOTION_PANEL_ENABLED: "enabled" },
        ["VITE_STUDIO_ENABLE_MOTION_PANEL", "VITE_STUDIO_MOTION_PANEL_ENABLED"],
        false,
      ),
    ).toBe(true);
  });

  it("falls back for missing, empty, or unknown env values", () => {
    expect(resolveStudioBooleanEnvFlag({}, ["MISSING"], false)).toBe(false);
    expect(resolveStudioBooleanEnvFlag({ EMPTY: "" }, ["EMPTY"], true)).toBe(true);
    expect(resolveStudioBooleanEnvFlag({ UNKNOWN: "maybe" }, ["UNKNOWN"], false)).toBe(false);
  });
});
