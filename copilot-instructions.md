# Otto CLI Extension Instructions

## Architectural Principles
- Extensions MUST NOT define API or CLI commands.
- All commands MUST be routed through the Otto Command Service Layer.
- If coding requires external access, generate ONLY internal commands and rely on the command service layer to expose CLI/API surfaces.

## Forbidden Actions
- Do not implement HTTP routes, REST handlers, GraphQL handlers, or server entrypoints in this repository.
- Do not add CLI parsers, shell command surfaces, or direct process argument parsing.
- Do not expose external API/CLI surfaces from extension modules.

## Command Generation Rules
- Generate metadata from command-service command definitions only.
- Execute internal commands only through `commandService.run(commandName, payload)`.
- Keep generated CLI metadata deterministic and command-service aligned.

## Extension Development Rules
- Keep code scoped to providers, services, and internal commands.
- Persist MemPalace metadata without introducing external transport surfaces.
- Fail clearly if command-service scan paths are missing or empty.