import { useState, useEffect } from "react";
import {
  User,
  Search,
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Book,
  Building,
  UserCircle,
} from "lucide-react";
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
        // background: "rgba(255, 255, 255, 0.8)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <img
        src={logoImage}
        alt="Rotating Logo"
        style={{
          width: "60px",
          height: "60px",
          // margin: '0px 0px 0px 160px',
          animation: "spin 1s linear infinite",
          filter: "drop-shadow(0 0 8px rgba(0, 0, 0, 0.2))",
        }}
      />
    </div>
  );
};
const CustomLogoLoader1 = () => {
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
        // background: "rgba(255, 255, 255, 0.8)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <img
        src={logoImage}
        alt="Rotating Logo"
        style={{
          width: "60px",
          height: "60px",
          margin: "0px 0px 0px 160px",
          animation: "spin 1s linear infinite",
          filter: "drop-shadow(0 0 8px rgba(0, 0, 0, 0.2))",
        }}
      />
    </div>
  );
};

const Memberlist = ({ setActivePage, activePage }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const usersPerPage = 10;

  useEffect(() => {
    fetchCommitteeMembers();
  }, []);

  const fetchCommitteeMembers = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const commId = user.id;

      if (!commId) {
        throw new Error("Comm_Id not found in localStorage");
      }

      const response = await fetch(
        "https://parivaar.app/public/api/committee-members",
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch committee members");
      }

      const result = await response.json();
      const members = result.members || (Array.isArray(result) ? result : []);
      const filteredMembers = members.filter(
        (member) => member.Comm_Id == parseInt(commId)
      );

      const formattedUsers = filteredMembers.map((member) => ({
        id: member.Mam_Id,
        userId: member.U_Id,
        name: member.user?.U_Name || "N/A",
        email: member.user?.U_Email || "N/A",
        number: member.user?.U_Mobile || "N/A",
        committeeId: member.Comm_Id,
        role: member.designation?.Desi_Name || "N/A",
        startDate: member.StartDate,
        endDate: member.EndDate,
        status: member.Status,
        duration: member.Duration,
        userDetails: member.user || {},
      }));

      setUsers(formattedUsers);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleViewProfile = (user) => {
    setLoadingProfile(true);
    setShowProfileModal(true);
    setSelectedUser(user.userDetails);
    setTimeout(() => setLoadingProfile(false), 500); // Simulate loading for better UX
  };

  const handleCloseProfile = () => {
    setShowProfileModal(false);
    setSelectedUser(null);
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
            `https://parivaar.app/public/api/committee-members/${userId}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (!response.ok) {
            throw new Error("Failed to delete committee member");
          }

          const updatedUsers = users.filter((user) => user.id !== userId);
          setUsers(updatedUsers);

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

  // Timer calculation function
  const calculateTimeRemaining = (startDate, endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const start = new Date(startDate);

    if (now < start) {
      return "Not yet started";
    }
    if (now > end) {
      return "Expired";
    }

    const diffMs = end - now;
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );

    return `${days}d ${hours}h`;
  };

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return <CustomLogoLoader1 />;
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Member Management</h1>
      </div>
      <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <User size={20} className="mr-2 text-[#11224D]" />
            Members List
          </h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              className="pl-9 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  Number
                </th>
                <th className="p-3 border-b border-gray-200 font-semibold text-gray-700">
                  Role
                </th>
                <th className="p-3 border-b border-gray-200 font-semibold text-gray-700">
                  Start Date
                </th>
                <th className="p-3 border-b border-gray-200 font-semibold text-gray-700">
                  End Date
                </th>
                <th className="p-3 border-b border-gray-200 font-semibold text-gray-700">
                  Status
                </th>
                <th className="p-3 border-b border-gray-200 font-semibold text-gray-700">
                  Time Remaining
                </th>
                <th className="p-3 border-b border-gray-200 font-semibold text-gray-700 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition">
                  <td className="p-3 border-b border-gray-200 font-medium">
                    {user.name}
                  </td>
                  <td className="p-3 border-b border-gray-200">
                    {user.number}
                  </td>
                  <td className="p-3 border-b border-gray-200">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {user.role}
                    </span>
                  </td>
                  <td className="p-3 border-b text-sm border-gray-200">
                    {user.startDate?.split(" ")[0] || "N/A"}
                  </td>
                  <td className="p-3 border-b text-sm border-gray-200">
                    {user.endDate?.split(" ")[0] || "N/A"}
                  </td>
                  <td className="p-3 border-b border-gray-200">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.status == "A"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {user.status == "A" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-3 border-b border-gray-200">
                    {user.startDate && user.endDate
                      ? calculateTimeRemaining(user.startDate, user.endDate)
                      : "N/A"}
                  </td>
                  <td className="p-3 border-b border-gray-200">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handleViewProfile(user)}
                        className="p-1 text-[#11224D] hover:text-blue-800 rounded-full hover:bg-blue-50"
                        title="View Profile"
                      >
                        <User size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-1 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50"
                        title="Delete User"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showProfileModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <X size={24} className="text-gray-500" />
                      </button>
                    </div>

                    <div className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="md:w-1/3">
                          <div className="bg-gray-50 rounded-xl p-4 text-center">
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

                          <div className="mt-4 bg-gray-50 rounded-xl p-4">
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
                          <div className="bg-gray-50 rounded-xl p-4 mb-4">
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

                          <div className="bg-gray-50 rounded-xl p-4 mb-4">
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

                          <div className="bg-gray-50 rounded-xl p-4">
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
            {Math.min(indexOfLastUser, users.length)} of {users.length} users
          </div>
          <div className="flex space-x-1">
            <button
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:bg-gray-200 disabled:cursor-not-allowed"
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
                }`}
                onClick={() => handlePageClick(page)}
              >
                {page}
              </button>
            ))}
            <button
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:bg-gray-200 disabled:cursor-not-allowed"
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

export default Memberlist;
