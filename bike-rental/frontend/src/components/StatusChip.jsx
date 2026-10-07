import React from "react";
import { statusClass, statusLabel } from "../utils.js";

// Coloured pill for a booking status with visual pulse for pending
export default function StatusChip({ status }) {
  const cls = statusClass[status] || "chip-neutral";
  const label = statusLabel[status] || status;

  return (
    <span className={`chip ${cls}`}>
      {label}
    </span>
  );
}
