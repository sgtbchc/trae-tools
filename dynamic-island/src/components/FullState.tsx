import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { TraeTask, TokenSpeedRecord, ConnectionStatus } from "../types";

const STATUS_COLORS: Record<string, string> = {
  waiting: "var(--color-waiting)",
  processing: "var(--color-processing)",
  completed: "var(--color-completed)",
  failed: "var(--color-failed)",
  "approval-pending": "var(--color-approval)",
};

const STATUS_LABELS: Record<string, string> = {
  waiting: "等待中",
  processing: "处理中",
  completed: "已完成",
  failed: "失败",
  "approval-pending": "待审批",
};

interface FullStateProps {
  tasks: TraeTask[];
  tokenSpeedHistory: TokenSpeedRecord[];
  connection: ConnectionStatus;
  onCancel: (taskId: string) => void;
  onApprove: (taskId: string) => void;
  onReject: (taskId: string) => void;
  onTaskClick: (taskId: string) => void;
  onBack: () => void;
}

export const FullState: React.FC<FullStateProps> = ({
  tasks,
  tokenSpeedHistory,
  connection,
  onCancel,
  onApprove,
  onReject,
  onTaskClick,
  onBack: _onBack,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      style={{
        padding: "16px 20px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        width: "380px",
        maxHeight: "200px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
        <span style={{ fontSize: "13px", fontWeight: 600 }}>Trae 任务</span>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: connection.connected ? "var(--color-completed)" : "var(--color-failed)",
            }}
          />
          <span style={{ fontSize: "10px", color: "var(--color-text-secondary)" }}>
            {connection.connected ? "已连接" : connection.reconnecting ? "重连中..." : "未连接"}
          </span>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
        }}
      >
        <AnimatePresence>
          {tasks.length === 0 ? (
            <div style={{ fontSize: "12px", color: "var(--color-text-dim)", textAlign: "center", padding: "16px 0" }}>
              无活跃任务
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                tokenSpeedHistory={tokenSpeedHistory}
                onCancel={() => onCancel(task.id)}
                onApprove={() => onApprove(task.id)}
                onReject={() => onReject(task.id)}
                onClick={() => onTaskClick(task.id)}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const TaskCard: React.FC<{
  task: TraeTask;
  tokenSpeedHistory: TokenSpeedRecord[];
  onCancel: () => void;
  onApprove: () => void;
  onReject: () => void;
  onClick: () => void;
}> = ({ task, tokenSpeedHistory, onCancel, onApprove, onReject, onClick }) => {
  const statusColor = STATUS_COLORS[task.status] || "var(--color-text-dim)";
  const avgSpeed =
    tokenSpeedHistory.length > 0
      ? tokenSpeedHistory.reduce((s, r) => s + r.speed, 0) / tokenSpeedHistory.length
      : 0;

  const [confirmCancel, setConfirmCancel] = React.useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      style={{
        padding: "8px 12px",
        borderRadius: "10px",
        backgroundColor: "rgba(255,255,255,0.06)",
        cursor: "pointer",
      }}
      onClick={onClick}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flex: 1, overflow: "hidden" }}>
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: statusColor,
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: "12px", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {task.title}
          </span>
        </div>
        <span style={{ fontSize: "10px", color: statusColor, flexShrink: 0, marginLeft: "8px" }}>
          {STATUS_LABELS[task.status]}
        </span>
      </div>

      <div style={{ display: "flex", gap: "12px", fontSize: "10px", color: "var(--color-text-secondary)", marginTop: "4px" }}>
        <span>{task.totalTokens.toLocaleString()} tokens</span>
        {task.status === "processing" && <span>{avgSpeed.toFixed(1)} tok/s</span>}
        <span>{task.model}</span>
      </div>

      {task.status === "approval-pending" && (
        <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
          <button
            onClick={(e) => { e.stopPropagation(); onApprove(); }}
            style={{
              flex: 1, padding: "4px 0", border: "none", borderRadius: "6px",
              backgroundColor: "var(--color-approval)", color: "#fff", fontSize: "11px",
              fontWeight: 600, cursor: "pointer",
            }}
          >
            批准
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onReject(); }}
            style={{
              flex: 1, padding: "4px 0", border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "6px", backgroundColor: "transparent",
              color: "var(--color-text-secondary)", fontSize: "11px", cursor: "pointer",
            }}
          >
            拒绝
          </button>
        </div>
      )}

      {task.status === "processing" && !confirmCancel && (
        <button
          onClick={(e) => { e.stopPropagation(); setConfirmCancel(true); }}
          style={{
            marginTop: "4px", padding: "2px 8px", border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "4px", backgroundColor: "transparent",
            color: "var(--color-text-secondary)", fontSize: "10px", cursor: "pointer",
          }}
        >
          取消
        </button>
      )}

      {confirmCancel && (
        <div style={{ display: "flex", gap: "6px", marginTop: "4px", alignItems: "center" }}>
          <span style={{ fontSize: "10px", color: "var(--color-text-secondary)" }}>确认取消？</span>
          <button
            onClick={(e) => { e.stopPropagation(); onCancel(); setConfirmCancel(false); }}
            style={{
              padding: "2px 8px", border: "none", borderRadius: "4px",
              backgroundColor: "var(--color-failed)", color: "#fff", fontSize: "10px", cursor: "pointer",
            }}
          >
            确认
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setConfirmCancel(false); }}
            style={{
              padding: "2px 8px", border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "4px", backgroundColor: "transparent",
              color: "var(--color-text-secondary)", fontSize: "10px", cursor: "pointer",
            }}
          >
            取消
          </button>
        </div>
      )}
    </motion.div>
  );
};
