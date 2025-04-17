
import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays } from 'date-fns';
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Plus, Save } from "lucide-react";
import TimeEntryTable from "./timesheet/direct-entry/TimeEntryTable";
import { useTimeEntries } from "@/hooks/useTimeEntries";
import { useTimeCalculations } from "@/hooks/useTimeCalculations";

const WeeklyDirectEntry = () => {
  const { selectedDate, customers, getProjectsByCustomer } = useAppContext();
  
  const [weekStartDate, setWeekStartDate] = useState<Date>(
    startOfWeek(selectedDate, { weekStartsOn: 1 })
  );
  
  const weekDates = [...Array(7)].map((_, i) => {
    const date = addDays(weekStartDate, i);
    return format(date, 'yyyy-MM-dd');
  });
  
  useEffect(() => {
    setWeekStartDate(startOfWeek(selectedDate, { weekStartsOn: 1 }));
  }, [selectedDate]);
  
  const {
    entryRows,
    setEntryRows,
    addEmptyRow,
    handleSaveEntries
  } = useTimeEntries(weekDates);
  
  const {
    calculateDailyTotal,
    getDailyTotalColorClass,
    calculateWeeklyTotal
  } = useTimeCalculations();

  // Function to get available projects for a specific customer
  const getAvailableProjectsForRow = (customerId: string) => {
    return getProjectsByCustomer(customerId);
  };

  console.log("Weekly direct entry rows:", entryRows);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Weekly Time Entry</h2>
        <Button onClick={handleSaveEntries}>
          <Save className="mr-2 h-4 w-4" />
          Save All Entries
        </Button>
      </div>
      
      <TimeEntryTable
        weekDates={weekDates}
        entryRows={entryRows}
        customers={customers}
        getAvailableProjectsForRow={getAvailableProjectsForRow}
        onRemoveRow={(id) => setEntryRows(entryRows.filter(row => row.id !== id))}
        onUpdateCustomer={(rowId, customerId) => {
          setEntryRows(entryRows.map(row => 
            row.id === rowId ? 
            { ...row, customerId, project: "" } : 
            row
          ));
        }}
        onUpdateProject={(rowId, projectId) => {
          setEntryRows(entryRows.map(row => 
            row.id === rowId ? 
            { ...row, project: projectId } : 
            row
          ));
        }}
        onUpdateTask={(rowId, task) => {
          setEntryRows(entryRows.map(row => 
            row.id === rowId ? { ...row, task } : row
          ));
        }}
        onUpdateNotes={(rowId, notes) => {
          setEntryRows(entryRows.map(row => 
            row.id === rowId ? { ...row, notes } : row
          ));
        }}
        onUpdateHours={(rowId, date, hours) => {
          setEntryRows(entryRows.map(row => {
            if (row.id === rowId) {
              return {
                ...row,
                hours: {
                  ...row.hours,
                  [date]: hours
                }
              };
            }
            return row;
          }));
        }}
        calculateDailyTotal={(date) => calculateDailyTotal(entryRows, date)}
        getDailyTotalColorClass={getDailyTotalColorClass}
        calculateWeeklyTotal={() => calculateWeeklyTotal(entryRows)}
      />
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={addEmptyRow}>
          <Plus className="mr-2 h-4 w-4" />
          Add Row
        </Button>
      </div>
    </div>
  );
};

export default WeeklyDirectEntry;
