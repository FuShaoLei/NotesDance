# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a minimal Vue 3 + Vite template project designed for GitHub Pages deployment. The project uses:
- Vue 3 (Composition API with `<script setup>`)
- Vite for build tooling and dev server
- Vue DevTools plugin for development

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start development server with hot-reload
npm run build        # Build for production (outputs to ./dist)
npm run preview      # Preview production build locally
```

**Node version requirement:** `^20.19.0 || >=22.12.0`

## Project Structure

```
src/
├── main.js      # Entry point - creates and mounts Vue app
└── App.vue      # Root component
```

- **`@` alias** maps to `./src` (configured in both `vite.config.js` and `jsconfig.json`)
- Environment variables are loaded from `.env` and prefixed with `VITE_`

## Configuration for GitHub Pages Deployment

The project is configured to deploy to GitHub Pages via GitHub Actions. To set up:

1. **Update `.env`:**
   - `VITE_APP_TITLE` - Sets the HTML page title
   - `VITE_PUBLISH_PATH` - Must match your GitHub Pages path (e.g., `/NotesDance/` for `https://username.github.io/NotesDance/`)

2. **GitHub Actions workflow** (`.github/workflows/fuck.yml`):
   - Triggers on push to `master` branch
   - Uses Node 20, runs `npm ci`, `npm run build`
   - Deploys `./dist` folder to GitHub Pages

3. **GitHub Settings:**
   - Go to Settings → Pages
   - Set Source to **GitHub Actions** (not a branch)

## Vite Configuration

- `base` path is read from `VITE_PUBLISH_PATH` env variable for proper GitHub Pages deployment
- Vue plugin and Vue DevTools are enabled
- Path alias `@` points to `src/`
