
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import UserSwitcher from "@/components/UserSwitcher";
import { useAppContext } from "@/context/AppContext";

const Navbar = () => {
  const { canManageTimesheets } = useAppContext();
  
  return (
    <header className="bg-background border-b">
      <div className="container h-16 flex items-center">
        <div className="mr-4 md:flex hidden">
          <NavLink to="/" className="text-xl font-bold">
            TimeTrack
          </NavLink>
        </div>
        <div className="flex space-x-4 items-center">
          <NavLink
            to="/"
            className={({ isActive }) =>
              cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground"
              )
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/weekly"
            className={({ isActive }) =>
              cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground"
              )
            }
          >
            Weekly Entry
          </NavLink>
          {canManageTimesheets() && (
            <>
              <NavLink
                to="/customers"
                className={({ isActive }) =>
                  cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )
                }
              >
                Customers
              </NavLink>
              <NavLink
                to="/projects"
                className={({ isActive }) =>
                  cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )
                }
              >
                Projects
              </NavLink>
              <NavLink
                to="/reports"
                className={({ isActive }) =>
                  cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )
                }
              >
                Reports
              </NavLink>
            </>
          )}
        </div>
        <div className="ml-auto">
          <UserSwitcher />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
