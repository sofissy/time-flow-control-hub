
import React, { useState, useEffect } from "react";
import { format, startOfWeek, endOfWeek, parseISO, addDays } from "date-fns";
import { useAppContext } from "@/context/AppContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CalendarIcon, CheckCircle, XCircle } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

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
    // For now we'll just group everything under the current user for demo purposes
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
  
  const getStatusBadgeClasses = (status: string) => {
    return cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
      status === "approved" ? "bg-green-100 text-green-800" :
      status === "rejected" ? "bg-red-100 text-red-800" :
      status === "pending" ? "bg-yellow-100 text-yellow-800" :
      status === "reopened" ? "bg-blue-100 text-blue-800" :
      "bg-gray-100 text-gray-800"
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Timesheet Summary</h2>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handlePreviousWeek}>
            Previous Week
          </Button>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(weekStartDate, "MMM d")} - {format(endOfWeek(weekStartDate, { weekStartsOn: 1 }), "MMM d, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center" side="bottom">
              <Calendar
                mode="single"
                captionLayout="dropdown"
                weekStartsOn={1}
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                disabled={(date) =>
                  date < new Date("2020-01-01") || date > new Date("2030-01-01")
                }
                className="rounded-md border shadow-sm"
              />
            </PopoverContent>
          </Popover>

          <Button variant="outline" size="sm" onClick={handleNextWeek}>
            Next Week
          </Button>
        </div>
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
            <TableRow key={item.user.id}>
              <TableCell className="font-medium">
                {item.user.name} {item.user.role === "admin" && <span className="text-xs text-muted-foreground">(Admin)</span>}
              </TableCell>
              
              {item.days.map((day: any, i: number) => (
                <TableCell key={i} className="text-center">
                  {day.hours > 0 ? (
                    <span className={cn(
                      day.hours >= 8 ? "text-green-600" : "text-amber-600"
                    )}>
                      {day.hours.toFixed(1)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
              ))}
              
              <TableCell className="text-center font-bold">
                {item.totalHours.toFixed(1)}
              </TableCell>
              
              <TableCell>
                <span className={getStatusBadgeClasses(item.weekStatus)}>
                  {item.weekStatus.charAt(0).toUpperCase() + item.weekStatus.slice(1)}
                </span>
              </TableCell>
              
              <TableCell>
                {item.weekStatus === "pending" && (
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleApprove(item.user.id)}
                      className="text-green-600"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleReject(item.user.id)}
                      className="text-red-600"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TimesheetSummary;
