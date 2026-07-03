# Otto CLI Extension

This repository provides a tracer-bullet Otto CLI extension that scans the command service layer, builds a CLI command index, exposes help and version output, and forwards matched commands without reimplementing command business logic.

## Responsibilities
- Scan `otto-command-service/src/commands/` for command definitions.
- Generate CLI command metadata and help text.
- Support manual rescans through `otto cli rescan`.
- Support automatic rescans triggered by `OttoUpdateAgent`.
- Persist generation metadata to MemPalace.

## Runtime Assumptions
- `OTTO_COMMAND_SERVICE_PATH` can override the command scan root.
- `OTTO_MEMPALACE_PATH` can override the MemPalace root.
- Without overrides, this repository expects sibling checkouts of `otto-command-service` and `otto-extensions`.

## Validation
- `npm test`
- `npm run typecheck`