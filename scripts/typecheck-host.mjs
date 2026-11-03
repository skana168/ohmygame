import path from "node:path";
import ts from "typescript";
import { excluded } from "./application-source-boundary.mjs";

/** Check the selected source program with the same source-owned host seam as
 * compilation. Required imports retain ordinary TypeScript resolution. */
export function typecheckHost(root, inputs, target = "host") {
  const configPath = path.join(root, "tsconfig.json");
  const config = ts.readConfigFile(configPath, ts.sys.readFile);
  if (config.error)
    throw new Error(
      ts.flattenDiagnosticMessageText(config.error.messageText, "\n"),
    );
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
  const options = { ...parsed.options, noEmit: true };
  const host = ts.createCompilerHost(options);
  host.resolveModuleNameLiterals = (
    literals,
    containingFile,
    redirectedReference,
    compilerOptions,
    containingSourceFile,
  ) =>
    literals.map((literal) => {
      const name = literal.text;
      const selected = name.endsWith("/host-business.js")
        ? "src/daemon/non-game-host.ts"
        : name.endsWith("/business-contributions.js")
          ? "src/renderer/core-contributions.ts"
          : undefined;
      if (selected)
        return {
          resolvedModule: {
            resolvedFileName: path.join(root, selected),
            extension: ts.Extension.Ts,
          },
        };
      return ts.resolveModuleName(
        name,
        containingFile,
        compilerOptions,
        host,
        undefined,
        redirectedReference,
        ts.getModeForUsageLocation(
          containingSourceFile,
          literal,
          compilerOptions,
        ),
      );
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
      `Selected ${target} typecheck failed: ${diagnostics.length} diagnostics`,
    );
  }
  console.log(
    `Selected ${target} typecheck passed: ${program.getSourceFiles().filter((file) => file.fileName.startsWith(path.join(root, "src/"))).length} source files.`,
  );
}
