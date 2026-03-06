# Fab Obsidian Theme

A minimal, clean Obsidian theme inspired by [gists.sh](https://gists.sh) and Vercel's design language.

- Pure neutral palette — no visual noise
- Geist + Geist Mono typography
- Unified dark surfaces
- Subtle borders, ghost buttons, hairline link underlines
- Antialiased text rendering

## Setup

Clone the repo and symlink it into your vault's themes directory. The folder name **must** be `Fab` (matching the `name` in `manifest.json`):

```bash
git clone https://github.com/linuz90/fab-obsidian-theme.git ~/Code/fab-obsidian-theme
ln -s ~/Code/fab-obsidian-theme "/path/to/vault/.obsidian/themes/Fab"
```

Then in Obsidian: Settings > Appearance > Themes > select **Fab**.

Edits to `theme.css` are picked up on reload (Cmd+R). Changes to `manifest.json` require a full restart.

## Reference

Built following the official [Obsidian theme development guide](https://docs.obsidian.md/Themes/App+themes/Build+a+theme).
