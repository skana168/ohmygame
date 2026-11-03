/** Source-owned host assembly. Non-game builds select non-game-host.ts here. */
import { ohmygameHost } from "./ohmygame-host.js";
import type { HostBusiness } from "./host-business-contract.js";
export type { HostBusiness } from "./host-business-contract.js";
export const hostBusiness: HostBusiness | undefined = ohmygameHost;
export function requireHostBusiness(): HostBusiness {
  return ohmygameHost;
}
