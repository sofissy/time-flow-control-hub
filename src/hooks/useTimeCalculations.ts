
export const useTimeCalculations = () => {
  const calculateDailyTotal = (entries: any[], date: string): number => {
    return entries.reduce((total, row) => {
      return total + parseFloat(row.hours[date] || "0");
    }, 0);
  };

  const getDailyTotalColorClass = (hours: number): string => {
    if (hours === 0) return "text-gray-400";
    if (hours > 8) return "text-red-500 font-bold";
    if (hours === 8) return "text-green-500 font-medium";
    if (hours < 4) return "text-amber-500 font-medium";
    return "text-blue-500 font-medium";
  };

  const calculateWeeklyTotal = (entries: any[]): number => {
    return entries.reduce((total, row) => {
      return total + Object.values(row.hours).reduce((sum: number, hours: any) => sum + parseFloat(hours || "0"), 0);
    }, 0);
  };

  return {
    calculateDailyTotal,
    getDailyTotalColorClass,
    calculateWeeklyTotal
  };
};
