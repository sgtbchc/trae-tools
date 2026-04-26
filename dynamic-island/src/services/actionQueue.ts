interface QueuedAction {
  id: string;
  type: "cancel" | "approve" | "reject" | "focus";
  taskId: string;
  timestamp: number;
  retryCount: number;
}

const MAX_RETRIES = 3;
const STORAGE_KEY = "trae-island-action-queue";

export class OfflineActionQueue {
  private queue: QueuedAction[] = [];
  private isOnline = true;
  private processing = false;

  constructor() {
    this.loadFromStorage();
  }

  setOnline(online: boolean): void {
    this.isOnline = online;
    if (online) {
      this.processQueue();
    }
  }

  enqueue(type: QueuedAction["type"], taskId: string): void {
    const action: QueuedAction = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      taskId,
      timestamp: Date.now(),
      retryCount: 0,
    };
    this.queue.push(action);
    this.saveToStorage();

    if (this.isOnline) {
      this.processQueue();
    }
  }

  getPendingCount(): number {
    return this.queue.length;
  }

  hasPending(): boolean {
    return this.queue.length > 0;
  }

  private async processQueue(): Promise<void> {
    if (this.processing || !this.isOnline || this.queue.length === 0) return;
    this.processing = true;

    while (this.queue.length > 0 && this.isOnline) {
      const action = this.queue[0];
      try {
        await this.executeAction(action);
        this.queue.shift();
        this.saveToStorage();
      } catch {
        action.retryCount++;
        if (action.retryCount >= MAX_RETRIES) {
          this.queue.shift();
          this.saveToStorage();
        } else {
          break;
        }
      }
    }

    this.processing = false;
  }

  private async executeAction(action: QueuedAction): Promise<void> {
    const API_BASE = "http://localhost:18731/api";
    const token = "local-dev-token";

    if (action.type === "focus") {
      return;
    }

    const res = await fetch(`${API_BASE}/tasks/${action.taskId}/action`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: action.type }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
    } catch {
      // storage unavailable
    }
  }

  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        this.queue = JSON.parse(data);
      }
    } catch {
      this.queue = [];
    }
  }
}
