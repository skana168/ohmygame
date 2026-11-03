import { ExampleNote } from "../modules/example/note.js";
import type { ComponentType } from "react";
import type { NodeProps } from "@xyflow/react";
import type { ProjectState } from "../shared/contracts.js";
import {
  customCanvasNodeIssue,
  type CustomCanvasNode,
} from "../shared/custom-canvas-nodes.js";
import { workspaceHasModule } from "../shared/workspace-policy.js";
import type { AssetCanvasFlowNode } from "./asset-canvas-flow.js";
import { t } from "./i18n.js";

export interface CustomCanvasRendererProps {
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
}
export interface CanvasRendererContribution {
  module: string;
  kind: string;
  component: ComponentType<CustomCanvasRendererProps>;
}

/** Compiled components only. Register domain renderers here alongside shared contracts. */
export const canvasRendererContributions: readonly CanvasRendererContribution[] =
  [{ module: "example", kind: "note", component: ExampleNote }];

export function CustomCanvasNodeRenderer({
  data,
}: Pick<NodeProps<AssetCanvasFlowNode>, "data">) {
  const payload = data as unknown as CustomCanvasNode["data"];
  const runtime = data.customRuntime as
    | { project: ProjectState; onChange: CustomCanvasRendererProps["onChange"] }
    | undefined;
  const renderer = canvasRendererContributions.find(
    (entry) => entry.module === payload.module && entry.kind === payload.kind,
  );
  const unavailable =
    !runtime ||
    !workspaceHasModule(runtime.project, payload.module) ||
    !renderer;
  const issue = customCanvasNodeIssue(payload);
  const Component = renderer?.component;
  return (
    <div className="story-text-node" style={{ width: 320, padding: 16 }}>
      {unavailable || issue ? (
        <div role="alert">
          {t(unavailable ? "customCanvas.missing" : "customCanvas.invalid", {
            module: payload.module,
            kind: payload.kind,
          })}
          {issue && <pre>{issue}</pre>}
        </div>
      ) : (
        Component && (
          <Component value={payload.value} onChange={runtime.onChange} />
        )
      )}
    </div>
  );
}
