import { applicationComposition } from "../src/shared/application-composition.ts";

if (applicationComposition.story) {
  await import("./build-story-resources.mjs");
} else {
  console.log("Skipped story resources for the non-game application.");
}
