import { useState } from "react";
import { format } from "date-fns";
import { useAppContext } from "@/context/AppContext";
import TimeReport from "@/components/TimeReport";
import Navbar from "@/components/Navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Edit2, 
  Trash2, 
  MoreHorizontal,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { 
    timeEntries, 
    selectedDate, 
    customers, 
    projects, 
    deleteTimeEntry, 
    updateTimeEntryStatus, 
    getTotalHoursForDay 
  } = useAppContext();
  
  const { toast } = useToast();
  const formattedDate = format(selectedDate, "yyyy-MM-dd");
  const dailyEntries = timeEntries.filter(entry => entry.date === formattedDate);
  
  const totalHoursToday = getTotalHoursForDay(formattedDate);
  
  const getCustomerName = (id: string) => {
    const customer = customers.find(c => c.id === id);
    return customer ? customer.name : "Unknown";
  };
  
  const getProjectName = (id: string) => {
    const project = projects.find(p => p.id === id);
    return project ? project.name : "Unknown";
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  const handleApprove = (entryId: string) => {
    updateTimeEntryStatus(entryId, "approved");
    toast({
      title: "Entry approved",
      description: "Time entry has been approved",
    });
  };
  
  const handleReject = (entryId: string) => {
    updateTimeEntryStatus(entryId, "rejected");
    toast({
      title: "Entry rejected",
      description: "Time entry has been rejected",
    });
  };
  
  const handleSubmitForApproval = (entryId: string) => {
    updateTimeEntryStatus(entryId, "pending");
    toast({
      title: "Submitted for approval",
      description: "Time entry has been submitted for approval",
    });
  };
  
  const handleDelete = (entryId: string) => {
    deleteTimeEntry(entryId);
    toast({
      title: "Entry deleted",
      description: "Time entry has been deleted",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-2/3 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium">
                  Time Entries for {format(selectedDate, "MMMM d, yyyy")}
                </CardTitle>
                <CardDescription>
                  {totalHoursToday.toFixed(1)} hours tracked today
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dailyEntries.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer / Project</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Hours</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dailyEntries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>
                            <div className="font-medium">{getCustomerName(entry.customerId)}</div>
                            <div className="text-sm text-muted-foreground">{getProjectName(entry.projectId)}</div>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {entry.description || "No description"}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {entry.hours.toFixed(1)}
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(entry.status)}`}>
                              {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
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
                                {entry.status === "draft" && (
                                  <DropdownMenuItem onClick={() => handleSubmitForApproval(entry.id)}>
                                    <Clock className="mr-2 h-4 w-4" />
                                    <span>Submit for Approval</span>
                                  </DropdownMenuItem>
                                )}
                                {entry.status === "pending" && (
                                  <>
                                    <DropdownMenuItem onClick={() => handleApprove(entry.id)}>
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      <span>Approve</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleReject(entry.id)}>
                                      <XCircle className="mr-2 h-4 w-4" />
                                      <span>Reject</span>
                                    </DropdownMenuItem>
                                  </>
                                )}
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => handleDelete(entry.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Delete</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    No time entries for today. Add entries using the Weekly Entry page.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="w-full lg:w-1/3 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Card className="dashboard-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Today</p>
                    <h3 className="text-2xl font-bold">{totalHoursToday.toFixed(1)}h</h3>
                  </div>
                  <div className="p-2 bg-brand-50 rounded-full">
                    <Clock className="h-5 w-5 text-brand-500" />
                  </div>
                </div>
              </Card>
              
              <Card className="dashboard-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Approved</p>
                    <h3 className="text-2xl font-bold">
                      {timeEntries
                        .filter(e => e.status === "approved")
                        .reduce((sum, entry) => sum + entry.hours, 0)
                        .toFixed(1)}h
                    </h3>
                  </div>
                  <div className="p-2 bg-green-50 rounded-full">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                </div>
              </Card>
              
              <Card className="dashboard-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending</p>
                    <h3 className="text-2xl font-bold">
                      {timeEntries
                        .filter(e => e.status === "pending")
                        .reduce((sum, entry) => sum + entry.hours, 0)
                        .toFixed(1)}h
                    </h3>
                  </div>
                  <div className="p-2 bg-yellow-50 rounded-full">
                    <Clock className="h-5 w-5 text-yellow-500" />
                  </div>
                </div>
              </Card>
              
              <Card className="dashboard-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Customers</p>
                    <h3 className="text-2xl font-bold">{customers.filter(c => c.active).length}</h3>
                  </div>
                  <div className="p-2 bg-blue-50 rounded-full">
                    <AlertCircle className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
              </Card>
            </div>
            
            <TimeReport 
              timeEntries={timeEntries}
              title="Weekly Report"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
