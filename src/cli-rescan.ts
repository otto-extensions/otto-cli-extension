import {
  type CliGenerationOptions,
  type CliGenerationResult,
  type RescanSource,
  type RescanTrigger,
  generateCliArtifacts,
  persistCliMetadata
} from "./cli-generator.js";
import { commandService } from "./command-service.js";

export interface CliRescanOptions extends CliGenerationOptions {
  memPalaceRoot?: string;
  trigger: RescanTrigger;
  source: RescanSource;
}

export interface CliRescanCommandInput extends Omit<CliRescanOptions, "trigger" | "source"> {
  trigger?: RescanTrigger;
  source?: RescanSource;
}

export interface ExtensionCommandDefinition<TInput, TOutput> {
  id: string;
  version: string;
  description: string;
  metadata: {
    owner: string;
    tags: string[];
  };
  safety: {
    idempotent: boolean;
    sideEffects: Array<"mempalace-write">;
  };
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  execute(input: TInput): Promise<TOutput>;
}

const CLI_RESCAN_COMMAND_ID = "otto.cli.rescan";

export async function rescanCli(options: CliRescanOptions): Promise<CliGenerationResult> {
  const result = await generateCliArtifacts(options);
  await persistCliMetadata(result, {
    memPalaceRoot: options.memPalaceRoot,
    trigger: options.trigger,
    source: options.source
  });
  return result;
}

commandService.register<CliRescanCommandInput, CliGenerationResult>(CLI_RESCAN_COMMAND_ID, async (input) =>
  rescanCli({
    ...input,
    trigger: input.trigger ?? "manual",
    source: input.source ?? "user"
  })
);

export async function executeCliRescanCommand(input: CliRescanCommandInput): Promise<CliGenerationResult> {
  return commandService.run<CliRescanCommandInput, CliGenerationResult>(CLI_RESCAN_COMMAND_ID, input);
}

export const cliRescanCommandDefinition: ExtensionCommandDefinition<CliRescanCommandInput, CliGenerationResult> = {
  id: CLI_RESCAN_COMMAND_ID,
  version: "1.0.0",
  description: "Rescan command registry and regenerate unified CLI metadata.",
  metadata: {
    owner: "otto-cli-extension",
    tags: ["cli", "rescan", "command-service"]
  },
  safety: {
    idempotent: true,
    sideEffects: ["mempalace-write"]
  },
  inputSchema: {
    type: "object",
    additionalProperties: false,
    properties: {
      repoRoot: { type: "string" },
      commandServicePath: { type: "string" },
      memPalaceRoot: { type: "string" },
      version: { type: "string" },
      trigger: { type: "string", enum: ["manual", "automatic"] },
      source: { type: "string", enum: ["user", "OttoUpdateAgent"] }
    }
  },
  outputSchema: {
    type: "object",
    required: ["version", "generatedAt", "scannedPath", "warnings", "commands"],
    properties: {
      version: { type: "string" },
      generatedAt: { type: "string" },
      scannedPath: { type: "string" },
      warnings: { type: "array" },
      commands: { type: "array" }
    }
  },
  execute: executeCliRescanCommand
};