import { WebSocketServer, WebSocket } from "ws";
import { createServer } from "http";
import express from "express";
import cors from "cors";
import type { TaskStatus } from "../src/types";

interface MockTask {
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

const PORT = 18731;

const mockTasks: MockTask[] = [
  {
    id: "task-1",
    title: "重构用户认证模块",
    status: "processing",
    tokenSpeed: 42.5,
    inputTokens: 1200,
    outputTokens: 3500,
    totalTokens: 4700,
    model: "claude-3.5-sonnet",
    startedAt: new Date(Date.now() - 60000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "task-2",
    title: "编写单元测试",
    status: "waiting",
    tokenSpeed: 0,
    inputTokens: 800,
    outputTokens: 0,
    totalTokens: 800,
    model: "claude-3.5-sonnet",
    startedAt: new Date(Date.now() - 30000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "task-3",
    title: "删除临时文件",
    status: "approval-pending",
    tokenSpeed: 0,
    inputTokens: 500,
    outputTokens: 200,
    totalTokens: 700,
    model: "claude-3.5-sonnet",
    startedAt: new Date(Date.now() - 120000).toISOString(),
    updatedAt: new Date().toISOString(),
    approvalMessage: "需要确认删除 /tmp/old-build 目录",
  },
];

const app = express();
app.use(cors());
app.use(express.json());

const authMiddleware: express.RequestHandler = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
};

app.get("/api/tasks", authMiddleware, (_req, res) => {
  res.json(mockTasks);
});

app.post("/api/tasks/:id/action", authMiddleware, (req, res) => {
  const { id } = req.params;
  const { action } = req.body as { action: string };
  const task = mockTasks.find((t) => t.id === id);
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  if (action === "cancel") {
    task.status = "failed";
    task.updatedAt = new Date().toISOString();
    broadcastTaskStatus(task);
    res.json({ success: true });
  } else if (action === "approve") {
    task.status = "processing";
    task.updatedAt = new Date().toISOString();
    broadcastTaskStatus(task);
    res.json({ success: true });
  } else if (action === "reject") {
    task.status = "failed";
    task.updatedAt = new Date().toISOString();
    broadcastTaskStatus(task);
    res.json({ success: true });
  } else {
    res.status(400).json({ error: "Invalid action" });
  }
});

const server = createServer(app);
const wss = new WebSocketServer({ server });

const clients = new Set<WebSocket>();

wss.on("connection", (ws) => {
  clients.add(ws);
  console.log("Client connected");

  ws.on("message", (data) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.type === "auth") {
        console.log("Auth received:", msg.payload);
      } else if (msg.type === "ping") {
        ws.send(JSON.stringify({ type: "pong", payload: {}, timestamp: new Date().toISOString() }));
      } else if (msg.type === "task:focus") {
        console.log("Focus task:", msg.payload);
      }
    } catch {
      console.warn("Invalid message received");
    }
  });

  ws.on("close", () => {
    clients.delete(ws);
    console.log("Client disconnected");
  });

  mockTasks.forEach((task) => {
    ws.send(
      JSON.stringify({
        type: "task:status-changed",
        payload: task,
        timestamp: new Date().toISOString(),
      }),
    );
  });
});

function broadcastTaskStatus(task: MockTask) {
  const msg = JSON.stringify({
    type: "task:status-changed",
    payload: task,
    timestamp: new Date().toISOString(),
  });
  clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(msg);
    }
  });
}

let speedCounter = 0;
setInterval(() => {
  const processingTask = mockTasks.find((t) => t.status === "processing");
  if (processingTask) {
    speedCounter = 30 + Math.random() * 40;
    processingTask.tokenSpeed = speedCounter;
    processingTask.outputTokens += Math.floor(speedCounter);
    processingTask.totalTokens = processingTask.inputTokens + processingTask.outputTokens;
    processingTask.updatedAt = new Date().toISOString();

    const msg = JSON.stringify({
      type: "task:token-speed",
      payload: { taskId: processingTask.id, speed: speedCounter },
      timestamp: new Date().toISOString(),
    });
    clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(msg);
      }
    });
  }
}, 1000);

setInterval(() => {
  const waitingTask = mockTasks.find((t) => t.status === "waiting");
  if (waitingTask && Math.random() > 0.7) {
    waitingTask.status = "processing";
    waitingTask.updatedAt = new Date().toISOString();
    broadcastTaskStatus(waitingTask);
  }
}, 5000);

server.listen(PORT, () => {
  console.log(`Mock server running on http://localhost:${PORT} (HTTP + WebSocket)`);
});
