/** Source module identities match tool contribution owners; core is always present. */
export interface WorkspaceManifest {
  version: 1;
  modules: { id: string; config: Record<string, unknown> }[];
}

export const WORKSPACE_MANIFEST_FILE = "workspace.json";

/** Application-supplied metadata only; workspace JSON cannot import implementations. */
export interface WorkspaceModuleDescriptor {
  id: string;
  configSchema: object;
  requires?: readonly string[];
  conflicts?: readonly string[];
  agentInstructions?: string;
  canvasNodes?: readonly { kind: string; dataSchema: object }[];
}

export const WORKSPACE_MANIFEST_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["version", "modules"],
  properties: {
    version: { const: 1 },
    modules: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "config"],
        properties: {
          id: { type: "string", minLength: 1 },
          config: { type: "object" },
        },
      },
    },
  },
} as const;

const emptyConfig = {
  type: "object",
  additionalProperties: false,
  properties: {},
};
export const OHMYGAME_WORKSPACE_MODULES: readonly WorkspaceModuleDescriptor[] =
  [
    { id: "game", configSchema: emptyConfig },
    { id: "interactive-story", configSchema: emptyConfig, requires: ["game"] },
  ];
