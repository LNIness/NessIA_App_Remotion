import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import express, { Request, Response } from "express";
import crypto from "crypto";

export const setupMcp = (app: express.Application) => {
  const sessions = new Map<string, { transport: StreamableHTTPServerTransport; server: McpServer }>();

  const createServer = () => {
    const server = new McpServer({
      name: "remotion-render",
      version: "1.0.0",
    });

    server.registerTool(
      "render_video",
      {
        description: "Lance un rendu vidéo Remotion à partir d'une liste de clips avec transitions, effets et audio optionnel.",
        inputSchema: z.object({
          clips: z.array(z.object({
            id: z.string(),
            type: z.enum(["image", "video"]),
            url: z.string(),
            duration: z.number(),
            trimStart: z.number().optional(),
            transitionToNext: z.object({
              type: z.enum(["whiteFade", "swipeLeft", "swipeRight", "swipeUp", "swipeDown"]),
              timing: z.enum(["linear", "spring"]).optional(),
              durationInFrames: z.number().optional(),
              damping: z.number().optional(),
            }).optional(),
            effect: z.object({
              type: z.enum(["zoomIn", "zoomOut", "kenBurns"]),
              intensity: z.number().optional(),
              fromX: z.number().optional(),
              fromY: z.number().optional(),
              toX: z.number().optional(),
              toY: z.number().optional(),
            }).optional(),
          })),
          width: z.number().optional(),
          height: z.number().optional(),
          fps: z.number().optional(),
          audio: z.object({
            musicUrl: z.string(),
            volume: z.number().optional(),
          }).optional(),
        }) as unknown as import("@modelcontextprotocol/sdk/server/zod-compat").AnySchema,
      },
      async (inputProps: any) => {
        const response = await fetch("http://localhost:3000/render", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(inputProps),
        });
        const result = await response.json();
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result) }],
        };
      }
    );

    return server;
  };

  app.post("/mcp", async (req: Request, res: Response) => {
    const sessionId = req.headers["mcp-session-id"] as string;
    let session = sessions.get(sessionId);

    if (!session) {
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => crypto.randomUUID(),
        onsessioninitialized: (id) => {
          sessions.set(id, { transport, server });
        },
      });
      const server = createServer();
      await server.connect(transport);
      session = { transport, server };
    }

    await session.transport.handleRequest(req, res, req.body);
  });

  app.get("/mcp", async (req: Request, res: Response) => {
    const sessionId = req.headers["mcp-session-id"] as string;
    const session = sessions.get(sessionId);
    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }
    await session.transport.handleRequest(req, res);
  });

  app.delete("/mcp", async (req: Request, res: Response) => {
    const sessionId = req.headers["mcp-session-id"] as string;
    sessions.delete(sessionId);
    res.status(200).json({ success: true });
  });
};