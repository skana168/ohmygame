import path from "node:path";

// Shared persisted data/protocol contracts remain available. Implementations and
// shipped business resources do not. Resolve first so aliases and transitive
// imports cannot evade this check by changing the import spelling.
export function excluded(root, file) {
  const relative = path.relative(root, file).replaceAll(path.sep, "/");
  if (
    relative === "src/story-web" ||
    relative.startsWith("src/story-web/") ||
    relative === "src/daemon/assets/story-templates" ||
    relative.startsWith("src/daemon/assets/story-templates/") ||
    relative === "src/daemon/assets/scene-templates" ||
    relative.startsWith("src/daemon/assets/scene-templates/")
  )
    return true;
  if (
    relative === "src/daemon/publish" ||
    relative.startsWith("src/daemon/publish/")
  )
    return true;
  if (
    /^src\/desktop\/(?:ohmygame-main|account-contribution|oauth)\./.test(
      relative,
    )
  )
    return true;
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
      "src/renderer/account-provider-details.tsx",
      "src/renderer/account-settings.tsx",
      "src/renderer/sign-in-dialog.tsx",
      "src/renderer/business-contributions.ts",
      "src/renderer/node-thumbnail-page.tsx",
      "src/renderer/cloud-quota.tsx",
      "src/renderer/pending-publish.ts",
    ].includes(relative) ||
    /^src\/renderer\/(?:community[.-]|publish-dialog|games\.tsx|desktop-game-preview|use-web-game-player)/.test(
      relative,
    )
  );
}
