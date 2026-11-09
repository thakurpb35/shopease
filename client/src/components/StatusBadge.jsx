import React from "react";
import { STATUS_STYLE } from "../utils.js";

export default function StatusBadge({ status }) {
  return <span className={`badge text-bg-${STATUS_STYLE[status] || "secondary"} text-capitalize`}>{status}</span>;
}
