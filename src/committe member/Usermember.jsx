import React, { useState, useEffect } from "react";
import { Search, Filter, ChevronDown, User } from "lucide-react";
import Swal from "sweetalert2";
import logoImage from "../../src/img/parivarlogo1.png"; // Adjust path if needed

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
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        backdropFilter: "blur(5px)",
      }}
    >
      <img
        src={logoImage}
        alt="Rotating Logo"
        style={{
          width: "60px",
          height: "60px",
          animation: "spin 1s linear infinite",
          filter: "drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))",
        }}
      />
    </div>
  );
};

const Usermember = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [committeeMembers, setCommitteeMembers] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("All");

  const userData = JSON.parse(localStorage.getItem("user")) || {};
  const commId = userData.Comm_Id;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://parivaar.app/public/api/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();

      const allUsers = data.users || [];
      const filteredByCommId = allUsers.filter(
        (user) => user.Comm_Id == commId
      );

      const regularUsers = filteredByCommId.filter((user) => user.Role_Id == 4);
      const committeeUsers = filteredByCommId.filter(
        (user) => user.Role_Id == 3
      );

      setUsers(regularUsers);
      setCommitteeMembers(committeeUsers);
      setFilteredData([...regularUsers, ...committeeUsers]); // Default: show all

      if (filteredByCommId.length == 0) {
        Swal.fire({
          icon: "info",
          title: "No Users",
          text: "No users found for this community",
          confirmButtonColor: "#1A2B49",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Fetch Error",
        text: err.message,
        confirmButtonColor: "#1A2B49",
      });
      setError(err.message);
      setUsers([]);
      setCommitteeMembers([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleFilter = (type) => {
    setSelectedFilter(type);
    if (type == "All") {
      setFilteredData([...users, ...committeeMembers]);
    } else if (type == "Committee Member") {
      setFilteredData(committeeMembers);
    } else if (type == "User") {
      setFilteredData(users);
    }
    setFilterOpen(false);
  };

  const filteredUsers = filteredData.filter(
    (user) =>
      user.U_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.U_Email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to get user initials
  const getInitials = (name) => {
    if (!name) return "U";
    const nameParts = name.split(" ");
    return nameParts.length > 1
      ? `${nameParts[0][0]}${nameParts[1][0]}`
      : nameParts[0][0];
  };

  return (
    <div className="min-h-screen bg-white p-6">
      {loading && <CustomLogoLoader />}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-[#1A2B49]/10">
        <div
          className="p-6 border-b border-[#1A2B49]/10"
          style={{ backgroundColor: "#1A2B49" }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-3xl font-bold text-white">Users Management</h1>
            <div className="flex items-center gap-3">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Search users..."
                  className="w-full pl-10 pr-4 py-3 bg-white border border-[#1A2B49]/20 rounded-xl focus:ring-2 focus:ring-[#1A2B49] focus:border-[#1A2B49] shadow-sm transition-all duration-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search
                  className="absolute left-3 top-3 text-[#1A2B49]"
                  size={18}
                />
              </div>
              <div className="relative">
                <button
                  onClick={() => setFilterOpen(!filterOpen)}
                  className="flex items-center gap-2 px-5 py-3 bg-white text-[#1A2B49] border border-[#1A2B49]/20 rounded-xl hover:bg-[#1A2B49] hover:text-[white] hover:border-[white] cursor-pointer h shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Filter size={18} />
                  <span className="hidden md:inline">{selectedFilter}</span>
                  <ChevronDown size={18} />
                </button>
                {filterOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-[#1A2B49]/10 z-10">
                    <button
                      onClick={() => handleFilter("All")}
                      className="w-full text-left px-4 py-2 text-[#1A2B49] hover:bg-[#1A2B49]/10 transition-all duration-200"
                    >
                      All
                    </button>
                    <button
                      onClick={() => handleFilter("Committee Member")}
                      className="w-full text-left px-4 py-2 text-[#1A2B49] hover:bg-[#1A2B49]/10 transition-all duration-200"
                    >
                      Committee Member
                    </button>
                    <button
                      onClick={() => handleFilter("User")}
                      className="w-full text-left px-4 py-2 text-[#1A2B49] hover:bg-[#1A2B49]/10 transition-all duration-200"
                    >
                      User
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr
                    className="text-left text-xs font-medium text-white uppercase tracking-wider"
                    style={{ backgroundColor: "#1A2B49" }}
                  >
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A2B49]/10">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.U_Id}
                      className="hover:bg-[#1A2B49]/5 transition-all duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-12 w-12 flex-shrink-0 flex items-center justify-center">
                            {user.P_Image &&
                            user.P_Image !==
                              "http://127.0.0.1:8000/profiles/null" ? (
                              <img
                                className="h-12 w-12 rounded-full shadow-md"
                                src={user.P_Image}
                                alt={user.U_Name}
                                onError={(e) =>
                                  (e.target.style.display = "none")
                                } // Hide on error
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-full bg-[#1A2B49] flex items-center justify-center text-white text-lg font-semibold shadow-md">
                                {getInitials(user.U_Name)}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-[#1A2B49]">
                              {user.U_Name}
                            </div>
                            <div className="text-sm text-[#1A2B49]/70">
                              {user.U_Email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.Role_Id == 3
                              ? "bg-[#1A2B49] text-white"
                              : "bg-white text-[#1A2B49] border border-[#1A2B49]"
                          }`}
                        >
                          {user.role?.Role_Name ||
                            (user.Role_Id == 3 ? "Committee Master" : "User")}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.U_Status == 1
                              ? "bg-[#1A2B49] text-white"
                              : "bg-white text-[#1A2B49] border border-[#1A2B49]"
                          }`}
                        >
                          {user.U_Status == 1 ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-[#1A2B49] text-center py-4">No users found</p>
          )}
        </div>

        <div
          className="px-6 py-4 flex items-center justify-between border-t border-[#1A2B49]/10"
          style={{ backgroundColor: "#1A2B49" }}
        >
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-white">
                Showing{" "}
                <span className="font-medium">{filteredUsers.length}</span>{" "}
                results
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Usermember;
