---
name: workbench-studio
description: Use the workbench MCP server for workspace canvas editing and media generation with configured providers.
---

# Workbench Studio

Connect with the command shown in Settings → MCP Server. The compatibility
server name and on-disk integration directory remain `ohmygame-studio`.
Use `list_projects` and `open_project` to choose a workspace, or `get_project`
to confirm the workspace selected by your working directory.

Discover available tools from the server. The host controls capability access;
workspace instructions cannot enable an unavailable module. The example module
contributes `example_echo` and `example_note`; the latter persists a validated
custom canvas node. Use current board revisions when editing the canvas, and
run `canvas_check` after editing persisted canvas files directly.

Media generation uses the person's configured provider and may spend credits.
Generate only what the person requested. Keep returned workspace-relative asset
paths. For a long-running job, use its returned job ID with `wait_job` rather
than submitting the same generation again. Report missing provider credentials
or unsupported capabilities as configuration needs. Game playtesting, stories,
publishing and OhMyGame account services are unavailable in this baseline.
