
import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays } from 'date-fns';
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Save, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const WeeklyDirectEntry = () => {
  const { 
    addTimeEntry, 
    customers, 
    projects, 
    getProjectsByCustomer,
    selectedDate,
    getEntriesForDate,
    timeEntries
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
    // Initialize with an empty row if no rows exist
    if (entryRows.length === 0) {
      addEmptyRow();
    }
    
    console.log("WeeklyDirectEntry - Current time entries:", timeEntries.length);
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
  
  const removeRow = (id: string) => {
    setEntryRows(entryRows.filter(row => row.id !== id));
  };

  const updateRowCustomer = (rowId: string, customerId: string) => {
    setEntryRows(entryRows.map(row => 
      row.id === rowId ? 
      { ...row, customerId, project: "" } : // Reset project when customer changes
      row
    ));
  };
  
  const updateRowProject = (rowId: string, projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setEntryRows(entryRows.map(row => 
        row.id === rowId ? 
        { ...row, project: projectId } : 
        row
      ));
    }
  };
  
  const updateRowTask = (rowId: string, task: string) => {
    setEntryRows(entryRows.map(row => 
      row.id === rowId ? { ...row, task } : row
    ));
  };
  
  const updateRowNotes = (rowId: string, notes: string) => {
    setEntryRows(entryRows.map(row => 
      row.id === rowId ? { ...row, notes } : row
    ));
  };
  
  const updateRowHours = (rowId: string, date: string, hours: string) => {
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
  };
  
  const handleSaveEntries = () => {
    let entriesAdded = 0;
    
    entryRows.forEach(row => {
      if (!row.project) {
        console.log("Skipping row without project");
        return;
      }
      
      Object.entries(row.hours).forEach(([date, hours]) => {
        const hoursValue = parseFloat(hours);
        if (hoursValue > 0) {
          const project = projects.find(p => p.id === row.project);
          if (!project) {
            console.log("Project not found:", row.project);
            return;
          }
          
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
          console.log("Added entry:", date, row.project, hoursValue);
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

  // Get available projects for a specific row based on its customer selection
  const getAvailableProjectsForRow = (rowCustomerId: string) => {
    if (!rowCustomerId) {
      return [];
    }
    return projects.filter(p => p.active && p.customerId === rowCustomerId);
  };

  // Calculate daily totals for all entries
  const calculateDailyTotal = (date: string) => {
    return entryRows.reduce((total, row) => {
      const hours = parseFloat(row.hours[date] || "0");
      return total + hours;
    }, 0);
  };

  // Function to determine color class based on hours
  const getDailyTotalColorClass = (hours: number): string => {
    if (hours === 0) return "text-gray-400";
    if (hours > 8) return "text-red-500 font-bold";
    if (hours === 8) return "text-green-500 font-medium";
    if (hours < 4) return "text-amber-500 font-medium";
    return "text-blue-500 font-medium";
  };

  // Calculate weekly total
  const calculateWeeklyTotal = () => {
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
      
      <div className="bg-white rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-40">Customer</TableHead>
              <TableHead className="w-40">Project</TableHead>
              <TableHead className="w-40">Task</TableHead>
              {weekDates.map((date, index) => (
                <TableHead key={date} className="text-center w-20">
                  {format(new Date(date), 'EEE')}<br />
                  {format(new Date(date), 'MMM d')}
                </TableHead>
              ))}
              <TableHead className="w-40">Notes</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entryRows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <Select 
                    value={row.customerId || undefined} 
                    onValueChange={(value) => updateRowCustomer(row.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers
                        .filter(c => c.active)
                        .map(customer => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                
                <TableCell>
                  <Select 
                    value={row.project || undefined} 
                    onValueChange={(value) => updateRowProject(row.id, value)}
                    disabled={!row.customerId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableProjectsForRow(row.customerId)
                        .map(project => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                
                <TableCell>
                  <Input
                    value={row.task}
                    onChange={(e) => updateRowTask(row.id, e.target.value)}
                    placeholder="Task"
                  />
                </TableCell>
                
                {weekDates.map((date) => (
                  <TableCell key={date} className="text-center">
                    <Input
                      className="w-16 mx-auto text-center"
                      value={row.hours[date] || "0"}
                      onChange={(e) => updateRowHours(row.id, date, e.target.value)}
                    />
                  </TableCell>
                ))}
                
                <TableCell>
                  <Textarea
                    value={row.notes}
                    onChange={(e) => updateRowNotes(row.id, e.target.value)}
                    placeholder="Notes"
                    className="h-10"
                  />
                </TableCell>
                
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeRow(row.id)}
                    disabled={entryRows.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {/* Daily totals row */}
            <TableRow className="bg-muted/50">
              <TableCell colSpan={3} className="font-medium">
                Daily Total
              </TableCell>
              {weekDates.map(date => {
                const dailyTotal = calculateDailyTotal(date);
                return (
                  <TableCell key={date} className={cn("text-center font-medium", getDailyTotalColorClass(dailyTotal))}>
                    {dailyTotal}
                  </TableCell>
                );
              })}
              <TableCell className="font-medium">
                Weekly Total:
              </TableCell>
              <TableCell className={cn("font-bold", getDailyTotalColorClass(calculateWeeklyTotal()))}>
                {calculateWeeklyTotal()}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      
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
