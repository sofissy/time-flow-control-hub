
import { useState } from "react";
import { format } from "date-fns";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppContext, TimeEntry } from "@/context/AppContext";

type TimeReportProps = {
  timeEntries: TimeEntry[];
  title?: string;
};

type ChartData = {
  name: string;
  hours: number;
};

const TimeReport = ({ timeEntries, title = "Time Report" }: TimeReportProps) => {
  const { customers, projects } = useAppContext();
  const [groupBy, setGroupBy] = useState<"customer" | "project" | "date">("date");
  
  const prepareChartData = (): ChartData[] => {
    const data: Record<string, number> = {};
    
    if (groupBy === "customer") {
      // Group by customer
      timeEntries.forEach(entry => {
        const customer = customers.find(c => c.id === entry.customerId);
        const customerName = customer ? customer.name : "Unknown";
        
        data[customerName] = (data[customerName] || 0) + entry.hours;
      });
    } else if (groupBy === "project") {
      // Group by project
      timeEntries.forEach(entry => {
        const project = projects.find(p => p.id === entry.projectId);
        const projectName = project ? project.name : "Unknown";
        
        data[projectName] = (data[projectName] || 0) + entry.hours;
      });
    } else {
      // Group by date
      timeEntries.forEach(entry => {
        const date = format(new Date(entry.date), "MMM dd");
        data[date] = (data[date] || 0) + entry.hours;
      });
    }
    
    return Object.entries(data).map(([name, hours]) => ({
      name,
      hours,
    }));
  };
  
  const chartData = prepareChartData();
  
  const totalHours = timeEntries.reduce((sum, entry) => sum + entry.hours, 0);
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>
              {totalHours.toFixed(1)} total hours tracked
            </CardDescription>
          </div>
          <Select value={groupBy} onValueChange={(value: "customer" | "project" | "date") => setGroupBy(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Group by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Group by Date</SelectItem>
              <SelectItem value="customer">Group by Customer</SelectItem>
              <SelectItem value="project">Group by Project</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 50,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end"
                  height={70}
                  interval={0}
                />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} hrs`, "Hours"]} />
                <Legend />
                <Bar dataKey="hours" name="Hours" fill="#0066ff" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground">No time entries to display</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeReport;
