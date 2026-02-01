# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Marketing/demo website for **climp**, a CLI music player written in Go. The site features a fully functional web-based audio player with a retro CRT terminal aesthetic, multiple audio visualizers, and keyboard-driven controls.

Single-page static site deployed on Vercel.

## Commands

```bash
bun run dev       # Start Astro dev server
bun run build     # Production build
bun run preview   # Preview production build locally
```

Package manager is **Bun** (bun.lock).

## Tech Stack

- **Astro 5** — static site generator, configured for static output
- **React 19** — interactive player component
- **Tailwind CSS 4** — via Vite plugin (`@tailwindcss/vite`), theme defined with `@theme` in `src/styles/global.css`
- **TypeScript 5** — strict mode, extends `astro/tsconfigs/strict`
- **Vercel adapter** — deployment target

## Architecture

The site is a single page (`src/pages/index.astro`) with a base layout and several components:

**Player system** (`src/components/Player.tsx` + `src/components/player/`):
- `Player.tsx` — main React component orchestrating all player sub-components
- `useAudioEngine.ts` — custom hook wrapping Web Audio API (AudioContext, AnalyserNode, playback controls)
- `useKeyBindings.ts` — keyboard shortcuts (Space, arrows, vim keys h/j/k/l, V for visualizer, R for repeat)
- `Controls.tsx`, `ProgressBar.tsx`, `Visualizer.tsx` — UI sub-components
- `types.ts` — shared TypeScript interfaces (`AudioState`, `AudioControls`)

**Visualizers** (`src/components/player/visualizers/`):
Four canvas-based renderers at 30 FPS using real-time audio frequency data: `spectrum.ts`, `waveform.ts`, `braille.ts`, `matrix.ts`.

**Astro components** (`src/components/`):
- `InstallSection.astro` — tabbed install instructions with copy-to-clipboard
- `Footer.astro` — site footer

**Styling** (`src/styles/global.css`):
Custom Tailwind v4 theme with CRT screen effects (scanlines, curvature, vignette, phosphor glow). Green monochrome terminal color scheme. All custom theme tokens defined via `@theme` directive.

## Key Conventions

- Astro components for static content, React only for the interactive player
- Audio files served from `public/audio/`
- JetBrains Mono font from `public/fonts/`
- Accessibility: ARIA labels, live regions, prefers-reduced-motion support
- No linter or formatter configured
- No tests configured
