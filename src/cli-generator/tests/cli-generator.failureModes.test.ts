import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { generateCliArtifacts, scanCommandDefinitions } from "../../cli-generator.js";

test("cli generator warns when the command-service path is missing", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "otto-cli-missing-"));

  try {
    const scanned = await scanCommandDefinitions({
      repoRoot: tempRoot,
      commandServicePath: path.join(tempRoot, "missing")
    });

    assert.equal(scanned.commands.length, 0);
    assert.match(scanned.warnings[0] ?? "", /path not found/i);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("cli generator warns when no supported command definitions are discovered", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "otto-cli-empty-"));

  try {
    const commandRoot = path.join(tempRoot, "commands");
    await mkdir(commandRoot, { recursive: true });

    const generated = await generateCliArtifacts({ commandServicePath: commandRoot });

    assert.equal(generated.commands.length, 0);
    assert.match(generated.warnings[0] ?? "", /no command definitions/i);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});