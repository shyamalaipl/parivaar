import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Usermember from "./Usermember";
import Userrequist from "./Usersrequest";
import Headermember from "./Headermember";
import Dashboardmember from "./Dashboardmember";
import MemberProfile from "./Memberprofile";
import Eventslistmember from "./Eventslistmember";
import Gallerymember from "./Gallerymember";
import Newsmember from "./Newsmember";
import Jobcreationmember from "./Jobcreationmember";
import Marketmember from "./Marketmember";
import Celebrationmember from "./Celebrationmember";
import Condolencemember from "./Condolencemember";
import Userrejected from "./Userrejected";
import UserAdmin from "./Useradmin";
import Adduser from "./Adduser";
import Donationmember from "./Donationmember";
import ScrollToTop from "../componet/Scrolltotop";

const Member = () => {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState(() => {
    return typeof window !== "undefined"
      ? localStorage.getItem("activePage") || "dashboardmember"
      : "dashboardmember";
  });
  const [historyStack, setHistoryStack] = useState([activePage]);

  // Update localStorage and history stack whenever activePage changes
  useEffect(() => {
    localStorage.setItem("activePage", activePage);
    setHistoryStack((prev) => {
      if (prev[prev.length - 1] !== activePage) {
        return [...prev, activePage];
      }
      return prev;
    });
    // Update URL to reflect the current member page
    window.history.pushState({ page: activePage }, "", `/member/${activePage}`);
    // Scroll to top on page change
    window.scrollTo(0, 0);
  }, [activePage]);

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      const currentStack = [...historyStack];
      currentStack.pop(); // Remove the current page

      if (currentStack.length > 0) {
        // Navigate to the previous page in the stack
        const previousPage = currentStack[currentStack.length - 1];
        setActivePage(previousPage);
        setHistoryStack(currentStack);
      } else {
        // If on dashboardmember, redirect to login
        navigate("/login");
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [activePage, historyStack, navigate]);

  const renderPage = () => {
    if (activePage == "dashboardmember")
      return <Dashboardmember setActivePage={setActivePage} />;
    else if (activePage == "usersmember")
      return <Usermember setActivePage={setActivePage} />;
    else if (activePage == "usersadmin")
      return <UserAdmin setActivePage={setActivePage} />;
    else if (activePage == "userrequist")
      return <Userrequist setActivePage={setActivePage} />;
    else if (activePage == "userrejected")
      return <Userrejected setActivePage={setActivePage} />;
    else if (activePage == "memberprofile")
      return <MemberProfile setActivePage={setActivePage} />;
    else if (activePage == "eventslistmember")
      return <Eventslistmember setActivePage={setActivePage} />;
    else if (activePage == "gallerymember")
      return <Gallerymember setActivePage={setActivePage} />;
    else if (activePage == "news")
      return <Newsmember setActivePage={setActivePage} />;
    else if (activePage == "jobcreationmember")
      return <Jobcreationmember setActivePage={setActivePage} />;
    else if (activePage == "marketmember")
      return <Marketmember setActivePage={setActivePage} />;
    else if (activePage == "celebration")
      return <Celebrationmember setActivePage={setActivePage} />;
    else if (activePage == "condolence")
      return <Condolencemember setActivePage={setActivePage} />;
    else if (activePage == "adduser")
      return <Adduser setActivePage={setActivePage} />;
    else if (activePage == "donation")
      return <Donationmember setActivePage={setActivePage} />;
    else
      return (
        <div className="text-center py-10 text-gray-500 bg-white rounded-xl shadow-sm p-8">
          <h3 className="text-2xl font-semibold mb-2">Page Not Found</h3>
          <p>The requested page doesn't exist or has been moved.</p>
        </div>
      );
  };

  return (
    <>
      <ScrollToTop />
      <div className="min-h-screen bg-gray-100 flex flex-col overflow-hidden">
        <Headermember setActivePage={setActivePage} activePage={activePage} />
        <main className="flex-1 p-4 md:p-6 pt-20 md:pt-24 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto w-full">{renderPage()}</div>
        </main>
      </div>
    </>
  );
};

export default Member;
