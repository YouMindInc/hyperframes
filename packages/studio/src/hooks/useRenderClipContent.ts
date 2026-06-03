import { useCallback, type ReactNode } from "react";
import { createElement } from "react";
import { CompositionThumbnail, VideoThumbnail } from "../player";
import type { TimelineElement } from "../player";
import { AudioWaveform } from "../player/components/AudioWaveform";
import { getTimelineElementLabel } from "../utils/studioHelpers";
import { buildProjectApiPath } from "../utils/projectRouting";

export function normalizeCompositionSrc(
  compSrc: string,
  projectId: string,
  origin: string,
): string {
  try {
    const parsed = new URL(compSrc, origin);
    const previewPrefix = new URL(buildProjectApiPath(projectId, "/preview/"), origin).pathname;
    if (parsed.pathname.startsWith(previewPrefix)) {
      return parsed.pathname.slice(previewPrefix.length);
    }
  } catch {
    // already relative
  }
  return compSrc;
}

interface UseRenderClipContentOptions {
  projectIdRef: { current: string | null };
  compIdToSrc: Map<string, string>;
  activePreviewUrl: string | null;
  effectiveTimelineDuration: number;
}

export function useRenderClipContent({
  projectIdRef,
  compIdToSrc,
  activePreviewUrl,
  effectiveTimelineDuration,
}: UseRenderClipContentOptions) {
  return useCallback(
    (el: TimelineElement, style: { clip: string; label: string }): ReactNode => {
      const pid = projectIdRef.current;
      if (!pid) return null;

      let compSrc = el.compositionSrc;
      if (compSrc) {
        compSrc = normalizeCompositionSrc(compSrc, pid, window.location.origin);
      }
      if (compSrc && compIdToSrc.size > 0) {
        const resolved =
          compIdToSrc.get(el.id) ||
          compIdToSrc.get(compSrc.replace(/^compositions\//, "").replace(/\.html$/, ""));
        if (resolved) compSrc = resolved;
      }

      // Composition clips — always use the comp's own preview URL for thumbnails.
      // This renders the composition in isolation so we get clean frames
      // instead of capturing the master at a time when the comp is fading in.
      if (compSrc) {
        return createElement(CompositionThumbnail, {
          previewUrl: buildProjectApiPath(pid, `/preview/comp/${compSrc}`),
          label: getTimelineElementLabel(el),
          labelColor: style.label,

          seekTime: 0,
          duration: el.duration,
        });
      }

      // When drilled into a composition, render all inner elements via
      // CompositionThumbnail at their start time — most accurate visual.
      if (activePreviewUrl && el.duration > 0) {
        return createElement(CompositionThumbnail, {
          previewUrl: activePreviewUrl,
          label: getTimelineElementLabel(el),
          labelColor: style.label,

          selector: el.selector,
          selectorIndex: el.selectorIndex,
          seekTime: el.start,
          duration: el.duration,
        });
      }

      const htmlPreviewEligible =
        el.duration > 0 &&
        effectiveTimelineDuration > 0 &&
        el.duration < effectiveTimelineDuration * 0.92 &&
        !/(backdrop|background|overlay|scrim|mask)/i.test(el.id);

      // Audio clips — waveform visualization
      if (el.tag === "audio") {
        const previewBase = new URL(buildProjectApiPath(pid, "/preview/"), window.location.origin)
          .pathname;
        let parsedSrcPath: string | null = null;
        if (el.src?.startsWith("http")) {
          try {
            parsedSrcPath = new URL(el.src).pathname;
          } catch {
            parsedSrcPath = null;
          }
        }
        const srcRelative = el.src
          ? parsedSrcPath?.startsWith(previewBase)
            ? decodeURIComponent(parsedSrcPath.slice(previewBase.length))
            : el.src.startsWith("http")
              ? null
              : el.src
          : null;
        const audioUrl = srcRelative
          ? buildProjectApiPath(pid, `/preview/${srcRelative}`)
          : (el.src ?? "");
        const waveformUrl = srcRelative
          ? buildProjectApiPath(pid, `/waveform/${srcRelative}`)
          : undefined;
        return createElement(AudioWaveform, {
          audioUrl,
          waveformUrl,
          label: getTimelineElementLabel(el),
          labelColor: style.label,
        });
      }

      if ((el.tag === "video" || el.tag === "img") && el.src) {
        const mediaSrc = el.src.startsWith("http")
          ? el.src
          : buildProjectApiPath(pid, `/preview/${el.src}`);
        return createElement(VideoThumbnail, {
          videoSrc: mediaSrc,
          label: getTimelineElementLabel(el),
          labelColor: style.label,
          duration: el.duration,
        });
      }

      if (htmlPreviewEligible) {
        return createElement(CompositionThumbnail, {
          previewUrl: buildProjectApiPath(pid, "/preview"),
          label: getTimelineElementLabel(el),
          labelColor: style.label,

          selector: el.selector,
          selectorIndex: el.selectorIndex,
          seekTime: el.start,
          duration: el.duration,
        });
      }

      return null;
    },
    [projectIdRef, compIdToSrc, activePreviewUrl, effectiveTimelineDuration],
  );
}
