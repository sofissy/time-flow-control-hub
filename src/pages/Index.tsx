import { useState } from "react";
import { format, startOfWeek, parseISO, addDays } from "date-fns";
import { useAppContext } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";
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
import { Button } from "@/components/ui/button";
import { 
  Calendar,
  Clock, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import TimesheetStatusBadge from "@/components/timesheet/TimesheetStatusBadge";

const Index = () => {
  const { 
    timeEntries, 
    selectedDate,
    customers, 
    projects,
    weekStatuses,
    getWeekStatus,
    getTotalHoursForWeek
  } = useAppContext();
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Get the last 8 weeks (including the current week)
  const getRecentWeeks = () => {
    const weeks = [];
    let currentDate = new Date();
    
    for (let i = 0; i < 8; i++) {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      weeks.push(weekStart);
      
      // Go back one week
      currentDate.setDate(currentDate.getDate() - 7);
    }
    
    return weeks;
  };
  
  const recentWeeks = getRecentWeeks();
  
  const openWeeklyTimesheet = (date: Date) => {
    // Fix: Navigate to the weekly entry page with the correct selected date
    navigate('/weekly', { 
      state: { 
        selectedDate: format(date, "yyyy-MM-dd") 
      } 
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
                  Weekly Timesheets
                </CardTitle>
                <CardDescription>
                  Recent timesheet submissions and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Week</TableHead>
                      <TableHead className="text-right">Hours</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentWeeks.map((weekStart, index) => {
                      const weekStartFormatted = format(weekStart, "yyyy-MM-dd");
                      const weekEndFormatted = format(addDays(weekStart, 6), "yyyy-MM-dd");
                      const weekStatus = getWeekStatus(weekStartFormatted);
                      const weekHours = getTotalHoursForWeek(weekStartFormatted);
                      
                      return (
                        <TableRow key={index} className="hover:bg-muted/30 cursor-pointer" onClick={() => openWeeklyTimesheet(weekStart)}>
                          <TableCell>
                            <div className="font-medium">{format(weekStart, "MMM d")} - {format(addDays(weekStart, 6), "MMM d, yyyy")}</div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {weekHours.toFixed(1)}
                          </TableCell>
                          <TableCell>
                            <TimesheetStatusBadge status={weekStatus?.status || "draft"} />
                          </TableCell>
                          <TableCell className="text-center">
                            <Button variant="ghost" size="sm" onClick={(e) => {
                              e.stopPropagation();
                              openWeeklyTimesheet(weekStart);
                            }}>
                              <FileText className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          
          <div className="w-full lg:w-1/3 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Card className="dashboard-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">This Week</p>
                    <h3 className="text-2xl font-bold">{getTotalHoursForWeek(format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd")).toFixed(1)}h</h3>
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
                      {weekStatuses
                        .filter(w => w.status === "approved")
                        .reduce((sum, week) => {
                          return sum + getTotalHoursForWeek(week.weekStart);
                        }, 0)
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
                      {weekStatuses
                        .filter(w => w.status === "pending")
                        .reduce((sum, week) => {
                          return sum + getTotalHoursForWeek(week.weekStart);
                        }, 0)
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
