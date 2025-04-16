
import Navbar from "@/components/Navbar";
import UserList from "@/components/UserList";

const Users = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container py-6">
        <UserList />
      </main>
    </div>
  );
};

export default Users;
