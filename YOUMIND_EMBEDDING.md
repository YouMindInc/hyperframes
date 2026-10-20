# YouMind Studio embedding

Upstream baseline: v0.8.181 (ae02e5aceff4742e5d72c20f0859eb3e6b449035).

The fork retains the published UI and adds the host boundary:

- Optional `StudioApp({ apiBaseUrl, projectId, portalContainer })` selects an exact
  project without changing the parent route and keeps mounted API/resource URLs.
- Nested project IDs remain one encoded segment and reject absolute/traversal IDs.
- Server `adapter.apiBaseUrl` covers root, fallback, nested preview and thumbnail.
- Server `adapter.isPreviewAssetAllowed` lets a host constrain read-only symlink assets.
- New upstream file pinning, request path parsing, persistent history and theme remain intact.

Build with Bun and run package Vitest scripts. `scripts/publish-youmind-studio.mjs`
packages rebuilt Studio and Studio Server with generated declarations and scoped
CSS as immutable release tarballs. It does not modify the original dependencies.

`STORYBOARD.md` is the plan source. Current upstream renders its review board to
`boards/storyboard.html` with local still images; it is a separate project artifact.
