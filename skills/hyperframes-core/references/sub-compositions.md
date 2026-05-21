# Sub-Compositions

A sub-composition is a separate HTML file embedded in a host composition. HyperFrames loads it, seeks it independently, and composites the result into the host at `data-start`.

## Host Wiring

In the host composition, the sub-composition appears as a clip with `data-composition-src`:

```html
<div
  id="chart"
  data-composition-id="data-chart"
  data-composition-src="compositions/data-chart.html"
  data-start="2"
  data-duration="8"
  data-track-index="2"
  data-width="1920"
  data-height="1080"
></div>
```

- `data-composition-id` on the host must match the internal `data-composition-id` of the file at `data-composition-src`.
- The host clip needs its own `data-start`, `data-duration`, `data-track-index`, `data-width`, `data-height`.

## Sub-Composition File Structure

Sub-composition files use a `<template>` wrapper because they are loaded into a host, not standalone-rendered. The content that HyperFrames mounts is the template payload, so put scene-critical CSS and timeline registration inside the template. Do not rely on `<head><style>` for scene layout.

```html
<template id="data-chart-template">
  <div
    id="root"
    data-composition-id="data-chart"
    data-width="1920"
    data-height="1080"
    data-duration="8"
    style="position:relative; width:1920px; height:1080px; overflow:hidden;"
  >
    <style>
      #data-chart-root,
      #data-chart-root *,
      #data-chart-root *::before,
      #data-chart-root *::after {
        box-sizing: border-box;
      }

      #data-chart-root {
        position: absolute;
        inset: 0;
        overflow: hidden;
      }

      #data-chart-root .stage {
        position: absolute;
        inset: 0;
      }
    </style>

    <div id="data-chart-root">
      <section class="stage clip" data-start="0" data-duration="8" data-track-index="1">
        <!-- sub-composition content -->
      </section>
    </div>

    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });
      // ... build timeline ...
      window.__timelines["data-chart"] = tl;
    </script>
  </div>
</template>
```

Contrast with **standalone** compositions, which put the root directly in `<body>` with no `<template>` wrapper.

### Agent Authoring Contract

When writing a scene file under `compositions/scene_*.html`, use this structure exactly unless a project-specific framework skill says otherwise:

- Use `<template>` for the sub-composition. Never wrap the top-level `index.html` in `<template>`.
- Use an outer composition root with `id="root"` plus `data-composition-id`, `data-width`, `data-height`, and `data-duration`.
- Put a scene-specific visual root inside it, e.g. `id="scene-3-root"` or `id="scene_3-root"`, with `position:absolute; inset:0; overflow:hidden`.
- Put the scene `<style>` block inside the outer root, before the visual DOM. Scope every selector to the scene visual root. Do not write unscoped selectors such as `.stage`, `.cta`, `.card`, `body`, `html`, or `:root` for scene styling.
- Put the GSAP timeline `<script>` inside the outer root, after the visual DOM, before `</div></template>`.
- Keep external library `<script src="...">` tags in `<head>` if needed, but do not put scene layout CSS in `<head>`.
- Register `window.__timelines["<composition-id>"]` with a key that exactly matches the root `data-composition-id`.
- Do not add narration, voice, or BGM `<audio>` inside worker-authored scene files when the parent host owns audio. In multi-scene videos, put all audio in `index.html` unless the build prompt explicitly says this scene is standalone.

### Failure Mode This Prevents

If CSS lives in `<head>` or the timeline script sits after `</template>`, lint may only report a narrow issue such as `missing_timeline_registry`, or it may pass after the script is moved. The render can still be wrong: unstyled scene DOM flows below the 1920x1080 canvas, and `inspect` reports text at `top: 2160`, `top: 3240`, or similar off-canvas positions. Treat that as a sub-composition structure bug, not as a font-size or copy-length problem.

## What HyperFrames Does With the Sub-Composition

- Loads the file and registers its timeline under its internal `data-composition-id`.
- Seeks the sub-composition's timeline independently from the host's playhead.
- Plays the sub-composition's content from `data-start` of the host clip, for `data-duration` seconds.

**Do not** manually `master.add(child)` a sub-composition timeline into the host timeline. HyperFrames already drives them independently — nesting them in GSAP causes double-seeks.

## Animations Inside Sub-Compositions

Prefer `gsap.fromTo()` over `gsap.from()` for entrance tweens. The host re-seeks the sub-composition every time its clip becomes visible; `gsap.from()` records the starting state at registration and can desync on seek-back, while `gsap.fromTo()` declares both endpoints explicitly and replays cleanly.

## Per-Instance Variables

If the sub-composition declares variables on its `<html>` element (`data-composition-variables`), the host can override values per instance:

```html
<div
  data-composition-id="data-chart"
  data-composition-src="compositions/data-chart.html"
  data-variable-values='{"title":"Q4 Revenue","accent":"#66d9ef"}'
  data-start="2"
  data-duration="8"
  data-track-index="2"
  data-width="1920"
  data-height="1080"
></div>
```

The host can render the same sub-composition multiple times with different `data-variable-values` to produce per-instance variations. See `variables-and-media.md` for variable declaration syntax.
