
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface DailyTotalsRowProps {
  weekDates: string[];
  getDailyTotal: (date: string) => number;
  getWeeklyTotal: () => number;
  getDailyTotalColorClass: (hours: number) => string;
}

const DailyTotalsRow = ({
  weekDates,
  getDailyTotal,
  getWeeklyTotal,
  getDailyTotalColorClass,
}: DailyTotalsRowProps) => {
  return (
    <TableRow className="bg-muted/50">
      <TableCell colSpan={2} className="font-medium">
        Daily Total
      </TableCell>
      {weekDates.map(date => {
        const hours = getDailyTotal(date);
        return (
          <TableCell key={date} className={cn("text-center font-medium", getDailyTotalColorClass(hours))}>
            {hours}
          </TableCell>
        );
      })}
      <TableCell className="text-center font-bold text-lg bg-muted">
        {getWeeklyTotal()}
      </TableCell>
    </TableRow>
  );
};

export default DailyTotalsRow;
