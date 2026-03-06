# Fab Obsidian Theme — Agent Guide

## What this is

A custom Obsidian theme. Source of truth lives in this repo (`~/Code/fab-obsidian-theme/`).

## Docs

Official theme development guide: https://docs.obsidian.md/Themes/App+themes/Build+a+theme

Key rules:
- All CSS goes in `theme.css` at the repo root
- `manifest.json` defines the theme name, version, and author
- The folder name inside `.obsidian/themes/` **must exactly match** the `name` field in `manifest.json`

## File structure

```
manifest.json   — Theme metadata (name must be "Fab")
theme.css       — All theme styles
README.md       — Project description
```

## Development workflow

The repo is symlinked into the Obsidian vault's themes directory:

```
{Vault}/.obsidian/themes/Fab -> ~/Code/fab-obsidian-theme
```

Edits to `theme.css` are picked up live — just reload Obsidian (Cmd+R) after saving. Changes to `manifest.json` require a full restart.

To use in a new vault, symlink the repo:

```bash
ln -s ~/Code/fab-obsidian-theme "/path/to/vault/.obsidian/themes/Fab"
```

## Design principles

- Vercel/gists.sh inspired: pure neutral palette, unified dark surfaces
- Geist (sans) + Geist Mono typography
- Antialiased text, generous line-height, tight heading tracking
- Ghost buttons, hairline link underlines, subtle borders
- No color noise — only blue for links, yellow for highlights
