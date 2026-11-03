import type { HostBusiness } from "./host-business.js";
export type { HostBusiness } from "./host-business.js";
export const hostBusiness: HostBusiness | undefined = undefined;
export function requireHostBusiness(): HostBusiness {
  throw new Error(
    "This application does not include game, story, publishing, or account services.",
  );
}
