
import React from 'react';
import { cn } from "@/lib/utils";

interface DailyTotalsRowProps {
  weekDates: string[];
  calculateDailyTotal: (date: string) => number;
  getDailyTotalColorClass: (hours: number) => string;
  calculateWeeklyTotal: () => number;
}

const DailyTotalsRow = ({
  weekDates,
  calculateDailyTotal,
  getDailyTotalColorClass,
  calculateWeeklyTotal
}: DailyTotalsRowProps) => {
  return (
    <tr className="bg-muted/50">
      <td colSpan={3} className="font-medium">
        Daily Total
      </td>
      {weekDates.map(date => {
        const dailyTotal = calculateDailyTotal(date);
        return (
          <td key={date} className={cn("text-center font-medium", getDailyTotalColorClass(dailyTotal))}>
            {dailyTotal}
          </td>
        );
      })}
      <td className="font-medium">
        Weekly Total:
      </td>
      <td className={cn("font-bold", getDailyTotalColorClass(calculateWeeklyTotal()))}>
        {calculateWeeklyTotal()}
      </td>
    </tr>
  );
};

export default DailyTotalsRow;
