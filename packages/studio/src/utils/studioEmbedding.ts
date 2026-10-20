import { configureStudioApiBaseUrl } from "./projectRouting";
import { configureStudioPortalContainer } from "./studioPortal";

export interface StudioAppProps {
  apiBaseUrl?: string;
  projectId?: string | null;
  portalContainer?: HTMLElement | null;
  readOnlyPreview?: boolean;
  readOnlyPreviewReason?: string;
}

export function configureStudioEmbedding(options: StudioAppProps) {
  configureStudioApiBaseUrl(options.apiBaseUrl);
  configureStudioPortalContainer(options.portalContainer);
  return {
    explicitProjectId: options.projectId,
    readOnlyPreview: options.readOnlyPreview ?? false,
    readOnlyPreviewReason: options.readOnlyPreviewReason,
  };
}
