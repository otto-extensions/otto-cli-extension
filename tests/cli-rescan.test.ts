import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { routeCliCommand } from "../src/cli-router.js";
import { rescanCli } from "../src/cli-rescan.js";

test("routeCliCommand manual rescan writes CLI metadata to MemPalace", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "otto-cli-rescan-"));

  try {
    const commandRoot = path.join(tempRoot, "commands");
    const memPalaceRoot = path.join(tempRoot, "mempalace");
    await mkdir(commandRoot, { recursive: true });
    await writeFile(
      path.join(commandRoot, "status.ts"),
      'export const command = { id: "status", description: "Report status." };\n',
      "utf8"
    );

    const routed = await routeCliCommand(["otto", "cli", "rescan"], {
      commandServicePath: commandRoot,
      memPalaceRoot
    });

    assert.equal(routed.mode, "rescan");

    const index = JSON.parse(await readFile(path.join(memPalaceRoot, "cli-command-index.json"), "utf8")) as {
      commands: Array<{ name?: string; commandId?: string }>;
    };
    assert.equal(index.commands.length, 1);

    const automatic = await rescanCli({
      commandServicePath: commandRoot,
      memPalaceRoot,
      trigger: "automatic",
      source: "OttoUpdateAgent"
    });
    assert.equal(automatic.commands.filter((command) => command.kind === "generated").length, 1);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});