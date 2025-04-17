
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

const WeeklyDirectEntry = () => {
  const { 
    addTimeEntry, 
    customers, 
    projects, 
    getProjectsByCustomer,
    selectedDate,
    getEntriesForDate
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
  const [availableProjects, setAvailableProjects] = useState<typeof projects>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  
  // Generate an array of dates for the current week
  const weekDates = [...Array(7)].map((_, i) => {
    const date = addDays(weekStartDate, i);
    return format(date, 'yyyy-MM-dd');
  });
  
  // Update week start date when selected date changes
  useEffect(() => {
    setWeekStartDate(startOfWeek(selectedDate, { weekStartsOn: 1 }));
  }, [selectedDate]);
  
  // Generate empty entry rows if there are none
  useEffect(() => {
    if (entryRows.length === 0) {
      addEmptyRow();
    }
  }, []);
  
  // Update available projects when customer selection changes
  useEffect(() => {
    if (selectedCustomer) {
      setAvailableProjects(getProjectsByCustomer(selectedCustomer));
    } else {
      setAvailableProjects([]);
    }
  }, [selectedCustomer, getProjectsByCustomer]);
  
  // Add an empty row to the entry table
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
  
  // Remove a row from the entry table
  const removeRow = (id: string) => {
    setEntryRows(entryRows.filter(row => row.id !== id));
  };
  
  // Update the project for a row and set the customerId
  const updateRowProject = (rowId: string, projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setEntryRows(entryRows.map(row => 
        row.id === rowId ? 
        { ...row, project: projectId, customerId: project.customerId } : 
        row
      ));
    }
  };
  
  // Update the task for a row
  const updateRowTask = (rowId: string, task: string) => {
    setEntryRows(entryRows.map(row => 
      row.id === rowId ? { ...row, task } : row
    ));
  };
  
  // Update the notes for a row
  const updateRowNotes = (rowId: string, notes: string) => {
    setEntryRows(entryRows.map(row => 
      row.id === rowId ? { ...row, notes } : row
    ));
  };
  
  // Update hours for a specific date in a row
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
  
  // Handle saving all entries
  const handleSaveEntries = () => {
    let entriesAdded = 0;
    
    // Add each entry with hours > 0
    entryRows.forEach(row => {
      if (!row.project) return; // Skip rows without a project
      
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
      
      // Reset to a single empty row after saving
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Weekly Time Entry</h2>
        <div className="flex space-x-2">
          <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by customer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Customers</SelectItem>
              {customers.filter(c => c.active).map(customer => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button onClick={handleSaveEntries}>
            <Save className="mr-2 h-4 w-4" />
            Save All Entries
          </Button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
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
                    value={row.project} 
                    onValueChange={(value) => updateRowProject(row.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {(selectedCustomer ? availableProjects : projects)
                        .filter(p => p.active)
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
