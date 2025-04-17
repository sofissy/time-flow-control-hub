
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { format, startOfWeek } from "date-fns";

// Define the types for our data
export type TimeEntry = {
  id: string;
  date: string;
  project: string;
  task: string;
  hours: number;
  notes: string;
};

export type Customer = {
  id: string;
  name: string;
  active: boolean;
};

export type Project = {
  id: string;
  name: string;
  customerId: string;
  active: boolean;
};

export type WeekStatus = {
  weekStart: string;
  status: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

// Define the shape of our AppContext
interface AppContextInterface {
  timeEntries: TimeEntry[];
  customers: Customer[];
  projects: Project[];
  weekStatuses: WeekStatus[];
  users: User[];
  selectedDate: Date;
  addTimeEntry: (entry: Omit<TimeEntry, "id">) => void;
  updateTimeEntry: (id: string, updates: Partial<TimeEntry>) => void;
  deleteTimeEntry: (id: string) => void;
  getEntriesForDate: (date: string) => TimeEntry[];
  getTotalHoursForWeek: (weekStart: string) => number;
  getWeekStatus: (weekStart: string) => WeekStatus | undefined;
  updateWeekStatus: (weekStart: string, status: string) => void;
  canManageTimesheets: () => boolean;
  canEditTimesheet: (weekStartDate: string) => boolean;
  currentUser: User;
  setSelectedDate: (date: Date) => void;
  setSelectedWeekDate: (date: Date) => void;
}

export const AppContext = createContext<AppContextInterface>({
  timeEntries: [],
  customers: [],
  projects: [],
  weekStatuses: [],
  users: [],
  selectedDate: new Date(),
  addTimeEntry: () => {},
  updateTimeEntry: () => {},
  deleteTimeEntry: () => {},
  getEntriesForDate: () => [],
  getTotalHoursForWeek: () => 0,
  getWeekStatus: () => undefined,
  updateWeekStatus: () => {},
  canManageTimesheets: () => false,
  canEditTimesheet: () => true,
  currentUser: { id: "", name: "", email: "", role: "" },
  setSelectedDate: () => {},
  setSelectedWeekDate: (date: Date) => {},
});

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // State variables
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([
    { id: "1", name: "Acme Corp", active: true },
    { id: "2", name: "Beta Co", active: true },
    { id: "3", name: "Gamma Ltd", active: false },
  ]);
  const [projects, setProjects] = useState<Project[]>([
    { id: "1", customerId: "1", name: "Project Alpha", active: true },
    { id: "2", customerId: "1", name: "Project Bravo", active: true },
    { id: "3", customerId: "2", name: "Project Charlie", active: true },
    { id: "4", customerId: "3", name: "Project Delta", active: false },
  ]);
  const [weekStatuses, setWeekStatuses] = useState<WeekStatus[]>([
    { weekStart: "2024-04-14", status: "approved" },
    { weekStart: "2024-04-21", status: "pending" },
  ]);
  const [users, setUsers] = useState<User[]>([
    { id: "1", name: "John Doe", email: "john@example.com", role: "admin" },
    { id: "2", name: "Jane Smith", email: "jane@example.com", role: "user" },
  ]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Function to add a time entry
  const addTimeEntry = (entry: Omit<TimeEntry, "id">) => {
    const newEntry: TimeEntry = {
      ...entry,
      id: Math.random().toString(), // Generate a unique ID
    };
    setTimeEntries([...timeEntries, newEntry]);
  };

  // Function to update a time entry
  const updateTimeEntry = (id: string, updates: Partial<TimeEntry>) => {
    setTimeEntries(
      timeEntries.map((entry) => (entry.id === id ? { ...entry, ...updates } : entry))
    );
  };

  // Function to delete a time entry
  const deleteTimeEntry = (id: string) => {
    setTimeEntries(timeEntries.filter((entry) => entry.id !== id));
  };

  // Function to get time entries for a specific date
  const getEntriesForDate = (date: string): TimeEntry[] => {
    return timeEntries.filter((entry) => entry.date === date);
  };

  const getTotalHoursForWeek = (weekStart: string): number => {
    const weekStartDate = new Date(weekStart);
    let totalHours = 0;

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(
        weekStartDate.setDate(weekStartDate.getDate() + 1)
      );
      const formattedDate = format(currentDate, "yyyy-MM-dd");
      totalHours += timeEntries
        .filter((entry) => entry.date === formattedDate)
        .reduce((sum, entry) => sum + entry.hours, 0);
    }

    return totalHours;
  };

  const getWeekStatus = (weekStart: string): WeekStatus | undefined => {
    return weekStatuses.find((status) => status.weekStart === weekStart);
  };

  const updateWeekStatus = (weekStart: string, status: string) => {
    setWeekStatuses(
      weekStatuses.map((weekStatus) =>
        weekStatus.weekStart === weekStart ? { ...weekStatus, status } : weekStatus
      )
    );
  };

  const canManageTimesheets = () => {
    // Check if the current user has the 'admin' role
    return currentUser.role === "admin";
  };
  
  // Function to determine if a timesheet can be edited based on its status
  const canEditTimesheet = (weekStartDate: string): boolean => {
    const status = getWeekStatus(weekStartDate)?.status;
    // Can edit if the status is draft or doesn't exist yet
    return !status || status === "draft" || status === "reopened";
  };

  const currentUser = users[0];

  const setSelectedWeekDate = (date: Date) => {
    setSelectedDate(date);
  };

  const contextValue: AppContextInterface = {
    timeEntries,
    customers,
    projects,
    weekStatuses,
    users,
    selectedDate,
    addTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    getEntriesForDate,
    getTotalHoursForWeek,
    getWeekStatus,
    updateWeekStatus,
    canManageTimesheets,
    canEditTimesheet,
    currentUser,
    setSelectedDate,
    setSelectedWeekDate,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
