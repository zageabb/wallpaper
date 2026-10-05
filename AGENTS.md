# AGENTS.md

## Mission
Develop Wallpaper Animation Studio as a deterministic overlay animation tool.

## Non-negotiable product rules
- Never animate, regenerate or transform the background image during playback.
- Treat the base image as a dormant physical scene: display hardware may exist, but active KPI values, graphs, map markers, data-flow highlights and AI activity belong in overlays.
- Never solve an overlay feature by baking its active state back into the base artwork.
- Prefer SVG for user-authored geometry and Canvas/CSS for effects.
- Coordinates must be stored normalized (0..1) so projects survive resolution changes.
- Preview and export must use the same animation timing model.
- Default output target is a subtle 15-second seamless 16:9 loop.
- Do not add a framework unless it solves a demonstrated need.
- Keep project data portable as JSON.
- Preserve undoability for editor operations.

## Autonomous development
Continue autonomously until:
1. the current objective is complete and verified;
2. a genuinely ambiguous product decision is required;
3. progress is blocked by something outside the repo; or
4. continuing would risk destructive changes.

Do not stop merely because one implementation step has completed.

## Evidence
Update DEVELOPMENT.md as objectives progress. A feature is complete only when its behavior can be demonstrated from the source of truth, not merely because code exists.
