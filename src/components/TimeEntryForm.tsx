
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Plus, X, Check, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppContext, Customer, Project } from "@/context/AppContext";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const TimeEntryForm = () => {
  const { 
    customers, 
    addTimeEntry, 
    getProjectsByCustomer, 
    selectedDate, 
    setSelectedDate 
  } = useAppContext();
  const { toast } = useToast();
  
  const activeCustomers = customers.filter(c => c.active);
  
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [hours, setHours] = useState<string>("1.0");
  const [description, setDescription] = useState<string>("");
  
  // Update available projects when customer changes
  useEffect(() => {
    if (selectedCustomer) {
      setAvailableProjects(getProjectsByCustomer(selectedCustomer));
      setSelectedProject(""); // Reset project selection
    } else {
      setAvailableProjects([]);
    }
  }, [selectedCustomer, getProjectsByCustomer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!selectedCustomer) {
      toast({
        title: "Customer required",
        description: "Please select a customer",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedProject) {
      toast({
        title: "Project required",
        description: "Please select a project",
        variant: "destructive",
      });
      return;
    }
    
    const hoursValue = parseFloat(hours);
    if (isNaN(hoursValue) || hoursValue <= 0) {
      toast({
        title: "Invalid hours",
        description: "Hours must be a positive number",
        variant: "destructive",
      });
      return;
    }
    
    // Create new time entry
    addTimeEntry({
      date: format(selectedDate, "yyyy-MM-dd"),
      customerId: selectedCustomer,
      projectId: selectedProject,
      hours: hoursValue,
      description,
    });
    
    // Reset form
    setDescription("");
    setHours("1.0");
    
    toast({
      title: "Time entry added",
      description: `Added ${hoursValue} hours for ${format(selectedDate, "MMM dd, yyyy")}`,
    });
  };
  
  const resetForm = () => {
    setSelectedCustomer("");
    setSelectedProject("");
    setHours("1.0");
    setDescription("");
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Add Time Entry</h3>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="customer">Customer</Label>
            <Select 
              value={selectedCustomer} 
              onValueChange={setSelectedCustomer}
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
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="project">Project</Label>
            <Select 
              value={selectedProject} 
              onValueChange={setSelectedProject}
              disabled={!selectedCustomer}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {availableProjects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="hours">Hours</Label>
          <div className="flex items-center">
            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
            <Input 
              id="hours"
              type="number"
              min="0.1"
              step="0.1"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="max-w-[100px]"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea 
            id="description"
            placeholder="What did you work on?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={resetForm}>
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
          <Button type="submit">
            <Plus className="mr-2 h-4 w-4" />
            Add Entry
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TimeEntryForm;
