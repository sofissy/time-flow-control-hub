
import React from "react";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Send } from "lucide-react";

interface TimesheetHeaderProps {
  weekStartDate: Date;
  weekStatus: string;
  isEditable: boolean;
  onSubmit: (weekStart: string, status: string) => void;
}

const TimesheetHeader = ({
  weekStartDate,
  weekStatus,
  isEditable,
  onSubmit,
}: TimesheetHeaderProps) => {
  // Format the date range for display
  const getDateRangeDisplay = () => {
    const start = format(weekStartDate, 'MMM d');
    const end = format(new Date(weekStartDate.getTime() + 6 * 24 * 60 * 60 * 1000), 'MMM d, yyyy');
    return `${start} - ${end}`;
  };

  // Get appropriate status badge color
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'submitted': return 'bg-blue-500';
      case 'pending': return 'bg-blue-500';  // Added pending to match with other components
      case 'reopened': return 'bg-amber-500';
      default: return 'bg-gray-500';
    }
  };

  // Determine if we should show the submit button - Made this more permissive
  // Also show button for empty string status (initial state)
  const shouldShowSubmitButton = isEditable && (!weekStatus || weekStatus === '' || weekStatus === 'draft' || weekStatus === 'reopened');

  console.log("TimesheetHeader state:", { weekStatus, isEditable, shouldShowButton: shouldShowSubmitButton });

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Weekly Timesheet</h2>
          <p className="text-sm text-muted-foreground">{getDateRangeDisplay()}</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground mr-2">Status:</span>
          <Badge className={getStatusColor(weekStatus)}>
            {weekStatus ? weekStatus.charAt(0).toUpperCase() + weekStatus.slice(1) : 'Draft'}
          </Badge>
          
          {shouldShowSubmitButton && (
            <Button 
              size="sm"
              variant="outline" 
              onClick={() => onSubmit(format(weekStartDate, 'yyyy-MM-dd'), 'submitted')}
              className="ml-2"
            >
              <Send className="mr-1 h-4 w-4" />
              Submit
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default TimesheetHeader;
