
import React, { createContext, useContext, useState, ReactNode } from "react";
import { format, startOfWeek, parseISO, isWithinInterval, addDays } from "date-fns";

// Define types for our data
export type Customer = {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  active: boolean;
};

export type Project = {
  id: string;
  name: string;
  customerId: string;
  description: string;
  active: boolean;
  budget?: number; // Budget in days
  budgetCost?: number; // Budget in currency (euros)
};

export type TimeEntry = {
  id: string;
  date: string; // ISO string
  customerId: string;
  projectId: string;
  hours: number;
  description: string;
  status?: "draft" | "pending" | "approved" | "rejected" | "reopened"; // Made optional as status is now at week level
};

export type WeekStatus = {
  weekStart: string; // ISO string YYYY-MM-DD of Monday
  status: "draft" | "pending" | "approved" | "rejected" | "reopened";
};

export type UserRole = "user" | "admin";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  dailyRate?: number; // Daily rate in euros
};

type AppContextType = {
  customers: Customer[];
  projects: Project[];
  timeEntries: TimeEntry[];
  weekStatuses: WeekStatus[];
  selectedDate: Date;
  currentUser: User;
  users: User[];
  addCustomer: (customer: Omit<Customer, "id">) => void;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (id: string) => void;
  addProject: (project: Omit<Project, "id">) => void;
  updateProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  addTimeEntry: (entry: Omit<TimeEntry, "id" | "status">) => void;
  updateTimeEntry: (entry: TimeEntry) => void;
  deleteTimeEntry: (id: string) => void;
  updateTimeEntryStatus: (id: string, status: TimeEntry["status"]) => void;
  getWeekStatus: (weekStart: string) => WeekStatus | undefined;
  updateWeekStatus: (weekStart: string, status: WeekStatus["status"]) => void;
  setSelectedDate: (date: Date) => void;
  getProjectsByCustomer: (customerId: string) => Project[];
  getCustomerById: (id: string) => Customer | undefined;
  getProjectById: (id: string) => Project | undefined;
  getTotalHoursForDay: (date: string) => number;
  getTotalHoursForWeek: (startDate: string) => number;
  getTotalHoursForMonth: (month: number, year: number) => number;
  switchUser: (userId: string) => void;
  addUser: (user: Omit<User, "id">) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;
  canManageTimesheets: () => boolean;
  canEditTimeEntry: (entry: TimeEntry) => boolean;
  canEditTimesheet: (weekStart: string) => boolean;
  getProjectActuals: (projectId: string) => { days: number; cost: number };
  getDailyRateForUser: (userId: string) => number;
};

// Create the context with a default value
const AppContext = createContext<AppContextType | undefined>(undefined);

// Sample data
const sampleCustomers: Customer[] = [
  {
    id: "c1",
    name: "Acme Corp",
    contactPerson: "John Doe",
    email: "john.doe@acme.com",
    active: true,
  },
  {
    id: "c2",
    name: "Wayne Enterprises",
    contactPerson: "Bruce Wayne",
    email: "bruce@wayne.com",
    active: true,
  },
  {
    id: "c3",
    name: "Stark Industries",
    contactPerson: "Tony Stark",
    email: "tony@stark.com",
    active: false,
  },
];

const sampleProjects: Project[] = [
  {
    id: "p1",
    name: "Website Redesign",
    customerId: "c1",
    description: "Complete redesign of corporate website",
    active: true,
    budget: 20, // 20 days
    budgetCost: 10000, // 10,000 euros
  },
  {
    id: "p2",
    name: "Mobile App Development",
    customerId: "c1",
    description: "iOS and Android app development",
    active: true,
    budget: 45, // 45 days
    budgetCost: 22500, // 22,500 euros
  },
  {
    id: "p3",
    name: "Security Audit",
    customerId: "c2",
    description: "Annual security audit and penetration testing",
    active: true,
    budget: 15, // 15 days
    budgetCost: 7500, // 7,500 euros
  },
  {
    id: "p4",
    name: "AI Integration",
    customerId: "c3",
    description: "Integration of AI technologies into existing products",
    active: false,
    budget: 30, // 30 days
    budgetCost: 15000, // 15,000 euros
  },
];

// Get today's date in ISO format
const today = new Date();
const todayISO = format(today, "yyyy-MM-dd");
const thisWeekStart = format(startOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd");

const sampleTimeEntries: TimeEntry[] = [
  {
    id: "t1",
    date: todayISO,
    customerId: "c1",
    projectId: "p1",
    hours: 3.5,
    description: "Homepage design implementation",
  },
  {
    id: "t2",
    date: todayISO,
    customerId: "c1",
    projectId: "p2",
    hours: 2,
    description: "API integration for mobile app",
  },
  {
    id: "t3",
    date: format(new Date(today.setDate(today.getDate() - 1)), "yyyy-MM-dd"),
    customerId: "c2",
    projectId: "p3",
    hours: 4,
    description: "Security vulnerability assessment",
  },
];

// Sample week statuses
const sampleWeekStatuses: WeekStatus[] = [
  {
    weekStart: thisWeekStart,
    status: "draft"
  }
];

// Sample users
const sampleUsers: User[] = [
  {
    id: "u1",
    name: "Regular User",
    email: "user@example.com",
    role: "user",
    dailyRate: 400, // 400 euros per day
  },
  {
    id: "u2",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    dailyRate: 600, // 600 euros per day
  }
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>(sampleCustomers);
  const [projects, setProjects] = useState<Project[]>(sampleProjects);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(sampleTimeEntries);
  const [weekStatuses, setWeekStatuses] = useState<WeekStatus[]>(sampleWeekStatuses);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [users, setUsers] = useState<User[]>(sampleUsers);
  const [currentUser, setCurrentUser] = useState<User>(sampleUsers[0]); // Default to regular user

  // User operations
  const switchUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  const addUser = (user: Omit<User, "id">) => {
    const newUser = {
      ...user,
      id: `u${users.length + 1}`,
    };
    setUsers([...users, newUser]);
  };

  const updateUser = (user: User) => {
    setUsers(users.map(u => (u.id === user.id ? user : u)));
  };

  const deleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
  };

  // Budget and resource rate utilities
  const getDailyRateForUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.dailyRate || 0;
  };
  
  const getProjectActuals = (projectId: string) => {
    // Calculate total hours spent on this project
    const projectEntries = timeEntries.filter(
      entry => entry.projectId === projectId && entry.status === "approved"
    );
    
    const totalHours = projectEntries.reduce((total, entry) => total + entry.hours, 0);
    
    // Convert hours to days (assuming 8 hour workday)
    const totalDays = totalHours / 8;
    
    // Calculate cost based on user daily rates
    let totalCost = 0;
    
    projectEntries.forEach(entry => {
      // Find the user who created this entry (in a real app, entries would have userId)
      // Here we're using the current user as a placeholder
      const userDailyRate = currentUser.dailyRate || 0;
      const entryCost = (entry.hours / 8) * userDailyRate;
      totalCost += entryCost;
    });
    
    return {
      days: parseFloat(totalDays.toFixed(1)),
      cost: Math.round(totalCost)
    };
  };

  // Permission checks
  const canManageTimesheets = () => {
    return currentUser.role === "admin";
  };

  const canEditTimeEntry = (entry: TimeEntry) => {
    // This is less relevant now that status is at the week level
    return canManageTimesheets() || true;
  };

  const canEditTimesheet = (weekStart: string) => {
    // Regular users can only edit if the week is in draft or reopened status
    const weekStatus = getWeekStatus(weekStart);
    
    if (!weekStatus) {
      // If no status exists, it's a new week and can be edited
      return true;
    }
    
    if (canManageTimesheets()) {
      // Admins can always edit
      return true;
    }
    
    // Regular users can edit only if draft or reopened
    return ['draft', 'reopened'].includes(weekStatus.status);
  };

  // Week status operations
  const getWeekStatus = (weekStart: string): WeekStatus | undefined => {
    return weekStatuses.find(w => w.weekStart === weekStart);
  };

  const updateWeekStatus = (weekStart: string, status: WeekStatus["status"]) => {
    const existingStatus = weekStatuses.find(w => w.weekStart === weekStart);
    
    if (existingStatus) {
      // Update existing status
      setWeekStatuses(
        weekStatuses.map(w => 
          w.weekStart === weekStart ? { ...w, status } : w
        )
      );
    } else {
      // Create new status
      setWeekStatuses([
        ...weekStatuses,
        { weekStart, status }
      ]);
    }
  };

  // Customer operations
  const addCustomer = (customer: Omit<Customer, "id">) => {
    const newCustomer = {
      ...customer,
      id: `c${customers.length + 1}`,
    };
    setCustomers([...customers, newCustomer]);
  };

  const updateCustomer = (customer: Customer) => {
    setCustomers(customers.map(c => (c.id === customer.id ? customer : c)));
  };

  const deleteCustomer = (id: string) => {
    setCustomers(customers.filter(c => c.id !== id));
  };

  // Project operations
  const addProject = (project: Omit<Project, "id">) => {
    const newProject = {
      ...project,
      id: `p${projects.length + 1}`,
    };
    setProjects([...projects, newProject]);
  };

  const updateProject = (project: Project) => {
    setProjects(projects.map(p => (p.id === project.id ? project : p)));
  };

  const deleteProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  // Time entry operations
  const addTimeEntry = (entry: Omit<TimeEntry, "id" | "status">) => {
    const newEntry = {
      ...entry,
      id: `t${timeEntries.length + 1}`,
    };
    
    // Ensure week status exists for this entry
    const entryDate = parseISO(entry.date);
    const weekStartDate = startOfWeek(entryDate, { weekStartsOn: 1 });
    const weekStartISO = format(weekStartDate, "yyyy-MM-dd");
    
    if (!getWeekStatus(weekStartISO)) {
      // Create week status if it doesn't exist
      updateWeekStatus(weekStartISO, "draft");
    }
    
    setTimeEntries([...timeEntries, newEntry]);
  };

  const updateTimeEntry = (entry: TimeEntry) => {
    // Check if user can edit this week's timesheet
    const entryDate = parseISO(entry.date);
    const weekStartDate = startOfWeek(entryDate, { weekStartsOn: 1 });
    const weekStartISO = format(weekStartDate, "yyyy-MM-dd");
    
    if (!canEditTimesheet(weekStartISO)) {
      return;
    }
    
    setTimeEntries(timeEntries.map(e => (e.id === entry.id ? entry : e)));
  };

  const deleteTimeEntry = (id: string) => {
    const entry = timeEntries.find(e => e.id === id);
    if (!entry) return;
    
    // Check if user can edit this week's timesheet
    const entryDate = parseISO(entry.date);
    const weekStartDate = startOfWeek(entryDate, { weekStartsOn: 1 });
    const weekStartISO = format(weekStartDate, "yyyy-MM-dd");
    
    if (!canEditTimesheet(weekStartISO)) {
      return;
    }
    
    setTimeEntries(timeEntries.filter(e => e.id !== id));
  };

  const updateTimeEntryStatus = (id: string, status: TimeEntry["status"]) => {
    // This is less relevant now as status is per week, but keeping for compatibility
    const entry = timeEntries.find(e => e.id === id);
    if (!entry) return;
    
    // Only admin can change status
    if (!canManageTimesheets()) {
      return;
    }
    
    setTimeEntries(
      timeEntries.map(e =>
        e.id === id ? { ...e, status } : e
      )
    );
  };

  // Helper functions
  const getProjectsByCustomer = (customerId: string) => {
    return projects.filter(p => p.customerId === customerId && p.active);
  };

  const getCustomerById = (id: string) => {
    return customers.find(c => c.id === id);
  };

  const getProjectById = (id: string) => {
    return projects.find(p => p.id === id);
  };

  const getTotalHoursForDay = (date: string) => {
    return timeEntries
      .filter(entry => entry.date === date)
      .reduce((total, entry) => total + entry.hours, 0);
  };

  const getTotalHoursForWeek = (startDate: string) => {
    const start = parseISO(startDate);
    const end = addDays(start, 6);
    
    return timeEntries
      .filter(entry => {
        const entryDate = parseISO(entry.date);
        return isWithinInterval(entryDate, { start, end });
      })
      .reduce((total, entry) => total + entry.hours, 0);
  };

  const getTotalHoursForMonth = (month: number, year: number) => {
    // Filter entries for the specific month and year
    return timeEntries
      .filter(entry => {
        const entryDate = parseISO(entry.date);
        return (
          entryDate.getMonth() === month && 
          entryDate.getFullYear() === year
        );
      })
      .reduce((total, entry) => total + entry.hours, 0);
  };

  const value = {
    customers,
    projects,
    timeEntries,
    weekStatuses,
    selectedDate,
    currentUser,
    users,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addProject,
    updateProject,
    deleteProject,
    addTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    updateTimeEntryStatus,
    getWeekStatus,
    updateWeekStatus,
    setSelectedDate,
    getProjectsByCustomer,
    getCustomerById,
    getProjectById,
    getTotalHoursForDay,
    getTotalHoursForWeek,
    getTotalHoursForMonth,
    switchUser,
    addUser,
    updateUser,
    deleteUser,
    canManageTimesheets,
    canEditTimeEntry,
    canEditTimesheet,
    getProjectActuals,
    getDailyRateForUser,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook for using the context
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
