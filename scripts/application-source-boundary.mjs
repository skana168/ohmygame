import path from "node:path";

// Shared persisted data/protocol contracts remain available. Implementations and
// shipped business resources do not. Resolve first so aliases and transitive
// imports cannot evade this check by changing the import spelling.
export function excluded(root, file) {
  const relative = path.relative(root, file).replaceAll(path.sep, "/");
  if (
    relative.startsWith("src/story-web/") ||
    relative.startsWith("src/daemon/assets/story-templates/")
  )
    return true;
  if (relative.startsWith("src/daemon/publish/")) return true;
  if (
    /^src\/(?:daemon|desktop|renderer)\/(?:playable-|story-|game-|web-game-|playtest(?:[.-])|owned-playtest|ohmygame-agent-tools)/.test(
      relative,
    )
  )
    return true;
  return (
    [
      "src/daemon/cloud-models.ts",
      "src/daemon/ohmygame-host.ts",
      "src/renderer/auth.tsx",
      "src/renderer/cloud-quota.tsx",
      "src/renderer/pending-publish.ts",
    ].includes(relative) ||
    /^src\/renderer\/(?:community[.-]|publish-dialog|games\.tsx|desktop-game-preview|use-web-game-player)/.test(
      relative,
    )
  );
}
