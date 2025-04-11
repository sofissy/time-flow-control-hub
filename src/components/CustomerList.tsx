
import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { Users, Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Customer } from "@/context/AppContext";

const CustomerList = () => {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useAppContext();
  const { toast } = useToast();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Form state
  const [name, setName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [active, setActive] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const handleAddCustomer = () => {
    if (!name) {
      toast({
        title: "Name required",
        description: "Please enter a customer name",
        variant: "destructive",
      });
      return;
    }

    addCustomer({
      name,
      contactPerson,
      email,
      active,
    });

    resetForm();
    setIsAddDialogOpen(false);
    
    toast({
      title: "Customer added",
      description: `${name} has been added successfully`,
    });
  };

  const handleEditCustomer = () => {
    if (!selectedCustomer) return;
    
    if (!name) {
      toast({
        title: "Name required",
        description: "Please enter a customer name",
        variant: "destructive",
      });
      return;
    }

    updateCustomer({
      id: selectedCustomer.id,
      name,
      contactPerson,
      email,
      active,
    });

    resetForm();
    setIsEditDialogOpen(false);
    
    toast({
      title: "Customer updated",
      description: `${name} has been updated successfully`,
    });
  };

  const handleDeleteCustomer = () => {
    if (!selectedCustomer) return;
    
    deleteCustomer(selectedCustomer.id);
    setIsDeleteDialogOpen(false);
    
    toast({
      title: "Customer deleted",
      description: `${selectedCustomer.name} has been deleted`,
    });
  };

  const openEditDialog = (customer: Customer) => {
    setSelectedCustomer(customer);
    setName(customer.name);
    setContactPerson(customer.contactPerson);
    setEmail(customer.email);
    setActive(customer.active);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setName("");
    setContactPerson("");
    setEmail("");
    setActive(true);
    setSelectedCustomer(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Users className="h-5 w-5 mr-2 text-brand-600" />
          <h2 className="text-xl font-semibold">Customers</h2>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add new customer</DialogTitle>
              <DialogDescription>
                Add a new customer to your time tracking system.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Customer name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input
                  id="contactPerson"
                  placeholder="Contact person name"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contact@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={active}
                  onCheckedChange={setActive}
                />
                <Label htmlFor="active">Active</Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                resetForm();
                setIsAddDialogOpen(false);
              }}>
                Cancel
              </Button>
              <Button onClick={handleAddCustomer}>Add Customer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit customer</DialogTitle>
              <DialogDescription>
                Make changes to customer information.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  placeholder="Customer name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-contactPerson">Contact Person</Label>
                <Input
                  id="edit-contactPerson"
                  placeholder="Contact person name"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  placeholder="contact@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-active"
                  checked={active}
                  onCheckedChange={setActive}
                />
                <Label htmlFor="edit-active">Active</Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                resetForm();
                setIsEditDialogOpen(false);
              }}>
                Cancel
              </Button>
              <Button onClick={handleEditCustomer}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete customer</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {selectedCustomer?.name}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteCustomer}>
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
            <TableHead>Contact Person</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell className="font-medium">{customer.name}</TableCell>
              <TableCell>{customer.contactPerson}</TableCell>
              <TableCell>{customer.email}</TableCell>
              <TableCell>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  customer.active 
                    ? "bg-green-100 text-green-800" 
                    : "bg-gray-100 text-gray-800"
                }`}>
                  {customer.active ? "Active" : "Inactive"}
                </span>
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
                    <DropdownMenuItem onClick={() => openEditDialog(customer)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={() => openDeleteDialog(customer)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
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

export default CustomerList;
