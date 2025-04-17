
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";

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
  return (
    <TableRow key={projectId}>
      <TableCell className="font-medium text-sm">
        {customerName}
      </TableCell>
      <TableCell className="font-medium">
        {projectName}
      </TableCell>
      
      {weekDates.map(date => (
        <TableCell key={date} className="text-center">
          {dates[date]?.hours || 0}
        </TableCell>
      ))}
      
      <TableCell className="text-center font-medium">
        {totalHours}
      </TableCell>
    </TableRow>
  );
};

export default ProjectRow;
