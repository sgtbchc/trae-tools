import React from "react";
import { motion } from "framer-motion";
import type { TraeTask, ConnectionStatus } from "../types";

const STATUS_COLORS: Record<string, string> = {
  waiting: "var(--color-waiting)",
  processing: "var(--color-processing)",
  completed: "var(--color-completed)",
  failed: "var(--color-failed)",
  "approval-pending": "var(--color-approval)",
};

interface CompactStateProps {
  task: TraeTask | null;
  taskCount: number;
  connection: ConnectionStatus;
  onClick: () => void;
}

export const CompactState: React.FC<CompactStateProps> = ({
  task,
  taskCount,
  connection,
  onClick,
}) => {
  const statusColor = task ? STATUS_COLORS[task.status] || "var(--color-text-dim)" : "var(--color-text-dim)";

  return (
    <motion.div
      className="compact-state"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "6px 16px",
        cursor: "pointer",
        minWidth: "120px",
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          backgroundColor: statusColor,
          boxShadow: task ? `0 0 8px ${statusColor}` : "none",
        }}
      />

      {task ? (
        <>
          <span
            style={{
              fontSize: "12px",
              fontWeight: 500,
              color: "var(--color-text)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "140px",
            }}
          >
            {task.title}
          </span>
          {taskCount > 1 && (
            <span
              style={{
                fontSize: "10px",
                backgroundColor: "rgba(255,255,255,0.15)",
                borderRadius: "8px",
                padding: "1px 6px",
                color: "var(--color-text-secondary)",
              }}
            >
              +{taskCount - 1}
            </span>
          )}
        </>
      ) : (
        <span
          style={{
            fontSize: "12px",
            color: connection.connected ? "var(--color-text-dim)" : "var(--color-failed)",
          }}
        >
          {connection.connected ? "Trae" : "●"}
        </span>
      )}
    </motion.div>
  );
};
