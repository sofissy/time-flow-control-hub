
import { useState } from "react";
import { useAppContext, User } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Plus, MoreHorizontal, Pencil, Trash2, EuroIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const UserList = () => {
  const { users, addUser, updateUser, deleteUser, canManageTimesheets, currentUser } = useAppContext();
  const { toast } = useToast();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [dailyRate, setDailyRate] = useState<number | undefined>(undefined);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleAddUser = () => {
    if (!name) {
      toast({
        title: "Name required",
        description: "Please enter a user name",
        variant: "destructive",
      });
      return;
    }

    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    addUser({
      name,
      email,
      role,
      dailyRate,
    });

    resetForm();
    setIsAddDialogOpen(false);
    
    toast({
      title: "User added",
      description: `${name} has been added successfully`,
    });
  };

  const handleEditUser = () => {
    if (!selectedUser) return;
    
    if (!name) {
      toast({
        title: "Name required",
        description: "Please enter a user name",
        variant: "destructive",
      });
      return;
    }

    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    updateUser({
      id: selectedUser.id,
      name,
      email,
      role,
      dailyRate,
    });

    resetForm();
    setIsEditDialogOpen(false);
    
    toast({
      title: "User updated",
      description: `${name} has been updated successfully`,
    });
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    
    deleteUser(selectedUser.id);
    setIsDeleteDialogOpen(false);
    
    toast({
      title: "User deleted",
      description: `${selectedUser.name} has been deleted`,
    });
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setDailyRate(user.dailyRate);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setRole("user");
    setDailyRate(undefined);
    setSelectedUser(null);
  };

  // Only admins can add/edit/delete users
  const isAdmin = canManageTimesheets();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Users className="h-5 w-5 mr-2 text-brand-600" />
          <h2 className="text-xl font-semibold">Users & Rates</h2>
        </div>
        
        {isAdmin && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add new user</DialogTitle>
                <DialogDescription>
                  Add a new user to your time tracking system.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="User name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={role} onValueChange={(value: "user" | "admin") => setRole(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dailyRate">Daily Rate (€)</Label>
                  <Input
                    id="dailyRate"
                    type="number"
                    placeholder="Rate per day"
                    value={dailyRate === undefined ? "" : dailyRate}
                    onChange={(e) => setDailyRate(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  resetForm();
                  setIsAddDialogOpen(false);
                }}>
                  Cancel
                </Button>
                <Button onClick={handleAddUser}>Add User</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit user</DialogTitle>
              <DialogDescription>
                Make changes to user information.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  placeholder="User name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              {isAdmin && (
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Role</Label>
                  <Select value={role} onValueChange={(value: "user" | "admin") => setRole(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="edit-dailyRate">Daily Rate (€)</Label>
                <Input
                  id="edit-dailyRate"
                  type="number"
                  placeholder="Rate per day"
                  value={dailyRate === undefined ? "" : dailyRate}
                  onChange={(e) => setDailyRate(e.target.value ? Number(e.target.value) : undefined)}
                  readOnly={!isAdmin && selectedUser?.id !== currentUser.id}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                resetForm();
                setIsEditDialogOpen(false);
              }}>
                Cancel
              </Button>
              <Button onClick={handleEditUser}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete user</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {selectedUser?.name}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteUser} disabled={selectedUser?.id === currentUser.id}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Daily Rate</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className={user.id === currentUser.id ? "bg-muted/30" : ""}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  user.role === "admin" 
                    ? "bg-brand-100 text-brand-800" 
                    : "bg-gray-100 text-gray-800"
                }`}>
                  {user.role === "admin" ? "Admin" : "User"}
                </span>
              </TableCell>
              <TableCell>
                {user.dailyRate ? (
                  <div className="flex items-center">
                    <EuroIcon className="h-3 w-3 mr-1" />
                    {user.dailyRate.toLocaleString()}
                  </div>
                ) : (
                  <span className="text-muted-foreground">Not set</span>
                )}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditDialog(user)} disabled={!isAdmin && user.id !== currentUser.id}>
                      <Pencil className="mr-2 h-4 w-4" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    {isAdmin && user.id !== currentUser.id && (
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => openDeleteDialog(user)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserList;
