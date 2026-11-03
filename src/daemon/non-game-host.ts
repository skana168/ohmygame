import type { HostBusiness } from "./host-business-contract.js";
export type { HostBusiness } from "./host-business-contract.js";
export const hostBusiness: HostBusiness | undefined = undefined;
export function requireHostBusiness(): HostBusiness {
  throw new Error(
    "This application does not include game, story, publishing, or account services.",
  );
}
