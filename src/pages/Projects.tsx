
import Navbar from "@/components/Navbar";
import ProjectList from "@/components/ProjectList";

const Projects = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container py-6">
        <ProjectList />
      </main>
    </div>
  );
};

export default Projects;
