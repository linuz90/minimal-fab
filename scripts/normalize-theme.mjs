import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { compare, selectorSpecificity } from "@csstools/selector-specificity";
import postcss from "postcss";
import selectorParser from "postcss-selector-parser";
import stylelint from "stylelint";
import obsidianConfig from "stylelint-config-obsidianmd";

const inputPath = process.argv[2];
const outputPath = process.argv[3];

if (!inputPath || !outputPath) {
  console.error("Usage: normalize-theme.mjs <input.css> <output.css>");
  process.exit(1);
}

const themeRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let css = fs.readFileSync(inputPath, "utf8").replaceAll("\r\n", "\n");

// Minimal still carries a legacy WebKit query which Stylelint would only
// half-modernize. Resolution is the standards-based equivalent in Electron.
css = css.replace(
  /only screen and \(-webkit-min-device-pixel-ratio:\s*([0-9.]+)\),\s*only screen and \(min-device-pixel-ratio:\s*\1\)/g,
  "(resolution >= $1dppx)",
);

// Quoting family names preserves their canonical spelling through Stylelint.
css = css.replace(
  /-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Inter,Ubuntu,sans-serif/g,
  '-apple-system, "BlinkMacSystemFont", "Segoe UI", "Roboto", "Inter", "Ubuntu", sans-serif',
);

const firstPass = await stylelint.lint({
  code: css,
  config: obsidianConfig,
  configBasedir: themeRoot,
  fix: true,
});
css = firstPass.code;
const analysisPass = await stylelint.lint({
  code: css,
  config: obsidianConfig,
  configBasedir: themeRoot,
});

const invalidClassNames = new Set();
const invalidIdNames = new Set();

for (const warning of analysisPass.results.flatMap((result) => result.warnings)) {
  if (warning.rule === "selector-class-pattern") {
    const match = warning.text.match(/Expected class selector "\.([^"]+)"/);
    if (match) invalidClassNames.add(match[1]);
  }

  if (warning.rule === "selector-id-pattern") {
    const match = warning.text.match(/Expected id selector "#([^"]+)"/);
    if (match) invalidIdNames.add(match[1]);
  }
}

const root = postcss.parse(css, { from: inputPath });
const namedColorLines = new Set(
  analysisPass.results
    .flatMap((result) => result.warnings)
    .filter((warning) => warning.rule === "color-named")
    .map((warning) => warning.line),
);

root.walkDecls((declaration) => {
  if (!namedColorLines.has(declaration.source?.start?.line)) return;

  declaration.value = declaration.value.replace(
    /(^|[^\w-])(white|black|blue)(?=$|[^\w-])/gi,
    (_, prefix, color) => `${prefix}${({ white: "#fff", black: "#000", blue: "#00f" })[color.toLowerCase()]}`,
  );
});

// Obsidian, CodeMirror, and plugins expose some camelCase class and ID names.
// Attribute selectors match the same elements while satisfying the directory
// scanner. The impossible :is() branch retains ID-level specificity exactly.
root.walkRules((rule) => {
  rule.selector = selectorParser((selectors) => {
    selectors.walkClasses((node) => {
      if (!invalidClassNames.has(node.value)) return;

      node.replaceWith(selectorParser.attribute({
        attribute: "class",
        operator: "~=",
        quoteMark: '"',
        value: node.value,
      }));
    });

    selectors.walkIds((node) => {
      if (!invalidIdNames.has(node.value)) return;

      const replacement = selectorParser().astSync(
        `:is([id="${node.value}"], #minimal-fab-never:not(*))`,
      ).nodes[0].nodes;
      node.replaceWith(...replacement);
    });
  }).processSync(rule.selector);
});

// Duplicate custom properties in one block are redundant. Keep the declaration
// that wins the cascade, including the uncommon earlier-!important case.
root.walkRules((rule) => {
  const declarationsByProperty = new Map();

  for (const node of rule.nodes ?? []) {
    if (node.type !== "decl" || !node.prop.startsWith("--")) continue;
    const declarations = declarationsByProperty.get(node.prop) ?? [];
    declarations.push(node);
    declarationsByProperty.set(node.prop, declarations);
  }

  for (const declarations of declarationsByProperty.values()) {
    if (declarations.length < 2) continue;
    const important = declarations.filter((declaration) => declaration.important);
    const winner = (important.length ? important : declarations).at(-1);

    for (const declaration of declarations) {
      if (declaration !== winner) declaration.remove();
    }
  }
});

