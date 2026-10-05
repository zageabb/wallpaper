# Wallpaper Animation Studio — Development Plan

## Objective
Create a browser-based editor that turns a static 16:9 technology wallpaper into a subtle seamless animated wallpaper without regenerating the scene between frames.

## Core principle
The base image is immutable. Motion is produced by deterministic overlays so buildings, dashboards and composition remain pixel-perfect stationary.

## Architecture
1. Static base image layer.
2. SVG overlay for editable electricity/data-flow paths.
3. Canvas overlay for particles, glows and pulses.
4. Optional KPI/graph overlays.
5. Timeline/loop controller.
6. Export pipeline for WebM/MP4/GIF.

## Development stages
### DEV-001 — Interactive base editor [IN PROGRESS]
Evidence of completion:
- Browser app loads without build tooling.
- User can load a local PNG/JPG as the fixed background.
- Click-to-place SVG route editor.
- Routes can be blue or gold, renamed, undone, deleted and saved to JSON.
- Preview mode animates flow without changing the background.

### DEV-002 — Flow rendering
- Multi-pass glow around paths.
- Moving light packets/particles rather than only dashed lines.
- Direction, speed, width, brightness and phase controls.
- Multiple independently timed paths.
- Seamless deterministic loop.

### DEV-003 — Reactive scene overlays
- Region editor to register dormant screen/panel bounds.
- Define pulse points by clicking the image.
- AI/network node pulses.
- Dashboard/KPI overlay regions.
- Build active information entirely as overlays rather than relying on information baked into the base.
- Bar, line, area, donut, numeric KPI and map-hotspot renderers.
- Per-overlay opacity/brightness and wake/sleep transitions.
- Trigger overlays when a flow reaches a destination.
- Return overlays to the exact dormant state before the loop boundary.

### DEV-004 — Timeline
- 15-second default loop.
- Sequence editor for document → system → analytics → AI → return.
- Scrubber, pause, frame stepping and loop-boundary verification.

### DEV-005 — Export
- Browser recording to WebM.
- Deterministic frame capture.
- Document MP4/GIF conversion workflow.
- Preserve source resolution/aspect ratio.

### DEV-006 — Usability
- Project JSON import/export.
- Autosave in browser storage.
- Route visibility/lock controls.
- Background dimming preview.
- Presets for subtle Teams wallpaper animation.

## Base artwork requirement
Use a deliberately dormant/static source scene. The base should contain the physical environment and display hardware only: buildings, circuitry, screen/panel surfaces, processor structures and normal low-level ambient illumination.

The base should NOT bake in active information or activity:
- no bright travelling electricity or highlighted data-flow trails;
- no populated KPI values;
- no active bar/line/area graphs;
- no illuminated donut/pie values;
- no active map hotspots or data markers;
- no strongly illuminated AI/network nodes;
- no transient documents/data particles intended to move.

Dashboard and KPI screens should remain present as believable dark/inactive glass or low-level UI frames, so animated detail can be registered precisely over them.

All active content is added progressively as deterministic overlays. This allows electricity to reach a system and then cause its screen, KPI, graph or AI node to wake up, update and later return to dormant state.

## Acceptance criteria
A successful output has no camera movement, no geometry morphing, no AI-redrawn frames and no background flicker. The base contains no active KPI/graph/data state. Only intentionally configured overlays provide electricity, information, KPI/graph activity, particles and AI/network activity.
