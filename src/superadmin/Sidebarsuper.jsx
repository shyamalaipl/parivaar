import React, { useEffect, useState } from "react";
import {
  Home,
  Users,
  FileText,
  Settings,
  LogOut,
  X,
  ChevronRight,
  BadgePercent,
  TicketPercent,
  ChevronDown,
  Package,
  Tags,
  List,
  Gauge,
  CalendarDays,
  WalletCards,
  Mail,
  MailPlus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { PiSquaresFourThin } from "react-icons/pi";
import { MdOutlineCardMembership } from "react-icons/md";
import Logo from "../img/parivarlogo1.png";

const Sidebarsuper = ({ setActivePage, activePage, isOpen, setIsOpen }) => {
  const [openDropdown, setOpenDropdown] = useState({
    membership: false,
    type: false,
  });

  const toggleDropdown = (dropdown) => {
    setOpenDropdown((prev) => ({
      ...prev,
      [dropdown]: !prev[dropdown],
    }));
  };

  const menuItems = [
    { id: "deshboardsuper", name: "Dashboard", icon: <Home size={22} /> },
    { id: "demomanag", name: "Manage Demo", icon: <MailPlus size={22} /> },

    {
      id: "communitylist",
      name: "Manage Community",
      icon: <MdOutlineCardMembership size={22} />,
    },
    { id: "userssuperlist", name: "Manage Users", icon: <Users size={22} /> },

    // This will be the dropdown parent
    // {
    //   id: "membership",
    //   name: "Manage Subscriptions",
    //   icon: <Package size={22} />,
    //   isParent: true,
    // },

    // This will be the dropdown parent
    // {
    //   id: "type",
    //   name: "Manage Type",
    //   icon: <List size={22} />,
    //   isParent: true,
    // },

    // { id: "featuremanag", name: "Manage Features", icon: <Gauge size={22} /> },
  ];

  // const dropdownItems = {
  //   membership: [
  //     {
  //       id: "packagemaster",
  //       name: "Package master",
  //       icon: <BadgePercent size={22} />,
  //     },
  //     {
  //       id: "discountmaster",
  //       name: "Discount master",
  //       icon: <Tags size={22} />,
  //     },
  //   ],
  //   type: [
  //     {
  //       id: "pricetype",
  //       name: "Price Types",
  //       icon: <TicketPercent size={22} />,
  //     },
  //     {
  //       id: "discounttype",
  //       name: "Discount Types",
  //       icon: <TicketPercent size={22} />,
  //     },
  //     {
  //       id: "discountvaluetype",
  //       name: "Discount Values",
  //       icon: <TicketPercent size={22} />,
  //     },
  //     {
  //       id: "durationtype",
  //       name: "Duration Types",
  //       icon: <CalendarDays size={22} />,
  //     },
  //   ],
  // };

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
    localStorage.removeItem("userData");
    localStorage.removeItem("username");
  };

  return (
    <div>
      <div
        className={`fixed top-0 left-0 h-screen bg-gradient-to-b from-gray-900 to-gray-800 shadow-xl
          transform transition-all duration-300 ease-in-out z-40 flex flex-col
          ${
            isOpen
              ? "w-64"
              : "-translate-x-full md:translate-x-0 md:w-16 md:items-center"
          }`}
      >
        {/* Fixed Header */}
        <div className="p-4 border-b border-gray-700/50 flex items-center justify-between w-full sticky top-0 z-10 bg-[#161F2F]">
          {isOpen ? (
            <>
              <div className="flex items-center gap-3">
                <img
                  src={Logo}
                  alt="Logo"
                  className="h-10 w-auto cursor-pointer"
                  onClick={toggleSidebar}
                />
                <h1 className="text-[white] text-lg font-semibold">Parivaar</h1>
              </div>
              <button
                onClick={toggleSidebar}
                className="p-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-full transition duration-300"
              >
                {/* <X size={24} /> */}
              </button>
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
        <div className="flex-1 overflow-y-auto pt-5 space-y-2 w-full">
          {menuItems.map((item) => (
            <React.Fragment key={item.id}>
              <button
                onClick={() => {
                  if (item.isParent) {
                    toggleDropdown(item.id);
                  } else {
                    setActivePage(item.id);
                    if (window.innerWidth < 768) {
                      setIsOpen(false);
                    }
                  }
                }}
                className={`w-full flex items-center px-4 py-3  transition-all duration-300 group relative
                  ${
                    activePage == item.id
                      ? "bg-[white] text-[#182131] shadow-md"
                      : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                  }`}
              >
                <span
                  className={`flex justify-center w-8 ${
                    activePage == item.id ? "text-black" : "text-gray-400"
                  }`}
                >
                  {item.icon}
                </span>
                {isOpen && (
                  <div className="ml-3 flex items-center justify-between flex-1">
                    <span className="text-sm font-medium block">
                      {item.name}
                    </span>
                    {item.isParent && (
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-300 ${
                          openDropdown[item.id] ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </div>
                )}
                {!isOpen && (
                  <div className="absolute left-full ml-2 rounded-md px-2 py-1 bg-gray-800 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50">
                    {item.name}
                  </div>
                )}
                {activePage == item.id && isOpen && !item.isParent && (
                  <ChevronRight
                    className="absolute right-2 text-[#161F2F]"
                    size={16}
                  />
                )}
              </button>

              {/* Dropdown items */}
              {item.isParent && openDropdown[item.id] && isOpen && (
                <div className="ml-4 pl-2 border-l-2 border-gray-600/50 space-y-1">
                  {dropdownItems[item.id].map((subItem) => (
                    <button
                      key={subItem.id}
                      onClick={() => {
                        setActivePage(subItem.id);
                        if (window.innerWidth < 768) {
                          setIsOpen(false);
                        }
                      }}
                      className={`w-full flex items-center px-4 py-2  transition-all duration-300 group relative
                        ${
                          activePage == subItem.id
                            ? "bg-[white] text-[#182131] shadow-md"
                            : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                        }`}
                    >
                      <span
                        className={`flex justify-center w-8 ${
                          activePage == subItem.id
                            ? "text-black"
                            : "text-gray-400"
                        }`}
                      >
                        {subItem.icon}
                      </span>
                      <span className="text-sm font-medium">
                        {subItem.name}
                      </span>
                      {activePage == subItem.id && (
                        <ChevronRight
                          className="absolute right-2 text-[#161F2F]"
                          size={16}
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Fixed Footer */}
        {/* <div className="p-4 border-t border-gray-700/50 w-full sticky bottom-0 bg-gray-900">
          <Link to="/">
            <button onClick={clearLocalStorage} className="w-full flex items-center px-2 py-3 text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-lg transition duration-300 group relative">
              <span className="flex justify-center w-8">
                <LogOut size={22} />
              </span>
              {isOpen && <span className="ml-3 text-sm font-medium">Logout</span>}
              {!isOpen && (
                <div onClick={clearLocalStorage} className="absolute left-full ml-2 rounded-md px-2 py-1 bg-gray-800 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50">
                  Logout
                </div>
              )}
            </button>
          </Link>
        </div> */}
      </div>
    </div>
  );
};

export default Sidebarsuper;
