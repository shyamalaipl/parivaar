import { useState } from "react";
import Communitylist from "./Communitylist";
import Communityreject from "./Communityreject";
import Communityrequest from "./Communityrequest";
import Deshboardsuper from "./Deshboardsuper";
import Headarsuper from "./Headarsuper";
import Sidebarsuper from "./Sidebarsuper";
import Usersuperlist from "./Usersuperlist";
import Discountmaster from "./Discountmaster";
import Featuremanag from "./Featuremanag";
import Packagemaster from "./Packagemaster";
import Pricetype from "./Pricetype";
import Discounttype from "./Discounttype";
import Discountvaluetype from "./Discountvaluetype";
import Durationtype from "./Durationtype";
import Profile from "./Profile";
import Demomanag from "./Demomanag";

const Superadmin = () => {
  const [activePage, setActivePage] = useState("deshboardsuper");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const pageContent = {
    deshboardsuper: <Deshboardsuper setActivePage={setActivePage} />,
    userssuperlist: <Usersuperlist setActivePage={setActivePage} />,
    communitylist: <Communitylist setActivePage={setActivePage} />,
    communityrequist: <Communityrequest setActivePage={setActivePage} />,
    communityrejected: <Communityreject setActivePage={setActivePage} />,
    discountmaster: <Discountmaster setActivePage={setActivePage} />,
    packagemaster: <Packagemaster setActivePage={setActivePage} />,
    featuremanag: <Featuremanag setActivePage={setActivePage} />,
    pricetype: <Pricetype setActivePage={setActivePage} />,
    discounttype: <Discounttype setActivePage={setActivePage} />,
    discountvaluetype: <Discountvaluetype setActivePage={setActivePage} />,
    durationtype: <Durationtype setActivePage={setActivePage} />,
    profile: <Profile setActivePage={setActivePage} />,
    demomanag: <Demomanag setActivePage={setActivePage} />,

    // departmentsuper: <Departmentsuper />,
  };
  return(

    <div className="min-h-screen bg-gray-100 flex overflow-hidden">
    <Sidebarsuper 
      setActivePage={setActivePage} 
      activePage={activePage}
      isOpen={isSidebarOpen}
      setIsOpen={setIsSidebarOpen}
    />
    <div 
      className={`flex-1 flex flex-col transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'md:ml-64' : 'ml-15 w-full'}`}
    >
      <Headarsuper isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
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
)

    
};

export default Superadmin;
