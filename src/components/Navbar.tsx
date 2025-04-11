import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Menu, 
  X, 
  Users, 
  FolderKanban, 
  BarChart2,
  TableCellsLarge 
} from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";

const Navbar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useMobile();
  
  const navItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: <Home className="h-5 w-5" />,
    },
    {
      name: "Weekly Entry",
      path: "/weekly",
      icon: <TableCellsLarge className="h-5 w-5" />,
    },
    {
      name: "Customers",
      path: "/customers",
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: "Projects",
      path: "/projects",
      icon: <FolderKanban className="h-5 w-5" />,
    },
    {
      name: "Reports",
      path: "/reports",
      icon: <BarChart2 className="h-5 w-5" />,
    },
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="container flex items-center justify-between py-3">
        <Link to="/" className="font-bold text-lg">
          TimeTracker
        </Link>
        
        {isMobile ? (
          <>
            <Button variant="outline" size="icon" onClick={toggleMobileMenu}>
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
            
            {mobileMenuOpen && (
              <div className="absolute top-full left-0 w-full bg-white border-b shadow-md py-2 flex flex-col items-center">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center space-x-2 px-4 py-2 rounded-md hover:bg-gray-100",
                      location.pathname === item.path
                        ? "font-bold bg-gray-100"
                        : "font-medium"
                    )}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 rounded-md hover:bg-gray-100",
                  location.pathname === item.path
                    ? "font-bold bg-gray-100"
                    : "font-medium"
                )}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
