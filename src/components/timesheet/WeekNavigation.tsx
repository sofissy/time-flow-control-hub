
import React from "react";
import { format, endOfWeek, startOfWeek } from "date-fns";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type WeekNavigationProps = {
  selectedDate: Date;
  weekStartDate: Date;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onSelectDate: (date: Date | undefined) => void;
};

const WeekNavigation = ({
  selectedDate,
  weekStartDate,
  onPreviousWeek,
  onNextWeek,
  onSelectDate,
}: WeekNavigationProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Button variant="outline" size="sm" onClick={onPreviousWeek}>
        Previous Week
      </Button>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {format(weekStartDate, "MMM d")} - {format(endOfWeek(weekStartDate, { weekStartsOn: 1 }), "MMM d, yyyy")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center" side="bottom">
          <Calendar
            mode="single"
            captionLayout="dropdown"
            weekStartsOn={1}
            selected={selectedDate}
            onSelect={onSelectDate}
            disabled={(date) =>
              date < new Date("2020-01-01") || date > new Date("2030-01-01")
            }
            className="rounded-md border shadow-sm"
          />
        </PopoverContent>
      </Popover>

      <Button variant="outline" size="sm" onClick={onNextWeek}>
        Next Week
      </Button>
    </div>
  );
};

export default WeekNavigation;
