let configuredPortalContainer: HTMLElement | null | undefined;

export function configureStudioPortalContainer(container?: HTMLElement | null): void {
  configuredPortalContainer = container;
}

export function getStudioPortalContainer(): HTMLElement | null | undefined {
  return configuredPortalContainer;
}
