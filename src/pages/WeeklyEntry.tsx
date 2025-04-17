
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { parseISO } from "date-fns";
import Navbar from "@/components/Navbar";
import WeeklyDirectEntry from "@/components/WeeklyDirectEntry";
import TimesheetSummary from "@/components/TimesheetSummary";
import WeeklyTimeTable from "@/components/WeeklyTimeTable";
import { useAppContext } from "@/context/AppContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const WeeklyEntry = () => {
  const { canManageTimesheets, setSelectedWeekDate, getWeekStatus } = useAppContext();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("entry");
  
  useEffect(() => {
    // Check if a date was passed via state
    const state = location.state as { selectedDate?: string };
    if (state && state.selectedDate) {
      // Convert string date to Date object and set it in context
      try {
        const parsedDate = typeof state.selectedDate === 'string' 
          ? parseISO(state.selectedDate)
          : state.selectedDate;
        setSelectedWeekDate(parsedDate);
      } catch (error) {
        console.error("Error parsing date:", error);
      }
    }
  }, [location.state, setSelectedWeekDate]);

  // Add debug logging
  console.log("WeeklyEntry rendering, activeTab:", activeTab);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container py-6">
        {canManageTimesheets() ? (
          <Tabs defaultValue="entry" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="entry">My Time Entry</TabsTrigger>
              <TabsTrigger value="summary">Timesheet Summary</TabsTrigger>
            </TabsList>
            
            <TabsContent value="entry">
              <WeeklyTimeTable />
            </TabsContent>
            
            <TabsContent value="summary">
              <TimesheetSummary />
            </TabsContent>
          </Tabs>
        ) : (
          <WeeklyDirectEntry />
        )}
      </main>
    </div>
  );
};

export default WeeklyEntry;
