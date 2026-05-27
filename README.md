# markdown-review

I created this minimal markdown online preview project with GitHub-flavored rendering.

## Environment Info

- Authoring agent: Codex
- Model used: GPT-5 (Codex coding agent runtime)
- App runtime: Codex CLI

## Online

- Live URL: [https://markdown.acexy.cn](https://markdown.acexy.cn)

## Features

- I implemented real-time preview while typing
- I integrated GFM parsing (`marked`)
- I added HTML sanitization (`DOMPurify`)
- I enabled code syntax highlighting (`highlight.js`)
- I designed CDN-first loading with automatic local fallback
- I added local storage persistence
- I provided sample / clear / copy markdown actions
- I made the layout responsive for desktop and mobile

## Quick Start

1. Open `index.html` directly in a browser.
2. Type markdown in the left editor panel.
3. View rendered results in the right preview panel.

## Project Structure

- `index.html`: page skeleton and UI structure
- `bootstrap.js`: CDN-first loader with local fallback
- `style.css`: layout and visual styles
- `app.js`: markdown rendering and interactions
- `public/vendor`: local vendor assets for offline/fallback usage

## Notes

- I built this as a static frontend implementation.
- No build tool or install step is required to run it.
