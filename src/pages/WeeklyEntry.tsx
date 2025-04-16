
import React from "react";
import Navbar from "@/components/Navbar";
import WeeklyDirectEntry from "@/components/WeeklyDirectEntry";
import TimesheetSummary from "@/components/TimesheetSummary";
import { useAppContext } from "@/context/AppContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const WeeklyEntry = () => {
  const { canManageTimesheets } = useAppContext();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container py-6">
        {canManageTimesheets() ? (
          <Tabs defaultValue="entry">
            <TabsList className="mb-4">
              <TabsTrigger value="entry">My Time Entry</TabsTrigger>
              <TabsTrigger value="summary">Timesheet Summary</TabsTrigger>
            </TabsList>
            
            <TabsContent value="entry">
              <WeeklyDirectEntry />
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
