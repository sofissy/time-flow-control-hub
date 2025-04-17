
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
  // Adding the properties used in components
  customerId: string;
  projectId: string;
  description: string;
  status?: string;
};

export type Customer = {
  id: string;
  name: string;
  active: boolean;
  // Adding missing properties
  contactPerson?: string;
  email?: string;
};

export type Project = {
  id: string;
  name: string;
  customerId: string;
  active: boolean;
  // Adding missing properties
  description?: string;
  budget?: number;
  budgetCost?: number;
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
  // Adding missing property
  dailyRate?: number;
};

// ProjectActuals type for budget tracking
export type ProjectActuals = {
  days: number;
  cost: number;
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
  // Add missing functions
  getProjectsByCustomer: (customerId: string) => Project[];
  updateTimeEntryStatus: (id: string, status: string) => void;
  getProjectActuals: (projectId: string) => ProjectActuals;
  addCustomer: (customer: Omit<Customer, "id">) => void;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (id: string) => void;
  addProject: (project: Omit<Project, "id">) => void;
  updateProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  addUser: (user: Omit<User, "id">) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;
  switchUser: (id: string) => void;
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
  setSelectedWeekDate: () => {},
  // Add missing functions to context default value
  getProjectsByCustomer: () => [],
  updateTimeEntryStatus: () => {},
  getProjectActuals: () => ({ days: 0, cost: 0 }),
  addCustomer: () => {},
  updateCustomer: () => {},
  deleteCustomer: () => {},
  addProject: () => {},
  updateProject: () => {},
  deleteProject: () => {},
  addUser: () => {},
  updateUser: () => {},
  deleteUser: () => {},
  switchUser: () => {},
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
    { id: "1", name: "John Doe", email: "john@example.com", role: "admin", dailyRate: 500 },
    { id: "2", name: "Jane Smith", email: "jane@example.com", role: "user", dailyRate: 400 },
  ]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentUser, setCurrentUser] = useState<User>(users[0]);

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

  // Function to update a time entry status
  const updateTimeEntryStatus = (id: string, status: string) => {
    updateTimeEntry(id, { status });
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
      const currentDate = new Date(weekStartDate);
      currentDate.setDate(currentDate.getDate() + i);
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
    const existingStatusIndex = weekStatuses.findIndex(ws => ws.weekStart === weekStart);
    
    if (existingStatusIndex >= 0) {
      // Update existing status
      setWeekStatuses(
        weekStatuses.map((weekStatus) =>
          weekStatus.weekStart === weekStart ? { ...weekStatus, status } : weekStatus
        )
      );
    } else {
      // Create new status
      setWeekStatuses([...weekStatuses, { weekStart, status }]);
    }
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

  const setSelectedWeekDate = (date: Date) => {
    setSelectedDate(date);
  };

  // Add missing functions
  const getProjectsByCustomer = (customerId: string): Project[] => {
    return projects.filter(project => project.customerId === customerId && project.active);
  };

  const getProjectActuals = (projectId: string): ProjectActuals => {
    // Calculate the total days and cost for a project from time entries
    const projectEntries = timeEntries.filter(entry => entry.projectId === projectId);
    
    const totalDays = projectEntries.reduce((sum, entry) => sum + entry.hours / 8, 0); // Assuming 8 hours per day
    
    // Calculate cost based on user rate if available
    let totalCost = 0;
    projectEntries.forEach(entry => {
      // This is simplified logic - in a real app you'd relate entries to users
      const userRate = users.find(u => u.id === "1")?.dailyRate || 0;
      totalCost += (entry.hours / 8) * userRate;
    });
    
    return { 
      days: totalDays,
      cost: totalCost
    };
  };

  // Customer CRUD operations
  const addCustomer = (customer: Omit<Customer, "id">) => {
    const newCustomer: Customer = {
      ...customer,
      id: Math.random().toString(),
    };
    setCustomers([...customers, newCustomer]);
  };

  const updateCustomer = (customer: Customer) => {
    setCustomers(
      customers.map((c) => (c.id === customer.id ? customer : c))
    );
  };

  const deleteCustomer = (id: string) => {
    setCustomers(customers.filter((c) => c.id !== id));
  };

  // Project CRUD operations
  const addProject = (project: Omit<Project, "id">) => {
    const newProject: Project = {
      ...project,
      id: Math.random().toString(),
    };
    setProjects([...projects, newProject]);
  };

  const updateProject = (project: Project) => {
    setProjects(
      projects.map((p) => (p.id === project.id ? project : p))
    );
  };

  const deleteProject = (id: string) => {
    setProjects(projects.filter((p) => p.id !== id));
  };

  // User CRUD operations
  const addUser = (user: Omit<User, "id">) => {
    const newUser: User = {
      ...user,
      id: Math.random().toString(),
    };
    setUsers([...users, newUser]);
  };

  const updateUser = (user: User) => {
    setUsers(
      users.map((u) => (u.id === user.id ? user : u))
    );
  };

  const deleteUser = (id: string) => {
    setUsers(users.filter((u) => u.id !== id));
  };

  const switchUser = (id: string) => {
    const user = users.find(u => u.id === id);
    if (user) {
      setCurrentUser(user);
    }
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
    // Add missing functions to context value
    getProjectsByCustomer,
    updateTimeEntryStatus,
    getProjectActuals,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addProject,
    updateProject,
    deleteProject,
    addUser,
    updateUser,
    deleteUser,
    switchUser,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
