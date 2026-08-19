# Minimal Fab — Agent Guide

## What this is

A custom Obsidian theme based on Minimal. Source of truth lives in this repo (`~/Code/minimal-fab/`).

## Docs

Official theme development guide: https://docs.obsidian.md/Themes/App+themes/Build+a+theme

Key rules:
- `upstream/minimal.css` is the pinned upstream base; do not edit it
- Minimal Fab changes go in `src/fab.css`
- Run `scripts/build-theme` after CSS changes; `theme.css` is generated
- `manifest.json` defines the theme name, version, and author
- The folder name inside `.obsidian/themes/` must exactly match the `name` field in `manifest.json`

## File structure

```
manifest.json          — Theme metadata (name must be "Minimal Fab")
theme.css              — Generated theme loaded by Obsidian
src/fab.css            — Minimal Fab's design layer
upstream/minimal.css   — Pinned Minimal base
scripts/build-theme    — Rebuilds theme.css
scripts/update-minimal — Fetches Minimal and rebuilds the theme
UPSTREAM.md            — Minimal version and update notes
LICENSE-Minimal        — Upstream MIT license
README.md              — Project description
PUBLISHING.md          — Release and Community Directory checklist
screenshots/           — Public preview assets
```

## Development workflow

Use a real theme directory containing file symlinks so Obsidian discovers it as a normal theme folder:

```
{Vault}/.obsidian/themes/Minimal Fab/manifest.json -> ~/Code/minimal-fab/manifest.json
{Vault}/.obsidian/themes/Minimal Fab/theme.css -> ~/Code/minimal-fab/theme.css
```

Run `scripts/build-theme`, then reload Obsidian with Cmd+R. Changes to `manifest.json` require a full restart.

Run `scripts/update-minimal [tag-or-branch]` to update the pinned Minimal base. Review the upstream diff and the live theme before committing.

Minimal's version and Minimal Fab's version are independent. When publishing an update, bump `manifest.json` deliberately; the updater only synchronizes `minAppVersion`.

To use in a new vault, symlink the repo:

```bash
mkdir -p "/path/to/vault/.obsidian/themes/Minimal Fab"
ln -s ~/Code/minimal-fab/manifest.json "/path/to/vault/.obsidian/themes/Minimal Fab/manifest.json"
ln -s ~/Code/minimal-fab/theme.css "/path/to/vault/.obsidian/themes/Minimal Fab/theme.css"
```

## Design principles

- Minimal owns Obsidian compatibility; keep Minimal Fab overrides small
- Vercel/gists.sh inspired: quiet, neutral, focused
- Geist (sans) + Geist Mono typography
- Comfortable line-height, restrained headings, subdued file titles
- Reuse Minimal and Obsidian variables instead of hardcoded component colors
- Keep distributable CSS private and offline: Community Directory themes may not load runtime assets from the network
