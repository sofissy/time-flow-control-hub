
import React from "react";
import { cn } from "@/lib/utils";

type TimesheetStatusBadgeProps = {
  status: string;
};

const TimesheetStatusBadge = ({ status }: TimesheetStatusBadgeProps) => {
  const getStatusBadgeClasses = (status: string) => {
    return cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
      status === "approved" ? "bg-green-100 text-green-800" :
      status === "rejected" ? "bg-red-100 text-red-800" :
      status === "pending" ? "bg-yellow-100 text-yellow-800" :
      status === "reopened" ? "bg-blue-100 text-blue-800" :
      "bg-gray-100 text-gray-800"
    );
  };

  return (
    <span className={getStatusBadgeClasses(status)}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default TimesheetStatusBadge;
