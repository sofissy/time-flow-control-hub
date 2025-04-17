
import React, { useState, useEffect } from "react";
import { format, startOfWeek, endOfWeek, addDays } from "date-fns";
import { useAppContext } from "@/context/AppContext";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import WeekNavigation from "./timesheet/WeekNavigation";
import TimesheetRow from "./timesheet/TimesheetRow";

const TimesheetSummary = () => {
  const { 
    users, 
    timeEntries, 
    weekStatuses,
    getWeekStatus,
    updateWeekStatus,
    canManageTimesheets, 
    currentUser,
    getTotalHoursForWeek
  } = useAppContext();
  const { toast } = useToast();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [weekStartDate, setWeekStartDate] = useState<Date>(startOfWeek(selectedDate, { weekStartsOn: 1 }));
  const [userTimesheets, setUserTimesheets] = useState<any[]>([]);

  // Ensure we're only showing this to admins
  if (!canManageTimesheets()) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-yellow-700">Only administrators can view timesheet summaries.</p>
      </div>
    );
  }
  
  useEffect(() => {
    setWeekStartDate(startOfWeek(selectedDate, { weekStartsOn: 1 }));
  }, [selectedDate]);
  
  useEffect(() => {
    const weekStartFormatted = format(weekStartDate, "yyyy-MM-dd");
    
    // Group by user - in a real app, this would use the entry.userId
    const summaries = users.map(user => {
      const totalHours = getTotalHoursForWeek(weekStartFormatted);
      const weekStatus = getWeekStatus(weekStartFormatted);
      
      return {
        user,
        totalHours,
        weekStatus: weekStatus?.status || "draft",
        days: [...Array(7)].map((_, i) => {
          const day = format(addDays(weekStartDate, i), "yyyy-MM-dd");
          const dayEntries = timeEntries.filter(e => e.date === day);
          return {
            date: day,
            hours: dayEntries.reduce((sum, e) => sum + e.hours, 0)
          };
        })
      };
    });
    
    setUserTimesheets(summaries);
  }, [timeEntries, weekStartDate, users, getWeekStatus, getTotalHoursForWeek]);
  
  const handlePreviousWeek = () => {
    const previousWeek = addDays(weekStartDate, -7);
    setWeekStartDate(previousWeek);
    setSelectedDate(previousWeek);
  };

  const handleNextWeek = () => {
    const nextWeek = addDays(weekStartDate, 7);
    setWeekStartDate(nextWeek);
    setSelectedDate(nextWeek);
  };
  
  const handleApprove = (userId: string) => {
    const weekStart = format(weekStartDate, "yyyy-MM-dd");
    updateWeekStatus(weekStart, "approved");
    
    toast({
      title: "Timesheet approved",
      description: "The timesheet has been approved successfully",
    });
  };
  
  const handleReject = (userId: string) => {
    const weekStart = format(weekStartDate, "yyyy-MM-dd");
    updateWeekStatus(weekStart, "rejected");
    
    toast({
      title: "Timesheet rejected",
      description: "The timesheet has been rejected",
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Timesheet Summary</h2>
        
        <WeekNavigation 
          selectedDate={selectedDate}
          weekStartDate={weekStartDate}
          onPreviousWeek={handlePreviousWeek}
          onNextWeek={handleNextWeek}
          onSelectDate={(date) => date && setSelectedDate(date)}
        />
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            {[...Array(7)].map((_, i) => {
              const day = addDays(weekStartDate, i);
              return (
                <TableHead key={i} className="text-center">
                  {format(day, "EEE")}<br />
                  {format(day, "MMM d")}
                </TableHead>
              );
            })}
            <TableHead className="text-center">Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {userTimesheets.map((item, index) => (
            <TimesheetRow
              key={item.user.id}
              user={item.user}
              days={item.days}
              totalHours={item.totalHours}
              weekStatus={item.weekStatus}
              weekStartDate={weekStartDate}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TimesheetSummary;
