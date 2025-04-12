
import { useState, useEffect } from "react";
import { 
  addDays, 
  format, 
  startOfWeek, 
  endOfWeek, 
  isWithinInterval, 
  parseISO,
  subWeeks,
  addWeeks
} from "date-fns";
import { ChevronLeft, ChevronRight, CalendarIcon, Save, Plus, Clock, CheckCircle, XCircle } from "lucide-react";
import { useAppContext, TimeEntry, Customer, Project } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface TimeEntryRowData {
  id?: string; // Optional id for existing entries
  customerId: string;
  projectId: string;
  description: string;
  status?: TimeEntry["status"]; // Optional status for existing entries
  hours: {
    [dayIndex: number]: string;
  };
}

const WeeklyTimeTable = () => {
  const { 
    customers, 
    projects,
    timeEntries,
    addTimeEntry,
    updateTimeEntry,
    updateTimeEntryStatus,
    selectedDate,
    setSelectedDate,
    currentUser,
    canManageTimesheets,
    canEditTimeEntry
  } = useAppContext();
  const { toast } = useToast();
  
  const activeCustomers = customers.filter(c => c.active);
  const activeProjects = projects.filter(p => p.active);
  
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(selectedDate, { weekStartsOn: 1 }));
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  
  const emptyRow = (): TimeEntryRowData => ({
    customerId: "",
    projectId: "",
    description: "",
    hours: {0: "", 1: "", 2: "", 3: "", 4: "", 5: "", 6: ""}
  });
  
  const [rows, setRows] = useState<TimeEntryRowData[]>([emptyRow()]);
  const [existingEntries, setExistingEntries] = useState<TimeEntryRowData[]>([]);
  
  const weekDays = Array.from({length: 7}, (_, i) => addDays(weekStart, i));
  
  const getCustomerName = (id: string) => {
    const customer = customers.find(c => c.id === id);
    return customer ? customer.name : "";
  };
  
  const getProjectName = (id: string) => {
    const project = projects.find(p => p.id === id);
    return project ? project.name : "";
  };
  
  useEffect(() => {
    const entriesByKey: Record<string, TimeEntryRowData> = {};
    const existingEntriesList: TimeEntryRowData[] = [];
    
    const weekEntries = timeEntries.filter(entry => {
      const entryDate = parseISO(entry.date);
      return isWithinInterval(entryDate, { start: weekStart, end: weekEnd });
    });
    
    weekEntries.forEach(entry => {
      const dayIndex = (parseISO(entry.date).getDay() + 6) % 7;
      
      const existingEntry = existingEntriesList.find(e => 
        e.id === entry.id ||
        (e.customerId === entry.customerId && 
         e.projectId === entry.projectId && 
         e.description === entry.description)
      );
      
      if (existingEntry) {
        existingEntry.hours[dayIndex] = entry.hours.toString();
      } else {
        existingEntriesList.push({
          id: entry.id,
          customerId: entry.customerId,
          projectId: entry.projectId,
          description: entry.description,
          status: entry.status,
          hours: { [dayIndex]: entry.hours.toString() }
        });
      }
    });
    
    setExistingEntries(existingEntriesList);
    setRows([emptyRow()]);
  }, [timeEntries, weekStart]);
  
  const handlePreviousWeek = () => {
    setWeekStart(subWeeks(weekStart, 1));
  };
  
  const handleNextWeek = () => {
    setWeekStart(addWeeks(weekStart, 1));
  };
  
  const handleCustomerChange = (rowIndex: number, customerId: string) => {
    const newRows = [...rows];
    newRows[rowIndex].customerId = customerId;
    newRows[rowIndex].projectId = "";
    setRows(newRows);
  };
  
  const handleProjectChange = (rowIndex: number, projectId: string) => {
    const newRows = [...rows];
    newRows[rowIndex].projectId = projectId;
    setRows(newRows);
  };
  
  const handleDescriptionChange = (rowIndex: number, description: string) => {
    const newRows = [...rows];
    newRows[rowIndex].description = description;
    setRows(newRows);
  };
  
  const handleHoursChange = (rowIndex: number, dayIndex: number, hours: string) => {
    const newRows = [...rows];
    newRows[rowIndex].hours[dayIndex] = hours;
    setRows(newRows);
  };
  
  const addRow = () => {
    setRows([...rows, emptyRow()]);
  };
  
  const getProjectsForCustomer = (customerId: string) => {
    return activeProjects.filter(p => p.customerId === customerId);
  };
  
  const calculateDailyTotal = (dayIndex: number): number => {
    let total = 0;
    
    // Add hours from new rows
    rows.forEach(row => {
      const hours = parseFloat(row.hours[dayIndex] || '0');
      if (!isNaN(hours)) {
        total += hours;
      }
    });
    
    // Add hours from existing entries
    existingEntries.forEach(entry => {
      const hours = parseFloat(entry.hours[dayIndex] || '0');
      if (!isNaN(hours)) {
        total += hours;
      }
    });
    
    return total;
  };
  
  const calculateWeekTotal = (): number => {
    let total = 0;
    for (let i = 0; i < 7; i++) {
      total += calculateDailyTotal(i);
    }
    return total;
  };
  
  const getDailyTotalColor = (hours: number): string => {
    return hours > 8 ? 'text-orange-500 font-bold' : '';
  };
  
  const saveEntries = () => {
    let entriesAdded = 0;
    
    rows.forEach(row => {
      if (!row.customerId || !row.projectId) return;
      
      Object.entries(row.hours).forEach(([dayIndex, hoursStr]) => {
        if (!hoursStr) return;
        
        const hours = parseFloat(hoursStr);
        if (isNaN(hours) || hours <= 0) return;
        
        const day = addDays(weekStart, parseInt(dayIndex));
        
        addTimeEntry({
          date: format(day, "yyyy-MM-dd"),
          customerId: row.customerId,
          projectId: row.projectId,
          hours,
          description: row.description,
        });
        
        entriesAdded++;
      });
    });
    
    toast({
      title: "Time entries saved",
      description: `Added ${entriesAdded} time ${entriesAdded === 1 ? 'entry' : 'entries'} for the week`,
    });
    
    if (entriesAdded > 0) {
      setRows([emptyRow()]);
    }
  };
  
  const updateEntryStatus = (entryId: string, status: TimeEntry["status"]) => {
    updateTimeEntryStatus(entryId, status);
    
    toast({
      title: status === "approved" ? "Time entry approved" : "Time entry rejected",
      description: `Time entry has been ${status}`,
    });
  };
  
  const getStatusBadge = (status: TimeEntry["status"]) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-500">Rejected</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "draft":
      default:
        return <Badge className="bg-gray-500">Draft</Badge>;
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Weekly Time Entry</h2>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal w-[240px]"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(weekStart, "MMM dd")} - {format(weekEnd, "MMM dd, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={weekStart}
                onSelect={(date) => date && setWeekStart(startOfWeek(date, { weekStartsOn: 1 }))}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          
          <Button variant="outline" size="icon" onClick={handleNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {existingEntries.length > 0 && (
        <>
          <h3 className="text-lg font-semibold mt-6">Existing Time Entries</h3>
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Customer</TableHead>
                  <TableHead className="w-[180px]">Project</TableHead>
                  <TableHead className="w-[200px]">Description</TableHead>
                  <TableHead>Status</TableHead>
                  {weekDays.map((day, index) => (
                    <TableHead key={index} className="text-center min-w-[80px]">
                      <div>{format(day, "EEE")}</div>
                      <div className="text-xs text-muted-foreground">{format(day, "MMM d")}</div>
                    </TableHead>
                  ))}
                  {canManageTimesheets() && <TableHead className="w-[120px]">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {existingEntries.map((entry, entryIndex) => (
                  <TableRow key={entryIndex}>
                    <TableCell>{getCustomerName(entry.customerId)}</TableCell>
                    <TableCell>{getProjectName(entry.projectId)}</TableCell>
                    <TableCell>{entry.description}</TableCell>
                    <TableCell>{entry.status && getStatusBadge(entry.status)}</TableCell>
                    {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
                      <TableCell key={dayIndex} className="text-center">
                        {entry.hours[dayIndex] || "-"}
                      </TableCell>
                    ))}
                    {canManageTimesheets() && (
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8" 
                            onClick={() => entry.id && updateEntryStatus(entry.id, "approved")}
                            disabled={entry.status === "approved"}
                          >
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8" 
                            onClick={() => entry.id && updateEntryStatus(entry.id, "rejected")}
                            disabled={entry.status === "rejected"}
                          >
                            <XCircle className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
      
      <h3 className="text-lg font-semibold mt-6">New Time Entries</h3>
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Customer</TableHead>
              <TableHead className="w-[180px]">Project</TableHead>
              <TableHead className="w-[200px]">Description</TableHead>
              {weekDays.map((day, index) => (
                <TableHead key={index} className="text-center min-w-[80px]">
                  <div>{format(day, "EEE")}</div>
                  <div className="text-xs text-muted-foreground">{format(day, "MMM d")}</div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                <TableCell>
                  <Select 
                    value={row.customerId} 
                    onValueChange={(value) => handleCustomerChange(rowIndex, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeCustomers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select 
                    value={row.projectId} 
                    onValueChange={(value) => handleProjectChange(rowIndex, value)}
                    disabled={!row.customerId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {row.customerId && getProjectsForCustomer(row.customerId).map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input 
                    placeholder="Description" 
                    value={row.description}
                    onChange={(e) => handleDescriptionChange(rowIndex, e.target.value)}
                  />
                </TableCell>
                {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
                  <TableCell key={dayIndex} className="text-center">
                    <Input 
                      type="number"
                      placeholder="0"
                      min="0"
                      step="0.5"
                      value={row.hours[dayIndex] || ""}
                      onChange={(e) => handleHoursChange(rowIndex, dayIndex, e.target.value)}
                      className="w-16 mx-auto text-center"
                      disabled={!row.customerId || !row.projectId}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow className="bg-muted/50">
              <TableCell colSpan={3} className="font-medium text-right">
                Daily Total
                <Clock className="h-4 w-4 inline ml-1" />
              </TableCell>
              {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
                const dailyTotal = calculateDailyTotal(dayIndex);
                return (
                  <TableCell 
                    key={dayIndex} 
                    className={cn(
                      "text-center font-medium",
                      getDailyTotalColor(dailyTotal)
                    )}
                  >
                    {dailyTotal.toFixed(1)}
                  </TableCell>
                );
              })}
            </TableRow>
            <TableRow className="bg-muted/30">
              <TableCell colSpan={3} className="font-medium text-right">
                Week Total
                <Clock className="h-4 w-4 inline ml-1" />
              </TableCell>
              <TableCell colSpan={7} className="text-center font-medium">
                {calculateWeekTotal().toFixed(1)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={addRow}>
          <Plus className="mr-2 h-4 w-4" /> Add Row
        </Button>
        <Button onClick={saveEntries}>
          <Save className="mr-2 h-4 w-4" /> Save Entries
        </Button>
      </div>
    </div>
  );
};

export default WeeklyTimeTable;
