import { renderCliHelp } from "./cli-help.js";
import { type CliGenerationOptions, type CliGenerationResult, generateCliArtifacts } from "./cli-generator.js";
import { rescanCli } from "./cli-rescan.js";

export type CliRouteResult =
  | { mode: "help"; exitCode: 0; output: string }
  | { mode: "version"; exitCode: 0; output: string }
  | { mode: "update"; exitCode: 0; output: string }
  | { mode: "rescan"; exitCode: 0; output: string; generated: CliGenerationResult }
  | { mode: "forward"; exitCode: 0; output: string; commandId: string; forwardedArgs: string[] }
  | { mode: "error"; exitCode: 1; output: string };

export interface CliRouteOptions extends CliGenerationOptions {
  memPalaceRoot?: string;
}

function normalizeArgs(argv: string[]): string[] {
  return argv[0] === "otto" ? argv.slice(1) : argv;
}

export async function routeCliCommand(argv: string[], options: CliRouteOptions = {}): Promise<CliRouteResult> {
  const args = normalizeArgs(argv);

  if (args.length === 0 || args[0] === "help") {
    const generated = await generateCliArtifacts(options);
    return {
      mode: "help",
      exitCode: 0,
      output: renderCliHelp(generated)
    };
  }

  if (args[0] === "cli" && args[1] === "version") {
    const generated = await generateCliArtifacts(options);
    return {
      mode: "version",
      exitCode: 0,
      output: `Otto CLI Extension v${generated.version}`
    };
  }

  if (args[0] === "cli" && args[1] === "update") {
    return {
      mode: "update",
      exitCode: 0,
      output: "CLI update hook acknowledged. Forward update execution to OttoUpdateAgent."
    };
  }

  if (args[0] === "cli" && args[1] === "rescan") {
    const generated = await rescanCli({
      ...options,
      memPalaceRoot: options.memPalaceRoot,
      trigger: "manual",
      source: "user"
    });
    return {
      mode: "rescan",
      exitCode: 0,
      output: `CLI rescan completed with ${generated.commands.filter((command) => command.kind === "generated").length} discovered commands.`,
      generated
    };
  }

  const generated = await generateCliArtifacts(options);
  const command = generated.commands.find(
    (candidate) => candidate.kind === "generated" && candidate.name === args[0]
  );

  if (!command?.commandId) {
    return {
      mode: "error",
      exitCode: 1,
      output: `${renderCliHelp(generated)}\n\nUnknown command: ${args[0]}`
    };
  }

  return {
    mode: "forward",
    exitCode: 0,
    output: `Forward ${command.commandId} to the command service layer.`,
    commandId: command.commandId,
    forwardedArgs: args.slice(1)
  };
}