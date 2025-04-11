
import Navbar from "@/components/Navbar";
import CustomerList from "@/components/CustomerList";

const Customers = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container py-6">
        <CustomerList />
      </main>
    </div>
  );
};

export default Customers;
