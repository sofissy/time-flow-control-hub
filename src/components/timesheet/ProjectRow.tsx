
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface ProjectRowProps {
  projectId: string;
  customerName: string;
  projectName: string;
  dates: Record<string, { hours: number }>;
  weekDates: string[];
  totalHours: number;
}

const ProjectRow = ({
  projectId,
  customerName,
  projectName,
  dates,
  weekDates,
  totalHours,
}: ProjectRowProps) => {
  // Function to determine color class based on hours
  const getHoursColorClass = (hours: number): string => {
    if (hours === 0) return "";
    if (hours > 8) return "text-red-600 font-medium";
    if (hours === 8) return "text-green-600";
    if (hours < 4 && hours > 0) return "text-amber-600";
    return "text-blue-600";
  };

  return (
    <TableRow key={projectId}>
      <TableCell className="font-medium text-sm">
        {customerName}
      </TableCell>
      <TableCell className="font-medium">
        {projectName}
      </TableCell>
      
      {weekDates.map(date => {
        const hours = dates[date]?.hours || 0;
        return (
          <TableCell key={date} className="text-center">
            <span className={cn(getHoursColorClass(hours))}>
              {hours}
            </span>
          </TableCell>
        );
      })}
      
      <TableCell className={cn("text-center font-medium", getHoursColorClass(totalHours))}>
        {totalHours}
      </TableCell>
    </TableRow>
  );
};

export default ProjectRow;
