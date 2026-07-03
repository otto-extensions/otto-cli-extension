import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { generateCliArtifacts } from "../src/cli-generator.js";
import { routeCliCommand } from "../src/cli-router.js";

test("generateCliArtifacts indexes command-service files and routeCliCommand forwards them", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "otto-cli-basic-"));

  try {
    const commandRoot = path.join(tempRoot, "commands");
    await mkdir(commandRoot, { recursive: true });
    await writeFile(
      path.join(commandRoot, "hello.json"),
      JSON.stringify({ id: "hello", description: "Say hello." }, null, 2),
      "utf8"
    );

    const generated = await generateCliArtifacts({
      commandServicePath: commandRoot,
      version: "9.9.9"
    });

    assert.equal(generated.version, "9.9.9");
    assert.equal(generated.warnings.length, 0);
    assert.ok(generated.commands.some((command) => command.kind === "generated" && command.name === "hello"));

    const routed = await routeCliCommand(["otto", "hello", "--name", "World"], {
      commandServicePath: commandRoot
    });

    assert.equal(routed.mode, "forward");
    if (routed.mode === "forward") {
      assert.equal(routed.commandId, "hello");
      assert.deepEqual(routed.forwardedArgs, ["--name", "World"]);
    }

    const help = await routeCliCommand(["otto", "help"], { commandServicePath: commandRoot });
    assert.equal(help.mode, "help");
    assert.match(help.output, /otto hello/);

    const sourceFile = generated.commands.find((command) => command.kind === "generated" && command.name === "hello")?.sourceFile;
    assert.ok(sourceFile);
    if (sourceFile) {
      const content = await readFile(sourceFile, "utf8");
      assert.match(content, /Say hello/);
    }
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});