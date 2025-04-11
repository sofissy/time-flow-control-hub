
import React, { createContext, useContext, useState, ReactNode } from "react";
import { format } from "date-fns";

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
};

export type TimeEntry = {
  id: string;
  date: string; // ISO string
  customerId: string;
  projectId: string;
  hours: number;
  description: string;
  status: "draft" | "pending" | "approved" | "rejected";
};

type AppContextType = {
  customers: Customer[];
  projects: Project[];
  timeEntries: TimeEntry[];
  selectedDate: Date;
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
  setSelectedDate: (date: Date) => void;
  getProjectsByCustomer: (customerId: string) => Project[];
  getCustomerById: (id: string) => Customer | undefined;
  getProjectById: (id: string) => Project | undefined;
  getTotalHoursForDay: (date: string) => number;
  getTotalHoursForWeek: (startDate: string) => number;
  getTotalHoursForMonth: (month: number, year: number) => number;
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
  },
  {
    id: "p2",
    name: "Mobile App Development",
    customerId: "c1",
    description: "iOS and Android app development",
    active: true,
  },
  {
    id: "p3",
    name: "Security Audit",
    customerId: "c2",
    description: "Annual security audit and penetration testing",
    active: true,
  },
  {
    id: "p4",
    name: "AI Integration",
    customerId: "c3",
    description: "Integration of AI technologies into existing products",
    active: false,
  },
];

// Get today's date in ISO format
const today = new Date();
const todayISO = format(today, "yyyy-MM-dd");

const sampleTimeEntries: TimeEntry[] = [
  {
    id: "t1",
    date: todayISO,
    customerId: "c1",
    projectId: "p1",
    hours: 3.5,
    description: "Homepage design implementation",
    status: "approved",
  },
  {
    id: "t2",
    date: todayISO,
    customerId: "c1",
    projectId: "p2",
    hours: 2,
    description: "API integration for mobile app",
    status: "pending",
  },
  {
    id: "t3",
    date: format(new Date(today.setDate(today.getDate() - 1)), "yyyy-MM-dd"),
    customerId: "c2",
    projectId: "p3",
    hours: 4,
    description: "Security vulnerability assessment",
    status: "draft",
  },
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>(sampleCustomers);
  const [projects, setProjects] = useState<Project[]>(sampleProjects);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(sampleTimeEntries);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

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
      status: "draft" as const,
    };
    setTimeEntries([...timeEntries, newEntry]);
  };

  const updateTimeEntry = (entry: TimeEntry) => {
    setTimeEntries(timeEntries.map(e => (e.id === entry.id ? entry : e)));
  };

  const deleteTimeEntry = (id: string) => {
    setTimeEntries(timeEntries.filter(e => e.id !== id));
  };

  const updateTimeEntryStatus = (id: string, status: TimeEntry["status"]) => {
    setTimeEntries(
      timeEntries.map(entry =>
        entry.id === id ? { ...entry, status } : entry
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
    // This is a simplified version - a real implementation would check dates within the week
    return timeEntries.reduce((total, entry) => total + entry.hours, 0);
  };

  const getTotalHoursForMonth = (month: number, year: number) => {
    // This is a simplified version - a real implementation would check dates within the month
    return timeEntries.reduce((total, entry) => total + entry.hours, 0);
  };

  const value = {
    customers,
    projects,
    timeEntries,
    selectedDate,
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
    setSelectedDate,
    getProjectsByCustomer,
    getCustomerById,
    getProjectById,
    getTotalHoursForDay,
    getTotalHoursForWeek,
    getTotalHoursForMonth,
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
