
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { format, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import TimesheetStatusBadge from "./TimesheetStatusBadge";
import TimesheetActionButtons from "./TimesheetActionButtons";

type DayData = {
  date: string;
  hours: number;
};

type TimesheetRowProps = {
  user: {
    id: string;
    name: string;
    role: string;
  };
  days: DayData[];
  totalHours: number;
  weekStatus: string;
  weekStartDate: Date;
  onApprove: (userId: string) => void;
  onReject: (userId: string) => void;
};

const TimesheetRow = ({
  user,
  days,
  totalHours,
  weekStatus,
  weekStartDate,
  onApprove,
  onReject,
}: TimesheetRowProps) => {
  return (
    <TableRow>
      <TableCell className="font-medium">
        {user.name} {user.role === "admin" && <span className="text-xs text-muted-foreground">(Admin)</span>}
      </TableCell>
      
      {days.map((day, i) => (
        <TableCell key={i} className="text-center">
          {day.hours > 0 ? (
            <span className={cn(
              day.hours >= 8 ? "text-green-600" : "text-amber-600"
            )}>
              {day.hours.toFixed(1)}
            </span>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </TableCell>
      ))}
      
      <TableCell className="text-center font-bold">
        {totalHours.toFixed(1)}
      </TableCell>
      
      <TableCell>
        <TimesheetStatusBadge status={weekStatus} />
      </TableCell>
      
      <TableCell>
        <TimesheetActionButtons
          status={weekStatus}
          onApprove={() => onApprove(user.id)}
          onReject={() => onReject(user.id)}
        />
      </TableCell>
    </TableRow>
  );
};

export default TimesheetRow;
