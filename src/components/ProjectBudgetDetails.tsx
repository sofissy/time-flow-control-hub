
import { useState } from "react";
import { useAppContext, Project } from "@/context/AppContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { EuroIcon } from "lucide-react";

interface ProjectBudgetDetailsProps {
  project: Project;
}

const ProjectBudgetDetails = ({ project }: ProjectBudgetDetailsProps) => {
  const { getProjectActuals } = useAppContext();
  const [activeTab, setActiveTab] = useState("days");
  
  const actuals = getProjectActuals(project.id);
  
  const daysBudget = project.budget || 0;
  const daysActual = actuals.days;
  const daysRemaining = Math.max(0, daysBudget - daysActual);
  const daysProgress = daysBudget > 0 ? Math.min(100, (daysActual / daysBudget) * 100) : 0;
  
  const costBudget = project.budgetCost || 0;
  const costActual = actuals.cost;
  const costRemaining = Math.max(0, costBudget - costActual);
  const costProgress = costBudget > 0 ? Math.min(100, (costActual / costBudget) * 100) : 0;
  
  const daysData = [
    { name: "Used", value: daysActual },
    { name: "Remaining", value: daysRemaining }
  ];
  
  const costData = [
    { name: "Used", value: costActual },
    { name: "Remaining", value: costRemaining }
  ];
  
  const COLORS = ["#ef4444", "#22c55e"];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Budget Tracking for {project.name}</CardTitle>
        <CardDescription>
          Track project progress against budget
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="days" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="days">Days</TabsTrigger>
            <TabsTrigger value="cost">Cost</TabsTrigger>
          </TabsList>
          <TabsContent value="days" className="space-y-4">
            {daysBudget > 0 ? (
              <>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{Math.round(daysProgress)}%</span>
                </div>
                <Progress value={daysProgress} className="h-2" />
                
                <div className="grid grid-cols-2 gap-4 my-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Used</p>
                    <p className="text-lg font-bold">{daysActual.toFixed(1)} days</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Remaining</p>
                    <p className="text-lg font-bold">{daysRemaining.toFixed(1)} days</p>
                  </div>
                </div>
                
                <div className="h-[200px] mt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={daysData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {daysData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${Number(value).toFixed(1)} days`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No days budget set for this project
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="cost" className="space-y-4">
            {costBudget > 0 ? (
              <>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{Math.round(costProgress)}%</span>
                </div>
                <Progress value={costProgress} className="h-2" />
                
                <div className="grid grid-cols-2 gap-4 my-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Used</p>
                    <p className="text-lg font-bold flex items-center">
                      <EuroIcon className="h-4 w-4 mr-1" />
                      {costActual.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Remaining</p>
                    <p className="text-lg font-bold flex items-center">
                      <EuroIcon className="h-4 w-4 mr-1" />
                      {costRemaining.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="h-[200px] mt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={costData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {costData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `€${Number(value).toLocaleString()}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No cost budget set for this project
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ProjectBudgetDetails;
