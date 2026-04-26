import type { WsMessage, TraeTask, TaskStatus } from "../types";

type MessageHandler = (msg: WsMessage) => void;

const RECONNECT_BASE_MS = 3000;
const RECONNECT_MAX_MS = 30000;

export class WsClient {
  private ws: WebSocket | null = null;
  private url: string;
  private token: string;
  private handlers: Map<string, Set<MessageHandler>> = new Map();
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private onConnectionChange: (connected: boolean, reconnecting: boolean) => void;
  private disposed = false;

  constructor(
    url: string,
    token: string,
    onConnectionChange: (connected: boolean, reconnecting: boolean) => void,
  ) {
    this.url = url;
    this.token = token;
    this.onConnectionChange = onConnectionChange;
  }

  connect(): void {
    if (this.disposed) return;
    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.onConnectionChange(true, false);
        this.send("auth", { token: this.token });
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          const msg: WsMessage = JSON.parse(event.data);
          this.dispatch(msg);
        } catch {
          console.warn("Failed to parse WS message");
        }
      };

      this.ws.onclose = () => {
        this.stopHeartbeat();
        this.onConnectionChange(false, false);
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        this.onConnectionChange(false, false);
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  on(type: string, handler: MessageHandler): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);
    return () => this.handlers.get(type)?.delete(handler);
  }

  send(type: string, payload: unknown, requestId?: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const msg: WsMessage = {
        type,
        payload,
        timestamp: new Date().toISOString(),
        requestId,
      };
      this.ws.send(JSON.stringify(msg));
    }
  }

  dispose(): void {
    this.disposed = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.stopHeartbeat();
    this.ws?.close();
  }

  private dispatch(msg: WsMessage): void {
    const handlers = this.handlers.get(msg.type);
    if (handlers) {
      handlers.forEach((h) => h(msg));
    }
    const wildcard = this.handlers.get("*");
    if (wildcard) {
      wildcard.forEach((h) => h(msg));
    }
  }

  private scheduleReconnect(): void {
    if (this.disposed) return;
    const delay = Math.min(
      RECONNECT_BASE_MS * Math.pow(2, this.reconnectAttempts),
      RECONNECT_MAX_MS,
    );
    this.reconnectAttempts++;
    this.onConnectionChange(false, true);
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      this.send("ping", {});
    }, 30000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
}

export function parseTaskFromPayload(payload: unknown): TraeTask | null {
  if (!payload || typeof payload !== "object") return null;
  const p = payload as Record<string, unknown>;
  return {
    id: String(p.id ?? ""),
    title: String(p.title ?? ""),
    status: (p.status as TaskStatus) ?? "waiting",
    tokenSpeed: Number(p.tokenSpeed ?? 0),
    inputTokens: Number(p.inputTokens ?? 0),
    outputTokens: Number(p.outputTokens ?? 0),
    totalTokens: Number(p.totalTokens ?? 0),
    model: String(p.model ?? ""),
    startedAt: String(p.startedAt ?? new Date().toISOString()),
    updatedAt: String(p.updatedAt ?? new Date().toISOString()),
    approvalMessage: p.approvalMessage ? String(p.approvalMessage) : undefined,
  };
}
