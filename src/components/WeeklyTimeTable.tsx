
import React from "react";
import { useToast } from "@/components/ui/use-toast"; 
import { format } from "date-fns";
import TimesheetHeader from "./timesheet/TimesheetHeader";
import TimesheetTable from "./timesheet/TimesheetTable";
import TimesheetFooter from "./timesheet/TimesheetFooter";
import { useTimesheetData } from "./timesheet/useTimesheetData";

const WeeklyTimeTable = () => {
  const { toast } = useToast();
  
  const {
    weekStartDate,
    weekDates,
    weekStatus,
    isEditable,
    getGroupedEntries,
    getDailyTotal,
    getWeeklyTotal,
    getDailyTotalColorClass,
    handleUpdateWeekStatus
  } = useTimesheetData();

  const groupedEntries = getGroupedEntries();
  
  const handleSubmitTimesheet = (weekStartISO: string, status: string) => {
    handleUpdateWeekStatus(weekStartISO, status);
    
    toast({
      title: `Timesheet ${status}`,
      description: `Timesheet has been ${status} successfully`,
    });
  };

  return (
    <div className="space-y-4">
      <TimesheetHeader 
        weekStartDate={weekStartDate}
        weekStatus={weekStatus}
        isEditable={isEditable}
        onSubmit={handleSubmitTimesheet}
      />
      
      <TimesheetTable
        weekDates={weekDates}
        groupedEntries={groupedEntries}
        getDailyTotal={getDailyTotal}
        getWeeklyTotal={getWeeklyTotal}
        getDailyTotalColorClass={getDailyTotalColorClass}
      />
      
      <TimesheetFooter
        totalHours={getWeeklyTotal()}
        weekStatus={weekStatus}
        getDailyTotalColorClass={getDailyTotalColorClass}
      />
    </div>
  );
};

export default WeeklyTimeTable;
