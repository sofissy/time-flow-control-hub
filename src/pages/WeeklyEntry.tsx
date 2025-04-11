
import Navbar from "@/components/Navbar";
import WeeklyTimeTable from "@/components/WeeklyTimeTable";

const WeeklyEntry = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container py-6">
        <WeeklyTimeTable />
      </main>
    </div>
  );
};

export default WeeklyEntry;
