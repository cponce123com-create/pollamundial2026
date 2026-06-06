import { useEffect, useRef, useCallback, useState } from "react";
import { toast } from "sonner";

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

type EventHandler = (event: SSEEvent) => void;

const eventHandlers = new Map<SSEEventType, Set<EventHandler>>();

/**
 * Subscribe to a specific SSE event type.
 */
export function onSSEEvent(type: SSEEventType, handler: EventHandler): () => void {
  if (!eventHandlers.has(type)) {
    eventHandlers.set(type, new Set());
  }
  const handlers = eventHandlers.get(type)!;
  handlers.add(handler);
  return () => {
    handlers.delete(handler);
  };
}

/**
 * Hook that connects to the SSE endpoint and processes events.
 * Shows toast notifications for relevant events.
 */
export function useSSE(clientId?: string): { connected: boolean } {
  const eventSourceRef = useRef<EventSource | null>(null);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef(0);
  const [connected, setConnected] = useState(false);

  const getClientId = useCallback((): string => {
    let id = clientId;
    if (!id) {
      id = localStorage.getItem("sse_client_id") || undefined;
      if (!id) {
        id = `client_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        localStorage.setItem("sse_client_id", id);
      }
    }
    return id;
  }, [clientId]);

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = new EventSource(`/api/events?clientId=${getClientId()}`);
    eventSourceRef.current = es;

    es.addEventListener("connected", () => {
      setConnected(true);
      retryCountRef.current = 0;
    });

    const handleEvent = (eventType: SSEEventType) => (event: MessageEvent) => {
      try {
        const data: SSEEvent = JSON.parse(event.data);
        const handlers = eventHandlers.get(eventType);
        if (handlers) {
          handlers.forEach((handler) => handler(data));
        }

        switch (eventType) {
          case "payment_approved":
            toast.success(`✅ Pago aprobado — Ticket #${data.payload.ticketNumber}`);
            break;
          case "payment_rejected":
            toast.error(`❌ Pago rechazado — Ticket #${data.payload.ticketNumber}${data.payload.reason ? `: ${data.payload.reason}` : ""}`);
            break;
          case "tournament_started":
            toast.info("🏆 ¡El torneo ha comenzado! Las predicciones están cerradas.");
            break;
          case "match_result":
            toast.success(`⚽ Resultado: ${data.payload.homeTeam} ${data.payload.homeScore}-${data.payload.awayScore} ${data.payload.awayTeam}`);
            break;
          case "match_unlocked":
            toast.info("🔓 Un partido ha sido desbloqueado.");
            break;
        }
      } catch {
        // Ignore parse errors
      }
    };

    const eventTypes: SSEEventType[] = [
      "payment_approved", "payment_rejected", "tournament_started",
      "match_result", "match_unlocked", "admin_action",
    ];
    eventTypes.forEach((type) => {
      es.addEventListener(type, handleEvent(type) as EventListener);
    });

    es.onerror = () => {
      setConnected(false);
      es.close();
      eventSourceRef.current = null;

      // Exponential backoff: 2s, 4s, 8s, 16s... max 60s
      const delay = Math.min(2000 * Math.pow(2, retryCountRef.current), 60000);
      retryCountRef.current++;
      console.log(`[SSE] Reconnecting in ${delay}ms (attempt ${retryCountRef.current})`);
      retryTimeoutRef.current = setTimeout(connect, delay);
    };
  }, [getClientId]);

  useEffect(() => {
    connect();

    return () => {
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
      if (eventSourceRef.current) eventSourceRef.current.close();
      setConnected(false);
    };
  }, [connect]);

  return { connected };
}
