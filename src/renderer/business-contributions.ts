import { AuthProvider } from "./auth.js";
import * as quota from "./cloud-quota.js";
import * as accountDetails from "./account-provider-details.js";
import { AccountSettings } from "./account-settings.js";
import * as pending from "./pending-publish.js";
import {
  GameRecordButton,
  GameRecordingNotices,
  onGameRecordingSaved,
} from "./game-recording.js";
import { GameTuningPanel } from "./game-tuning-panel.js";
import { useWebGamePlayer } from "./use-web-game-player.js";
import { DesktopGamePreview } from "./desktop-game-preview.js";
import { PlayableEditorWorkspace } from "./playable-editor-workspace.js";
import { usePlaytestAskRequests } from "./playable-playtest.js";
import { PlaytestPage } from "./playtest.js";
import { NodeThumbnailPage } from "./node-thumbnail-page.js";
import { PublishDialog } from "./publish-dialog.js";
import { GamesPage, GamePlayer } from "./games.js";
import { CommunityProfilePage } from "./community-profile.js";
import type { RendererContributions } from "./contribution-contract.js";

export const rendererContributions: RendererContributions = {
  account: {
    AuthProvider,
    ...quota,
    ...pending,
    ...accountDetails,
    AccountSettings,
  },
  game: {
    GameRecordButton,
    GameRecordingNotices,
    onGameRecordingSaved,
    GameTuningPanel,
    useWebGamePlayer,
    DesktopGamePreview,
  },
  story: {
    PlayableEditorWorkspace,
    usePlaytestAskRequests,
    PlaytestPage,
    NodeThumbnailPage,
  },
  publishing: { PublishDialog },
  community: { GamesPage, GamePlayer, CommunityProfilePage },
};
