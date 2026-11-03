import path from "node:path";

/** Resolve the source-registered host assembly; no business implementation is substituted. */
export function hostAssemblyPlugin(root, nonGame) {
  return {
    name: "application-host-assembly",
    setup(builder) {
      if (!nonGame) return;
      builder.onResolve({ filter: /(?:^|\/)host-business\.js$/ }, () => ({
        path: path.join(root, "src/daemon/non-game-host.ts"),
      }));
      builder.onLoad(
        { filter: /\/shared\/application-selection\.ts$/ },
        () => ({
          contents:
            'export const applicationCompositionId = "non-game" as const;',
          loader: "ts",
        }),
      );
    },
  };
}
