# Publishing Minimal Fab

Minimal Fab is public on GitHub, but submission to Obsidian's Community Directory still has policy and scanner dependencies because the repository includes Minimal's source.

## Community Directory policy blocker

Obsidian's current [Developer policies](https://docs.obsidian.md/community-directory/developer-policies) do not accept forks unless the fork has explicit written approval from the original author in a publicly verifiable place. Minimal Fab vendors a pinned copy of Minimal and builds on it directly, so it is likely to be reviewed as a Minimal fork even though Minimal's MIT license legally permits redistribution and modification.

Before submitting, do one of the following:

1. Get public written approval from Steph Ango for Minimal Fab to be listed as a Minimal-based theme, then link that approval in the submission or README and credit Steph as a contributor in the Community Directory.
2. Rebuild Minimal Fab as a standalone theme that contains no inherited Minimal source. Preserve the visual design, but start the CSS base fresh against Obsidian's public variables and core styles.

Do not describe the project as independent of Minimal while it still vendors Minimal's CSS.

Minimal's own README explicitly permits distributing forks, recommends GitHub's fork mechanism, and asks forks to retain Steph's [Buy Me a Coffee](https://www.buymeacoffee.com/kepano) link. The Community Directory policy may still require project-specific approval, so obtain an unambiguous public confirmation before submission.

## Permission request

Ask **Steph Ango (`@kepano`)**, the author and maintainer of Minimal. A public affirmative reply from `@kepano` to an X post, or an affirmative reply in [kepano/obsidian-minimal](https://github.com/kepano/obsidian-minimal/issues), gives the directory reviewers a verifiable approval link. The [Minimal channel](https://discord.com/channels/686053708261228577/931008597557649410) in the official Obsidian Discord is a good fallback, but preserve a public link or screenshot of any approval.

Suggested request:

> Hey @kepano! I made Minimal Fab, my more native/Codex-ish macOS fork of Minimal, with a cleaner palette and quieter details. Would you be ok with me submitting it to Obsidian's Community Theme directory? https://github.com/linuz90/minimal-fab

Do not submit until the answer is public and clearly affirmative.

Once the entry exists, add Steph as a contributor in the Community Directory, link the approval in the README, and provide it during review if requested. README attribution alone does not replace the directory's contributor-credit requirement.

## Official CSS scanner

Obsidian's official [`stylelint-config-obsidianmd`](https://github.com/obsidianmd/stylelint-config) uses the same blocking rules as the Community Directory scanner. Run it against the final distributable `theme.css` before creating a release; warning-severity findings are advisory, but error-severity findings block submission.

As of 2026-08-19, Minimal Fab's own override layer has no error-severity findings, but the compiled theme still inherits blocking findings from Minimal 9.0.2, which predates the official scanner. Do not create the `2.1.0` release or submit the theme until one of these is true:

1. Minimal publishes a lint-clean upstream revision and Minimal Fab updates to it.
2. The inherited CSS is normalized without breaking the fork's behaviour or update path.
3. Obsidian's directory reviewers confirm an accepted path after reviewing the branch scan.

Do not disable scanner rules to hide errors; the directory review checks the distributable independently.

## Name

The directory-facing name is **Minimal Fab**. Obsidian's [manifest rules](https://docs.obsidian.md/Reference/Manifest#name) prohibit “Obsidian”, “Theme”, and related variants in theme names, and a theme name cannot change after submission. Minimal Fab was not present in the active or removed theme registries when checked on 2026-08-19; recheck before the initial release.

## Initial submission checklist

1. Confirm `linuz90/minimal-fab` is public.
2. Resolve the fork-policy requirement above.
3. Resolve every error-severity finding from the official CSS scanner.
4. Confirm the default branch contains `README.md`, `LICENSE`, `manifest.json`, `theme.css`, `versions.json`, and both screenshots.
5. Check that `manifest.json` has the final name, semantic version, minimum Obsidian version, and author details.
6. Test both light and dark modes on the minimum supported Obsidian version and the current stable version.
7. Create a GitHub release whose tag exactly matches the `version` in `manifest.json` without a `v` prefix, for example `2.1.0`.
8. Attach `manifest.json` and `theme.css` to that release as binary release assets. Committing them to the repository is not enough.
9. Sign in at [community.obsidian.md](https://community.obsidian.md), connect the GitHub account, open **Themes**, and select **New theme**.
10. Submit the repository URL, use the optimized 512×288 `screenshots/minimal-fab-store.png` as the screenshot path, and select both Light and Dark as supported modes.
11. Accept the developer policies and address any automated review feedback. If a fix changes the release, bump the manifest version and publish a matching new release.

The official process is documented in [Submit your theme](https://docs.obsidian.md/themes/app-themes/submit-theme). The directory reads `manifest.json` from the default branch, but installs `manifest.json` and `theme.css` from the matching GitHub release.

## Updates after acceptance

The initial version is the only one submitted through the directory form. For later updates, bump `manifest.json`, rebuild `theme.css`, create a matching GitHub release, and attach both distributable files. Obsidian will offer the update automatically.
