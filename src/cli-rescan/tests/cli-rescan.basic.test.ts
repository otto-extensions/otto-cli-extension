import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { cliRescanCommandDefinition, executeCliRescanCommand } from "../../cli-rescan.js";

test("cli rescan command writes MemPalace metadata with manual defaults", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "otto-cli-rescan-"));

  try {
    const commandRoot = path.join(tempRoot, "commands");
    const memPalaceRoot = path.join(tempRoot, "mempalace");
    await mkdir(commandRoot, { recursive: true });
    await writeFile(path.join(commandRoot, "status.ts"), 'export const command = { id: "status", description: "Report status." };\n', "utf8");

    const rescanned = await executeCliRescanCommand({ commandServicePath: commandRoot, memPalaceRoot });

    assert.equal(rescanned.commands.length, 1);
    const index = JSON.parse(await readFile(path.join(memPalaceRoot, "cli-command-index.json"), "utf8")) as {
      commands: Array<{ name?: string; commandId?: string }>;
    };
    assert.equal(index.commands[0]?.commandId, "status");
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("cli rescan command definition exposes the expected command metadata", () => {
  assert.equal(cliRescanCommandDefinition.id, "otto.cli.rescan");
  assert.equal(cliRescanCommandDefinition.safety.idempotent, true);
});