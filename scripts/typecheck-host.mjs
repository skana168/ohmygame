import path from "node:path";
import ts from "typescript";
import { excluded } from "./application-source-boundary.mjs";

/** Check the selected source program with the same source-owned host seam as
 * compilation. Required imports retain ordinary TypeScript resolution. */
export function typecheckHost(root, inputs) {
  const configPath = path.join(root, "tsconfig.json");
  const config = ts.readConfigFile(configPath, ts.sys.readFile);
  if (config.error)
    throw new Error(
      ts.flattenDiagnosticMessageText(config.error.messageText, "\n"),
    );
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
  const options = { ...parsed.options, noEmit: true };
  const host = ts.createCompilerHost(options);
  host.resolveModuleNames = (names, containingFile) =>
    names.map((name) => {
      if (name.endsWith("/host-business.js"))
        return {
          resolvedFileName: path.join(root, "src/daemon/non-game-host.ts"),
          extension: ts.Extension.Ts,
        };
      return ts.resolveModuleName(name, containingFile, options, host)
        .resolvedModule;
    });
  const readFile = host.readFile.bind(host);
  host.readFile = (file) =>
    file === path.join(root, "src/shared/application-selection.ts")
      ? 'export const applicationCompositionId = "non-game" as const;'
      : readFile(file);
  const program = ts.createProgram(
    inputs.map((file) => path.join(root, file)),
    options,
    host,
  );
  const unavailable = program
    .getSourceFiles()
    .filter((file) => excluded(root, file.fileName));
  if (unavailable.length)
    throw new Error(
      `Excluded type inputs remain: ${unavailable.map((file) => file.fileName).join(", ")}`,
    );
  const diagnostics = ts.getPreEmitDiagnostics(program);
  if (diagnostics.length) {
    console.error(
      ts.formatDiagnosticsWithColorAndContext(diagnostics, {
        getCanonicalFileName: (file) => file,
        getCurrentDirectory: () => root,
        getNewLine: () => "\n",
      }),
    );
    throw new Error(
      `Selected host typecheck failed: ${diagnostics.length} diagnostics`,
    );
  }
  console.log(
    `Selected host typecheck passed: ${program.getSourceFiles().filter((file) => file.fileName.startsWith(path.join(root, "src/"))).length} source files.`,
  );
}
