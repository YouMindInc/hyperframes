# YouMind Studio embedding

Upstream baseline: v0.8.55 (96369c8acd8ea820340d2f377fff003b48659878).

The fork retains the upstream UI and adds host integration:

- `StudioApp({ apiBaseUrl, projectId, portalContainer })` supports a mounted API,
  explicit workspace-relative projects, and scoped floating menus.
- Explicit projects do not read/write the host's location hash.
- All Studio API requests, including new write/version, media, render and event
  routes, honor the API base.
- Nested project IDs are one encoded route segment. Empty, absolute and parent
  traversal segments remain invalid. Server file routing does not infer file
  paths by comparing an encoded project name with Hono's decoded path.
- Runtime preview URLs are normalized to project-relative composition sources.
- Studio Server accepts `adapter.apiBaseUrl` for preview and thumbnail URLs.

Build with Bun. Run Studio tests with its Vitest script, not `bun test`.
YouComputer's `scripts/publish-hyperframes-runtime.mjs` packages both Studio and
Studio Server under `@youmindinc`, with pinned public dependencies and generated
types. It generates a scoped `embed.css` from the upstream compiled stylesheet.
YouComputer release jobs install these fixed packages; they do not clone a
moving fork branch. Electron export rendering remains a separate host feature.
