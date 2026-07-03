import type { CliGenerationResult } from "./cli-generator.js";

export function renderCliHelp(result: CliGenerationResult): string {
  const builtinLines = result.commands
    .filter((command) => command.kind === "builtin")
    .map((command) => `  ${command.invocation.padEnd(20)} ${command.description}`);
  const generatedLines = result.commands
    .filter((command) => command.kind === "generated")
    .map((command) => `  ${command.invocation.padEnd(20)} ${command.description}`);

  const warningSection =
    result.warnings.length === 0
      ? ""
      : `\nWarnings:\n${result.warnings.map((warning) => `  - ${warning}`).join("\n")}\n`;

  return [
    `Otto CLI Extension v${result.version}`,
    `Scanned command service path: ${result.scannedPath}`,
    "",
    "Built-in commands:",
    ...builtinLines,
    "",
    "Generated commands:",
    ...(generatedLines.length > 0 ? generatedLines : ["  No command definitions discovered yet."]),
    warningSection
  ]
    .filter(Boolean)
    .join("\n");
}