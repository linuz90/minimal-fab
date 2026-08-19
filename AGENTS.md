# mnml — Agent Guide

## What this is

A custom Obsidian theme based on Minimal. Source of truth lives in this repo (`~/Code/obsidian-mnml/`).

## Docs

Official theme development guide: https://docs.obsidian.md/Themes/App+themes/Build+a+theme

Key rules:
- `upstream/minimal.css` is the pinned upstream base; do not edit it
- mnml changes go in `src/mnml.css`
- Run `pnpm install` once, then `pnpm build` after CSS changes; `theme.css` is generated and standards-normalized
- Run `pnpm check` before committing; it verifies generated-file drift and the official Obsidian Stylelint config
- `manifest.json` defines the theme name, version, and author
- The folder name inside `.obsidian/themes/` must exactly match the `name` field in `manifest.json`

## File structure

```
manifest.json          — Theme metadata (name must be "mnml")
versions.json          — Published theme version to minimum Obsidian mapping
theme.css              — Generated theme loaded by Obsidian
src/mnml.css           — mnml's design layer
upstream/minimal.css   — Pinned Minimal base
scripts/build-theme    — Rebuilds theme.css
scripts/check-theme    — Verifies theme.css matches its sources
scripts/normalize-theme.mjs — Produces scanner-compliant CSS without editing upstream
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
{Vault}/.obsidian/themes/mnml/manifest.json -> ~/Code/obsidian-mnml/manifest.json
{Vault}/.obsidian/themes/mnml/theme.css -> ~/Code/obsidian-mnml/theme.css
```

Run `pnpm build`, then reload Obsidian with Cmd+R. Changes to `manifest.json` require a full restart.

Run `scripts/update-minimal [tag-or-branch]` to update the pinned Minimal base. Review the upstream diff and the live theme before committing.

Minimal's version and mnml's version are independent. When publishing an update, bump `manifest.json` deliberately and add its compatibility mapping to `versions.json`; the updater only synchronizes `minAppVersion`.

To use in a new vault, symlink the repo:

```bash
mkdir -p "/path/to/vault/.obsidian/themes/mnml"
ln -s ~/Code/obsidian-mnml/manifest.json "/path/to/vault/.obsidian/themes/mnml/manifest.json"
ln -s ~/Code/obsidian-mnml/theme.css "/path/to/vault/.obsidian/themes/mnml/theme.css"
```

## Design principles

- Minimal owns Obsidian compatibility; keep mnml overrides small
- Keep the vendored upstream byte-exact; normalize only the generated distribution
- Vercel/gists.sh inspired: quiet, neutral, focused
- Native system typography
- Comfortable line-height, restrained headings, subdued file titles
- Reuse Minimal and Obsidian variables instead of hardcoded component colors
- Keep distributable CSS private and offline: Community Directory themes may not load runtime assets from the network
