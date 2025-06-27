import { useState } from "react";
import Admindashboard from "./Admindashboard";
import Useradmin from "./Useradmin";
import Adminsidebar from "./Adminsidebar";
import Headaradmin from "./Headaradmin";
import Departmentadmin from "./Departmentadmin";
import Memberlist from "./Memberlist";
import Userrequest from "./Userrequest";
import Userrejected from "./Userrejected";
import Profileadmin from "./Profileadmin";
import DesignationCreation from "./DesignationCreation";
import Admineventlist from "./Admineventlist";

const Admin = () => {
  const [activePage, setActivePage] = useState("admindashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const pageContent = {
    admindashboard: <Admindashboard setActivePage={setActivePage} />,
    usersadmin: <Useradmin setActivePage={setActivePage} />,
    memberlist: <Memberlist />,
    userrequist: <Userrequest setActivePage={setActivePage} />,
    userrejected: <Userrejected setActivePage={setActivePage} />,
    departmentadmin: <Departmentadmin setActivePage={setActivePage} />,
    profileadmin: <Profileadmin setActivePage={setActivePage} />,
    designationCreation: <DesignationCreation setActivePage={setActivePage} />,
    admineventlist: <Admineventlist setActivePage={setActivePage} />


  };

  return (
    <div className="min-h-screen bg-gray-100 flex overflow-hidden">
      <Adminsidebar 
        setActivePage={setActivePage} 
        activePage={activePage}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'md:ml-64' : 'ml-15 w-full'}`}
      >
        <Headaradmin isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} setActivePage={setActivePage} // Pass setActivePage to HeaderAdmin
          activePage={activePage} />
        <main className="flex-1 p-4 md:p-6 pt-20 md:pt-24 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto w-full">
            {pageContent[activePage] || (
              <div className="text-center py-10 text-gray-500 bg-white rounded-xl shadow-sm p-8">
                <h3 className="text-2xl font-semibold mb-2">Page Not Found</h3>
                <p>The requested page doesn't exist or has been moved.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Admin;