import type { FastifyInstance } from "fastify";
import type { ProjectState } from "../shared/contracts.js";
import type { ProjectManager } from "./projects.js";
import type { NodeCodebaseUpdate } from "../shared/playable-codebase.js";
import {
  buildPlayableProject,
  validatePlayableProject,
} from "./playable-project.js";
import { isWebStory } from "./story-web-project.js";
import {
  openNodeCodebaseDetail,
  writeNodeCodebase,
  NodeCodebaseConflictError,
} from "./playable-codebase.js";
import {
  listPlayableThumbnails,
  readPlayableThumbnail,
  readGraphNodeIds,
  writePlayableThumbnail,
  PlayableThumbnailError,
} from "./playable-thumbnails.js";
import {
  addPlayableNode,
  type AddPlayableNodeRequest,
} from "./playable-add-node.js";
import { PLAYABLE_PRESETS } from "./playable-presets.js";
import { sniffImageType } from "./image-format.js";

export function registerStoryProjectRoutes(
  app: FastifyInstance,
  options: {
    projects: ProjectManager;
    storyEnabled: (project: ProjectState) => boolean;
    storyHostEnabled: boolean;
    storyUnavailable: string;
  },
) {
  const { projects, storyEnabled, storyHostEnabled, storyUnavailable } =
    options;
  app.get<{ Params: { projectId: string } }>(
    "/projects/:projectId/playable",
    async (request, reply) => {
      const project = projects.get(request.params.projectId);
      if (!project) return reply.code(404).send({ error: "Project not found" });
      if (project.type !== "interactive-story")
        return reply
          .code(409)
          .send({
            error: "Node Runtime requires an Interactive Story project",
          });
      try {
        const definition = await buildPlayableProject(project.workspacePath);
        if (!definition) return { available: false };
        // A web story carries its own runtime and plays as a page.
        const web = await isWebStory(project.workspacePath);
        return { available: true, definition, ...(web ? { web: true } : {}) };
      } catch (cause) {
        return reply
          .code(400)
          .send({
            error: cause instanceof Error ? cause.message : String(cause),
          });
      }
    },
  );

  app.get<{
    Params: { projectId: string };
    Querystring: { mode?: "draft" | "publish" };
  }>(
    "/projects/:projectId/playable/validation",
    {
      schema: {
        querystring: {
          type: "object",
          additionalProperties: false,
          properties: { mode: { enum: ["draft", "publish"] } },
        },
      },
    },
    async (request, reply) => {
      const project = projects.get(request.params.projectId);
      if (!project) return reply.code(404).send({ error: "Project not found" });
      if (project.type !== "interactive-story")
        return reply
          .code(409)
          .send({
            error: "Playable validation requires an Interactive Story project",
          });
      return validatePlayableProject(
        project.workspacePath,
        request.query.mode ?? "draft",
      );
    },
  );

  app.get<{ Params: { projectId: string } }>(
    "/projects/:projectId/playable/codebase",
    async (request, reply) => {
      const project = projects.get(request.params.projectId);
      if (!project) return reply.code(404).send({ error: "Project not found" });
      if (project.type !== "interactive-story")
        return reply
          .code(409)
          .send({
            error: "Playable codebases require an Interactive Story project",
          });
      try {
        return await openNodeCodebaseDetail(project.workspacePath);
      } catch (cause) {
        return reply
          .code(400)
          .send({
            error: cause instanceof Error ? cause.message : String(cause),
          });
      }
    },
  );

  app.put<{ Params: { projectId: string }; Body: NodeCodebaseUpdate }>(
    "/projects/:projectId/playable/codebase",
    {
      schema: { body: { type: "object" } },
      bodyLimit: 1_000_000,
    },
    async (request, reply) => {
      const project = projects.get(request.params.projectId);
      if (!project) return reply.code(404).send({ error: "Project not found" });
      if (project.type !== "interactive-story")
        return reply
          .code(409)
          .send({
            error: "Playable codebases require an Interactive Story project",
          });
      if (typeof request.body.revision !== "string")
        return reply
          .code(400)
          .send({
            error:
              "Playable codebase updates require the revision they were made from",
          });
      let revision: string;
      try {
        revision = await writeNodeCodebase(project.workspacePath, request.body);
      } catch (cause) {
        return reply
          .code(cause instanceof NodeCodebaseConflictError ? 409 : 400)
          .send({
            error: cause instanceof Error ? cause.message : String(cause),
          });
      }
      try {
        await projects.touch(project.id);
      } catch {
        return reply
          .code(500)
          .send({
            error:
              "Playable codebase was saved, but project metadata could not be updated",
          });
      }
      return { revision };
    },
  );

  app.get<{ Params: { projectId: string } }>(
    "/projects/:projectId/playable/thumbnails",
    async (request, reply) => {
      const project = projects.get(request.params.projectId);
      if (!project) return reply.code(404).send({ error: "Project not found" });
      if (!storyEnabled(project))
        return reply.code(409).send({ error: storyUnavailable });
      try {
        return {
          thumbnails: await listPlayableThumbnails(project.workspacePath),
        };
      } catch (cause) {
        return reply
          .code(400)
          .send({
            error: cause instanceof Error ? cause.message : String(cause),
          });
      }
    },
  );

  app.get<{ Params: { projectId: string; nodeId: string } }>(
    "/projects/:projectId/playable/thumbnails/:nodeId",
    async (request, reply) => {
      const project = projects.get(request.params.projectId);
      if (!project) return reply.code(404).send({ error: "Project not found" });
      if (!storyEnabled(project))
        return reply.code(409).send({ error: storyUnavailable });
      try {
        const image = await readPlayableThumbnail(
          project.workspacePath,
          request.params.nodeId,
        );
        if (!image)
          return reply.code(404).send({ error: "Thumbnail not found" });
        reply.header("content-type", "image/webp");
        reply.header("cache-control", "no-store");
        reply.header("x-content-type-options", "nosniff");
        return reply.send(image);
      } catch (cause) {
        if (cause instanceof PlayableThumbnailError)
          return reply.code(400).send({ error: cause.message });
        throw cause;
      }
    },
  );

  app.put<{
    Params: { projectId: string; nodeId: string };
    Querystring: { hash: string };
    Body: Buffer;
  }>(
    "/projects/:projectId/playable/thumbnails/:nodeId",
    {
      schema: {
        querystring: {
          type: "object",
          additionalProperties: false,
          required: ["hash"],
          properties: { hash: { type: "string", maxLength: 64 } },
        },
      },
    },
    async (request, reply) => {
      const project = projects.get(request.params.projectId);
      if (!project) return reply.code(404).send({ error: "Project not found" });
      if (project.type !== "interactive-story")
        return reply
          .code(409)
          .send({
            error: "Node thumbnails require an Interactive Story project",
          });
      if (!(
        Buffer.isBuffer(request.body) &&
        sniffImageType(request.body) === "image/webp"
      ))
        return reply
          .code(400)
          .send({ error: "A Node thumbnail must be a WebP image" });
      try {
        const nodeIds = await readGraphNodeIds(project.workspacePath);
        return await writePlayableThumbnail(
          project.workspacePath,
          request.params.nodeId,
          request.query.hash,
          request.body,
          nodeIds,
        );
      } catch (cause) {
        if (cause instanceof PlayableThumbnailError)
          return reply.code(400).send({ error: cause.message });
        throw cause;
      }
    },
  );

  app.get("/playable/presets", async (_request, reply) => {
    if (!storyHostEnabled)
      return reply.code(409).send({ error: storyUnavailable });
    return {
      presets: PLAYABLE_PRESETS.map((preset) => ({
        id: preset.id,
        label: preset.label,
        summary: preset.summary,
      })),
    };
  });

  app.post<{ Params: { projectId: string }; Body: AddPlayableNodeRequest }>(
    "/projects/:projectId/playable/nodes",
    {
      schema: {
        body: {
          type: "object",
          additionalProperties: false,
          required: ["preset", "id"],
          properties: {
            preset: { type: "string", maxLength: 60 },
            id: { type: "string", minLength: 1, maxLength: 60 },
            title: { type: "string", maxLength: 120 },
            position: {
              type: "object",
              additionalProperties: false,
              required: ["x", "y"],
              properties: { x: { type: "number" }, y: { type: "number" } },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const project = projects.get(request.params.projectId);
      if (!project) return reply.code(404).send({ error: "Project not found" });
      if (project.type !== "interactive-story")
        return reply
          .code(409)
          .send({
            error: "Playable Nodes require an Interactive Story project",
          });
      let result;
      try {
        result = await addPlayableNode(project.workspacePath, request.body);
      } catch (cause) {
        return reply
          .code(cause instanceof NodeCodebaseConflictError ? 409 : 400)
          .send({
            error: cause instanceof Error ? cause.message : String(cause),
          });
      }
      try {
        await projects.touch(project.id);
      } catch {
        return reply
          .code(500)
          .send({
            error:
              "The Node was created, but project metadata could not be updated",
          });
      }
      return result;
    },
  );
}
