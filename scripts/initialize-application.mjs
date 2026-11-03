import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import identity from "../application-identity.cjs";
import { exportTemplate } from "./export-template.mjs";

const [destination, name, packageName, desktopId, dataDirectory, ...extra] =
  process.argv.slice(2);
if (!destination || extra.length || dataDirectory === undefined)
  throw new Error(
    'Usage: bun run init:application /absolute/new-directory "OhMyApp" ohmyapp org.example.ohmyapp .app-data',
  );
// Validate through the same loader contract as startup, before creating output.
const configured = identity.validateIdentity({
  name,
  packageName,
  desktopId,
  dataDirectory,
});
await exportTemplate(destination);
const root = path.resolve(destination);
const json = (value) => `${JSON.stringify(value, null, 2)}\n`;
const pkg = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const previousName = pkg.name;
pkg.name = configured.packageName;
await writeFile(path.join(root, "package.json"), json(pkg));
const lock = await readFile(path.join(root, "bun.lock"), "utf8");
await writeFile(
  path.join(root, "bun.lock"),
  lock.replace(
    `"name": "${previousName}"`,
    `"name": "${configured.packageName}"`,
  ),
);
await writeFile(path.join(root, "application.json"), json(configured));
console.log(`Initialized ${configured.name}: ${root}`);
