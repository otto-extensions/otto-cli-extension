import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { generateCliArtifacts, resolveCommandServicePath } from "../../cli-generator.js";

test("cli generator indexes command-service files and preserves versioning", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "otto-cli-basic-"));

  try {
    const commandRoot = path.join(tempRoot, "commands");
    await mkdir(commandRoot, { recursive: true });
    await writeFile(
      path.join(commandRoot, "hello.json"),
      JSON.stringify({ id: "hello", description: "Say hello." }, null, 2),
      "utf8"
    );

    const generated = await generateCliArtifacts({ commandServicePath: commandRoot, version: "9.9.9" });

    assert.equal(generated.version, "9.9.9");
    assert.equal(generated.warnings.length, 0);
    assert.equal(generated.commands.length, 1);
    assert.equal(generated.commands[0]?.name, "hello");
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("cli generator resolves explicit and default command service paths", () => {
  assert.equal(resolveCommandServicePath("/repo/root", "/custom/commands"), "/custom/commands");
  assert.match(resolveCommandServicePath("/repo/root"), /otto-command-service\/src\/commands$/);
});