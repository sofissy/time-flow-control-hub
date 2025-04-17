
import React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check, AlertCircle } from "lucide-react";

interface TimesheetFooterProps {
  totalHours: number;
  weekStatus: string;
  getDailyTotalColorClass: (hours: number) => string;
}

const TimesheetFooter = ({
  totalHours,
  weekStatus,
  getDailyTotalColorClass,
}: TimesheetFooterProps) => {
  return (
    <>
      <Card className="p-4 mt-4">
        <div className="flex justify-between items-center">
          <div className="text-lg font-medium">
            Weekly Total: <span className={cn("font-bold", getDailyTotalColorClass(totalHours))}>{totalHours} hours</span>
          </div>
        </div>
      </Card>
      
      {weekStatus === 'rejected' && (
        <div className="bg-red-50 border border-red-200 rounded p-4 flex items-start space-x-2 mt-4">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-800">Timesheet Rejected</h3>
            <p className="text-red-700">
              Your timesheet was rejected. Please review your entries and resubmit.
            </p>
          </div>
        </div>
      )}
      
      {weekStatus === 'approved' && (
        <div className="bg-green-50 border border-green-200 rounded p-4 flex items-start space-x-2 mt-4">
          <Check className="h-5 w-5 text-green-500 mt-0.5" />
          <div>
            <h3 className="font-medium text-green-800">Timesheet Approved</h3>
            <p className="text-green-700">
              Your timesheet has been approved.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default TimesheetFooter;
