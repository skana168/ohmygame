import { readFileSync } from "node:fs";
import { parse } from "yaml";
import identity from "./application-identity.cjs";

export function desktopConfiguration(root) {
  const application = identity.loadIdentity(root);
  const config = parse(
    readFileSync(new URL("./electron-builder.yml", import.meta.url), "utf8"),
  );
  return {
    ...config,
    appId: application.desktopId,
    productName: application.name,
    extraMetadata: { name: application.packageName },
    files: [...config.files, "application.json", "application-identity.cjs"],
    win: {
      ...config.win,
      artifactName: "${productName}-${version}-${arch}.${ext}",
    },
    dmg: {
      ...config.dmg,
      artifactName: "${productName}-${version}-${arch}.${ext}",
    },
    publish: process.env.DESKTOP_UPDATE_URL ? config.publish : null,
  };
}

export default desktopConfiguration();
