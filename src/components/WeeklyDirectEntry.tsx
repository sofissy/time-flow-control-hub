
import React, { useState } from 'react';
import { useAppContext } from "@/context/AppContext";

// Fix the file by adding a complete component with proper exports
const WeeklyDirectEntry = () => {
  const { addTimeEntry } = useAppContext();
  
  const handleAddTimeEntry = (entry) => {
    if (entry && entry.hours > 0) {
      addTimeEntry({
        date: entry.date,
        project: entry.project,
        task: entry.task,
        hours: entry.hours,
        notes: entry.notes || "",
        customerId: entry.project, // Assuming project ID is the customer ID for backward compatibility
        projectId: entry.project,
        description: entry.notes || "",
      });
    }
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Weekly Time Entry</h2>
      {/* Rest of component implementation */}
    </div>
  );
};

// Add the default export
export default WeeklyDirectEntry;
