
import React from "react";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserIcon } from "lucide-react";

const UserSwitcher = () => {
  const { currentUser, users, switchUser } = useAppContext();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto">
          <UserIcon className="w-4 h-4 mr-2" />
          {currentUser.name} ({currentUser.role})
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {users.map((user) => (
          <DropdownMenuItem
            key={user.id}
            onClick={() => switchUser(user.id)}
            className={currentUser.id === user.id ? "bg-muted" : ""}
          >
            {user.name} ({user.role})
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserSwitcher;
