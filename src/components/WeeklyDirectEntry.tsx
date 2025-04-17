
import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays } from 'date-fns';
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Save } from "lucide-react";
import TimeEntryTable from "./timesheet/direct-entry/TimeEntryTable";

const WeeklyDirectEntry = () => {
  const { 
    addTimeEntry, 
    customers, 
    projects,
    selectedDate,
    getProjectsByCustomer
  } = useAppContext();
  const { toast } = useToast();
  
  const [weekStartDate, setWeekStartDate] = useState<Date>(startOfWeek(selectedDate, { weekStartsOn: 1 }));
  const [entryRows, setEntryRows] = useState<{
    id: string;
    project: string;
    task: string;
    notes: string;
    hours: { [key: string]: string };
    customerId: string;
  }[]>([]);
  
  const weekDates = [...Array(7)].map((_, i) => {
    const date = addDays(weekStartDate, i);
    return format(date, 'yyyy-MM-dd');
  });
  
  useEffect(() => {
    setWeekStartDate(startOfWeek(selectedDate, { weekStartsOn: 1 }));
  }, [selectedDate]);
  
  useEffect(() => {
    if (entryRows.length === 0) {
      addEmptyRow();
    }
  }, []);
  
  const addEmptyRow = () => {
    const emptyHours: { [key: string]: string } = {};
    weekDates.forEach(date => {
      emptyHours[date] = "0";
    });
    
    setEntryRows([
      ...entryRows,
      {
        id: Math.random().toString(),
        project: "",
        task: "",
        notes: "",
        hours: emptyHours,
        customerId: ""
      }
    ]);
  };

  const handleSaveEntries = () => {
    let entriesAdded = 0;
    
    entryRows.forEach(row => {
      if (!row.project) return;
      
      Object.entries(row.hours).forEach(([date, hours]) => {
        const hoursValue = parseFloat(hours);
        if (hoursValue > 0) {
          addTimeEntry({
            date,
            project: row.project,
            task: row.task,
            hours: hoursValue,
            notes: row.notes || "",
            customerId: row.customerId,
            projectId: row.project,
            description: row.notes || "",
          });
          entriesAdded++;
        }
      });
    });
    
    if (entriesAdded > 0) {
      toast({
        title: "Time entries saved",
        description: `${entriesAdded} time entries have been saved successfully.`,
      });
      
      const emptyHours: { [key: string]: string } = {};
      weekDates.forEach(date => {
        emptyHours[date] = "0";
      });
      
      setEntryRows([{
        id: Math.random().toString(),
        project: "",
        task: "",
        notes: "",
        hours: emptyHours,
        customerId: ""
      }]);
    } else {
      toast({
        title: "No entries to save",
        description: "Please add hours to at least one project.",
        variant: "destructive",
      });
    }
  };

  const calculateDailyTotal = (date: string): number => {
    return entryRows.reduce((total, row) => {
      return total + parseFloat(row.hours[date] || "0");
    }, 0);
  };

  const getDailyTotalColorClass = (hours: number): string => {
    if (hours === 0) return "text-gray-400";
    if (hours > 8) return "text-red-500 font-bold";
    if (hours === 8) return "text-green-500 font-medium";
    if (hours < 4) return "text-amber-500 font-medium";
    return "text-blue-500 font-medium";
  };

  const calculateWeeklyTotal = (): number => {
    return weekDates.reduce((total, date) => {
      return total + calculateDailyTotal(date);
    }, 0);
  };

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
          const numericHours = hours.replace(/[^0-9.]/g, '');
          setEntryRows(entryRows.map(row => {
            if (row.id === rowId) {
              return {
                ...row,
                hours: {
                  ...row.hours,
                  [date]: numericHours
                }
              };
            }
            return row;
          }));
        }}
        getAvailableProjectsForRow={(customerId) => getProjectsByCustomer(customerId)}
        calculateDailyTotal={calculateDailyTotal}
        getDailyTotalColorClass={getDailyTotalColorClass}
        calculateWeeklyTotal={calculateWeeklyTotal}
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
