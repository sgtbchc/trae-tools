export type TaskStatus = "waiting" | "processing" | "completed" | "failed" | "approval-pending";

export interface TraeTask {
  id: string;
  title: string;
  status: TaskStatus;
  tokenSpeed: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  model: string;
  startedAt: string;
  updatedAt: string;
  approvalMessage?: string;
}

export interface TokenSpeedRecord {
  timestamp: number;
  speed: number;
}

export interface QuotaInfo {
  platform: string;
  windows: {
    fiveHour: QuotaWindow;
    weekly: QuotaWindow;
    monthly: QuotaWindow;
  };
  lastUpdated: string;
  isStale: boolean;
}

export interface QuotaWindow {
  used: number;
  remaining: number;
  total: number;
}

export type IslandState = "compact" | "expanded" | "full";

export interface WsMessage {
  type: string;
  payload: unknown;
  timestamp: string;
  requestId?: string;
}

export type WsEventType =
  | "task:status-changed"
  | "task:token-speed"
  | "task:approval-required"
  | "token:updated"
  | "token:session-ended"
  | "quota:updated"
  | "quota:low"
  | "connection:status";

export interface ConnectionStatus {
  connected: boolean;
  reconnecting: boolean;
  lastConnected?: string;
}
