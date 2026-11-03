import { useState } from "react";
import { useOptionalAccount } from "./account-context.js";
import { UserAvatar } from "./user-avatar.js";
import { Button } from "./ui/index.js";
import { SettingsGroup, SettingsRow, SettingsNote } from "./settings-parts.js";
import { t } from "./i18n.js";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function AccountSettings() {
  const auth = useOptionalAccount();
  const [error, setError] = useState<string>();
  if (!auth) return null;
  if (auth.state.status !== "signed-in") {
    const loading = auth?.state.status === "loading";
    return (
      <SettingsGroup>
        <SettingsRow
          title={
            loading
              ? t("settings.account.loading")
              : t("settings.account.signedOut")
          }
          description={t("settings.account.signedOutHint")}
        >
          <Button
            variant="primary"
            disabled={loading}
            onClick={auth?.openSignIn}
          >
            {t("common.signIn")}
          </Button>
        </SettingsRow>
      </SettingsGroup>
    );
  }
  const { user } = auth.state;
  return (
    <>
      <SettingsGroup>
        <div className="settings-identity">
          <UserAvatar
            className="settings-avatar"
            name={user.name}
            avatarUrl={user.avatarUrl}
          />
          <div className="settings-identity-text">
            <strong>{user.name}</strong>
            <span>
              {user.email
                ? t("settings.account.signedInWith", { email: user.email })
                : t("settings.account.signedInAs")}
            </span>
          </div>
          <Button
            onClick={() =>
              void auth
                .signOut()
                .catch((cause) => setError(errorMessage(cause)))
            }
          >
            {t("common.signOut")}
          </Button>
        </div>
      </SettingsGroup>
      {error ? <SettingsNote tone="danger">{error}</SettingsNote> : null}
    </>
  );
}
