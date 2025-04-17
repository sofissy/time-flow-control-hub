
import React from 'react';
import { Table, TableHeader, TableHead, TableBody, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import EntryRow from "./EntryRow";
import DailyTotalsRow from "./DailyTotalsRow";
import { Customer, Project } from "@/context/AppContext";

interface TimeEntryTableProps {
  weekDates: string[];
  entryRows: Array<{
    id: string;
    project: string;
    task: string;
    notes: string;
    hours: { [key: string]: string };
    customerId: string;
  }>;
  customers: Customer[];
  onRemoveRow: (id: string) => void;
  onUpdateCustomer: (rowId: string, customerId: string) => void;
  onUpdateProject: (rowId: string, projectId: string) => void;
  onUpdateTask: (rowId: string, task: string) => void;
  onUpdateNotes: (rowId: string, notes: string) => void;
  onUpdateHours: (rowId: string, date: string, hours: string) => void;
  getAvailableProjectsForRow: (customerId: string) => Project[];
  calculateDailyTotal: (date: string) => number;
  getDailyTotalColorClass: (hours: number) => string;
  calculateWeeklyTotal: () => number;
}

const TimeEntryTable = ({
  weekDates,
  entryRows,
  customers,
  onRemoveRow,
  onUpdateCustomer,
  onUpdateProject,
  onUpdateTask,
  onUpdateNotes,
  onUpdateHours,
  getAvailableProjectsForRow,
  calculateDailyTotal,
  getDailyTotalColorClass,
  calculateWeeklyTotal
}: TimeEntryTableProps) => {
  return (
    <div className="bg-white rounded-lg border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-40">Customer</TableHead>
            <TableHead className="w-40">Project</TableHead>
            <TableHead className="w-40">Task</TableHead>
            {weekDates.map((date) => (
              <TableHead key={date} className="text-center w-20">
                {format(new Date(date), 'EEE')}<br />
                {format(new Date(date), 'MMM d')}
              </TableHead>
            ))}
            <TableHead className="w-40">Notes</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entryRows.map((row, index) => (
            <EntryRow
              key={row.id}
              row={row}
              weekDates={weekDates}
              customers={customers}
              onRemove={onRemoveRow}
              onUpdateCustomer={onUpdateCustomer}
              onUpdateProject={onUpdateProject}
              onUpdateTask={onUpdateTask}
              onUpdateNotes={onUpdateNotes}
              onUpdateHours={onUpdateHours}
              getAvailableProjectsForRow={getAvailableProjectsForRow}
              isLastRow={entryRows.length === 1}
            />
          ))}
          <DailyTotalsRow
            weekDates={weekDates}
            calculateDailyTotal={calculateDailyTotal}
            getDailyTotalColorClass={getDailyTotalColorClass}
            calculateWeeklyTotal={calculateWeeklyTotal}
          />
        </TableBody>
      </Table>
    </div>
  );
};

export default TimeEntryTable;
