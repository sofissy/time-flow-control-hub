
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import ProjectRow from "./ProjectRow";
import DailyTotalsRow from "./DailyTotalsRow";

interface ProjectGroup {
  projectId: string;
  projectName: string;
  customerName: string;
  customerId: string;
  dates: Record<string, {
    hours: number;
    entries: any[];
  }>;
}

interface TimesheetTableProps {
  weekDates: string[];
  groupedEntries: ProjectGroup[];
  getDailyTotal: (date: string) => number;
  getWeeklyTotal: () => number;
  getDailyTotalColorClass: (hours: number) => string;
}

const TimesheetTable = ({
  weekDates,
  groupedEntries,
  getDailyTotal,
  getWeeklyTotal,
  getDailyTotalColorClass,
}: TimesheetTableProps) => {
  return (
    <div className="bg-white rounded-lg border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-32">Customer</TableHead>
            <TableHead className="w-40">Project</TableHead>
            {weekDates.map((date, index) => (
              <TableHead key={date} className="text-center w-20">
                {format(new Date(date), 'EEE')}<br />
                {format(new Date(date), 'MMM d')}
              </TableHead>
            ))}
            <TableHead className="text-center w-24">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groupedEntries.length > 0 ? (
            <>
              {groupedEntries.map((projectGroup) => (
                <ProjectRow
                  key={projectGroup.projectId}
                  projectId={projectGroup.projectId}
                  customerName={projectGroup.customerName}
                  projectName={projectGroup.projectName}
                  dates={projectGroup.dates}
                  weekDates={weekDates}
                  totalHours={Object.values(projectGroup.dates).reduce((sum, day) => sum + day.hours, 0)}
                />
              ))}
              
              <DailyTotalsRow
                weekDates={weekDates}
                getDailyTotal={getDailyTotal}
                getWeeklyTotal={getWeeklyTotal}
                getDailyTotalColorClass={getDailyTotalColorClass}
              />
            </>
          ) : (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                No time entries found for this week. Use the "My Time Entry" tab to add entries.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TimesheetTable;