const license = root.nodes.find(
  (node) => node.type === "comment" && node.text.includes("Minimal Theme for Obsidian"),
);
const settings = [];
root.walkComments((comment) => {
  if (comment.text.trimStart().startsWith("@settings")) settings.push(comment.clone());
});

const units = [];
let sourceOrder = 0;
let sourceRuleId = 0;

function addRule(rule, mediaParams = null) {
  const currentRuleId = sourceRuleId++;

  for (const selector of rule.selectors) {
    const selectorNode = selectorParser().astSync(selector).nodes[0];
    const specificity = selectorSpecificity(selectorNode);
    const clonedRule = rule.clone({ selector });
    let node = clonedRule;

    if (mediaParams) {
      node = postcss.atRule({ name: "media", params: mediaParams });
      node.append(clonedRule);
    }

    units.push({
      mediaParams,
      node,
      rule: clonedRule,
      sourceOrder: sourceOrder++,
      sourceRuleId: currentRuleId,
      specificity,
    });
  }
}

for (const node of root.nodes) {
  if (node.type === "rule") {
    addRule(node);
    continue;
  }

  if (node.type === "atrule" && node.name === "media") {
    for (const child of node.nodes ?? []) {
      if (child.type === "comment") continue;
      if (child.type !== "rule") {
        throw new Error(`Unsupported node inside @media: ${child.type}`);
      }
      addRule(child, node.params);
    }
    continue;
  }

  if (node.type === "atrule" && node.name !== "charset") {
    throw new Error(`Unsupported top-level at-rule: @${node.name}`);
  }
}

// Source order only decides a cascade tie. Sorting by specificity while keeping
// ties stable therefore removes descending-specificity errors without changing
// which declaration wins. Media rules are split into equivalent single-rule
// wrappers so the same ordering remains true whenever a query is active.
units.sort(
  (left, right) => compare(left.specificity, right.specificity) || left.sourceOrder - right.sourceOrder,
);

// Rejoin adjacent selectors from the same source rule when their specificity
// and media context match. This keeps the generated asset reasonably compact.
const mergedUnits = [];
for (const unit of units) {
  const previous = mergedUnits.at(-1);
  if (
    previous
    && previous.sourceRuleId === unit.sourceRuleId
    && previous.mediaParams === unit.mediaParams
    && compare(previous.specificity, unit.specificity) === 0
  ) {
    previous.rule.selector += `,\n${unit.rule.selector}`;
    continue;
  }
  mergedUnits.push(unit);
}

const output = postcss.root();
const charset = postcss.atRule({ name: "charset", params: '"UTF-8"' });
output.append(charset);
if (license) {
  const licenseComment = license.clone();
  licenseComment.raws.before = "\n\n";
  output.append(licenseComment);
}
const generatedComment = postcss.comment({
  text: "Generated from pinned Minimal CSS and Minimal Fab overrides; edit the source files, not theme.css.",
});
generatedComment.raws.before = "\n\n";
output.append(generatedComment);
for (const unit of mergedUnits) {
  unit.node.raws.before = "\n\n";
  output.append(unit.node);
}
for (const comment of settings) {
  comment.raws.before = "\n\n";
  output.append(comment);
}

const finalPass = await stylelint.lint({
  code: `${output.toString()}\n`,
  config: obsidianConfig,
  configBasedir: themeRoot,
  fix: true,
});
const finalCss = finalPass.code.replaceAll("\r\n", "\n");
const finalCheck = await stylelint.lint({
  code: finalCss,
  config: obsidianConfig,
  configBasedir: themeRoot,
});
const finalWarnings = finalCheck.results.flatMap((result) => result.warnings);
const errors = finalWarnings.filter((warning) => warning.severity === "error");

if (errors.length) {
  const counts = errors.reduce((result, warning) => {
    result[warning.rule] = (result[warning.rule] ?? 0) + 1;
    return result;
  }, {});
  throw new Error(`Generated CSS failed Obsidian Stylelint: ${JSON.stringify(counts)}`);
}

fs.writeFileSync(outputPath, finalCss);
console.log(`Normalized theme.css: 0 errors, ${finalWarnings.length} warnings`);
