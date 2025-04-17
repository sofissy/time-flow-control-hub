
import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Customer, Project } from "@/context/AppContext";

interface EntryRowProps {
  row: {
    id: string;
    project: string;
    task: string;
    notes: string;
    hours: { [key: string]: string };
    customerId: string;
  };
  weekDates: string[];
  customers: Customer[];
  onRemove: (id: string) => void;
  onUpdateCustomer: (rowId: string, customerId: string) => void;
  onUpdateProject: (rowId: string, projectId: string) => void;
  onUpdateTask: (rowId: string, task: string) => void;
  onUpdateNotes: (rowId: string, notes: string) => void;
  onUpdateHours: (rowId: string, date: string, hours: string) => void;
  getAvailableProjectsForRow: (customerId: string) => Project[];
  isLastRow: boolean;
}

const EntryRow = ({
  row,
  weekDates,
  customers,
  onRemove,
  onUpdateCustomer,
  onUpdateProject,
  onUpdateTask,
  onUpdateNotes,
  onUpdateHours,
  getAvailableProjectsForRow,
  isLastRow
}: EntryRowProps) => {
  // Handle hour input change with proper validation
  const handleHourChange = (rowId: string, date: string, value: string) => {
    // Allow empty string, decimal point, or numbers
    if (value === '' || value === '.' || /^\d*\.?\d*$/.test(value)) {
      onUpdateHours(rowId, date, value);
    }
  };

  return (
    <tr>
      <td>
        <Select 
          value={row.customerId || undefined} 
          onValueChange={(value) => onUpdateCustomer(row.id, value)}
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
      </td>
      
      <td>
        <Select 
          value={row.project || undefined} 
          onValueChange={(value) => onUpdateProject(row.id, value)}
          disabled={!row.customerId}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select project" />
          </SelectTrigger>
          <SelectContent>
            {row.customerId && getAvailableProjectsForRow(row.customerId)
              .map(project => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </td>
      
      <td>
        <Input
          value={row.task}
          onChange={(e) => onUpdateTask(row.id, e.target.value)}
          placeholder="Task"
        />
      </td>
      
      {weekDates.map((date) => (
        <td key={date} className="text-center">
          <Input
            className="w-16 mx-auto text-center"
            value={row.hours[date] || "0"}
            onChange={(e) => handleHourChange(row.id, date, e.target.value)}
          />
        </td>
      ))}
      
      <td>
        <Textarea
          value={row.notes}
          onChange={(e) => onUpdateNotes(row.id, e.target.value)}
          placeholder="Notes"
          className="h-10"
        />
      </td>
      
      <td>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(row.id)}
          disabled={isLastRow}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  );
};

export default EntryRow;
