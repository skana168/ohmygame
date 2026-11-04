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
import { execFile, spawnSync } from "node:child_process";
import { promisify } from "node:util";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, it } from "vitest";
import identity from "../application-identity.cjs";
import { parseChangelog } from "../src/shared/changelog.js";

const execute = promisify(execFile);
async function runScript(args: string[], cwd = process.cwd()) {
  try {
    return { ...(await execute("node", args, { cwd })), status: 0 };
  } catch (error) {
    const failure = error as Error & {
      stdout: string;
      stderr: string;
      code: number;
    };
    return {
      stdout: failure.stdout,
      stderr: failure.stderr,
      status: failure.code,
    };
  }
}

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

// These CLI integration cases compile the selected source graph with TypeScript.
// Keep their compiler budget separate from ordinary API tests.
it("exports an independent selected workbench without overwriting an existing destination", async () => {
  const parent = await mkdtemp(path.join(tmpdir(), "template-export-"));
  const destination = path.join(parent, "template");
  const run = () => runScript(["scripts/export-template.mjs", destination]);
  const result = await run();
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
  expect((await run()).status).not.toBe(0);
  expect(identity.loadIdentity().name).toBe("OhMyGame");
}, 180_000);

it("refuses empty destinations and source paths through a symlinked parent", async () => {
  const parent = await mkdtemp(path.join(tmpdir(), "template-boundary-"));
  const invoke = (destination: string) =>
    runScript(["scripts/export-template.mjs", destination]);
  try {
    const empty = path.join(parent, "empty");
    await mkdir(empty);
    expect((await invoke(empty)).status).not.toBe(0);
    expect(await readdir(empty)).toEqual([]);
    const alias = path.join(parent, "source");
    await symlink(process.cwd(), alias, "junction");
    for (const destination of [
      process.cwd(),
      path.join(process.cwd(), "template-boundary-output"),
      path.join(alias, "template-boundary-output"),
    ]) {
      const result = await invoke(destination);
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

it("initializes a named application before installing and rejects invalid inputs without output", async () => {
  const parent = await mkdtemp(path.join(tmpdir(), "application-init-"));
  const destination = path.join(parent, "app");
  const invoke = (name = "OhMyApp") =>
    runScript([
      "scripts/initialize-application.mjs",
      destination,
      name,
      "ohmyapp",
      "org.example.ohmyapp",
      ".app-data",
    ]);
  const invalid = await invoke("../invalid");
  expect(invalid.status).not.toBe(0);
  expect(invalid.stderr).toContain("Invalid application.json name");
  await expect(lstat(destination)).rejects.toMatchObject({ code: "ENOENT" });
  const result = await invoke();
  expect(result.stderr, result.stdout).toBe("");
  expect(result.status).toBe(0);
  expect(identity.loadIdentity(destination)).toEqual({
    name: "OhMyApp",
    packageName: "ohmyapp",
    desktopId: "org.example.ohmyapp",
    dataDirectory: ".app-data",
  });
  expect(
    JSON.parse(await readFile(path.join(destination, "package.json"), "utf8"))
      .name,
  ).toBe("ohmyapp");
  expect(await readFile(path.join(destination, "bun.lock"), "utf8")).toContain(
    '"name": "ohmyapp"',
  );
  expect((await invoke()).status).not.toBe(0);
  // The exported initializer runs without dependencies or the original checkout.
  await writeFile(
    path.join(destination, ".env.local"),
    "DO_NOT_COPY=secret-fixture",
  );
  await mkdir(path.join(destination, ".data"));
  await writeFile(path.join(destination, ".data/state.json"), "local-fixture");
  const second = path.join(parent, "second");
  const generated = await runScript(
    [
      "scripts/initialize-application.mjs",
      second,
      "Research Desk",
      "research-desk",
      "org.example.research",
      ".research-data",
    ],
    destination,
  );
  expect(generated.stderr, generated.stdout).toBe("");
  expect(generated.status).toBe(0);
  expect(identity.loadIdentity(second).name).toBe("Research Desk");
  expect(
    identity.dataDirectory(identity.loadIdentity(second), second, {}),
  ).not.toBe(
    identity.dataDirectory(identity.loadIdentity(destination), destination, {}),
  );
  for (const omitted of [
    "node_modules",
    ".env.local",
    ".data",
    ".runtime",
    "dist",
    ".git",
    "src/story-web",
    "src/daemon/ohmygame-host.ts",
  ]) {
    await expect(lstat(path.join(second, omitted))).rejects.toMatchObject({
      code: "ENOENT",
    });
  }
}, 180_000);

it("refuses invalid initialization settings and unsafe destinations before writing", async () => {
  const parent = await mkdtemp(path.join(tmpdir(), "init-boundaries-"));
  const destination = path.join(parent, "new");
  const args = ["Notes", "notes", "org.example.notes", ".notes"];
  const invoke = (target: string, values = args) =>
    spawnSync(
      "node",
      ["scripts/initialize-application.mjs", target, ...values],
      { encoding: "utf8" },
    );
  for (const [index, value, field] of [
    [0, "../bad", "name"],
    [1, "@scope/bad", "packageName"],
    [2, "bad", "desktopId"],
    [3, "", "dataDirectory"],
  ] as const) {
    const values = [...args];
    values[index] = value;
    const result = invoke(destination, values);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain(`Invalid application.json ${field}`);
    await expect(lstat(destination)).rejects.toMatchObject({ code: "ENOENT" });
  }
  await mkdir(destination);
  expect(invoke(destination).status).not.toBe(0);
  expect(await readdir(destination)).toEqual([]);
  await writeFile(path.join(destination, "keep.txt"), "unchanged");
  expect(invoke(destination).status).not.toBe(0);
  expect(await readFile(path.join(destination, "keep.txt"), "utf8")).toBe(
    "unchanged",
  );
  const alias = path.join(parent, "alias");
  await symlink(process.cwd(), alias, "junction");
  for (const target of [
    process.cwd(),
    path.join(process.cwd(), "init-boundary-output"),
    path.join(alias, "init-boundary-output"),
  ]) {
    const result = invoke(target);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("Export outside the source checkout");
  }
  await expect(
    lstat(path.join(alias, "init-boundary-output")),
  ).rejects.toMatchObject({ code: "ENOENT" });
});
