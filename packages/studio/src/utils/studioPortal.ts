let container: HTMLElement | null = null;

/** Hosts keep floating menus inside the same scoped theme as the Studio. */
export function configureStudioPortalContainer(next?: HTMLElement | null): void {
  container = next ?? null;
}

export function getStudioPortalContainer(): HTMLElement {
  return container ?? document.body;
}
