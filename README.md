# Fab Obsidian Theme

A quiet, focused Obsidian theme based on [Minimal](https://github.com/kepano/obsidian-minimal) by Steph Ango, with a small Fab design layer inspired by [gists.sh](https://gists.sh) and Vercel.

- Minimal's current Obsidian and plugin compatibility
- Geist + Geist Mono typography
- Compact, subdued note and tab titles
- Restrained document chrome, polished command surfaces, and comfortable reading width
- Small custom layer that is easy to rebase onto future Minimal releases

## Setup

Clone the repo, create a real `Fab` theme directory, and symlink the two files Obsidian loads:

```bash
git clone https://github.com/linuz90/fab-obsidian-theme.git ~/Code/fab-obsidian-theme
mkdir -p "/path/to/vault/.obsidian/themes/Fab"
ln -s ~/Code/fab-obsidian-theme/manifest.json "/path/to/vault/.obsidian/themes/Fab/manifest.json"
ln -s ~/Code/fab-obsidian-theme/theme.css "/path/to/vault/.obsidian/themes/Fab/theme.css"
```

Then in Obsidian: Settings > Appearance > Themes > select **Fab**.

If Fab is not listed after installation, fully restart Obsidian so it rescans theme manifests.

The real `Fab` directory lets Obsidian discover it as a normal theme while edits still flow through the file symlinks.

Edit `src/fab.css`, run `scripts/build-theme`, then reload Obsidian with `Cmd+R`. Changes to `manifest.json` require a full restart.

Update to the latest Minimal with `scripts/update-minimal`. Pass a tag or branch to pin a specific upstream revision. The updater also keeps Fab's minimum Obsidian version aligned with Minimal.

Fab's own version is independent of Minimal. Bump `manifest.json` when publishing a new Fab release.

## Reference

`upstream/minimal.css` is the pinned Minimal base. See [UPSTREAM.md](UPSTREAM.md) and [LICENSE-Minimal](LICENSE-Minimal).

Built following the official [Obsidian theme development guide](https://docs.obsidian.md/Themes/App+themes/Build+a+theme).
