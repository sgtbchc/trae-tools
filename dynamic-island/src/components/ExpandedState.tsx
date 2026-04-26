import React from "react";
import { motion } from "framer-motion";
import type { TraeTask, TokenSpeedRecord } from "../types";

const STATUS_LABELS: Record<string, string> = {
  waiting: "等待中",
  processing: "处理中",
  completed: "已完成",
  failed: "失败",
  "approval-pending": "待审批",
};

const STATUS_COLORS: Record<string, string> = {
  waiting: "var(--color-waiting)",
  processing: "var(--color-processing)",
  completed: "var(--color-completed)",
  failed: "var(--color-failed)",
  "approval-pending": "var(--color-approval)",
};

interface ExpandedStateProps {
  task: TraeTask | null;
  tokenSpeedHistory: TokenSpeedRecord[];
  onCancel: () => void;
  onApprove: () => void;
  onReject: () => void;
  onClick: () => void;
}

export const ExpandedState: React.FC<ExpandedStateProps> = ({
  task,
  tokenSpeedHistory,
  onCancel,
  onApprove,
  onReject,
  onClick,
}) => {
  if (!task) {
    return (
      <div
        style={{
          padding: "12px 20px",
          fontSize: "13px",
          color: "var(--color-text-dim)",
          cursor: "pointer",
        }}
        onClick={onClick}
      >
        无活跃任务
      </div>
    );
  }

  const statusColor = STATUS_COLORS[task.status] || "var(--color-text-dim)";
  const avgSpeed =
    tokenSpeedHistory.length > 0
      ? tokenSpeedHistory.reduce((s, r) => s + r.speed, 0) / tokenSpeedHistory.length
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        padding: "12px 20px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        cursor: "pointer",
        minWidth: "280px",
      }}
      onClick={onClick}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: statusColor,
              boxShadow: `0 0 10px ${statusColor}`,
            }}
          />
          <span style={{ fontSize: "13px", fontWeight: 600 }}>{task.title}</span>
        </div>
        <span
          style={{
            fontSize: "11px",
            color: statusColor,
            backgroundColor: `${statusColor}20`,
            padding: "2px 8px",
            borderRadius: "10px",
          }}
        >
          {STATUS_LABELS[task.status]}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "11px", color: "var(--color-text-secondary)" }}>
        <span>Token: {task.totalTokens.toLocaleString()}</span>
        {task.status === "processing" && (
          <span style={{ color: "var(--color-processing)" }}>
            {avgSpeed.toFixed(1)} tok/s
          </span>
        )}
        <span>{task.model}</span>
      </div>

      {task.status === "processing" && tokenSpeedHistory.length > 1 && (
        <Sparkline data={tokenSpeedHistory} />
      )}

      {task.status === "approval-pending" && (
        <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
          <button
            onClick={(e) => { e.stopPropagation(); onApprove(); }}
            style={{
              flex: 1,
              padding: "6px 0",
              border: "none",
              borderRadius: "8px",
              backgroundColor: "var(--color-approval)",
              color: "#fff",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            批准
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onReject(); }}
            style={{
              flex: 1,
              padding: "6px 0",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "8px",
              backgroundColor: "transparent",
              color: "var(--color-text-secondary)",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            拒绝
          </button>
        </div>
      )}

      {task.status === "processing" && (
        <button
          onClick={(e) => { e.stopPropagation(); onCancel(); }}
          style={{
            padding: "4px 12px",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "6px",
            backgroundColor: "transparent",
            color: "var(--color-text-secondary)",
            fontSize: "11px",
            cursor: "pointer",
            alignSelf: "flex-end",
          }}
        >
          取消
        </button>
      )}
    </motion.div>
  );
};

const Sparkline: React.FC<{ data: TokenSpeedRecord[] }> = ({ data }) => {
  const width = 240;
  const height = 24;
  const maxSpeed = Math.max(...data.map((d) => d.speed), 1);

  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - (d.speed / maxSpeed) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <polyline
        points={points}
        fill="none"
        stroke="var(--color-processing)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
};
