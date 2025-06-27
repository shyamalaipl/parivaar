import { useState, useEffect } from "react";
import {
  User,
  Briefcase,
  Search,
  X,
  AlertTriangle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Book,
  Building,
  UserCircle,
  CircleChevronLeft,
  PlusCircle,
  Plus,
} from "lucide-react";
import { ImCross } from "react-icons/im";
import Swal from "sweetalert2";
import logoImage from "../../src/img/parivarlogo1.png";

const CustomLogoLoader = () => {
  const keyframes = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  if (!document.getElementById("spin-keyframes")) {
    const styleSheet = document.createElement("style");
    styleSheet.id = "spin-keyframes";
    styleSheet.textContent = keyframes;
    document.head.appendChild(styleSheet);
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <img
 Hawkins
        src={logoImage}
        alt="Rotating Logo"
        style={{
          width: "60px",
          height: "60px",
          animation: "spin 1s linear infinite",
          filter: "drop-shadow(0 0 8px rgba(0, 0, 0, 0.2))",
        }}
      />
    </div>
  );
};

const UserAdmin = ({ setActivePage, activePage }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [requestCount, setRequestCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const usersPerPage = 10;

  useEffect(() => {
    const fetchApprovedUsers = async () => {
      try {
        // Get Comm_Id from localStorage
        const userData = JSON.parse(localStorage.getItem("user"));
        const commId = userData?.Comm_Id;

        if (!commId) {
          throw new Error("Comm_Id not found in localStorage");
        }

        // Fetch data from the API
        const response = await fetch("https://parivaar.app/public/api/users");
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const result = await response.json();
        const userList = result.data || [];
        if (!Array.isArray(userList)) {
          throw new Error("API response does not contain a users array");
        }

        // Filter users by Comm_Id and Role_Id == 3
        const filteredUsers = userList.filter(
          (user) => user.Comm_Id == commId && user.Role_Id == "3"
        );

        // Calculate counts
        const requestUsers = filteredUsers.filter(user => user.U_Status == "0").length;
        const rejectedUsers = filteredUsers.filter(user => user.U_Status == "2").length;
        
        // Format approved users (U_Status == 1)
        const formattedUsers = filteredUsers
          .filter(user => user.U_Status == "1")
          .map((user) => ({
            id: user.U_Id,
            name: user.U_Name,
            email: user.U_Email,
            number: user.U_Mobile,
            committeeId: user.Comm_Id,
            role: user.role?.Role_Name || "User",
          }));

        setUsers(formattedUsers);
        setFilteredUsers(formattedUsers);
        setRequestCount(requestUsers);
        setRejectedCount(rejectedUsers);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchApprovedUsers();
  }, []);

  const fetchUserDetails = async (userId) => {
    setLoadingProfile(true);
    setShowProfileModal(true);
    try {
      const response = await fetch("https://parivaar.app/public/api/users");
      if (!response.ok) {
        throw new Error("Failed to fetch user details");
      }

      const result = await response.json();
      const userList = result.data || [];
      const userDetails = userList.find((user) => user.U_Id == userId);

      if (userDetails) {
        setSelectedUser({
          U_Name: userDetails.U_Name,
          U_Email: userDetails.U_Email,
          U_Mobile: userDetails.U_Mobile,
          Middle_Name: userDetails.Middle_Name,
          Last_Name: userDetails.Last_Name,
          Address: userDetails.Address,
          City: userDetails.City,
          State: userDetails.State,
          Country: userDetails.Country,
          Zipcode: userDetails.Zipcode,
          Gender: userDetails.Gender,
          Occupation: userDetails.Occupation,
          Marital_Status: userDetails.Marital_Status,
          Education_School: userDetails.Education_School,
          Education_College: userDetails.Education_College,
          P_Image: userDetails.P_Image,
          School_Name: userDetails.School_Name,
          College_Name: userDetails.College_Name,
          Occupation_Address: userDetails.Occupation_Address,
          DOB: userDetails.DOB,
        });
      } else {
        throw new Error("User not found");
      }
    } catch (err) {
      Swal.fire(
        "Error!",
        "Failed to fetch user details: " + err.message,
        "error"
      );
      setShowProfileModal(false);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleCloseProfile = () => {
    setShowProfileModal(false);
    setSelectedUser(null);
    setLoadingProfile(false);
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setCurrentPage(1);

    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(term.toLowerCase()) ||
        user.email.toLowerCase().includes(term.toLowerCase()) ||
        user.number.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  const handleDelete = async (userId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this user?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(
            `https://parivaar.app/public/api/users/${userId}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (!response.ok) {
            throw new Error("Failed to delete user");
          }

          const updatedUsers = users.filter((user) => user.id !== userId);
          setUsers(updatedUsers);
          const updatedFilteredUsers = updatedUsers.filter(
            (user) =>
              user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
              user.number.toLowerCase().includes(searchTerm.toLowerCase())
          );
          setFilteredUsers(updatedFilteredUsers);

          Swal.fire(
            "Deleted!",
            "User has been deleted successfully.",
            "success"
          );
        } catch (error) {
          Swal.fire(
            "Error!",
            "Failed to delete user: " + error.message,
            "error"
          );
        }
      }
    });
  };

  if (loading) {
    return <CustomLogoLoader />;
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-gradient-to-br from-[#fdf9f7] to-[#f0f4ff] p-3 pt-0">
      <div className="flex justify-between rounded-xl bg-[#1A2B49] p-4 items-center shadow-lg">
        <button
          className="flex cursor-pointer items-center text-white hover:bg-gray-800 p-2 rounded-lg transition-all duration-200 transform hover:scale-105"
          onClick={() => setActivePage("dashboardmember")}
        >
          <CircleChevronLeft size={30} className="mr-2" />
        </button>

        <div>
          <h1 className="text-xl font-bold text-white">User Management</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setActivePage("adduser")}
            className="px-3 py-2 cursor-pointer rounded-lg bg-[#1A2B49] text-white border-2 border-green-600 hover:bg-green-600 hover:text-[#1A2B49] transition-all duration-200 transform hover:scale-105 shadow-md flex items-center"
          >
            <Plus size={18} className="mr-2 text-[#ff6f00]" />
            Add User
          </button>
          <button
            onClick={() => setActivePage("userrequist")}
            className="relative px-3 py-2 cursor-pointer rounded-lg bg-[#1A2B49] text-white border-2 border-green-100 hover:bg-[#EDFDF6] hover:text-[#1A2B49] transition-all duration-200 transform hover:scale-105 shadow-md flex items-center"
          >
            <AlertTriangle size={18} className="mr-2 text-green-800" />
            User Request
            {requestCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-sm">
                {requestCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActivePage("userrejected")}
            className="relative px-3 py-2 cursor-pointer rounded-lg bg-[#1A2B49] text-white border-2 border-red-600 hover:bg-red-800 hover:text-white transition-all duration-200 transform hover:scale-105 shadow-md flex items-center"
          >
            <ImCross size={15} className="mr-2 text-red-400" />
            Rejected User
            {rejectedCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-sm">
                {rejectedCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="bg-[#faf8f9] shadow-lg rounded-xl p-6 border border-gray-100 transition-all duration-200 hover:shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <User size={20} className="mr-2 text-[#11224D]" />
            User List
          </h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              className="pl-9 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              value={searchTerm}
              onChange={handleSearch}
            />
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="p-3 border-b border-gray-200 font-semibold text-gray-700">
                  Name
                </th>
                <th className="p-3 border-b border-gray-200 font-semibold text-gray-700">
                  Email
                </th>
                <th className="p-3 border-b border-gray-200 font-semibold text-gray-700">
                  Number
                </th>
                <th className="p-3 border-b border-gray-200 font-semibold text-gray-700">
                  Code
                </th>
                <th className="p-3 border-b border-gray-200 font-semibold text-gray-700">
                  Role
                </th>
                <th className="p-3 border-b border-gray-200 font-semibold text-gray-700 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.length > 0 ? (
                currentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-all duration-150">
                    <td className="p-3 border-b border-gray-200 font-medium">
                      {user.name}
                    </td>
                    <td className="p-3 border-b border-gray-200 text-[#11224D]">
                      {user.email}
                    </td>
                    <td className="p-3 border-b border-gray-200">
                      +91 {user.number}
                    </td>
                    <td className="p-3 border-b border-gray-200">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {user.committeeId}
                      </span>
                    </td>
                    <td className="p-3 border-b border-gray-200">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role == "Admin"
                            ? "bg-red-100 text-red-800"
                            : user.role == "Moderator"
                            ? "bg-blue-100 text-blue-800"
                            : user.role == "Editor"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="p-3 border-b border-gray-200">
                      <div className="flex justify-center space-x-2">
                        <button 
                          onClick={() => fetchUserDetails(user.id)}
                          className="p-1 rounded-full hover:bg-blue-50 transition-all duration-150"
                        >
                          <User
                            size={18}
                            className="cursor-pointer text-[#11224D] hover:text-blue-800"
                          />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-1 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50 transition-all duration-150"
                          title="Delete User"
                        >
                          <X size={18} className="cursor-pointer" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-3 text-center text-gray-600">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {showProfileModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              {loadingProfile ? (
                <div className="min-h-[400px] flex items-center justify-center">
                  <CustomLogoLoader />
                </div>
              ) : (
                selectedUser && (
                  <>
                    <div className="sticky top-0 bg-white p-6 border-b flex justify-between items-center">
                      <h3 className="text-2xl font-bold text-gray-800">
                        User Profile
                      </h3>
                      <button
                        onClick={handleCloseProfile}
                        className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200"
                      >
                        <X size={24} className="text-gray-500" />
                      </button>
                    </div>

                    <div className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="md:w-1/3">
                          <div className="bg-gray-50 rounded-xl p-4 text-center shadow-sm transition-all duration-200 hover:shadow-md">
                            {selectedUser.P_Image ? (
                              <img
                                src={selectedUser.P_Image}
                                alt="Profile"
                                className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-white shadow-lg"
                              />
                            ) : (
                              <div className="w-32 h-32 rounded-full mx-auto bg-gray-200 flex items-center justify-center">
                                <UserCircle
                                  size={64}
                                  className="text-gray-400"
                                />
                              </div>
                            )}
                            <h4 className="mt-4 text-xl font-semibold">
                              {`${selectedUser.U_Name} ${
                                selectedUser.Middle_Name || ""
                              } ${selectedUser.Last_Name || ""}`}
                            </h4>
                            <p className="text-gray-500">
                              {selectedUser.Occupation ||
                                "No occupation listed"}
                            </p>
                          </div>

                          <div className="mt-4 bg-gray-50 rounded-xl p-4 shadow-sm transition-all duration-200 hover:shadow-md">
                            <h5 className="font-semibold mb-3">
                              Contact Information
                            </h5>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Mail size={16} />
                                <span>{selectedUser.U_Email}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Phone size={16} />
                                <span>{selectedUser.U_Mobile}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <MapPin size={16} />
                                <span>{`${selectedUser.City || "N/A"}, ${
                                  selectedUser.State || "N/A"
                                }, ${selectedUser.Country || "N/A"}`}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="md:w-2/3">
                          <div className="bg-gray-50 rounded-xl p-4 mb-4 shadow-sm transition-all duration-200 hover:shadow-md">
                            <h5 className="font-semibold mb-3">
                              Personal Information
                            </h5>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-gray-500">Gender</p>
                                <p className="font-medium">
                                  {selectedUser.Gender || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500">Marital Status</p>
                                <p className="font-medium">
                                  {selectedUser.Marital_Status || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500">Date of Birth</p>
                                <p className="font-medium">
                                  {selectedUser.DOB || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500">Zipcode</p>
                                <p className="font-medium">
                                  {selectedUser.Zipcode || "N/A"}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-gray-50 rounded-xl p-4 mb-4 shadow-sm transition-all duration-200 hover:shadow-md">
                            <h5 className="font-semibold mb-3">Education</h5>
                            <div className="space-y-4">
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <Book size={16} className="text-gray-600" />
                                  <span className="font-medium">
                                    School Education
                                  </span>
                                </div>
                                <p className="text-gray-600">
                                  School: {selectedUser.School_Name || "N/A"}
                                </p>
                                <p className="text-gray-600">
                                  Score:{" "}
                                  {selectedUser.Education_School || "N/A"}
                                </p>
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <Building
                                    size={16}
                                    className="text-gray-600"
                                  />
                                  <span className="font-medium">
                                    College Education
                                  </span>
                                </div>
                                <p className="text-gray-600">
                                  College: {selectedUser.College_Name || "N/A"}
                                </p>
                                <p className="text-gray-600">
                                  Score:{" "}
                                  {selectedUser.Education_College || "N/A"}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-gray-50 rounded-xl p-4 shadow-sm transition-all duration-200 hover:shadow-md">
                            <h5 className="font-semibold mb-3">
                              Occupation Details
                            </h5>
                            <div className="space-y-2">
                              <p className="text-gray-600">
                                Occupation: {selectedUser.Occupation || "N/A"}
                              </p>
                              <p className="text-gray-600">
                                Work Address:{" "}
                                {selectedUser.Occupation_Address || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )
              )}
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {indexOfFirstUser + 1} to{" "}
            {Math.min(indexOfLastUser, filteredUsers.length)} of{" "}
            {filteredUsers.length} users
          </div>
          <div className="flex space-x-1">
            <button
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:bg-gray-200 disabled:cursor-not-allowed transition-all duration-200"
              onClick={handlePrevious}
              disabled={currentPage == 1}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`px-3 py-1 border rounded ${
                  currentPage == page
                    ? "bg-[#11224D] text-white"
                    : "hover:bg-gray-50"
                } transition-all duration-200`}
                onClick={() => handlePageClick(page)}
              >
                {page}
              </button>
            ))}
            <button
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:bg-gray-200 disabled:cursor-not-allowed transition-all duration-200"
              onClick={handleNext}
              disabled={currentPage == totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAdmin;