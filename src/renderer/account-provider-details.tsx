import { useEffect, useRef, useState } from "react";
import type { ProviderSummary } from "../shared/contracts.js";
import { useOptionalAccount } from "./account-context.js";
import {
  accountCloudState,
  cloudQuotaSummary,
  CloudQuotaDetails,
} from "./cloud-quota.js";
import { listProviders, getCloudQuotas, MODELS_CHANGED_EVENT } from "./api.js";
import {
  ProviderDetailHeader,
  ProviderEnableControl,
} from "./models-settings.js";
import { ProviderModels } from "./provider-models.js";
import { Button, IconButton } from "./ui/index.js";
import { RefreshCw } from "./icons.js";
import { t } from "./i18n.js";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function FreeCloudAccount({
  provider,
  refreshing,
  onRefresh,
}: {
  provider?: ProviderSummary;
  refreshing: boolean;
  onRefresh: () => void;
}) {
  const auth = useOptionalAccount();
  const userId =
    auth?.state.status === "signed-in" ? auth?.state.user.id : undefined;
  const cloud = accountCloudState(provider?.cloud, userId);
  const needsSignIn = !userId || cloud?.availability === "sign_in_required";
  const quota = cloud?.quota;
  return (
    <>
      <div className="settings-provider-connection">
        <div className="settings-provider-setting-row settings-provider-auth-row">
          <span className="settings-search-field-label">
            {t("providers.account")}
          </span>
          <span
            className="settings-provider-setting-value"
            title={
              auth?.state.status === "signed-in"
                ? auth?.state.user.email
                : undefined
            }
          >
            {auth?.state.status === "signed-in"
              ? (auth?.state.user.email ?? auth?.state.user.name)
              : t("providers.ohMyGameAccount")}
          </span>
          {needsSignIn ? (
            <Button onClick={auth?.openSignIn}>{t("common.signIn")}</Button>
          ) : null}
        </div>
      </div>
      <section
        className="settings-detail-section provider-models"
        aria-label={t("providers.quota.title")}
      >
        <div className="provider-models-heading">
          <h4>{t("providers.quota.title")}</h4>
          {userId ? (
            <IconButton
              size="sm"
              disabled={refreshing}
              onClick={onRefresh}
              label={t("providers.quota.refresh")}
            >
              <RefreshCw
                size={15}
                className={refreshing ? "spin" : undefined}
                aria-hidden="true"
              />
            </IconButton>
          ) : null}
        </div>
        {quota ? (
          <CloudQuotaDetails quota={quota} />
        ) : (
          <p className="settings-detail-hint" role="status">
            {needsSignIn
              ? t("providers.quota.signIn")
              : refreshing
                ? t("providers.quota.checking")
                : cloudQuotaSummary(cloud)}
          </p>
        )}
        {quota && cloud?.availability !== "ready" ? (
          <p className="settings-detail-hint" role="status">
            {cloud?.availability === "personal_exhausted"
              ? t("providers.quota.exhausted")
              : cloudQuotaSummary(cloud)}
          </p>
        ) : null}
      </section>
    </>
  );
}

export function FreeCloudProviderDetail({
  provider,
  onBack,
}: {
  provider: ProviderSummary;
  onBack: () => void;
}) {
  const auth = useOptionalAccount();
  const userId =
    auth?.state.status === "signed-in" ? auth?.state.user.id : undefined;
  const [current, setCurrent] = useState(provider);
  const [modelsRevision, setModelsRevision] = useState(0);
  const [error, setError] = useState<string>();
  const [refreshing, setRefreshing] = useState(false);
  const refreshRef = useRef<(force?: boolean) => void>(() => {});
  useEffect(() => {
    let active = true,
      sequence = 0;
    const load = (force = false) => {
      const revision = ++sequence;
      setRefreshing(true);
      void (
        force ? (getCloudQuotas?.() ?? Promise.resolve()) : Promise.resolve()
      )
        .then(listProviders)
        .then((providers) => {
          if (!active || revision !== sequence) return;
          setCurrent(
            providers.find((item) => item.id === provider.id) ?? provider,
          );
          setError(undefined);
          if (force) setModelsRevision((value) => value + 1);
        })
        .catch((cause) => {
          if (active && revision === sequence) setError(errorMessage(cause));
        })
        .finally(() => {
          if (active && revision === sequence) setRefreshing(false);
        });
    };
    refreshRef.current = load;
    const refresh = () => load();
    refresh();
    window.addEventListener(MODELS_CHANGED_EVENT, refresh);
    const timer = setInterval(refresh, 30_000);
    return () => {
      active = false;
      clearInterval(timer);
      window.removeEventListener(MODELS_CHANGED_EVENT, refresh);
    };
  }, [provider.id, userId]);
  return (
    <section className="settings-panel settings-provider-detail">
      <ProviderDetailHeader provider={current} onBack={onBack}>
        <ProviderEnableControl
          provider={current}
          onChanged={() => refreshRef.current()}
        />
      </ProviderDetailHeader>
      <FreeCloudAccount
        provider={current}
        refreshing={refreshing}
        onRefresh={() => refreshRef.current(true)}
      />
      {error ? (
        <p className="settings-note is-danger" role="alert">
          {error}
        </p>
      ) : null}
      <ProviderModels
        key={`${provider.id}-${userId}-${modelsRevision}`}
        providerId={provider.id}
      />
    </section>
  );
}
