import React, { useState, useEffect, useCallback } from "react";
import { format, startOfWeek, endOfWeek, addDays, isSameDay, parseISO } from "date-fns";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Plus, MoreHorizontal, Pencil, Trash2, CheckCircle, XCircle, Clock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

const WeeklyTimeTable = () => {
  const {
    customers,
    projects,
    timeEntries,
    addTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    updateWeekStatus,
    getWeekStatus,
    selectedDate,
    setSelectedDate,
    getProjectsByCustomer,
    canEditTimesheet,
    updateTimeEntryStatus,
    canManageTimesheets
  } = useAppContext();
  const { toast } = useToast();

  const [weekStartDate, setWeekStartDate] = useState(startOfWeek(selectedDate, { weekStartsOn: 1 }));
  const [weekEntries, setWeekEntries] = useState(timeEntries.filter(entry =>
    entry.date >= format(startOfWeek(selectedDate, { weekStartsOn: 1 }), "yyyy-MM-dd") &&
    entry.date <= format(endOfWeek(selectedDate, { weekStartsOn: 1 }), "yyyy-MM-dd")
  ));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Form state
  const [date, setDate] = useState(selectedDate);
  const [customerId, setCustomerId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [description, setDescription] = useState("");
  const [hours, setHours] = useState<number | undefined>(undefined);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  const weekStartISO = format(weekStartDate, "yyyy-MM-dd");
  const weekStatus = getWeekStatus(weekStartISO);
  const canEdit = canEditTimesheet(weekStartISO);

  useEffect(() => {
    setWeekStartDate(startOfWeek(selectedDate, { weekStartsOn: 1 }));
  }, [selectedDate]);

  useEffect(() => {
    const start = format(weekStartDate, "yyyy-MM-dd");
    const end = format(endOfWeek(weekStartDate, { weekStartsOn: 1 }), "yyyy-MM-dd");
    
    setWeekEntries(timeEntries.filter(entry => entry.date >= start && entry.date <= end));
  }, [timeEntries, weekStartDate]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
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

  const handleOpenDialog = () => {
    setDate(selectedDate);
    setIsDialogOpen(true);
  };

  const handleAddTimeEntry = () => {
    if (!customerId) {
      toast({
        title: "Customer required",
        description: "Please select a customer",
        variant: "destructive",
      });
      return;
    }

    if (!projectId) {
      toast({
        title: "Project required",
        description: "Please select a project",
        variant: "destructive",
      });
      return;
    }

    if (!hours) {
      toast({
        title: "Hours required",
        description: "Please enter the number of hours",
        variant: "destructive",
      });
      return;
    }

    if (hours <= 0) {
      toast({
        title: "Invalid hours",
        description: "Hours must be greater than zero",
        variant: "destructive",
      });
      return;
    }

    addTimeEntry({
      date: format(date, "yyyy-MM-dd"),
      customerId,
      projectId,
      hours,
      description,
    });

    resetForm();
    setIsDialogOpen(false);
    
    toast({
      title: "Time entry added",
      description: "Time entry has been added successfully",
    });
  };

  const handleOpenEditDialog = (entryId: string) => {
    const entry = timeEntries.find(e => e.id === entryId);
    if (!entry) return;

    setSelectedEntryId(entryId);
    setDate(parseISO(entry.date));
    setCustomerId(entry.customerId);
    setProjectId(entry.projectId);
    setDescription(entry.description);
    setHours(entry.hours);
    setIsEditDialogOpen(true);
  };

  const handleEditTimeEntry = () => {
    if (!selectedEntryId) return;

    if (!customerId) {
      toast({
        title: "Customer required",
        description: "Please select a customer",
        variant: "destructive",
      });
      return;
    }

    if (!projectId) {
      toast({
        title: "Project required",
        description: "Please select a project",
        variant: "destructive",
      });
      return;
    }

    if (!hours) {
      toast({
        title: "Hours required",
        description: "Please enter the number of hours",
        variant: "destructive",
      });
      return;
    }

    if (hours <= 0) {
      toast({
        title: "Invalid hours",
        description: "Hours must be greater than zero",
        variant: "destructive",
      });
      return;
    }

    updateTimeEntry({
      id: selectedEntryId,
      date: format(date, "yyyy-MM-dd"),
      customerId,
      projectId,
      hours,
      description,
    });

    resetForm();
    setIsEditDialogOpen(false);
    
    toast({
      title: "Time entry updated",
      description: "Time entry has been updated successfully",
    });
  };

  const handleDeleteTimeEntry = (entryId: string) => {
    deleteTimeEntry(entryId);
    toast({
      title: "Time entry deleted",
      description: "Time entry has been deleted successfully",
    });
  };

  const handleUpdateWeekStatus = (status: "draft" | "pending" | "approved" | "rejected" | "reopened") => {
    updateWeekStatus(weekStartISO, status);
    toast({
      title: `Timesheet ${status}`,
      description: `Timesheet has been ${status} successfully`,
    });
  };

  const resetForm = () => {
    setDate(selectedDate);
    setCustomerId("");
    setProjectId("");
    setDescription("");
    setHours(undefined);
    setSelectedEntryId(null);
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

  const getProjectsForCustomer = useCallback((customerId: string) => {
    return projects.filter(project => project.customerId === customerId && project.active);
  }, [projects]);

  const isToday = (date: Date) => {
    return isSameDay(date, selectedDate);
  };

  const weekDays = [];
  let currentDay = weekStartDate;
  for (let i = 0; i < 7; i++) {
    weekDays.push(addDays(currentDay, i));
  }

  const handleSubmitForApproval = () => {
    handleUpdateWeekStatus("pending");
  };

  const handleApprove = () => {
    handleUpdateWeekStatus("approved");
  };

  const handleReject = () => {
    handleUpdateWeekStatus("rejected");
  };

  const handleReopen = () => {
    handleUpdateWeekStatus("reopened");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Weekly Time Entry</h2>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handlePreviousWeek}>
            Previous Week
          </Button>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={""}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(weekStartDate, "MMMM d, yyyy")} - {format(endOfWeek(weekStartDate, { weekStartsOn: 1 }), "MMMM d, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center" side="bottom">
              <Calendar
                mode="single"
                captionLayout="dropdown"
                weekStartsOn={1}
                selected={selectedDate}
                onSelect={handleDateSelect}
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
            <TableHead>Date</TableHead>
            <TableHead>Customer / Project</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Hours</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {weekDays.map(day => {
            const dayEntries = getDayEntries(day);
            const formattedDate = format(day, "yyyy-MM-dd");
            const totalHours = dayEntries.reduce((sum, entry) => sum + entry.hours, 0);

            return (
              <React.Fragment key={formattedDate}>
                <TableRow className={isToday(day) ? "bg-brand-50 font-medium" : ""}>
                  <TableCell className="font-semibold">{format(day, "EEE, MMM d")}</TableCell>
                  <TableCell colSpan={2} className="text-muted-foreground">
                    Total: {totalHours.toFixed(1)} hours
                  </TableCell>
                  <TableCell className="text-right"></TableCell>
                  <TableCell></TableCell>
                  <TableCell>
                    {isToday(day) && canEdit && (
                      <Button variant="ghost" size="sm" onClick={handleOpenDialog}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Entry
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
                {dayEntries.length > 0 ? (
                  dayEntries.map(entry => (
                    <TableRow key={entry.id}>
                      <TableCell></TableCell>
                      <TableCell>
                        <div className="font-medium">{getCustomerName(entry.customerId)}</div>
                        <div className="text-sm text-muted-foreground">{getProjectName(entry.projectId)}</div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{entry.description || "No description"}</TableCell>
                      <TableCell className="text-right">{entry.hours.toFixed(1)}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          entry.status === "approved" ? "bg-green-100 text-green-800" :
                          entry.status === "rejected" ? "bg-red-100 text-red-800" :
                          entry.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {entry.status ? entry.status.charAt(0).toUpperCase() + entry.status.slice(1) : "Draft"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {canEdit && (
                              <DropdownMenuItem onClick={() => handleOpenEditDialog(entry.id)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                              </DropdownMenuItem>
                            )}
                            {canEdit && (
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteTimeEntry(entry.id)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow key={`empty-${formattedDate}`}>
                    <TableCell></TableCell>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">No entries for this day</TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>

      {/* Add Time Entry Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Time Entry</DialogTitle>
            <DialogDescription>
              Add a new time entry for the selected date.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                value={format(date, "MMMM d, yyyy")}
                disabled
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="customer">Customer</Label>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger>
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
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {customerId ? (
                    getProjectsForCustomer(customerId).map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      Select a customer first
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="hours">Hours</Label>
              <Input
                id="hours"
                type="number"
                placeholder="Enter hours"
                value={hours === undefined ? "" : hours.toString()}
                onChange={(e) => setHours(e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              resetForm();
              setIsDialogOpen(false);
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddTimeEntry}>Add Entry</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Time Entry Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Time Entry</DialogTitle>
            <DialogDescription>
              Edit the time entry for the selected date.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-date">Date</Label>
              <Input
                id="edit-date"
                value={format(date, "MMMM d, yyyy")}
                disabled
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-customer">Customer</Label>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger>
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
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-project">Project</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {customerId ? (
                    getProjectsForCustomer(customerId).map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      Select a customer first
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-hours">Hours</Label>
              <Input
                id="edit-hours"
                type="number"
                placeholder="Enter hours"
                value={hours === undefined ? "" : hours.toString()}
                onChange={(e) => setHours(e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Enter description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              resetForm();
              setIsEditDialogOpen(false);
            }}>
              Cancel
            </Button>
            <Button onClick={handleEditTimeEntry}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Week Status Actions */}
      <div className="flex justify-between items-center">
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
          {canManageTimesheets() && weekStatus?.status === "pending" && (
            <>
              <Button variant="ghost" onClick={handleApprove}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve
              </Button>
              <Button variant="ghost" onClick={handleReject}>
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </>
          )}
          {canManageTimesheets() && weekStatus?.status !== "draft" && weekStatus?.status !== "reopened" && (
            <Button onClick={handleReopen}>Reopen</Button>
          )}
          {/* Regular users can only edit if the week is in draft or reopened status */}
          {/* Admins can always edit */}
          {/* Regular users can edit only if draft or reopened */}
          {weekStatus?.status !== "draft" && weekStatus?.status !== "reopened" && !canManageTimesheets() && (
            <span className="text-muted-foreground">
              Timesheet is locked for editing.
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeeklyTimeTable;
