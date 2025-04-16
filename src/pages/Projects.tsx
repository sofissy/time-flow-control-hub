
import { useState } from "react";
import Navbar from "@/components/Navbar";
import ProjectList from "@/components/ProjectList";
import ProjectBudgetDetails from "@/components/ProjectBudgetDetails";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Projects = () => {
  const { projects } = useAppContext();
  const [selectedProjectIndex, setSelectedProjectIndex] = useState<number | null>(
    projects.length > 0 ? 0 : null
  );
  
  const activeProjects = projects.filter(p => p.active);
  const selectedProject = selectedProjectIndex !== null ? activeProjects[selectedProjectIndex] : null;
  
  const handlePreviousProject = () => {
    if (selectedProjectIndex !== null && selectedProjectIndex > 0) {
      setSelectedProjectIndex(selectedProjectIndex - 1);
    }
  };
  
  const handleNextProject = () => {
    if (selectedProjectIndex !== null && selectedProjectIndex < activeProjects.length - 1) {
      setSelectedProjectIndex(selectedProjectIndex + 1);
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container py-6">
        <div className="flex flex-col space-y-6">
          <ProjectList />
          
          {activeProjects.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Project Budget Details</h3>
                
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handlePreviousProject} 
                    disabled={selectedProjectIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <span className="text-sm">
                    {selectedProjectIndex !== null ? selectedProjectIndex + 1 : 0} of {activeProjects.length}
                  </span>
                  
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handleNextProject} 
                    disabled={selectedProjectIndex === activeProjects.length - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {selectedProject && <ProjectBudgetDetails project={selectedProject} />}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Projects;
