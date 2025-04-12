
import React from "react";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserIcon, ShieldCheck, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const UserSwitcher = () => {
  const { currentUser, users, switchUser } = useAppContext();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto">
          {currentUser.role === "admin" ? (
            <ShieldCheck className="w-4 h-4 mr-2 text-blue-500" />
          ) : (
            <User className="w-4 h-4 mr-2" />
          )}
          {currentUser.name}
          <Badge 
            variant="outline" 
            className={`ml-2 ${currentUser.role === "admin" ? "border-blue-500 text-blue-500" : ""}`}
          >
            {currentUser.role === "admin" ? "Admin" : "User"}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Switch user</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {users.map((user) => (
          <DropdownMenuItem
            key={user.id}
            onClick={() => switchUser(user.id)}
            className={currentUser.id === user.id ? "bg-muted" : ""}
          >
            {user.role === "admin" ? (
              <ShieldCheck className="w-4 h-4 mr-2 text-blue-500" />
            ) : (
              <User className="w-4 h-4 mr-2" />
            )}
            {user.name}
            <Badge 
              variant="outline" 
              className={`ml-2 ${user.role === "admin" ? "border-blue-500 text-blue-500" : ""}`}
            >
              {user.role === "admin" ? "Admin" : "User"}
            </Badge>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserSwitcher;
