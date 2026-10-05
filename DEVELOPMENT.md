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
- Define pulse points by clicking the image.
- AI/network node pulses.
- Dashboard/KPI overlay regions.
- Simple bar, line and donut animation.
- Trigger overlays when a flow reaches a destination.

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
Prefer a dormant/static source image with the same visual scene but minimal bright electricity/highlight trails. Normal environmental illumination remains. Animation overlays restore the bright blue/gold flows, making masking and alignment substantially easier.

## Acceptance criteria
A successful output has no camera movement, no geometry morphing, no AI-redrawn frames and no background flicker. Only intentionally configured overlays move.
