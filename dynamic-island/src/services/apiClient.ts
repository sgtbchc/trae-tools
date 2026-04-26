import type { TraeTask, TaskStatus } from "../types";

const API_BASE = "http://localhost:18731/api";

export async function fetchTasks(token: string): Promise<TraeTask[]> {
  const res = await fetch(`${API_BASE}/tasks`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return (data as unknown[]).map(parseTask);
}

export async function cancelTask(token: string, taskId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/tasks/${taskId}/action`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action: "cancel" }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

export async function approveTask(token: string, taskId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/tasks/${taskId}/action`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action: "approve" }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

export async function rejectTask(token: string, taskId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/tasks/${taskId}/action`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action: "reject" }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

function parseTask(raw: unknown): TraeTask {
  const p = raw as Record<string, unknown>;
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
