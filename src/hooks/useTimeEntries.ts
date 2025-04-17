
import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { format, startOfWeek } from 'date-fns';
import { useAppContext } from "@/context/AppContext";

export const useTimeEntries = (weekDates: string[]) => {
  const { addTimeEntry } = useAppContext();
  const { toast } = useToast();
  
  const [entryRows, setEntryRows] = useState<{
    id: string;
    project: string;
    task: string;
    notes: string;
    hours: { [key: string]: string };
    customerId: string;
  }[]>([]);

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
      
      resetEntries();
    } else {
      toast({
        title: "No entries to save",
        description: "Please add hours to at least one project.",
        variant: "destructive",
      });
    }
  };

  const resetEntries = () => {
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
  };

  return {
    entryRows,
    setEntryRows,
    addEmptyRow,
    handleSaveEntries
  };
};
