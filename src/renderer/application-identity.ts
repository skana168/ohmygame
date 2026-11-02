declare const __APP_NAME__: string;
declare const __APP_PACKAGE_NAME__: string;

export const applicationName = __APP_NAME__;
export const applicationPackageName = __APP_PACKAGE_NAME__;

export function applicationStorageKey(legacyKey: string): string {
  return legacyKey.replace(/^ohmygame/, applicationPackageName);
}
