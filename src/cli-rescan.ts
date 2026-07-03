import {
  type CliGenerationOptions,
  type CliGenerationResult,
  type RescanSource,
  type RescanTrigger,
  generateCliArtifacts,
  persistCliMetadata
} from "./cli-generator.js";

export interface CliRescanOptions extends CliGenerationOptions {
  memPalaceRoot?: string;
  trigger: RescanTrigger;
  source: RescanSource;
}

export async function rescanCli(options: CliRescanOptions): Promise<CliGenerationResult> {
  const result = await generateCliArtifacts(options);
  await persistCliMetadata(result, {
    memPalaceRoot: options.memPalaceRoot,
    trigger: options.trigger,
    source: options.source
  });
  return result;
}