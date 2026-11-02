import { applicationComposition } from "../src/shared/application-composition.js";

if (applicationComposition.game) {
  await import("./prepare-game-examples.js");
} else {
  console.log("Skipped game examples for the non-game application.");
}
