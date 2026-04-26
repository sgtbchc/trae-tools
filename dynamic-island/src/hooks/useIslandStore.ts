import { useState, useCallback, useRef } from "react";
import type { TraeTask, IslandState, TokenSpeedRecord, ConnectionStatus } from "../types";

interface IslandStore {
  islandState: IslandState;
  setIslandState: (state: IslandState) => void;
  toggleIsland: () => void;
  tasks: TraeTask[];
  setTasks: (tasks: TraeTask[]) => void;
  updateTask: (id: string, partial: Partial<TraeTask>) => void;
  activeTask: TraeTask | null;
  tokenSpeedHistory: TokenSpeedRecord[];
  addTokenSpeed: (speed: number) => void;
  connection: ConnectionStatus;
  setConnection: (status: Partial<ConnectionStatus>) => void;
  actionFeedback: { type: "success" | "error"; message: string } | null;
  showActionFeedback: (type: "success" | "error", message: string) => void;
}

export function useIslandStore(): IslandStore {
  const [islandState, setIslandState] = useState<IslandState>("compact");
  const [tasks, setTasks] = useState<TraeTask[]>([]);
  const [tokenSpeedHistory, setTokenSpeedHistory] = useState<TokenSpeedRecord[]>([]);
  const [connection, setConnectionRaw] = useState<ConnectionStatus>({
    connected: false,
    reconnecting: false,
  });
  const [actionFeedback, setActionFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const feedbackTimer = useRef<ReturnType<typeof setTimeout>>();

  const toggleIsland = useCallback(() => {
    setIslandState((prev) => {
      if (prev === "compact") return "expanded";
      if (prev === "expanded") return "full";
      return "compact";
    });
  }, []);

  const updateTask = useCallback((id: string, partial: Partial<TraeTask>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...partial } : t)),
    );
  }, []);

  const activeTask = tasks.find(
    (t) => t.status === "processing" || t.status === "approval-pending",
  ) || tasks[0] || null;

  const addTokenSpeed = useCallback((speed: number) => {
    const record: TokenSpeedRecord = { timestamp: Date.now(), speed };
    setTokenSpeedHistory((prev) => {
      const next = [...prev, record];
      const cutoff = Date.now() - 60000;
      return next.filter((r) => r.timestamp > cutoff);
    });
  }, []);

  const setConnection = useCallback((status: Partial<ConnectionStatus>) => {
    setConnectionRaw((prev) => ({ ...prev, ...status }));
  }, []);

  const showActionFeedback = useCallback(
    (type: "success" | "error", message: string) => {
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
      setActionFeedback({ type, message });
      feedbackTimer.current = setTimeout(() => setActionFeedback(null), 1500);
    },
    [],
  );

  return {
    islandState,
    setIslandState,
    toggleIsland,
    tasks,
    setTasks,
    updateTask,
    activeTask,
    tokenSpeedHistory,
    addTokenSpeed,
    connection,
    setConnection,
    actionFeedback,
    showActionFeedback,
  };
}
