import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import express, { Request, Response } from "express";
import crypto from "crypto";

// Configure le serveur MCP (Model Context Protocol) sur l'application Express
// Utilisé uniquement pour Copilot Agent en mode développement — pas pour n8n en production
export const setupMcp = (app: express.Application) => {
  // Stockage des sessions MCP actives — une session par client connecté
  const sessions = new Map<string, { transport: StreamableHTTPServerTransport; server: McpServer }>();

  // Crée une instance MCP avec l'outil render_video enregistré
  const createServer = () => {
    const server = new McpServer({
      name: "remotion-render",
      version: "1.0.0",
    });

    // Outil exposé à Copilot Agent — schéma identique au contrat JSON de l'API /render
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
              durationInFrames: z.number().optional(), // linear uniquement
              damping: z.number().optional(),          // spring uniquement
            }).optional(),
            effect: z.object({
              type: z.enum(["zoomIn", "zoomOut", "kenBurns"]),
              intensity: z.number().optional(),
              fromX: z.number().optional(), // kenBurns uniquement
              fromY: z.number().optional(), // kenBurns uniquement
              toX: z.number().optional(),   // kenBurns uniquement
              toY: z.number().optional(),   // kenBurns uniquement
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
      // Délègue le rendu à l'API /render — le MCP est un simple proxy
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

  // POST /mcp — initialise une session ou réutilise une session existante
  app.post("/mcp", async (req: Request, res: Response) => {
    const sessionId = req.headers["mcp-session-id"] as string;
    let session = sessions.get(sessionId);

    if (!session) {
      // Nouvelle session — crée un transport et un serveur MCP dédiés
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

  // GET /mcp — stream SSE pour les événements MCP (notifications, progression)
  app.get("/mcp", async (req: Request, res: Response) => {
    const sessionId = req.headers["mcp-session-id"] as string;
    const session = sessions.get(sessionId);
    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }
    await session.transport.handleRequest(req, res);
  });

  // DELETE /mcp — ferme et supprime une session MCP
  app.delete("/mcp", async (req: Request, res: Response) => {
    const sessionId = req.headers["mcp-session-id"] as string;
    sessions.delete(sessionId);
    res.status(200).json({ success: true });
  });
};