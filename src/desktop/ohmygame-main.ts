import { createAccountDesktop } from "./account-contribution.js";
import {
  registerDesktopBusiness,
  registerDesktopAccount,
} from "./business-registration.js";
import { createGameDesktop } from "./game-contribution.js";

registerDesktopBusiness(createGameDesktop);
registerDesktopAccount(createAccountDesktop);
await import("./main.js");
