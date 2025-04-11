
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { useAppContext } from "@/context/AppContext";
import TimeReport from "@/components/TimeReport";
import { format, startOfWeek, endOfWeek, subWeeks, addWeeks, parseISO } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
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

const Reports = () => {
  const { timeEntries, customers, projects } = useAppContext();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Calculate week range
  const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
  
  const handlePreviousWeek = () => {
    setSelectedDate(subWeeks(selectedDate, 1));
  };
  
  const handleNextWeek = () => {
    setSelectedDate(addWeeks(selectedDate, 1));
  };
  
  // Filter entries for the selected week
  const weeklyEntries = timeEntries.filter(entry => {
    const entryDate = parseISO(entry.date);
    return entryDate >= start && entryDate <= end;
  });
  
  // Group by customer and project
  const summary = weeklyEntries.reduce<Record<string, Record<string, number>>>((acc, entry) => {
    const customer = customers.find(c => c.id === entry.customerId);
    const project = projects.find(p => p.id === entry.projectId);
    
    const customerName = customer ? customer.name : "Unknown";
    const projectName = project ? project.name : "Unknown";
    
    if (!acc[customerName]) {
      acc[customerName] = {};
    }
    
    if (!acc[customerName][projectName]) {
      acc[customerName][projectName] = 0;
    }
    
    acc[customerName][projectName] += entry.hours;
    return acc;
  }, {});
  
  const totalHours = weeklyEntries.reduce((sum, entry) => sum + entry.hours, 0);
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container py-6">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl font-bold">Time Reports</h1>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handlePreviousWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal w-[240px]",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(start, "MMM dd")} - {format(end, "MMM dd, yyyy")}
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
              
              <Button variant="outline" size="icon" onClick={handleNextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Weekly chart */}
          <TimeReport 
            timeEntries={weeklyEntries} 
            title={`Week of ${format(start, "MMM dd")} - ${format(end, "MMM dd")}`}
          />
          
          {/* Summary table */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(summary).length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead className="text-right">Hours</TableHead>
                      <TableHead className="text-right">%</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(summary).map(([customerName, projects]) => 
                      Object.entries(projects).map(([projectName, hours], index) => (
                        <TableRow key={`${customerName}-${projectName}`}>
                          {index === 0 && (
                            <TableCell rowSpan={Object.keys(projects).length} className="font-medium">
                              {customerName}
                            </TableCell>
                          )}
                          <TableCell>{projectName}</TableCell>
                          <TableCell className="text-right">{hours.toFixed(1)}</TableCell>
                          <TableCell className="text-right">
                            {totalHours > 0 ? Math.round((hours / totalHours) * 100) : 0}%
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                    <TableRow>
                      <TableCell colSpan={2} className="font-bold">Total</TableCell>
                      <TableCell className="text-right font-bold">{totalHours.toFixed(1)}</TableCell>
                      <TableCell className="text-right font-bold">100%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No time entries for this week.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Reports;
