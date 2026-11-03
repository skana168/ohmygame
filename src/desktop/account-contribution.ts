import { shell } from "electron";
import { isOAuthAuthorizationUrl, OAuthCallbackFlow } from "./oauth.js";
import type { DesktopAccountContext } from "./business-registration.js";

export function createAccountDesktop(context: DesktopAccountContext) {
  const oauth = new OAuthCallbackFlow(() =>
    context.mainWindow()?.webContents.send("ohmygame:auth-callback"),
  );
  context.handle("ohmygame:open-auth-url", async (_event, url: unknown) => {
    if (typeof url !== "string" || !isOAuthAuthorizationUrl(url))
      throw new Error("Invalid OAuth authorization URL");
    await shell.openExternal(url);
  });
  context.handle("ohmygame:take-auth-callback", () => oauth.takeCallback());
  context.handle("ohmygame:auth-callback-url", () => oauth.callbackUrl());
  context.handle("ohmygame:cancel-auth", () => oauth.cancel());
  return { close: () => oauth.cancel() };
}
