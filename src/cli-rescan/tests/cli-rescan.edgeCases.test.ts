import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { executeCliRescanCommand, rescanCli } from "../../cli-rescan.js";

test("cli rescan applies automatic source metadata and appends history entries", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "otto-cli-auto-"));

  try {
    const commandRoot = path.join(tempRoot, "commands");
    const memPalaceRoot = path.join(tempRoot, "mempalace");
    await mkdir(commandRoot, { recursive: true });
    await writeFile(path.join(commandRoot, "hello.json"), JSON.stringify({ id: "hello", description: "Say hello." }, null, 2), "utf8");

    await rescanCli({ commandServicePath: commandRoot, memPalaceRoot, trigger: "automatic", source: "OttoUpdateAgent" });
    await executeCliRescanCommand({ commandServicePath: commandRoot, memPalaceRoot, trigger: "manual", source: "user" });

    const history = JSON.parse(await readFile(path.join(memPalaceRoot, "cli-generation-history.json"), "utf8")) as Array<{ source?: string }>;
    assert.equal(history.length, 2);
    assert.equal(history[0]?.source, "OttoUpdateAgent");
    assert.equal(history[1]?.source, "user");
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("cli rescan command defaults trigger and source when omitted", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "otto-cli-defaults-"));

  try {
    const commandRoot = path.join(tempRoot, "commands");
    const memPalaceRoot = path.join(tempRoot, "mempalace");
    await mkdir(commandRoot, { recursive: true });
    await writeFile(path.join(commandRoot, "status.json"), JSON.stringify({ id: "status" }, null, 2), "utf8");

    const result = await executeCliRescanCommand({ commandServicePath: commandRoot, memPalaceRoot });

    assert.equal(result.commands.length, 1);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});