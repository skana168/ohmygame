/** Source-owned host assembly. Non-game builds select non-game-host.ts at this seam. */
export { ohmygameHost as hostBusiness } from "./ohmygame-host.js";
import { ohmygameHost } from "./ohmygame-host.js";
export type HostBusiness = typeof ohmygameHost;
export function requireHostBusiness(): HostBusiness {
  return ohmygameHost;
}
