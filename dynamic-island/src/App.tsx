import React, { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIslandStore } from "./hooks/useIslandStore";
import { useMonitorPosition } from "./hooks/useMonitorPosition";
import { WsClient, parseTaskFromPayload } from "./services/wsClient";
import { OfflineActionQueue } from "./services/actionQueue";
import { cancelTask, approveTask, rejectTask, fetchTasks } from "./services/apiClient";
import { CompactState } from "./components/CompactState";
import { ExpandedState } from "./components/ExpandedState";
import { FullState } from "./components/FullState";
import { ActionFeedback } from "./components/ActionFeedback";
import type { IslandState } from "./types";

const WS_URL = "ws://localhost:18731";
const TRAE_TOKEN = "local-dev-token";

const ISLAND_SIZES: Record<IslandState, { width: number; height: number }> = {
  compact: { width: 200, height: 36 },
  expanded: { width: 300, height: 140 },
  full: { width: 400, height: 200 },
};

const App: React.FC = () => {
  const store = useIslandStore();
  const { positionOnMonitor } = useMonitorPosition();
  const wsRef = useRef<WsClient | null>(null);
  const queueRef = useRef<OfflineActionQueue>(new OfflineActionQueue());
  const leaveTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const ws = new WsClient(WS_URL, TRAE_TOKEN, (connected, reconnecting) => {
      store.setConnection({ connected, reconnecting });
      queueRef.current.setOnline(connected);
    });

    ws.on("task:status-changed", (msg) => {
      const task = parseTaskFromPayload(msg.payload);
      if (task) {
        store.updateTask(task.id, task);
        if (!store.tasks.find((t) => t.id === task.id)) {
          store.setTasks([...store.tasks, task]);
        }
      }
    });

    ws.on("task:token-speed", (msg) => {
      const p = msg.payload as Record<string, unknown>;
      store.addTokenSpeed(Number(p.speed ?? 0));
    });

    ws.on("task:approval-required", (msg) => {
      const task = parseTaskFromPayload(msg.payload);
      if (task) {
        store.updateTask(task.id, { status: "approval-pending", approvalMessage: task.approvalMessage });
      }
    });

    ws.connect();
    wsRef.current = ws;

    fetchTasks(TRAE_TOKEN)
      .then((tasks) => store.setTasks(tasks))
      .catch(() => {});

    return () => {
      ws.dispose();
    };
  }, []);

  useEffect(() => {
    const size = ISLAND_SIZES[store.islandState];
    positionOnMonitor("primary", size.width, size.height);
  }, [store.islandState, positionOnMonitor]);

  const handleMouseEnter = useCallback(() => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    if (store.islandState === "compact" && store.activeTask) {
      store.setIslandState("expanded");
    }
  }, [store.islandState, store.activeTask]);

  const handleMouseLeave = useCallback(() => {
    leaveTimer.current = setTimeout(() => {
      if (store.islandState === "expanded") {
        store.setIslandState("compact");
      }
    }, 800);
  }, [store.islandState]);

  const handleCancel = useCallback(
    async (taskId: string) => {
      if (!store.connection.connected) {
        queueRef.current.enqueue("cancel", taskId);
        store.showActionFeedback("success", "已排队");
        return;
      }
      try {
        await cancelTask(TRAE_TOKEN, taskId);
        store.showActionFeedback("success", "已取消");
      } catch {
        store.showActionFeedback("error", "取消失败");
      }
    },
    [store],
  );

  const handleApprove = useCallback(
    async (taskId: string) => {
      if (!store.connection.connected) {
        queueRef.current.enqueue("approve", taskId);
        store.showActionFeedback("success", "已排队");
        return;
      }
      try {
        await approveTask(TRAE_TOKEN, taskId);
        store.showActionFeedback("success", "已批准");
      } catch {
        store.showActionFeedback("error", "操作失败");
      }
    },
    [store],
  );

  const handleReject = useCallback(
    async (taskId: string) => {
      if (!store.connection.connected) {
        queueRef.current.enqueue("reject", taskId);
        store.showActionFeedback("success", "已排队");
        return;
      }
      try {
        await rejectTask(TRAE_TOKEN, taskId);
        store.showActionFeedback("success", "已拒绝");
      } catch {
        store.showActionFeedback("error", "操作失败");
      }
    },
    [store],
  );

  const handleTaskClick = useCallback((taskId: string) => {
    wsRef.current?.send("task:focus", { taskId });
  }, []);

  const size = ISLAND_SIZES[store.islandState];

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingTop: "4px",
      }}
    >
      <motion.div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        animate={{
          width: size.width,
          height: size.height,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 25,
        }}
        style={{
          backgroundColor: "var(--island-bg)",
          borderRadius: "var(--island-radius)",
          boxShadow: "var(--island-shadow)",
          overflow: "hidden",
          position: "relative",
          cursor: "pointer",
        }}
      >
        <AnimatePresence mode="wait">
          {store.islandState === "compact" && (
            <CompactState
              key="compact"
              task={store.activeTask}
              taskCount={store.tasks.length}
              connection={store.connection}
              onClick={store.toggleIsland}
            />
          )}

          {store.islandState === "expanded" && (
            <ExpandedState
              key="expanded"
              task={store.activeTask}
              tokenSpeedHistory={store.tokenSpeedHistory}
              onCancel={() => store.activeTask && handleCancel(store.activeTask.id)}
              onApprove={() => store.activeTask && handleApprove(store.activeTask.id)}
              onReject={() => store.activeTask && handleReject(store.activeTask.id)}
              onClick={store.toggleIsland}
            />
          )}

          {store.islandState === "full" && (
            <FullState
              key="full"
              tasks={store.tasks}
              tokenSpeedHistory={store.tokenSpeedHistory}
              connection={store.connection}
              onCancel={handleCancel}
              onApprove={handleApprove}
              onReject={handleReject}
              onTaskClick={handleTaskClick}
              onBack={() => store.setIslandState("compact")}
            />
          )}
        </AnimatePresence>

        <ActionFeedback feedback={store.actionFeedback} />

        {queueRef.current.hasPending() && (
          <div
            style={{
              position: "absolute",
              bottom: "4px",
              right: "8px",
              fontSize: "9px",
              color: "var(--color-waiting)",
            }}
          >
            {queueRef.current.getPendingCount()} 待执行
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default App;
