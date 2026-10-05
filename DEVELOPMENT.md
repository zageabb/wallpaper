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
### DEV-001 — Interactive base editor [COMPLETE]
Evidence of completion:
- Browser app loads without build tooling.
- User can load a local PNG/JPG as the fixed background.
- Click-to-place SVG route editor.
- Routes can be blue or gold, renamed, undone, deleted and saved to JSON.
- Existing routes can be reopened for editing; control points can be dragged or individually deleted.
- Preview mode animates flow without changing the background.

### DEV-002 — Flow rendering [COMPLETE]
- [x] Multi-pass glow around paths.
- [x] Moving light packets/particles rather than only dashed lines.
- [x] Direction, speed, width and brightness controls.
- [x] Multiple independently timed paths.
- [x] Explicit route phase/start-time control.
- [x] Seamless deterministic 15-second preview loop.
- [x] One-way causal packet travel from route start to destination.
- [x] Boundary-safe route timing with dormant tail before loop reset.

### DEV-003 — Reactive scene overlays [IN PROGRESS]
- [x] Four-corner perspective region editor to register dormant screen/panel surfaces.
- [x] Define standalone pulse points by clicking the image.
- [x] AI/network region pulses.
- [x] Dashboard/KPI overlay regions.
- [x] Build active information entirely as overlays rather than relying on information baked into the base.
- [x] Initial bar, line and numeric KPI renderers.
- [x] Area, donut and map-hotspot renderers.
- [x] Perspective-project KPI/graph overlays into four-corner screen geometry.
- [x] Per-overlay wake/sleep transitions.
- [x] Trigger overlays when a flow reaches a destination.
- [x] Stable route IDs prevent linked screen regions shifting when routes are deleted.
- [x] Return configured overlays to dormant state before the loop boundary.

### DEV-004 — Timeline
- [x] 15-second default loop.
- Sequence editor for document → system → analytics → AI → return.
- [x] Scrubber and pause.
- [x] Frame stepping and loop-boundary verification.
- [x] Validate four-corner regions, trigger-route references and wake/sleep windows.

### DEV-005 — Export
- Browser recording to WebM.
- Deterministic frame capture.
- Document MP4/GIF conversion workflow.
- Preserve source resolution/aspect ratio.

### DEV-006 — Usability
- [x] Project JSON import/export.
- [x] Autosave in browser storage.
- [x] Route visibility/lock controls.
- [ ] Background dimming preview.
- [ ] Presets for subtle Teams wallpaper animation.

## Route visibility and lock controls [COMPLETE]
Scope:
- Allow each completed route to be independently hidden/shown without deleting it.
- Allow a route to be locked so its control points cannot be accidentally moved or deleted while tracing other elements.
- Preserve visibility and lock state in project JSON/autosave.
Acceptance/evidence:
- Route list exposes visible/hidden and locked/unlocked controls.
- Hidden routes and their packets/handles do not render in the editor/preview.
- Locked routes cannot enter point editing and their control points cannot be dragged or deleted.
- Visibility/lock state is included in JSON/autosave, with safe defaults for older projects.
- Implementation commit `41a5a22`; GitHub Actions run `37379154047` completed successfully.

## Route timing and speed semantics [COMPLETE]
Scope:
- Make the route Speed control visibly affect packet travel while keeping route-triggered screen wake-up causal.
- Ensure every packet completes before the configured route arrival/end boundary.
- Keep a dormant tail before the 15-second loop reset.
- Clarify timing labels so users can predict when electricity reaches a destination.
Acceptance/evidence:
- Speed now changes deterministic route travel time and route-triggered overlay arrival.
- Packet staggering is normalised so all packets complete by the route arrival boundary.
- Loop verification uses speed-adjusted travel and preserves the dormant tail.
- Hidden-route rendering and route deletion handling were hardened during implementation.
- Implementation commit `dcd173f`; GitHub Actions run `37379931921` completed successfully.

## HOTFIX — Pulse-point interaction [PLANNED]
Reported behaviour: pulse points do not appear to work in the current editor.
Scope:
- Reproduce from source flow and fix pulse placement/rendering interaction before continuing background dimming.
- Ensure a placed pulse marker remains addressable by the pulse renderer and visibly animates during its configured window.
- Preserve route editing and pulse deletion behaviour.
Acceptance/evidence target:
- Add pulse → click stage → pulse appears in list and marker is visible.
- Scrubbing/previewing through its active window shows deterministic expanding pulse rings.
- Route particles/handles cannot corrupt pulse selection/rendering.
- CI is green.

## NEXT — Background dimming preview [PLANNED]
Scope:
- Add an editor-only background dimming control to make routes, handles, regions and pulse points easier to trace over bright artwork.
- Dimming must not alter the source image, project animation output or exported frames.
- Allow quick return to normal brightness.
Acceptance/evidence target:
- Editor exposes a background dim amount with immediate visual feedback.
- Preview/output rendering remains based on the unmodified source image.
- Dimming is treated as an editor preference rather than animation content.
- CI is green.

## Current testing milestone
The editor is approaching its first manual testing milestone. Before declaring it ready, complete the remaining high-value editor work needed to exercise the deterministic overlay model end-to-end:
- [x] Standalone pulse-point editor.
- [x] Autosave/recovery for local projects.
- [x] Route visibility/lock controls for practical tracing.
- [ ] Manual browser test of perspective screens, route-triggered wake-up, scrub/frame-step, loop verification and JSON round-trip.
- [ ] Record first-test instructions and known limitations; video export is not required for the first interactive test milestone.

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


## Recent evidence
- Perspective four-corner screen regions implemented and projected overlays follow panel geometry.
- Causal route arrival and loop-boundary timing implemented.
- Stable route/region IDs and legacy JSON migration implemented.
- Validation hardening implemented in `500a8b3`; GitHub Actions run `37320210773` completed successfully.


## Development workflow rule
Before starting each new development item, update this `DEVELOPMENT.md` first so the intended change, scope and acceptance/evidence target are recorded before implementation begins. After implementation, update the same item with completion status and verification evidence. Do not begin the next development item until the documentation reflects the current state.
