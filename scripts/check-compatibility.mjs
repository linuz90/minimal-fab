import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import postcss from "postcss";
import selectorParser from "postcss-selector-parser";

const themeRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceCss = fs.readFileSync(path.join(themeRoot, "upstream/minimal.css"), "utf8");
const builtCss = fs.readFileSync(path.join(themeRoot, "theme.css"), "utf8");
const sourceRoot = postcss.parse(sourceCss);
const builtRoot = postcss.parse(builtCss);
// Mirrors every CSS-facing option exposed by Minimal Theme Settings 9.0.0.
const minimalThemeSettingsVersion = "9.0.0";

const requiredPaletteProperties = [
  "--bg1",
  "--bg2",
  "--bg3",
  "--ui1",
  "--ui2",
  "--ui3",
  "--tx1",
  "--tx2",
  "--tx3",
  "--tx4",
];

function paletteFor(selector) {
  const properties = new Map();
  builtRoot.walkRules((rule) => {
    if (!rule.selectors.includes(selector)) return;
    rule.walkDecls((declaration) => {
      if (requiredPaletteProperties.includes(declaration.prop)) {
        properties.set(declaration.prop, declaration.value);
      }
    });
  });
  return properties;
}

for (const { baseSelector, pluginSelector } of [
  {
    baseSelector: ".theme-light",
    pluginSelector: ".theme-light.minimal-default-light",
  },
  {
    baseSelector: ".theme-dark",
    pluginSelector: ".theme-dark.minimal-default-dark:not(.minimal-dark-black)",
  },
]) {
  const basePalette = paletteFor(baseSelector);
  const pluginPalette = paletteFor(pluginSelector);
  const missing = requiredPaletteProperties.filter((property) => !pluginPalette.has(property));
  if (missing.length) {
    throw new Error(
      `${pluginSelector} no longer preserves the mnml palette: ${missing.join(", ")}`,
    );
  }

  const changed = requiredPaletteProperties.filter(
    (property) => pluginPalette.get(property) !== basePalette.get(property),
  );
  if (changed.length) {
    throw new Error(
      `${pluginSelector} differs from ${baseSelector}: ${changed.join(", ")}`,
    );
  }
}

const settingsComments = (root) => {
  const comments = [];
  root.walkComments((comment) => {
    if (comment.text.trimStart().startsWith("@settings")) {
      comments.push(comment.text.trim().replaceAll("\r\n", "\n"));
    }
  });
  return comments;
};

const sourceSettings = settingsComments(sourceRoot);
const builtSettings = settingsComments(builtRoot);
if (JSON.stringify(builtSettings) !== JSON.stringify(sourceSettings)) {
  throw new Error("Generated CSS no longer preserves Minimal's Style Settings metadata exactly");
}

const selectorClasses = new Set();
builtRoot.walkRules((rule) => {
  for (const selector of rule.selectors) {
    selectorParser((selectors) => {
      selectors.walkClasses((classNode) => selectorClasses.add(classNode.value));
    }).processSync(selector);
  }
});
const minimalThemeSettingsClassContracts = [
  "borders-none",
  "chart-100",
  "chart-max",
  "chart-wide",
  "colorful-active",
  "colorful-frame",
  "colorful-headings",
  "full-file-names",
  "full-width-media",
  "iframe-100",
  "iframe-max",
  "iframe-wide",
  "img-grid",
  "img-100",
  "img-max",
  "img-wide",
  "labeled-nav",
  "links-ext-on",
  "links-int-on",
  "map-100",
  "map-max",
  "map-wide",
  "minimal-atom-dark",
  "minimal-atom-light",
  "minimal-ayu-dark",
  "minimal-ayu-light",
  "minimal-catppuccin-dark",
  "minimal-catppuccin-light",
  "minimal-dark-black",
  "minimal-dark-tonal",
  "minimal-dracula-dark",
  "minimal-eink-dark",
  "minimal-eink-light",
  "minimal-everforest-dark",
  "minimal-everforest-light",
  "minimal-flexoki-dark",
  "minimal-flexoki-light",
  "minimal-focus-mode",
  "minimal-gruvbox-dark",
  "minimal-gruvbox-light",
  "minimal-light-contrast",
  "minimal-light-tonal",
  "minimal-light-white",
  "minimal-line-nums",
  "minimal-macos-dark",
  "minimal-macos-light",
  "minimal-nord-dark",
  "minimal-nord-light",
  "minimal-notion-dark",
  "minimal-notion-light",
  "minimal-rose-pine-dark",
  "minimal-rose-pine-light",
  "minimal-solarized-dark",
  "minimal-solarized-light",
  "minimal-status-off",
  "minimal-things-dark",
  "minimal-things-light",
  "table-100",
  "table-max",
  "table-wide",
];

const styleSettingsDefaultClassContracts = [
  "pdf-blend-light",
  "pdf-invert-dark",
  "sidebar-tabs-default",
  "trim-cols",
];

for (const { label, classNames } of [
  {
    label: "Minimal Theme Settings",
    classNames: minimalThemeSettingsClassContracts,
  },
  {
    label: "Style Settings defaults",
    classNames: styleSettingsDefaultClassContracts,
  },
]) {
  const missingClassContracts = classNames.filter(
    (className) => !selectorClasses.has(className),
  );
  if (missingClassContracts.length) {
    throw new Error(
      `Generated CSS lost ${label} class contracts: ${missingClassContracts.join(", ")}`,
    );
  }
}

console.log(
  `Compatibility checks passed: ${sourceSettings.length} Style Settings blocks, ${styleSettingsDefaultClassContracts.length} Style Settings default-class contracts, and ${minimalThemeSettingsClassContracts.length} Minimal Theme Settings ${minimalThemeSettingsVersion} class contracts.`,
);
