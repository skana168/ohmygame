import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import type { Readable } from "node:stream";
import { ZipFile } from "yazl";
import { PUBLISH_GAME_COVER_PATH } from "../shared/publish-v1.js";
import { compressArchiveFile } from "./archive-compression.js";

export class ArchiveError extends Error {
  constructor(
    message: string,
    readonly statusCode = 409,
  ) {
    super(message);
  }
}

export async function createPluginArchive(
  source: string,
  maxBytes = 25 * 1024 * 1024,
  preserveExecutable = false,
): Promise<Buffer> {
  return createZip(source, true, undefined, maxBytes, preserveExecutable);
}

export async function createZip(
  source: string,
  plugin = false,
  cover?: Buffer,
  maxBytes?: number,
  preserveExecutable = false,
  media?: { optimize(filename: string): Promise<string> },
): Promise<Buffer> {
  const zip = new ZipFile();
  const files = await filesIn(source, "", plugin);
  const zipOptions = {
    mtime: new Date(1980, 0, 2),
    forceDosTimestamp: true,
    // Deflate output differs between zlib builds, so Plugin entries are stored
    // to keep the archive's checksum the same on every runtime.
    ...(plugin ? { mode: 0o100644, compress: false } : {}),
  } as const;
  if (cover !== undefined && files.includes(PUBLISH_GAME_COVER_PATH)) {
    throw new ArchiveError(
      `Publish output uses reserved path: ${PUBLISH_GAME_COVER_PATH}`,
    );
  }
  for (const file of files) {
    const original = path.join(source, ...file.split("/"));
    const filename = media ? await media.optimize(original) : original;
    const executable =
      preserveExecutable && ((await stat(filename)).mode & 0o111) !== 0;
    const options = {
      ...zipOptions,
      compress: !plugin && compressArchiveFile(file),
    };
    zip.addFile(
      filename,
      file,
      executable ? { ...options, mode: 0o100755 } : options,
    );
  }
  if (cover !== undefined)
    zip.addBuffer(cover, PUBLISH_GAME_COVER_PATH, {
      ...zipOptions,
      compress: false,
    });
  const chunks: Buffer[] = [];
  const output = zip.outputStream as Readable;
  const completed = new Promise<Buffer>((resolve, reject) => {
    let bytes = 0;
    output.on("data", (chunk: Buffer) => {
      bytes += chunk.length;
      if (maxBytes !== undefined && bytes > maxBytes) {
        output.destroy(
          new ArchiveError(
            `Publish artifact exceeds ${maxBytes / (1024 * 1024)} MB`,
            413,
          ),
        );
        return;
      }
      chunks.push(chunk);
    });
    output.once("error", reject);
    // yazl reports a file it cannot stat or read on the ZipFile, possibly once per file, and then never ends the output.
    zip.on("error", reject);
    output.once("end", () => resolve(Buffer.concat(chunks)));
  });
  zip.end();
  return completed;
}

async function filesIn(
  root: string,
  relative = "",
  plugin = false,
): Promise<string[]> {
  const files: string[] = [];
  const directory = path.join(root, relative);
  for (const entry of (await readdir(directory, { withFileTypes: true })).sort(
    (a, b) => a.name.localeCompare(b.name),
  )) {
    if (ignored(entry.name, relative, plugin) || entry.isSymbolicLink())
      continue;
    const child = relative ? `${relative}/${entry.name}` : entry.name;
    if (entry.isDirectory())
      files.push(...(await filesIn(root, child, plugin)));
    else if (entry.isFile()) files.push(child);
  }
  return files;
}

function ignored(name: string, relative: string, plugin: boolean): boolean {
  if (
    name === "node_modules" ||
    name === ".git" ||
    name === ".data" ||
    (!plugin && name === "AGENTS.md")
  )
    return true;
  if (!name.startsWith(".")) return false;
  return !(plugin && !relative && name === ".ohmygame-plugin");
}
