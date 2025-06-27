import React, { useState, useEffect, useRef } from "react";
import {
  User,
  Menu,
  X,
  ChevronDown,
  CircleChevronLeft,
  Mail,
  Phone,
  Settings,
  Edit,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Headarsuper = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showProfilePage, setShowProfilePage] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const inputRefs = useRef({}); // Store refs for input fields

  // Fields to display and edit
  const displayFields = [
    "U_Name",
    "U_Email",
    "U_Mobile",
    "Middle_Name",
    "Last_Name",
    "Address",
    "City",
    "P_Image",
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get U_Id from localStorage
        const user = JSON.parse(localStorage.getItem("user"));
        const uId = user?.U_Id;

        if (!uId) {
          throw new Error("User ID not found in localStorage");
        }

        // Fetch user data from API
        const response = await fetch("https://parivaar.app/public/api/users");
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        const result = await response.json();

        // Find user matching U_Id
        const userDataFromApi = result.data.find((user) => user.U_Id == uId);
        if (!userDataFromApi) {
          throw new Error("User not found in API response");
        }

        // Filter only required fields
        const filteredData = {};
        displayFields.forEach((field) => {
          filteredData[field] = userDataFromApi[field] || "";
        });

        setUserData({
          ...filteredData,
          role: user.Role_Name || "SuperAdmin",
          joinDate: userDataFromApi.created_at
            ? new Date(userDataFromApi.created_at).toLocaleDateString()
            : "N/A",
        });
        setFormData(filteredData);
      } catch (err) {
        setError(err.message);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const toggleSidebar = () => {
    if (setIsSidebarOpen) {
      setIsSidebarOpen(!isSidebarOpen);
    }
  };

  const handleProfileClick = () => {
    setShowProfilePage(true);
    setShowProfile(false);
  };

  const handleBackClick = () => {
    setShowProfilePage(false);
    setEditMode(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
    setShowProfile(false);
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, P_Image: reader.result }));
      };
      reader.readAsDataURL(file); // Convert to base64
    }
  };

  const handleSave = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const uId = user?.U_Id;

      if (!uId) {
        throw new Error("User ID not found in localStorage");
      }

      // Update user data via API
      const response = await fetch(
        `https://parivaar.app/public/api/users/${uId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update user data");
      }

      const updatedData = await response.json();
      const filteredData = {};
      displayFields.forEach((field) => {
        filteredData[field] = updatedData.data[field] || "";
      });

      setUserData({
        ...filteredData,
        role: user.Role_Name || "SuperAdmin",
        joinDate: updatedData.data.created_at
          ? new Date(updatedData.data.created_at).toLocaleDateString()
          : "N/A",
      });
      setFormData(filteredData);
      setEditMode(false);
    } catch (err) {
      setError(err.message);
    }
  };

  // Enhanced Profile Page Component
  const ProfilePage = () => (
    <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-sm z-40 p-4 overflow-y-auto animate-fadeIn">
      <div className="max-w-md mx-auto bg-gradient-to-br from-blue-50 to-gray-50 rounded-xl shadow-2xl overflow-hidden animate-slideUp">
        {/* Header with back button */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-4 flex items-center justify-between">
          <button
            onClick={handleBackClick}
            className="p-1.5 text-white hover:bg-blue-700/30 rounded-full transition-all duration-200"
          >
            <CircleChevronLeft size={20} />
          </button>
          <h2 className="text-xl font-semibold text-white">My Profile</h2>
          <button
            onClick={handleEditToggle}
            className="p-1.5 text-white hover:bg-blue-700/30 rounded-full transition-all duration-200"
          >
            {/* <Edit size={20} /> */}
          </button>
        </div>

        {/* Profile Content */}
        <div className="p-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-6 relative">
            <div className="w-28 h-28 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center mb-4 shadow-lg overflow-hidden">
              {userData?.P_Image ? (
                <img
                  src={userData.P_Image}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={48} className="text-white" />
              )}
            </div>
            {editMode && (
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="text-sm text-gray-500"
              />
            )}
            <h3 className="text-2xl font-bold text-gray-800 mt-2">
              {userData?.U_Name || "User"}
            </h3>
            <p className="text-sm text-blue-600 font-medium">
              {userData?.role || "Role"}
            </p>
          </div>

          {/* User Details */}
          <div className="space-y-5">
            {/* Personal Info Card */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <h4 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">
                Personal Information
              </h4>

              <div className="space-y-4">
                {[
                  "U_Name",
                  "U_Email",
                  "U_Mobile",
                  "Middle_Name",
                  "Last_Name",
                  "Address",
                  "City",
                ].map((field) => (
                  <div key={field} className="flex items-start">
                    <div className="bg-blue-100/50 p-2 rounded-lg mr-3">
                      {field == "U_Email" ? (
                        <Mail size={18} className="text-blue-600" />
                      ) : field == "U_Mobile" ? (
                        <Phone size={18} className="text-blue-600" />
                      ) : (
                        <User size={18} className="text-blue-600" />
                      )}
                    </div>
                    <div className="w-full">
                      <p className="text-xs text-gray-500">
                        {field.replace("_", " ")}
                      </p>
                      {editMode ? (
                        <input
                          type="text"
                          name={field}
                          value={formData[field] || ""}
                          onChange={handleInputChange}
                          className="w-full text-sm font-medium border-b border-gray-300 focus:outline-none focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-sm font-medium">
                          {userData?.[field] || "N/A"}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Account Info Card */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <h4 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">
                Account Information
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Member Since</p>
                  <p className="text-sm font-medium">
                    {userData?.joinDate || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Account Status</p>
                  <p className="text-sm font-medium text-green-600">Active</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-center gap-4">
            {editMode ? (
              <>
                <button
                  onClick={handleSave}
                  type="button"
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200"
                >
                  Save
                </button>
                <button
                  onClick={handleEditToggle}
                  type="button"
                  className="px-6 py-2 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={handleLogout}
                type="button"
                className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg">
          {error}
        </div>
      )}
    </div>
  );

  return (
    <>
      <header
        className={`fixed top-0 bg-[#172030] shadow-md p-[16.5px] z-30 flex items-center justify-between
          transition-all duration-300 ease-in-out
          ${isSidebarOpen ? "md:left-64 left-0 right-0" : "left-0 right-0"}`}
      >
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="md:hidden mr-2 p-2 text-white hover:bg-blue-800/50 rounded-full transition duration—duration-300"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 p-1 hover:bg-blue-800/50 rounded-lg transition duration-300 group"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center group-hover:from-blue-500 group-hover:to-blue-700 transition-all duration-200 overflow-hidden">
                {userData?.P_Image ? (
                  <img
                    src={userData.P_Image}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={18} className="text-white" />
                )}
              </div>
              <span className="hidden md:block text-white text-sm font-medium">
                {userData?.U_Name || "User"}
              </span>
              <ChevronDown
                size={16}
                className="hidden md:block text-white transition-transform duration-200"
                style={{
                  transform: showProfile ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 z-50 animate-dropDown">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-800">
                    {userData?.U_Name || "User"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {userData?.U_Email || "user@example.com"}
                  </p>
                </div>
                <button
                  onClick={handleProfileClick}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-2 transition-colors duration-150"
                >
                  <User size={16} className="text-blue-600" />
                  Profile
                </button>
                <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-2 transition-colors duration-150">
                  <Settings size={16} className="text-blue-600" />
                  Settings
                </button>
                <div className="border-t border-gray-100">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors duration-150"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Render Profile Page when showProfilePage is true */}
      {showProfilePage && <ProfilePage />}

      {/* Add some global animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes dropDown {
          from {
            transform: translateY(-10px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .animate-slideUp {
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-dropDown {
          animation: dropDown 0.2s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default Headarsuper;
