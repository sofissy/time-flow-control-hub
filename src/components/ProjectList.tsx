
import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
import { Briefcase, Plus, MoreHorizontal, Pencil, Trash2, EuroIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Project } from "@/context/AppContext";

const ProjectList = () => {
  const { projects, customers, addProject, updateProject, deleteProject, getProjectActuals } = useAppContext();
  const { toast } = useToast();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Form state
  const [name, setName] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [budget, setBudget] = useState<number | undefined>(undefined);
  const [budgetCost, setBudgetCost] = useState<number | undefined>(undefined);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const activeCustomers = customers.filter(c => c.active);

  const handleAddProject = () => {
    if (!name) {
      toast({
        title: "Name required",
        description: "Please enter a project name",
        variant: "destructive",
      });
      return;
    }

    if (!customerId) {
      toast({
        title: "Customer required",
        description: "Please select a customer",
        variant: "destructive",
      });
      return;
    }

    addProject({
      name,
      customerId,
      description,
      active,
      budget,
      budgetCost,
    });

    resetForm();
    setIsAddDialogOpen(false);
    
    toast({
      title: "Project added",
      description: `${name} has been added successfully`,
    });
  };

  const handleEditProject = () => {
    if (!selectedProject) return;
    
    if (!name) {
      toast({
        title: "Name required",
        description: "Please enter a project name",
        variant: "destructive",
      });
      return;
    }

    if (!customerId) {
      toast({
        title: "Customer required",
        description: "Please select a customer",
        variant: "destructive",
      });
      return;
    }

    updateProject({
      id: selectedProject.id,
      name,
      customerId,
      description,
      active,
      budget,
      budgetCost,
    });

    resetForm();
    setIsEditDialogOpen(false);
    
    toast({
      title: "Project updated",
      description: `${name} has been updated successfully`,
    });
  };

  const handleDeleteProject = () => {
    if (!selectedProject) return;
    
    deleteProject(selectedProject.id);
    setIsDeleteDialogOpen(false);
    
    toast({
      title: "Project deleted",
      description: `${selectedProject.name} has been deleted`,
    });
  };

  const openEditDialog = (project: Project) => {
    setSelectedProject(project);
    setName(project.name);
    setCustomerId(project.customerId);
    setDescription(project.description);
    setActive(project.active);
    setBudget(project.budget);
    setBudgetCost(project.budgetCost);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (project: Project) => {
    setSelectedProject(project);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setName("");
    setCustomerId("");
    setDescription("");
    setActive(true);
    setBudget(undefined);
    setBudgetCost(undefined);
    setSelectedProject(null);
  };

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'Unknown';
  };

  // Function to calculate and format budget utilization
  const getBudgetUtilization = (project: Project) => {
    if (!project.budget) return "No budget";
    
    const actuals = getProjectActuals(project.id);
    const daysPercentage = project.budget > 0 
      ? Math.round((actuals.days / project.budget) * 100) 
      : 0;
    
    return (
      <div className="flex flex-col">
        <div className="text-sm font-medium">{actuals.days} / {project.budget} days ({daysPercentage}%)</div>
        {project.budgetCost && (
          <div className="text-xs text-muted-foreground flex items-center">
            <EuroIcon className="h-3 w-3 mr-1" />
            {actuals.cost.toLocaleString()} / {project.budgetCost.toLocaleString()}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Briefcase className="h-5 w-5 mr-2 text-brand-600" />
          <h2 className="text-xl font-semibold">Projects</h2>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add new project</DialogTitle>
              <DialogDescription>
                Add a new project to your time tracking system.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Project name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customer">Customer</Label>
                <Select value={customerId} onValueChange={setCustomerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeCustomers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Project description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget (days)</Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="Total days"
                    value={budget === undefined ? "" : budget}
                    onChange={(e) => setBudget(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budgetCost">Budget (€)</Label>
                  <Input
                    id="budgetCost"
                    type="number"
                    placeholder="Total cost"
                    value={budgetCost === undefined ? "" : budgetCost}
                    onChange={(e) => setBudgetCost(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </div>
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
              <Button onClick={handleAddProject}>Add Project</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit project</DialogTitle>
              <DialogDescription>
                Make changes to project information.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  placeholder="Project name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-customer">Customer</Label>
                <Select value={customerId} onValueChange={setCustomerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeCustomers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  placeholder="Project description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-budget">Budget (days)</Label>
                  <Input
                    id="edit-budget"
                    type="number"
                    placeholder="Total days"
                    value={budget === undefined ? "" : budget}
                    onChange={(e) => setBudget(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-budgetCost">Budget (€)</Label>
                  <Input
                    id="edit-budgetCost"
                    type="number"
                    placeholder="Total cost"
                    value={budgetCost === undefined ? "" : budgetCost}
                    onChange={(e) => setBudgetCost(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </div>
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
              <Button onClick={handleEditProject}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete project</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {selectedProject?.name}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteProject}>
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
            <TableHead>Customer</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Budget Utilization</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id}>
              <TableCell className="font-medium">{project.name}</TableCell>
              <TableCell>{getCustomerName(project.customerId)}</TableCell>
              <TableCell className="max-w-[200px] truncate">{project.description}</TableCell>
              <TableCell>{getBudgetUtilization(project)}</TableCell>
              <TableCell>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  project.active 
                    ? "bg-green-100 text-green-800" 
                    : "bg-gray-100 text-gray-800"
                }`}>
                  {project.active ? "Active" : "Inactive"}
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
                    <DropdownMenuItem onClick={() => openEditDialog(project)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={() => openDeleteDialog(project)}
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

export default ProjectList;
