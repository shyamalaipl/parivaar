import React, { useState } from "react";
import { Bell, Mail, Search, User, Menu, X, ChevronDown } from "lucide-react";
import Logo from "../img/parivarlogo1.png";

const HeaderAdmin = ({ isSidebarOpen, setIsSidebarOpen, setActivePage, activePage }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const toggleSidebar = () => {
    if (setIsSidebarOpen) {
      setIsSidebarOpen(!isSidebarOpen);
    }
  };

  const notifications = [
    { id: 1, text: "New user registration", time: "5 min ago" },
    { id: 2, text: "System update completed", time: "1 hour ago" },
    { id: 3, text: "New member request", time: "3 hours ago" },
  ];

  const messages = [
    { id: 1, sender: "John Doe", text: "When will the next meeting be scheduled?", time: "10 min ago" },
    { id: 2, sender: "Sarah Smith", text: "Please review the latest reports", time: "2 hours ago" },
  ];

  // Handle navigation to Profileadmin page
  // const handleProfileClick = () => {
  //   if (setActivePage) {
  //     setActivePage("profileadmin"); // Set active page to "profileadmin"
  //     setShowProfile(false); // Close the dropdown after clicking
  //   }
  // };

  return (
    <header
      className={`fixed top-0 bg-[#1A2433] shadow-md p-[16.4px] z-30 flex items-center justify-between
        transition-all duration-300 ease-in-out
        ${isSidebarOpen ? "md:left-64 left-0 right-0" : "left-0 right-0"}`}
    >
      {/* Left Section */}
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="md:hidden mr-2 p-2 text-white hover:bg-[white] rounded-full transition duration-300"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="hidden md:flex items-center">
          <div className="text-white px-2 py-1 rounded-lg flex items-center">
            {/* <img src={Logo} alt="Logo" className="h-8 w-auto" /> */}
          </div>
          <div>
            {/* <h1 className="text-white ml-10 font-semibold">Admin Panel</h1> */}
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Search Bar */}
        <div className="relative hidden md:block">
          {/* <input
            type="text"
            placeholder="Search..."
            className="border border-blue-400/30 text-[#192333] placeholder-white bg-blue-900/20 rounded-full py-1.5 pl-9 pr-4 focus:outline-none focus:ring-2 focus:ring-[#192333] text-sm w-40 lg:w-64 transition-all duration-300"
          />
          <Search className="absolute left-3 top-2 text-[white]" size={16} /> */}
        </div>

        {/* Icons */}
        {/* <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowMessages(false);
              setShowProfile(false);
            }}
            className="relative p-2 text-[#192333] hover:bg-[white] rounded-full transition duration-300"
          >
            <Bell size={20} />
            <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs flex items-center justify-center">
              3
            </span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800">Notifications</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                  >
                    <p className="text-sm text-gray-800">{notification.text}</p>
                    <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-gray-100">
                <button className="text-blue-600 text-sm font-medium hover:text-blue-800">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div> */}

        {/* <div className="relative">
          <button
            onClick={() => {
              setShowMessages(!showMessages);
              setShowNotifications(false);
              setShowProfile(false);
            }}
            className="relative p-2 text-[#192333] hover:bg-[white] rounded-full transition duration-300"
          >
            <Mail size={20} />
            <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs flex items-center justify-center">
              2
            </span>
          </button>

          {showMessages && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800">Messages</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex justify-between">
                      <p className="text-sm font-medium text-gray-800">{message.sender}</p>
                      <p className="text-xs text-gray-500">{message.time}</p>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{message.text}</p>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-gray-100">
                <button className="text-blue-600 text-sm font-medium hover:text-blue-800">
                  View all messages
                </button>
              </div>
            </div>
          )}
        </div> */}

        {/* Profile Avatar */}
        <div className="relative">
          <button
            // onClick={() => {
            //   setShowProfile(!showProfile);
            //   setShowNotifications(false);
            //   setShowMessages(false);
            // }}
            onClick={() => setActivePage('profileadmin')}
            className="flex items-center gap-2 p-1 bg-[white] rounded-lg transition duration-300"
          >
            <div className="w-8 h-8  rounded-full flex items-center justify-center">
              <User size={18} className="text-[#192333]" />
            </div>
            <span className="hidden md:block text-[#1A2433] text-sm">Admin</span>
            <ChevronDown size={16} className="hidden md:block text-[#1A2433]" />
          </button>

          {/* {showProfile && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-800">Admin User</p>
                <p className="text-xs text-gray-500 mt-1">admin@example.com</p>
              </div>
              <button
                onClick={() => setActivePage('profileadmin')} // Updated to navigate to Profileadmin
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                Profile
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Account Settings
              </button>
              <div className="border-t border-gray-100 mt-2 pt-2">
                <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                  Logout
                </button>
              </div>
            </div>
          )} */}
        </div>

        {/* <button onClick={() => setActivePage('profileadmin')} className="border">
          Profile <span>
            <User size={18} className="text-[#192333]" />

            </span> 

        </button> */}
      </div>
    </header>
  );
};

export default HeaderAdmin;