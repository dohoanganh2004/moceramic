import React from "react";

// Shared with pages/admin/custom-orders (kept in sync manually there) so a
// status reads the same colour for both staff and customers.
export const CUSTOM_ORDER_STATUS_COLORS = {
  requested: "secondary",
  reviewing: "info",
  quoted: "primary",
  accepted: "success",
  in_progress: "warning",
  completed: "success",
  cancelled: "danger",
};

const CustomOrderStatusBadge = ({ status }) => (
  <span className={`badge bg-${CUSTOM_ORDER_STATUS_COLORS[status] || "secondary"} text-capitalize`}>
    {(status || "").replace("_", " ")}
  </span>
);

export default CustomOrderStatusBadge;
