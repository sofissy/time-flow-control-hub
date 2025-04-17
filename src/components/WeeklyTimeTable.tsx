
import React, { useState, useEffect } from "react";
import { format, startOfWeek, addDays, parseISO } from "date-fns";
import { useToast } from "@/components/ui/use-toast"; 
import { useAppContext, TimeEntry } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Check, X, AlertCircle, Clock } from "lucide-react";

const WeeklyTimeTable = () => {
  const { toast } = useToast();
  const { 
    timeEntries, 
    customers,
    projects,
    updateWeekStatus, 
    selectedDate, 
    getEntriesForDate,
    getWeekStatus,
    canEditTimesheet,
    getProjectsByCustomer,
    updateTimeEntryStatus,
    addTimeEntry
  } = useAppContext();
  
  const [weekStartDate, setWeekStartDate] = useState<Date>(startOfWeek(selectedDate, { weekStartsOn: 1 }));
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
      return format(addDays(start, i), 'yyyy-MM-dd');
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
      
      // Get week status
      const weekStart = format(weekStartDate, 'yyyy-MM-dd');
      const status = getWeekStatus(weekStart);
      setWeekStatus(status?.status || "draft");
      
      // Check if timesheet is editable
      setIsEditable(canEditTimesheet(weekStart));
    }
  }, [weekDates, timeEntries, getEntriesForDate, getWeekStatus, canEditTimesheet]);
  
  // Group entries by project and date
  const getGroupedEntries = () => {
    const groupedByProject: Record<string, {
      projectId: string,
      projectName: string,
      customerName: string,
      dates: Record<string, {
        hours: number,
        entries: TimeEntry[]
      }>
    }> = {};
    
    weekEntries.forEach(entry => {
      if (!entry.projectId) return;
      
      const project = projects.find(p => p.id === entry.projectId);
      const customer = customers.find(c => c.id === entry.customerId);
      
      if (!project || !customer) return;
      
      if (!groupedByProject[entry.projectId]) {
        groupedByProject[entry.projectId] = {
          projectId: entry.projectId,
          projectName: project.name,
          customerName: customer.name,
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
  
  const handleUpdateWeekStatus = (weekStartISO: string, status: string) => {
    updateWeekStatus(weekStartISO, status);
    setWeekStatus(status);
    
    toast({
      title: `Timesheet ${status}`,
      description: `Timesheet has been ${status} successfully`,
    });
  };
  
  // Format the date range for display
  const getDateRangeDisplay = () => {
    if (weekDates.length === 0) return "";
    
    const start = format(new Date(weekDates[0]), 'MMM d');
    const end = format(new Date(weekDates[6]), 'MMM d, yyyy');
    
    return `${start} - ${end}`;
  };
  
  // Get appropriate status badge color
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'submitted': return 'bg-blue-500';
      case 'reopened': return 'bg-amber-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Weekly Timesheet</h2>
            <p className="text-sm text-muted-foreground">{getDateRangeDisplay()}</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground mr-2">Status:</span>
            <Badge className={getStatusColor(weekStatus)}>
              {weekStatus ? weekStatus.charAt(0).toUpperCase() + weekStatus.slice(1) : 'Draft'}
            </Badge>
            
            {isEditable && weekStatus !== 'approved' && (
              <Button 
                size="sm"
                variant="outline" 
                onClick={() => handleUpdateWeekStatus(format(weekStartDate, 'yyyy-MM-dd'), 'submitted')}
              >
                <Check className="mr-1 h-4 w-4" />
                Submit
              </Button>
            )}
          </div>
        </div>
      </Card>
      
      <div className="bg-white rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-40">Project</TableHead>
              {weekDates.map((date, index) => (
                <TableHead key={date} className="text-center w-20">
                  {format(new Date(date), 'EEE')}<br />
                  {format(new Date(date), 'MMM d')}
                </TableHead>
              ))}
              <TableHead className="text-center">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {getGroupedEntries().map((projectGroup) => (
              <TableRow key={projectGroup.projectId}>
                <TableCell className="font-medium">
                  <div>{projectGroup.projectName}</div>
                  <div className="text-xs text-muted-foreground">{projectGroup.customerName}</div>
                </TableCell>
                
                {weekDates.map(date => (
                  <TableCell key={date} className="text-center">
                    {projectGroup.dates[date]?.hours || 0}
                  </TableCell>
                ))}
                
                <TableCell className="text-center font-medium">
                  {Object.values(projectGroup.dates).reduce((sum, day) => sum + day.hours, 0)}
                </TableCell>
              </TableRow>
            ))}
            
            <TableRow className="bg-muted/50">
              <TableCell className="font-medium">Daily Total</TableCell>
              {weekDates.map(date => (
                <TableCell key={date} className="text-center font-medium">
                  {getDailyTotal(date)}
                </TableCell>
              ))}
              <TableCell className="text-center font-bold">
                {getWeeklyTotal()}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      
      {weekStatus === 'rejected' && (
        <div className="bg-red-50 border border-red-200 rounded p-4 flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-800">Timesheet Rejected</h3>
            <p className="text-red-700">
              Your timesheet was rejected. Please review your entries and resubmit.
            </p>
          </div>
        </div>
      )}
      
      {weekStatus === 'approved' && (
        <div className="bg-green-50 border border-green-200 rounded p-4 flex items-start space-x-2">
          <Check className="h-5 w-5 text-green-500 mt-0.5" />
          <div>
            <h3 className="font-medium text-green-800">Timesheet Approved</h3>
            <p className="text-green-700">
              Your timesheet has been approved.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyTimeTable;
