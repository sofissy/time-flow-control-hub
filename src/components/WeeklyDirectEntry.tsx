
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

// Define the type for a single cell edit data
type CellEditData = {
  hours: string;
  projectId: string;
  description: string;
};

// Define the type for the edit data state
type EditDataType = Record<string, CellEditData>;

// Define the type for a new row in inline entry
type InlineEntry = {
  id: string;
  customerId: string;
  projectId: string;
  hours: string;
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
  const [weekEntries, setWeekEntries] = useState(timeEntries);
  const [editData, setEditData] = useState<EditDataType>({});
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [availableProjects, setAvailableProjects] = useState<any[]>([]);
  
  // State for inline entry rows
  const [inlineEntries, setInlineEntries] = useState<InlineEntry[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  
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
    
    setWeekEntries(timeEntries.filter(entry => entry.date >= start && entry.date <= end));
  }, [timeEntries, weekStartDate]);

  useEffect(() => {
    if (selectedCustomerId) {
      setAvailableProjects(getProjectsByCustomer(selectedCustomerId));
    } else {
      setAvailableProjects([]);
    }
  }, [selectedCustomerId, getProjectsByCustomer]);

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

  const handleCellChange = (day: Date, field: keyof CellEditData, value: string) => {
    const formattedDate = format(day, "yyyy-MM-dd");
    
    setEditData(prev => ({
      ...prev,
      [formattedDate]: {
        ...(prev[formattedDate] || { hours: "", projectId: "", description: "" }),
        [field]: value
      }
    }));
  };

  const handleSaveEntry = (day: Date) => {
    const formattedDate = format(day, "yyyy-MM-dd");
    const entryData = editData[formattedDate];
    
    if (!entryData) return;
    
    if (!selectedCustomerId) {
      toast({
        title: "Customer required",
        description: "Please select a customer",
        variant: "destructive",
      });
      return;
    }

    if (!entryData.projectId) {
      toast({
        title: "Project required",
        description: "Please select a project",
        variant: "destructive",
      });
      return;
    }

    const hoursValue = parseFloat(entryData.hours || "0");
    if (isNaN(hoursValue) || hoursValue <= 0) {
      toast({
        title: "Invalid hours",
        description: "Hours must be a positive number",
        variant: "destructive",
      });
      return;
    }

    addTimeEntry({
      date: formattedDate,
      customerId: selectedCustomerId,
      projectId: entryData.projectId,
      hours: hoursValue,
      description: entryData.description || "",
    });

    // Clear the edit data after saving
    setEditData(prev => {
      const newData = { ...prev };
      delete newData[formattedDate];
      return newData;
    });

    toast({
      title: "Time entry added",
      description: `Added ${hoursValue} hours for ${format(day, "MMM dd, yyyy")}`,
    });
  };

  // Function to initialize inline entry for a specific day
  const initializeInlineEntry = (day: Date) => {
    setSelectedDay(day);
    // Add a new empty inline entry
    addInlineEntryRow();
  };

  // Function to add a new inline entry row
  const addInlineEntryRow = () => {
    const newEntry: InlineEntry = {
      id: `new-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      customerId: "",
      projectId: "",
      hours: "",
      description: ""
    };
    
    setInlineEntries(prev => [...prev, newEntry]);
  };

  // Function to update an inline entry field
  const updateInlineEntry = (id: string, field: keyof InlineEntry, value: string) => {
    setInlineEntries(prev => 
      prev.map(entry => 
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  // Function to remove an inline entry row
  const removeInlineEntry = (id: string) => {
    setInlineEntries(prev => prev.filter(entry => entry.id !== id));
  };

  // Function to get available projects for a specific customer
  const getAvailableProjectsForCustomer = (customerId: string) => {
    return projects.filter(p => p.customerId === customerId && p.active);
  };

  // Function to save all inline entries for the selected day
  const saveInlineEntries = () => {
    if (!selectedDay) return;
    
    const formattedDate = format(selectedDay, "yyyy-MM-dd");
    
    // Validate and save each entry
    let hasErrors = false;
    
    inlineEntries.forEach(entry => {
      if (!entry.customerId) {
        toast({
          title: "Customer required",
          description: "Please select a customer for all entries",
          variant: "destructive",
        });
        hasErrors = true;
        return;
      }
      
      if (!entry.projectId) {
        toast({
          title: "Project required",
          description: "Please select a project for all entries",
          variant: "destructive",
        });
        hasErrors = true;
        return;
      }
      
      const hoursValue = parseFloat(entry.hours || "0");
      if (isNaN(hoursValue) || hoursValue <= 0) {
        toast({
          title: "Invalid hours",
          description: "Hours must be a positive number for all entries",
          variant: "destructive",
        });
        hasErrors = true;
        return;
      }
    });
    
    if (hasErrors) return;
    
    // Save each valid entry
    inlineEntries.forEach(entry => {
      addTimeEntry({
        date: formattedDate,
        customerId: entry.customerId,
        projectId: entry.projectId,
        hours: parseFloat(entry.hours),
        description: entry.description || "",
      });
    });
    
    // Clear inline entries after saving
    setInlineEntries([]);
    setSelectedDay(null);
    
    toast({
      title: "Time entries added",
      description: `Added ${inlineEntries.length} entries for ${format(selectedDay, "MMM dd, yyyy")}`,
    });
  };

  const getDayEntries = (date: Date) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    return weekEntries.filter(entry => entry.date === formattedDate);
  };

  const getCustomerName = (id: string) => {
    const customer = customers.find(c => c.id === id);
    return customer ? customer.name : "Unknown";
  };

  const getProjectName = (id: string) => {
    const project = projects.find(p => p.id === id);
    return project ? project.name : "Unknown";
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
      
      <div>
        <Table className="border">
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">Day</TableHead>
              {weekDays.map(day => (
                <TableHead key={format(day, "yyyy-MM-dd")} className="text-center border-l">
                  {format(day, "EEE")}<br />
                  {format(day, "MMM d")}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Project</TableCell>
              {weekDays.map(day => {
                const formattedDate = format(day, "yyyy-MM-dd");
                const dayEntries = getDayEntries(day);
                const isToday = isSameDay(day, new Date());
                const cellData = editData[formattedDate];
                const isSelectedDay = selectedDay && isSameDay(selectedDay, day);
                
                return (
                  <TableCell 
                    key={formattedDate} 
                    className={cn("border-l p-1", isToday ? "bg-muted/50" : "")}
                  >
                    {canEdit && !isSelectedDay ? (
                      <div className="space-y-2 p-1">
                        {dayEntries.map((entry) => (
                          <div key={entry.id} className="text-xs p-1 bg-muted/30 rounded">
                            <div className="font-medium truncate">{getCustomerName(entry.customerId)}</div>
                            <div className="truncate">{getProjectName(entry.projectId)}</div>
                          </div>
                        ))}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full text-xs"
                          onClick={() => initializeInlineEntry(day)}
                        >
                          <Plus className="h-3 w-3 mr-1" /> Add Entry
                        </Button>
                      </div>
                    ) : isSelectedDay ? (
                      <div className="space-y-2">
                        {inlineEntries.map((entry, index) => (
                          <div key={entry.id} className="space-y-1 p-1 border rounded mb-2">
                            <Select 
                              value={entry.customerId} 
                              onValueChange={(value) => updateInlineEntry(entry.id, 'customerId', value)}
                            >
                              <SelectTrigger className="h-7 text-xs">
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
                            
                            <Select 
                              value={entry.projectId} 
                              onValueChange={(value) => updateInlineEntry(entry.id, 'projectId', value)}
                              disabled={!entry.customerId}
                            >
                              <SelectTrigger className="h-7 text-xs">
                                <SelectValue placeholder="Select project" />
                              </SelectTrigger>
                              <SelectContent>
                                {entry.customerId ? (
                                  getAvailableProjectsForCustomer(entry.customerId).map(project => (
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
                            
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => removeInlineEntry(entry.id)}
                              >
                                <Trash2 className="h-3 w-3 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs"
                            onClick={addInlineEntryRow}
                          >
                            <Plus className="h-3 w-3 mr-1" /> Add row
                          </Button>
                          
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="text-xs"
                            onClick={saveInlineEntries}
                            disabled={inlineEntries.length === 0}
                          >
                            <Save className="h-3 w-3 mr-1" /> Save all
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {dayEntries.map((entry) => (
                          <div key={entry.id} className="text-xs p-1 bg-muted/30 rounded">
                            <div className="font-medium truncate">{getCustomerName(entry.customerId)}</div>
                            <div className="truncate">{getProjectName(entry.projectId)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
            
            <TableRow>
              <TableCell className="font-medium">Hours</TableCell>
              {weekDays.map(day => {
                const formattedDate = format(day, "yyyy-MM-dd");
                const dayEntries = getDayEntries(day);
                const totalHours = dayEntries.reduce((sum, entry) => sum + entry.hours, 0);
                const isToday = isSameDay(day, new Date());
                const cellData = editData[formattedDate];
                const isSelectedDay = selectedDay && isSameDay(selectedDay, day);
                
                return (
                  <TableCell 
                    key={formattedDate} 
                    className={cn("border-l p-1", isToday ? "bg-muted/50" : "")}
                  >
                    {isSelectedDay ? (
                      <div className="space-y-2">
                        {inlineEntries.map((entry) => (
                          <div key={entry.id} className="mb-2 pt-1">
                            <Input
                              type="number"
                              min="0.1"
                              step="0.1"
                              placeholder="0.0"
                              value={entry.hours}
                              onChange={(e) => updateInlineEntry(entry.id, 'hours', e.target.value)}
                              className="h-7 text-xs"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center font-medium">
                        {totalHours > 0 ? totalHours.toFixed(1) : "-"}
                      </div>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
            
            <TableRow>
              <TableCell className="font-medium">Description</TableCell>
              {weekDays.map(day => {
                const formattedDate = format(day, "yyyy-MM-dd");
                const dayEntries = getDayEntries(day);
                const isToday = isSameDay(day, new Date());
                const cellData = editData[formattedDate];
                const isSelectedDay = selectedDay && isSameDay(selectedDay, day);
                
                return (
                  <TableCell 
                    key={formattedDate} 
                    className={cn("border-l p-1", isToday ? "bg-muted/50" : "")}
                  >
                    {isSelectedDay ? (
                      <div className="space-y-2">
                        {inlineEntries.map((entry) => (
                          <div key={entry.id} className="mb-2 pt-1">
                            <Input
                              placeholder="Description"
                              value={entry.description}
                              onChange={(e) => updateInlineEntry(entry.id, 'description', e.target.value)}
                              className="h-7 text-xs"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {dayEntries.map((entry) => (
                          <div key={entry.id} className="text-xs p-1 truncate">
                            {entry.description || "No description"}
                          </div>
                        ))}
                      </div>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
            
            <TableRow>
              <TableCell className="font-medium">Daily Total</TableCell>
              {weekDays.map(day => {
                const dayEntries = getDayEntries(day);
                const totalHours = dayEntries.reduce((sum, entry) => sum + entry.hours, 0);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <TableCell 
                    key={format(day, "yyyy-MM-dd")} 
                    className={cn(
                      "border-l text-center font-bold", 
                      isToday ? "bg-muted/50" : "",
                      totalHours >= 8 ? "text-green-600" : totalHours > 0 ? "text-amber-600" : "text-gray-400"
                    )}
                  >
                    {totalHours > 0 ? totalHours.toFixed(1) : "-"}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableBody>
        </Table>
      </div>
      
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
        
        <div>
          {weekStatus?.status === "draft" && (
            <Button onClick={handleSubmitForApproval} disabled={!canEdit}>
              <Clock className="mr-2 h-4 w-4" />
              Submit for Approval
            </Button>
          )}
          
          {weekStatus?.status !== "draft" && weekStatus?.status !== "reopened" && !canEdit && (
            <span className="text-muted-foreground">
              Timesheet is locked for editing.
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeeklyDirectEntry;
