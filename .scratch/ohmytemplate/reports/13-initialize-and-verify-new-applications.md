# Ticket 13: initialize and verify applications

Status: claimed, pending merger. Implementation and generated application verification
are in progress; no overall delivery or whole-spec review completion is claimed.

Branch: `t3/initialize-verify-apps`.
Worktree: `/Users/yoyun/.t3/worktrees/ohmygame/t3-1031fd5e`.
Starting HEAD `8661916f`; `git merge-base --is-ancestor 0e24caa2 HEAD` passed.
Read repository/contribution instructions, final spec, glossary/ADR, local tracker,
ticket 13, reports 10/11/12, actual exporter and identity/runtime implementations.
Applied requested TDD/tests/mocking and git-commit skills at approved public seams.

## Initial slices

- Public command: `bun run init:application DESTINATION DISPLAY_NAME PACKAGE_NAME DESKTOP_ID DATA_DIRECTORY`.
- Uses existing identity validation before export and ticket 12's selected exporter,
  retaining canonical-parent/symlink source refusal and atomic existing-dir refusal.
- Exported inventory permits the same command inside an independent template,
  without source links or dependencies installed, and omits unlisted local state.
  Package and frozen lock workspace names change together; source defaults/lock do not.
- Red: missing initializer (`/tmp/ohmytemplate-13-red.log`), after source frozen
  install (the initial attempt lacked dependencies and was not a behavioral red).
  Green: `/tmp/ohmytemplate-13-green.log`.
- Extended existing identity/export suite: 8 tests pass, including real Node
  initializer from generated app without dependencies, invalid fields, existing
  empty/populated destinations and direct/aliased nested source refusal. Second
  generation omits intentionally seeded `.env.local` and `.data` sentinel files.
  Log: `/tmp/ohmytemplate-13-boundaries.log`.
- First retained artifact: `/tmp/ohmytemplate-13-ohmyapp`, identity OhMyApp /
  ohmyapp / org.example.ohmyapp / .app-data. Generation passed; further checks below
  will establish acceptance. English/Chinese source and shipped guides updated.

No subagents, new checkout/worktree, push, PR, watch, source/global configuration
changes or destructive cleanup. No other ticket or execution-state edits.
