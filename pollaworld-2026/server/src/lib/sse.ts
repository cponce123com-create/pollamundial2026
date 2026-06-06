/**
 * SSE (Server-Sent Events) event bus for real-time notifications.
 * Allows the server to push events to connected clients.
 */

import { Request, Response } from "express";
import logger from "./logger";

interface SSEClient {
  id: string;
  res: Response;
}

const clients = new Map<string, SSEClient>();

export type SSEEventType =
  | "payment_approved"
  | "payment_rejected"
  | "tournament_started"
  | "match_result"
  | "match_unlocked"
  | "admin_action";

interface SSEEvent {
  type: SSEEventType;
  payload: Record<string, unknown>;
  timestamp: string;
}

/**
 * GET /api/events — SSE endpoint for clients to subscribe
 */
export function sseHandler(req: Request, res: Response): void {
  const clientId = req.query.clientId as string || `client_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no",
  });

  // Send initial connection event
  res.write(`event: connected\ndata: ${JSON.stringify({ clientId })}\n\n`);

  const client: SSEClient = { id: clientId, res };
  clients.set(clientId, client);
  logger.info({ clientId, totalClients: clients.size }, "SSE client connected");

  // Heartbeat to keep connection alive
  const heartbeat = setInterval(() => {
    res.write(": heartbeat\n\n");
  }, 30_000);

  // Clean up on disconnect
  req.on("close", () => {
    clearInterval(heartbeat);
    clients.delete(clientId);
    logger.info({ clientId, totalClients: clients.size }, "SSE client disconnected");
  });
}

/**
 * Broadcast an event to all connected SSE clients.
 */
export function broadcastEvent(type: SSEEventType, payload: Record<string, unknown>): void {
  const event: SSEEvent = { type, payload, timestamp: new Date().toISOString() };
  const data = `event: ${type}\ndata: ${JSON.stringify(event)}\n\n`;

  let sent = 0;
  for (const [id, client] of clients) {
    try {
      client.res.write(data);
      sent++;
    } catch (err) {
      logger.warn({ clientId: id }, "Failed to send SSE event, removing client");
      clients.delete(id);
    }
  }

  if (sent > 0) {
    logger.debug({ type, sent }, "SSE event broadcast");
  }
}

/**
 * Get current connected client count.
 */
export function getSSEClientCount(): number {
  return clients.size;
}
