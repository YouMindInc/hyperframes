import { parseStudioPreviewUrl } from "../../utils/projectRouting";
import type { ThumbnailLoadedResult } from "./thumbnailScheduler";
import { TIMELINE_VIEWPORT_BUDGETS } from "./timelineViewportBudgets";

function thumbnailSource(source: string): string {
  const preview = parseStudioPreviewUrl(source);
  if (!preview || !/\.jpe?g$/i.test(preview.assetPath)) return source;
  const { url } = preview;
  url.pathname = `${preview.projectApiPath}/image-thumbnail/${preview.assetPath}`;
  return url.href;
}

function loadImage(source: string, signal: AbortSignal): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const cleanup = () => {
      image.onload = null;
      image.onerror = null;
      signal.removeEventListener("abort", onAbort);
    };
    const onAbort = () => {
      cleanup();
      image.src = "";
      reject(new DOMException("Aborted", "AbortError"));
    };
    if (signal.aborted) {
      onAbort();
      return;
    }
    image.onload = () => {
      cleanup();
      resolve(image);
    };
    image.onerror = () => {
      cleanup();
      if (/\.svg($|\?)/i.test(source)) resolve(image);
      else {
        image.src = "";
        reject(new Error("Image thumbnail failed to load"));
      }
    };
    signal.addEventListener("abort", onAbort, { once: true });
    image.src = source;
  });
}

export async function decodeImageThumbnail(
  source: string,
  signal: AbortSignal,
): Promise<ThumbnailLoadedResult> {
  let url = thumbnailSource(source);
  let image: HTMLImageElement;
  try {
    image = await loadImage(url, signal);
  } catch (error) {
    if (signal.aborted || url === source) throw error;
    url = source;
    image = await loadImage(source, signal);
  }
  try {
    signal.throwIfAborted();
    const width = image.naturalWidth || TIMELINE_VIEWPORT_BUDGETS.posterMaxPhysicalWidth;
    const height = image.naturalHeight || TIMELINE_VIEWPORT_BUDGETS.posterMaxPhysicalHeight;
    return { value: { kind: "image", url, aspect: width / height }, weight: width * height * 4 };
  } finally {
    image.src = "";
  }
}
