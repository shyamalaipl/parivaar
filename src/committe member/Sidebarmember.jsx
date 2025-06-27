import React, { useEffect } from "react";
import {
  Home,
  Users,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
  PlusCircle,
  X,
  ChevronRight,
  Circle,
  Plus,
  Newspaper,
  Badge,
  BaggageClaimIcon,
  BadgeCheckIcon,
  ShoppingBag,
  PartyPopper,
  NotebookPen,
} from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "../img/parivarlogo1.png";
import Gallerymember from "./Gallerymember";
import { MdPhoto } from "react-icons/md";
import { Paper } from "@mui/material";

const Sidebarmember = ({ setActivePage, activePage, isOpen, setIsOpen }) => {
  const menuItems = [
    { id: "dashboardmember", name: "Dashboard", icon: <Home size={22} /> },
    // { id: "usersmember", name: "Users", icon: <Users size={22} /> },
    { id: "usersadmin", name: "Users", icon: <Users size={22} /> },

    // { id: "memberprofile", name: "My Profile", icon: <Users size={22} /> },
    { id: "news", name: "Notice", icon: <Newspaper size={22} /> },
    {
      id: "celebration",
      name: "  Celebration",
      icon: <PartyPopper size={22} />,
    },
    { id: "condolence", name: "Condolence", icon: <NotebookPen size={22} /> },

    {
      id: "jobcreationmember",
      name: "Job",
      icon: <BadgeCheckIcon size={22} />,
    },

    { id: "eventslistmember", name: "Events", icon: <Plus size={22} /> },
    // { id: "eventcreate", name: "Create Event", icon: <PlusCircle size={22} /> },
    { id: "gallerymember", name: "Gallery", icon: <MdPhoto size={22} /> },
    { id: "marketmember", name: "Market", icon: <ShoppingBag size={22} /> },

    // { id: "settings", name: "Settings", icon: <Settings size={22} /> },
    // { id: "help", name: "Help & Support", icon: <HelpCircle size={22} /> },
  ];

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsOpen]);

  const clearLocalStorage = () => {
    // localStorage.removeItem("userData");
    // localStorage.removeItem("username");
    localStorage.removeItem("user");
  };

  return (
    <div
      className={`fixed top-0 left-0 h-screen bg-gradient-to-b from-[#263042] to-[#263042] shadow-xl
        transform transition-all duration-300 ease-in-out z-40 flex flex-col
        ${
          isOpen
            ? "w-64"
            : "-translate-x-full md:translate-x-0 md:w-16 md:items-center"
        }`}
    >
      {/* Fixed Header */}
      <div className="p-4 border-b  border-white flex items-center justify-between w-full sticky top-0 z-10 bg-[#1A2B49]">
        {isOpen ? (
          <>
            <div className="flex items-center gap-3">
              <img
                src={Logo}
                alt="Logo"
                className="h-10 w-auto cursor-pointer"
                onClick={toggleSidebar}
              />
              <h1 className="text-[white] text-lg font-semibold">Parivar</h1>
            </div>
            {/* <button
              onClick={toggleSidebar}
              className="p-2 text-[white] hover:text-white hover:bg-[#0000006d] rounded-full transition duration-300"
            >
              <X size={24} />
            </button> */}
          </>
        ) : (
          <div className="flex justify-center w-full">
            <img
              src={Logo}
              alt="Logo"
              className="h-10 w-auto cursor-pointer hover:opacity-80 transition-opacity"
              onClick={toggleSidebar}
            />
          </div>
        )}
      </div>

      {/* Scrollable Menu Section */}
      <div className="flex-1 overflow-y-auto bg-white pt-5 space-y-2 w-full">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActivePage(item.id);
              if (window.innerWidth < 768) {
                setIsOpen(false);
              }
            }}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-300 group relative
              ${
                activePage == item.id
                  ? "bg-[#1a2b49] text-white shadow-md"
                  : "text-[#1A2B49] hover:bg-[#1a2b4979] "
              }`}
          >
            <span
              className={`flex justify-center w-8 ${
                activePage == item.id ? "text-white" : "text-[#1a2b49]"
              }`}
            >
              {item.icon}
            </span>
            {isOpen && (
              <div className="ml-3">
                <span className="text-sm font-medium block">{item.name}</span>
              </div>
            )}
            {!isOpen && (
              <div className="absolute left-full ml-2 rounded-md px-2 py-1 bg-indigo-800 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50">
                {item.name}
              </div>
            )}
            {activePage == item.id && isOpen && (
              <ChevronRight className="absolute right-2 text-white" size={16} />
            )}
          </button>
        ))}
      </div>

      {/* Fixed Footer */}
      <div className="p-4 border-t border-indigo-700/50 w-full sticky bottom-0 bg-[#263042]">
        <Link to="/">
          <button
            onClick={clearLocalStorage}
            className="w-full flex items-center px- py-3 text-red-700 hover:bg-red-900/20 hover:text-red-800 rounded-lg transition duration-300 group relative"
          >
            <span className="flex justify-center w-8">
              <LogOut size={22} />
            </span>
            {isOpen && <span className="ml-3 text-sm font-medium">Logout</span>}
            {!isOpen && (
              <div className="absolute left-full ml-2 rounded-md px-2 py-1 bg-indigo-800 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50">
                Logout
              </div>
            )}
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Sidebarmember;
