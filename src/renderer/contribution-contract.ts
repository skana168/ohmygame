/** Optional renderer contributions. Type-only references never load implementations. */
export interface RendererContributions {
  account?: Pick<typeof import("./auth.js"), "AuthProvider"> &
    typeof import("./cloud-quota.js") &
    typeof import("./pending-publish.js") &
    typeof import("./account-provider-details.js") &
    typeof import("./account-settings.js");
  game?: Pick<
    typeof import("./game-recording.js"),
    "GameRecordButton" | "GameRecordingNotices" | "onGameRecordingSaved"
  > &
    Pick<typeof import("./game-tuning-panel.js"), "GameTuningPanel"> &
    Pick<typeof import("./use-web-game-player.js"), "useWebGamePlayer"> &
    Pick<typeof import("./desktop-game-preview.js"), "DesktopGamePreview">;
  story?: Pick<
    typeof import("./playable-editor-workspace.js"),
    "PlayableEditorWorkspace"
  > &
    Pick<typeof import("./playable-playtest.js"), "usePlaytestAskRequests"> &
    Pick<typeof import("./playtest.js"), "PlaytestPage"> &
    Pick<typeof import("./node-thumbnail-page.js"), "NodeThumbnailPage">;
  publishing?: Pick<typeof import("./publish-dialog.js"), "PublishDialog">;
  community?: Pick<typeof import("./games.js"), "GamesPage" | "GamePlayer"> &
    Pick<typeof import("./community-profile.js"), "CommunityProfilePage">;
}
