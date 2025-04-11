
import { Link, useLocation } from "react-router-dom";
import { Clock, Users, Briefcase, BarChart3, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

const Navbar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const navItems = [
    { name: "Dashboard", path: "/", icon: <Clock className="w-5 h-5" /> },
    { name: "Customers", path: "/customers", icon: <Users className="w-5 h-5" /> },
    { name: "Projects", path: "/projects", icon: <Briefcase className="w-5 h-5" /> },
    { name: "Reports", path: "/reports", icon: <BarChart3 className="w-5 h-5" /> },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link to="/" className="flex items-center space-x-2">
              <Clock className="h-6 w-6 text-brand-600" />
              <span className="hidden md:inline-block font-bold text-xl text-brand-600">TimeTrack</span>
            </Link>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <nav className="hidden md:flex items-center space-x-2 md:space-x-4 ml-auto">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:text-brand-500",
                  location.pathname === item.path
                    ? "text-brand-500 bg-brand-50"
                    : "text-muted-foreground"
                )}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="ml-auto md:ml-0 flex items-center space-x-2">
            {/* Add more controls like profile menu here */}
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed top-14 left-0 right-0 bg-background border-b z-30">
          <nav className="container flex flex-col py-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-md text-base font-medium transition-colors",
                  location.pathname === item.path
                    ? "text-brand-500 bg-brand-50"
                    : "text-muted-foreground hover:text-brand-500 hover:bg-brand-50/50"
                )}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
};

export default Navbar;
