
import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";

type TimesheetActionButtonsProps = {
  status: string;
  onApprove: () => void;
  onReject: () => void;
};

const TimesheetActionButtons = ({ 
  status, 
  onApprove, 
  onReject 
}: TimesheetActionButtonsProps) => {
  if (status !== "pending") {
    return null;
  }
  
  return (
    <div className="flex space-x-2">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onApprove}
        className="text-green-600"
      >
        <CheckCircle className="h-4 w-4 mr-1" />
        Approve
      </Button>
      
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onReject}
        className="text-red-600"
      >
        <XCircle className="h-4 w-4 mr-1" />
        Reject
      </Button>
    </div>
  );
};

export default TimesheetActionButtons;
