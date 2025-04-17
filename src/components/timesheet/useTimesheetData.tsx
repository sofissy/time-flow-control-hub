
import { useState, useEffect } from "react";
import { format, startOfWeek } from "date-fns";
import { useAppContext, TimeEntry } from "@/context/AppContext";

export const useTimesheetData = () => {
  const { 
    timeEntries,
    customers,
    projects,
    updateWeekStatus,
    selectedDate,
    getEntriesForDate,
    getWeekStatus,
    canEditTimesheet
  } = useAppContext();
  
  const [weekStartDate, setWeekStartDate] = useState<Date>(
    startOfWeek(selectedDate, { weekStartsOn: 1 })
  );
  const [weekEntries, setWeekEntries] = useState<TimeEntry[]>([]);
  const [weekDates, setWeekDates] = useState<string[]>([]);
  const [weekStatus, setWeekStatus] = useState<string>("draft");
  const [isEditable, setIsEditable] = useState<boolean>(true);
  
  // Update week start date when selected date changes
  useEffect(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    setWeekStartDate(start);
    
    // Generate array of dates for the week
    const dates = [...Array(7)].map((_, i) => {
      return format(new Date(start.getTime() + i * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
    });
    setWeekDates(dates);
  }, [selectedDate]);
  
  // Load entries for the current week
  useEffect(() => {
    if (weekDates.length > 0) {
      const entries: TimeEntry[] = [];
      
      weekDates.forEach(date => {
        const dayEntries = getEntriesForDate(date);
        entries.push(...dayEntries);
      });
      
      setWeekEntries(entries);
      console.log("Week entries loaded:", entries.length);
      
      // Get week status
      const weekStart = format(weekStartDate, 'yyyy-MM-dd');
      const status = getWeekStatus(weekStart);
      setWeekStatus(status?.status || "draft");
      
      // Check if timesheet is editable
      setIsEditable(canEditTimesheet(weekStart));
    }
  }, [weekDates, timeEntries, getEntriesForDate, getWeekStatus, canEditTimesheet, weekStartDate]);
  
  // Group entries by project and date
  const getGroupedEntries = () => {
    const groupedByProject: Record<string, {
      projectId: string,
      projectName: string,
      customerName: string,
      customerId: string,
      dates: Record<string, {
        hours: number,
        entries: TimeEntry[]
      }>
    }> = {};
    
    weekEntries.forEach(entry => {
      if (!entry.projectId) return;
      
      const project = projects.find(p => p.id === entry.projectId);
      const customer = customers.find(c => c.id === entry.customerId);
      
      if (!project || !customer) {
        console.log("Missing project or customer for entry:", entry);
        return;
      }
      
      if (!groupedByProject[entry.projectId]) {
        groupedByProject[entry.projectId] = {
          projectId: entry.projectId,
          projectName: project.name,
          customerName: customer.name,
          customerId: customer.id,
          dates: {}
        };
      }
      
      if (!groupedByProject[entry.projectId].dates[entry.date]) {
        groupedByProject[entry.projectId].dates[entry.date] = {
          hours: 0,
          entries: []
        };
      }
      
      groupedByProject[entry.projectId].dates[entry.date].hours += entry.hours;
      groupedByProject[entry.projectId].dates[entry.date].entries.push(entry);
    });
    
    return Object.values(groupedByProject);
  };
  
  // Calculate total hours for a specific date
  const getDailyTotal = (date: string): number => {
    return weekEntries
      .filter(entry => entry.date === date)
      .reduce((total, entry) => total + entry.hours, 0);
  };
  
  // Calculate total weekly hours
  const getWeeklyTotal = (): number => {
    return weekEntries.reduce((total, entry) => total + entry.hours, 0);
  };
  
  // Get color class based on daily hours
  const getDailyTotalColorClass = (hours: number): string => {
    if (hours === 0) return "text-gray-400";
    if (hours > 8) return "text-red-500 font-bold";
    if (hours === 8) return "text-green-500 font-medium";
    if (hours < 4) return "text-amber-500 font-medium";
    return "text-blue-500 font-medium";
  };
  
  const handleUpdateWeekStatus = (weekStartISO: string, status: string) => {
    updateWeekStatus(weekStartISO, status);
    setWeekStatus(status);
  };

  return {
    weekStartDate,
    weekDates,
    weekStatus,
    isEditable,
    getGroupedEntries,
    getDailyTotal,
    getWeeklyTotal,
    getDailyTotalColorClass,
    handleUpdateWeekStatus
  };
};
