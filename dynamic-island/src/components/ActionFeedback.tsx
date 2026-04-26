import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ActionFeedbackProps {
  feedback: { type: "success" | "error"; message: string } | null;
}

export const ActionFeedback: React.FC<ActionFeedbackProps> = ({ feedback }) => {
  return (
    <AnimatePresence>
      {feedback && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 14px",
            borderRadius: "12px",
            backgroundColor:
              feedback.type === "success"
                ? "rgba(34, 197, 94, 0.9)"
                : "rgba(239, 68, 68, 0.9)",
            fontSize: "12px",
            fontWeight: 600,
            color: "#fff",
            pointerEvents: "none",
            zIndex: 100,
          }}
        >
          <span>{feedback.type === "success" ? "✓" : "✕"}</span>
          <span>{feedback.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
