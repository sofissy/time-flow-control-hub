
import React, { useState, useEffect } from "react";
import { format, addDays, startOfWeek, endOfWeek, parseISO, isSameDay } from "date-fns";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarIcon, Save, Clock, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// Define the type for a row entry
type TimeEntryRow = {
  id: string;
  customerId: string;
  projectId: string;
  hours: Record<string, string>; // Map of date string to hours
  description: string;
};

const WeeklyDirectEntry = () => {
  const { 
    customers, 
    projects, 
    timeEntries, 
    addTimeEntry, 
    updateTimeEntry, 
    deleteTimeEntry,
    getWeekStatus, 
    updateWeekStatus,
    selectedDate, 
    setSelectedDate, 
    getProjectsByCustomer,
    canEditTimesheet
  } = useAppContext();
  const { toast } = useToast();

  const [weekStartDate, setWeekStartDate] = useState(startOfWeek(selectedDate, { weekStartsOn: 1 }));
  const [weekEntries, setWeekEntries] = useState<any[]>([]);
  const [entryRows, setEntryRows] = useState<TimeEntryRow[]>([]);
  
  const weekStartISO = format(weekStartDate, "yyyy-MM-dd");
  const canEdit = canEditTimesheet(weekStartISO);
  const weekStatus = getWeekStatus(weekStartISO);

  // Initialize week days
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    weekDays.push(addDays(weekStartDate, i));
  }

  useEffect(() => {
    setWeekStartDate(startOfWeek(selectedDate, { weekStartsOn: 1 }));
  }, [selectedDate]);

  useEffect(() => {
    const start = format(weekStartDate, "yyyy-MM-dd");
    const end = format(endOfWeek(weekStartDate, { weekStartsOn: 1 }), "yyyy-MM-dd");
    
    const filteredEntries = timeEntries.filter(entry => entry.date >= start && entry.date <= end);
    setWeekEntries(filteredEntries);
    
    // Group entries by customer and project
    const entriesByProject: Record<string, Record<string, any>> = {};
    
    filteredEntries.forEach(entry => {
      const key = `${entry.customerId}-${entry.projectId}`;
      if (!entriesByProject[key]) {
        entriesByProject[key] = {
          entries: [],
          customerId: entry.customerId,
          projectId: entry.projectId,
          description: entry.description
        };
      }
      entriesByProject[key].entries.push(entry);
    });
    
    // Convert to rows format
    const rows: TimeEntryRow[] = Object.values(entriesByProject).map((group) => {
      const hours: Record<string, string> = {};
      group.entries.forEach((entry: any) => {
        hours[entry.date] = String(entry.hours);
      });
      
      return {
        id: `${group.customerId}-${group.projectId}`,
        customerId: group.customerId,
        projectId: group.projectId,
        hours,
        description: group.description || '',
      };
    });
    
    setEntryRows(rows);
  }, [timeEntries, weekStartDate]);

  // Calculate daily totals
  const getDailyTotals = () => {
    const dailyTotals: Record<string, number> = {};
    
    weekDays.forEach(day => {
      const dateKey = format(day, "yyyy-MM-dd");
      dailyTotals[dateKey] = 0;
      
      // Sum hours for each entry on this day
      entryRows.forEach(row => {
        if (row.hours[dateKey]) {
          const hours = parseFloat(row.hours[dateKey]) || 0;
          dailyTotals[dateKey] += hours;
        }
      });
    });
    
    return dailyTotals;
  };
  
  const dailyTotals = getDailyTotals();
  
  // Helper function to determine cell background color based on hours
  const getDailyTotalColor = (hours: number) => {
    if (hours > 8) return "bg-red-100 text-red-800 font-medium";
    if (hours > 0) return "bg-green-50 text-green-800";
    return "";
  };

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

  const addNewRow = () => {
    const newRow: TimeEntryRow = {
      id: `new-${Date.now()}`,
      customerId: "",
      projectId: "",
      hours: {},
      description: ""
    };
    setEntryRows(prev => [...prev, newRow]);
  };

  const updateRow = (id: string, field: keyof TimeEntryRow, value: any) => {
    setEntryRows(prev => 
      prev.map(row => 
        row.id === id ? { ...row, [field]: value } : row
      )
    );
  };

  const updateHours = (id: string, date: string, hours: string) => {
    setEntryRows(prev => 
      prev.map(row => {
        if (row.id === id) {
          return {
            ...row,
            hours: {
              ...row.hours,
              [date]: hours
            }
          };
        }
        return row;
      })
    );
  };

  const removeRow = (id: string) => {
    setEntryRows(prev => prev.filter(row => row.id !== id));
  };

  const getProjectName = (id: string) => {
    const project = projects.find(p => p.id === id);
    return project ? project.name : "Unknown";
  };

  const getCustomerName = (id: string) => {
    const customer = customers.find(c => c.id === id);
    return customer ? customer.name : "Unknown";
  };

  const getAvailableProjectsForCustomer = (customerId: string) => {
    return projects.filter(p => p.customerId === customerId && p.active);
  };

  const saveAllEntries = () => {
    let hasErrors = false;
    
    entryRows.forEach(row => {
      if (!row.customerId) {
        toast({
          title: "Customer required",
          description: "Please select a customer for all entries",
          variant: "destructive",
        });
        hasErrors = true;
        return;
      }
      
      if (!row.projectId) {
        toast({
          title: "Project required",
          description: "Please select a project for all entries",
          variant: "destructive",
        });
        hasErrors = true;
        return;
      }
      
      // Check if at least one day has hours
      const hasHours = Object.values(row.hours).some(h => parseFloat(h) > 0);
      if (!hasHours) {
        toast({
          title: "Hours required",
          description: "Please enter hours for at least one day",
          variant: "destructive",
        });
        hasErrors = true;
        return;
      }
    });
    
    if (hasErrors) return;
    
    // Save valid entries
    entryRows.forEach(row => {
      Object.entries(row.hours).forEach(([date, hours]) => {
        const hoursValue = parseFloat(hours);
        if (hoursValue > 0) {
          addTimeEntry({
            date,
            customerId: row.customerId,
            projectId: row.projectId,
            hours: hoursValue,
            description: row.description || "",
          });
        }
      });
    });
    
    toast({
      title: "Time entries saved",
      description: `Saved ${entryRows.length} entries for the week`,
    });
  };

  const handleSubmitForApproval = () => {
    updateWeekStatus(weekStartISO, "pending");
    toast({
      title: "Timesheet submitted",
      description: "Your timesheet has been submitted for approval",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Weekly Time Entry</h2>
        
        <div className="flex items-center gap-4">
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
      </div>
      
      {canEdit ? (
        <div className="space-y-4">
          <Table className="border">
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/6">Customer</TableHead>
                <TableHead className="w-1/6">Project</TableHead>
                <TableHead className="w-1/6">Description</TableHead>
                {weekDays.map(day => (
                  <TableHead key={format(day, "yyyy-MM-dd")} className="text-center">
                    {format(day, "EEE")}<br />
                    {format(day, "MMM d")}
                  </TableHead>
                ))}
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entryRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="p-1">
                    <Select 
                      value={row.customerId} 
                      onValueChange={(value) => updateRow(row.id, 'customerId', value)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.filter(c => c.active).map(customer => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  
                  <TableCell className="p-1">
                    <Select 
                      value={row.projectId} 
                      onValueChange={(value) => updateRow(row.id, 'projectId', value)}
                      disabled={!row.customerId}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        {row.customerId ? (
                          getAvailableProjectsForCustomer(row.customerId).map(project => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-customer" disabled>
                            Select a customer first
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  
                  <TableCell className="p-1">
                    <Input
                      placeholder="Description"
                      className="h-8 text-xs"
                      value={row.description}
                      onChange={(e) => updateRow(row.id, 'description', e.target.value)}
                    />
                  </TableCell>
                  
                  {weekDays.map(day => {
                    const formattedDate = format(day, "yyyy-MM-dd");
                    const isToday = isSameDay(day, new Date());
                    
                    return (
                      <TableCell 
                        key={formattedDate} 
                        className={cn("p-1 text-center", isToday ? "bg-muted/50" : "")}
                      >
                        <Input
                          type="number"
                          min="0"
                          step="0.5"
                          className="h-8 text-center"
                          value={row.hours[formattedDate] || ""}
                          onChange={(e) => updateHours(row.id, formattedDate, e.target.value)}
                        />
                      </TableCell>
                    );
                  })}
                  
                  <TableCell className="p-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeRow(row.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              
              {/* Daily totals row */}
              <TableRow className="font-medium">
                <TableCell colSpan={3} className="text-right p-1">
                  Daily totals:
                </TableCell>
                {weekDays.map(day => {
                  const dateKey = format(day, "yyyy-MM-dd");
                  const total = dailyTotals[dateKey] || 0;
                  return (
                    <TableCell 
                      key={`total-${dateKey}`} 
                      className={cn(
                        "text-center p-1",
                        getDailyTotalColor(total)
                      )}
                    >
                      {total > 0 ? total.toFixed(1) : "-"}
                    </TableCell>
                  );
                })}
                <TableCell className="p-1"></TableCell>
              </TableRow>
              
              <TableRow>
                <TableCell colSpan={9 + weekDays.length} className="p-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs"
                    onClick={addNewRow}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add New Row
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          
          <div className="flex justify-between">
            <div>
              <Button 
                onClick={saveAllEntries} 
                disabled={entryRows.length === 0}
              >
                <Save className="mr-2 h-4 w-4" />
                Save All Entries
              </Button>
            </div>
            
            <div>
              {weekStatus?.status === "draft" && (
                <Button onClick={handleSubmitForApproval}>
                  <Clock className="mr-2 h-4 w-4" />
                  Submit for Approval
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Table className="border">
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/6">Customer</TableHead>
                <TableHead className="w-1/6">Project</TableHead>
                <TableHead className="w-1/6">Description</TableHead>
                {weekDays.map(day => (
                  <TableHead key={format(day, "yyyy-MM-dd")} className="text-center">
                    {format(day, "EEE")}<br />
                    {format(day, "MMM d")}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {entryRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{getCustomerName(row.customerId)}</TableCell>
                  <TableCell>{getProjectName(row.projectId)}</TableCell>
                  <TableCell>{row.description}</TableCell>
                  
                  {weekDays.map(day => {
                    const formattedDate = format(day, "yyyy-MM-dd");
                    const hours = row.hours[formattedDate] || "";
                    return (
                      <TableCell key={formattedDate} className="text-center">
                        {hours ? parseFloat(hours).toFixed(1) : "-"}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
              
              {/* Daily totals row for read-only view */}
              <TableRow className="font-medium">
                <TableCell colSpan={3} className="text-right">
                  Daily totals:
                </TableCell>
                {weekDays.map(day => {
                  const dateKey = format(day, "yyyy-MM-dd");
                  const total = dailyTotals[dateKey] || 0;
                  return (
                    <TableCell 
                      key={`total-${dateKey}`} 
                      className={cn(
                        "text-center",
                        getDailyTotalColor(total)
                      )}
                    >
                      {total > 0 ? total.toFixed(1) : "-"}
                    </TableCell>
                  );
                })}
              </TableRow>
              
              {entryRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9 + weekDays.length} className="text-center py-4 text-muted-foreground">
                    No time entries for this week
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          <div>
            <span className="text-muted-foreground">
              {weekStatus?.status !== "draft" ? "Timesheet is locked for editing" : "You don't have permission to edit"}
            </span>
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-center mt-4">
        <div>
          <h3 className="text-lg font-medium">Week Status</h3>
          <p className="text-muted-foreground">
            Current status:{" "}
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              weekStatus?.status === "approved" ? "bg-green-100 text-green-800" :
              weekStatus?.status === "rejected" ? "bg-red-100 text-red-800" :
              weekStatus?.status === "pending" ? "bg-yellow-100 text-yellow-800" :
              weekStatus?.status === "reopened" ? "bg-blue-100 text-blue-800" :
              "bg-gray-100 text-gray-800"
            }`}>
              {weekStatus?.status ? weekStatus.status.charAt(0).toUpperCase() + weekStatus.status.slice(1) : "Draft"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default WeeklyDirectEntry;
