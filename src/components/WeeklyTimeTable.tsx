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
import { ChevronLeft, ChevronRight, CalendarIcon, Save, Plus } from "lucide-react";
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

interface TimeEntryRowData {
  customerId: string;
  projectId: string;
  description: string;
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
    selectedDate,
    setSelectedDate
  } = useAppContext();
  const { toast } = useToast();
  
  // Filter to only active customers and projects
  const activeCustomers = customers.filter(c => c.active);
  const activeProjects = projects.filter(p => p.active);
  
  // Keep track of the week being displayed
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(selectedDate, { weekStartsOn: 1 }));
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  
  // Initial empty row
  const emptyRow = (): TimeEntryRowData => ({
    customerId: "",
    projectId: "",
    description: "",
    hours: {0: "", 1: "", 2: "", 3: "", 4: "", 5: "", 6: ""}
  });
  
  // State for the table data
  const [rows, setRows] = useState<TimeEntryRowData[]>([emptyRow()]);
  
  // Generate an array of dates for the current week
  const weekDays = Array.from({length: 7}, (_, i) => addDays(weekStart, i));
  
  // Helper function to get customer and project names
  const getCustomerName = (id: string) => {
    const customer = customers.find(c => c.id === id);
    return customer ? customer.name : "";
  };
  
  const getProjectName = (id: string) => {
    const project = projects.find(p => p.id === id);
    return project ? project.name : "";
  };
  
  // Load existing time entries for the current week
  useEffect(() => {
    // Create a map to organize entries by customer/project/description
    const entriesByKey: Record<string, TimeEntryRowData> = {};
    
    // Filter time entries for the current week
    const weekEntries = timeEntries.filter(entry => {
      const entryDate = parseISO(entry.date);
      return isWithinInterval(entryDate, { start: weekStart, end: weekEnd });
    });
    
    // Group entries
    weekEntries.forEach(entry => {
      const key = `${entry.customerId}-${entry.projectId}-${entry.description}`;
      const dayIndex = (parseISO(entry.date).getDay() + 6) % 7; // Convert Sunday=0 to Monday=0 format
      
      if (!entriesByKey[key]) {
        entriesByKey[key] = {
          customerId: entry.customerId,
          projectId: entry.projectId,
          description: entry.description,
          hours: {}
        };
      }
      
      entriesByKey[key].hours[dayIndex] = entry.hours.toString();
    });
    
    // Convert map to array
    const loadedRows = Object.values(entriesByKey);
    
    // If we have loaded rows, use them, otherwise keep an empty row
    setRows(loadedRows.length > 0 ? loadedRows : [emptyRow()]);
    
  }, [timeEntries, weekStart]);
  
  // Handle moving to previous/next week
  const handlePreviousWeek = () => {
    setWeekStart(subWeeks(weekStart, 1));
  };
  
  const handleNextWeek = () => {
    setWeekStart(addWeeks(weekStart, 1));
  };
  
  // Handle changes to the row data
  const handleCustomerChange = (rowIndex: number, customerId: string) => {
    const newRows = [...rows];
    newRows[rowIndex].customerId = customerId;
    newRows[rowIndex].projectId = ""; // Reset project when customer changes
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
  
  // Add a new row
  const addRow = () => {
    setRows([...rows, emptyRow()]);
  };
  
  // Get projects for a specific customer
  const getProjectsForCustomer = (customerId: string) => {
    return activeProjects.filter(p => p.customerId === customerId);
  };
  
  // Save all time entries for the week
  const saveEntries = () => {
    let entriesAdded = 0;
    
    rows.forEach(row => {
      // Skip rows without customer and project
      if (!row.customerId || !row.projectId) return;
      
      // Add an entry for each day with hours
      Object.entries(row.hours).forEach(([dayIndex, hoursStr]) => {
        // Skip days without hours
        if (!hoursStr) return;
        
        const hours = parseFloat(hoursStr);
        if (isNaN(hours) || hours <= 0) return;
        
        const day = addDays(weekStart, parseInt(dayIndex));
        
        // Add time entry
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
    
    // Reset to empty state if entries were added
    if (entriesAdded > 0) {
      setRows([emptyRow()]);
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
