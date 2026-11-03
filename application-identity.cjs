const { readFileSync } = require("node:fs");
const path = require("node:path");

function loadIdentity(root = __dirname) {
  const value = JSON.parse(
    readFileSync(path.join(root, "application.json"), "utf8"),
  );
  return validateIdentity(value);
}
function validateIdentity(value) {
  const fail = (field, reason) => {
    throw new Error(`Invalid application.json ${field}: ${reason}`);
  };
  if (!value || typeof value !== "object" || Array.isArray(value))
    fail("configuration", "expected an object");
  for (const key of Object.keys(value)) {
    if (!["name", "packageName", "desktopId", "dataDirectory"].includes(key))
      fail(key, "unsupported setting");
  }
  if (
    typeof value.name !== "string" ||
    !/^[\p{L}\p{N}][\p{L}\p{N} ._-]{0,79}$/u.test(value.name) ||
    value.name.trim() !== value.name
  )
    fail(
      "name",
      "use 1–80 letters, digits, spaces, dots, underscores or hyphens",
    );
  if (
    typeof value.packageName !== "string" ||
    !/^[a-z][a-z0-9-]{0,79}$/.test(value.packageName)
  )
    fail("packageName", "use a lowercase unscoped package name");
  if (
    typeof value.desktopId !== "string" ||
    !/^[a-z][a-z0-9]*(\.[a-z][a-z0-9-]*){2,}$/.test(value.desktopId)
  )
    fail("desktopId", "use a reverse DNS ID such as org.example.notes");
  if (
    typeof value.dataDirectory !== "string" ||
    !value.dataDirectory.trim() ||
    /[\x00-\x1f]/.test(value.dataDirectory)
  )
    fail("dataDirectory", "expected a nonempty directory path");
  return Object.freeze(value);
}
function dataDirectory(
  identity,
  root,
  environment = process.env,
  desktopUserData,
) {
  const override = environment.OHMYGAME_DATA_DIR;
  if (override !== undefined && !override.trim())
    throw new Error("OHMYGAME_DATA_DIR must be a nonempty directory path");
  return path.resolve(
    override ??
      (desktopUserData && identity.dataDirectory === ".data"
        ? path.join(desktopUserData, "data")
        : path.resolve(desktopUserData ?? root, identity.dataDirectory)),
  );
}
module.exports = { loadIdentity, validateIdentity, dataDirectory };
