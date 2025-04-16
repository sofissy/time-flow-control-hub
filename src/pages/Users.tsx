
import React from "react";
import Navbar from "@/components/Navbar";
import UserList from "@/components/UserList";
import TimesheetSummary from "@/components/TimesheetSummary";
import { useAppContext } from "@/context/AppContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Users = () => {
  const { canManageTimesheets } = useAppContext();
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container py-6">
        {canManageTimesheets() ? (
          <Tabs defaultValue="users">
            <TabsList className="mb-4">
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="timesheets">Timesheet Summary</TabsTrigger>
            </TabsList>
            
            <TabsContent value="users">
              <UserList />
            </TabsContent>
            
            <TabsContent value="timesheets">
              <TimesheetSummary />
            </TabsContent>
          </Tabs>
        ) : (
          <UserList />
        )}
      </main>
    </div>
  );
};

export default Users;
