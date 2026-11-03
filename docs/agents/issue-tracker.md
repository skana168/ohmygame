# Issue tracker: Local Markdown

Issues and specs live as Markdown files under `.scratch/`.

## Conventions

- Use one directory per feature: `.scratch/<feature-slug>/`.
- Store the spec in `spec.md`.
- Store each implementation ticket in `issues/<NN>-<slug>.md`,
  numbered from `01`.
- Record triage state in a `Status:` line near the top of each ticket.
  Use the values in [triage-labels.md](triage-labels.md).
- Append comments and conversation history under `## Comments`.

When a skill says “publish to the issue tracker”, create the appropriate
file under `.scratch/<feature-slug>/`, creating directories as needed.

When a skill says “fetch the relevant ticket”, read the referenced file.
Resolve a ticket number within its feature directory.

## Wayfinding operations

- Map: `.scratch/<effort>/map.md`, containing Notes,
  Decisions-so-far, and Fog.
- Child ticket: `.scratch/<effort>/issues/<NN>-<slug>.md`.
  Record its type in `Type:`: `research`, `prototype`, `grilling`, or `task`.
- Blocking: record dependencies as `Blocked by: NN, NN`.
  A ticket is unblocked when every listed ticket is resolved.
- Frontier: select the first open, unblocked, unclaimed ticket by number.
- Claim: set `Status: claimed` and save before starting work.
- Resolve: append the answer under `## Answer`, set `Status: resolved`,
  and add a summary and link to the map’s Decisions-so-far section.

Wayfinding uses `claimed` and `resolved` as execution statuses.
The five triage statuses apply when evaluating and routing tickets.
