import {
  mkdtemp,
  writeFile,
  rm,
  readFile,
  lstat,
  mkdir,
  symlink,
  readdir,
} from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, it } from "vitest";
import identity from "../application-identity.cjs";
import { parseChangelog } from "../src/shared/changelog.js";

it("loads independent application identity and resolves storage relative to its checkout", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "identity-"));
  try {
    await writeFile(
      path.join(root, "application.json"),
      JSON.stringify({
        name: "Studio Notes",
        packageName: "studio-notes",
        desktopId: "org.example.notes",
        dataDirectory: ".notes",
      }),
    );
    const configured = identity.loadIdentity(root);
    expect(configured.name).toBe("Studio Notes");
    expect(identity.dataDirectory(configured, root, {})).toBe(
      path.join(root, ".notes"),
    );
    expect(
      identity.dataDirectory(configured, root, {
        OHMYGAME_DATA_DIR: "/override",
      }),
    ).toBe(path.resolve("/override"));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

it("rejects partial, unsupported and invalid identities before startup", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "identity-invalid-"));
  const defaults = {
    name: "Notes",
    packageName: "notes",
    desktopId: "org.example.notes",
    dataDirectory: ".notes",
  };
  try {
    for (const invalid of [
      { ...defaults, name: "../Notes" },
      { ...defaults, packageName: "@scope/name" },
      { ...defaults, desktopId: "notes" },
      { ...defaults, dataDirectory: "" },
      { ...defaults, extra: true },
      {},
    ]) {
      await writeFile(
        path.join(root, "application.json"),
        JSON.stringify(invalid),
      );
      expect(() => identity.loadIdentity(root)).toThrow(
        /Invalid application.json/,
      );
    }
    expect(identity.loadIdentity()).toEqual({
      name: "OhMyGame",
      packageName: "ohmygame",
      desktopId: "ai.ohmygame.desktop",
      dataDirectory: ".data",
    });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

it("packages the configured desktop and package identity without release credentials", async () => {
  const { default: config } = await import(
    new URL("../electron-builder.config.mjs", import.meta.url).href
  );
  expect(config.appId).toBe("ai.ohmygame.desktop");
  expect(config.extraMetadata.name).toBe("ohmygame");
  expect(config.files).toContain("application.json");
  expect(config.publish).toBeNull();
});

it("uses independent desktop identifiers and writable storage without changing defaults", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "identity-package-"));
  try {
    await writeFile(
      path.join(root, "application.json"),
      JSON.stringify({
        name: "Studio Notes",
        packageName: "studio-notes",
        desktopId: "org.example.notes",
        dataDirectory: "notes-data",
      }),
    );
    const { desktopConfiguration } = await import(
      new URL("../electron-builder.config.mjs", import.meta.url).href
    );
    const config = desktopConfiguration(root);
    expect(config.appId).toBe("org.example.notes");
    expect(config.productName).toBe("Studio Notes");
    expect(config.extraMetadata.name).toBe("studio-notes");
    expect(
      identity.dataDirectory(
        identity.loadIdentity(root),
        root,
        {},
        path.join(root, "profiles", "notes"),
      ),
    ).toBe(path.join(root, "profiles", "notes", "notes-data"));
    expect(
      identity.dataDirectory(
        identity.loadIdentity(),
        root,
        {},
        path.join(root, "profiles", "legacy"),
      ),
    ).toBe(path.join(root, "profiles", "legacy", "data"));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

it("exports an independent selected workbench without overwriting an existing destination", async () => {
  const parent = await mkdtemp(path.join(tmpdir(), "template-export-"));
  const destination = path.join(parent, "template");
  const run = () =>
    spawnSync(process.execPath, ["scripts/export-template.mjs", destination], {
      encoding: "utf8",
    });
  const result = run();
  expect(result.stderr, result.stdout).toBe("");
  expect(result.status).toBe(0);
  expect(
    JSON.parse(
      await readFile(path.join(destination, "application.json"), "utf8"),
    ).name,
  ).toBe("OhMyTemplate");
  expect(
    await readFile(
      path.join(destination, "src/daemon/host-business.ts"),
      "utf8",
    ),
  ).toContain("./non-game-host.js");
  for (const file of [
    ".git",
    "node_modules",
    ".data",
    ".runtime",
    "src/daemon/ohmygame-host.ts",
    "src/story-web",
    "src/shared/playable-runtime.ts",
    "src/renderer/auth.tsx",
    "scripts/prepare-game-examples.ts",
  ]) {
    await expect(lstat(path.join(destination, file))).rejects.toMatchObject({
      code: "ENOENT",
    });
  }
  expect(await readFile(path.join(destination, "LICENSE"), "utf8")).toContain(
    "Apache License",
  );
  expect(
    parseChangelog(
      await readFile(path.join(destination, "CHANGELOG.md"), "utf8"),
    )[0].version,
  ).toBe("0.0.0-beta.5.0");
  for (const file of [
    "src/renderer/assets/home/OFL.txt",
    "src/renderer/assets/sidebar/OFL.txt",
  ]) {
    expect(await readFile(path.join(destination, file), "utf8")).toContain(
      "SIL OPEN FONT LICENSE",
    );
  }
  expect(run().status).not.toBe(0);
  expect(identity.loadIdentity().name).toBe("OhMyGame");
});

it("refuses empty destinations and source paths through a symlinked parent", async () => {
  const parent = await mkdtemp(path.join(tmpdir(), "template-boundary-"));
  const invoke = (destination: string) =>
    spawnSync(process.execPath, ["scripts/export-template.mjs", destination], {
      encoding: "utf8",
    });
  try {
    const empty = path.join(parent, "empty");
    await mkdir(empty);
    expect(invoke(empty).status).not.toBe(0);
    expect(await readdir(empty)).toEqual([]);
    const alias = path.join(parent, "source");
    await symlink(process.cwd(), alias, "junction");
    for (const destination of [
      process.cwd(),
      path.join(process.cwd(), "template-boundary-output"),
      path.join(alias, "template-boundary-output"),
    ]) {
      const result = invoke(destination);
      expect(result.status).not.toBe(0);
      expect(result.stderr).toContain("Export outside the source checkout");
    }
    await expect(
      lstat(path.join(alias, "template-boundary-output")),
    ).rejects.toMatchObject({ code: "ENOENT" });
  } finally {
    await rm(parent, { recursive: true, force: true });
  }
});
