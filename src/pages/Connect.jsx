import React, { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Calendar,
  User,
} from "lucide-react";
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
        top: "64px",
        left: 0,
        right: "5px",
        bottom: 0,
        background: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        backdropFilter: "blur(10px)",
      }}
    >
      <img
        src={logoImage}
        alt="Rotating Logo"
        style={{
          width: "50px",
          height: "50px",
          animation: "spin 1s linear infinite",
          filter: "drop-shadow(0 0 5px rgba(0, 0, 0, 0.3))",
        }}
      />
    </div>
  );
};

const Connect = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("https://parivaar.app/public/api/users");
      const data = await response.json();
      if (data.status == "success") {
        const userData = JSON.parse(localStorage.getItem("user"));
        const commId = userData?.Comm_Id;
        if (commId) {
          const filteredData = data.data.filter(
            (user) =>
              user.Comm_Id == commId && user.Role_Id == 3 && user.U_Status == 1
          );
          setUsers(filteredData);
          setFilteredUsers(filteredData);
        } else {
          console.error("Comm_Id not found in local storage");
          setUsers([]);
          setFilteredUsers([]);
        }
      } else {
        console.error("API response status is not success:", data);
        setUsers([]);
        setFilteredUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const filtered = users.filter(
      (user) =>
        user.U_Name?.toLowerCase().includes(term) ||
        user.U_Email?.toLowerCase().includes(term) ||
        user.City?.toLowerCase().includes(term) ||
        user.Occupation?.toLowerCase().includes(term)
    );

    setFilteredUsers(filtered);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A2B49]/10 to-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-[#1A2B49]/50" />
          </div>
          <input
            type="text"
            placeholder="Search by name, email, city, or occupation..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-[#1A2B49]/10 focus:border-[#1A2B49]/30 focus:ring-2 focus:ring-[#1A2B49]/20 bg-white/50 backdrop-blur-sm transition-all duration-200"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <CustomLogoLoader />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <div
                key={user.U_Id}
                onClick={() => setSelectedUser(user)}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
              >
                <div className="relative h-48 rounded-t-xl overflow-hidden">
                  {user.P_Image ? (
                    <img
                      src={user.P_Image}
                      alt={user.U_Name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#1A2B49]/5">
                      <User size={64} className="text-[#1A2B49]/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A2B49]/80 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-xl font-semibold text-white">
                      {user.U_Name}
                    </h3>
                    <p className="text-white/80 text-sm flex items-center gap-1">
                      <MapPin size={14} />{" "}
                      {user.City || "Location not specified"}
                    </p>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-[#1A2B49]/80 text-sm flex items-center gap-2 mb-2">
                    <Briefcase size={16} />{" "}
                    {user.Occupation || "Occupation not specified"}
                  </p>
                  <p className="text-[#1A2B49]/80 text-sm flex items-center gap-2">
                    <Mail size={16} /> {user.U_Email}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* User Details Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row">
              {/* Left Side - Image */}
              <div className="md:w-1/3 bg-[#1A2B49] relative">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="absolute top-4 right-4 bg-white/90 p-2 rounded-full hover:bg-white transition-colors duration-200 z-10"
                >
                  ✕
                </button>
                {selectedUser.P_Image ? (
                  <img
                    src={selectedUser.P_Image}
                    alt={selectedUser.U_Name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full min-h-[300px] flex items-center justify-center">
                    <User size={120} className="text-white/30" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#1A2B49] via-[#1A2B49]/80 to-transparent">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {selectedUser.U_Name} {selectedUser.Middle_Name}{" "}
                    {selectedUser.Last_Name}
                  </h2>
                  <p className="text-white/90 flex items-center gap-2">
                    <Briefcase size={18} />{" "}
                    {selectedUser.Occupation || "Occupation not specified"}
                  </p>
                </div>
              </div>

              {/* Right Side - Information */}
              <div className="md:w-2/3 p-6 overflow-y-auto">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-[#1A2B49] mb-4">
                      Contact Information
                    </h3>
                    <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
                      <p className="flex items-center gap-3 text-gray-700">
                        <Mail size={20} className="text-[#1A2B49]" />{" "}
                        {selectedUser.U_Email}
                      </p>
                      <p className="flex items-center gap-3 text-gray-700">
                        <Phone size={20} className="text-[#1A2B49]" />{" "}
                        {selectedUser.U_Mobile}
                      </p>
                      <p className="flex items-start gap-3 text-gray-700">
                        <MapPin size={20} className="text-[#1A2B49] mt-1" />
                        <span>
                          {selectedUser.Address}, {selectedUser.City},{" "}
                          {selectedUser.State}, {selectedUser.Country} -{" "}
                          {selectedUser.Zipcode}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-[#1A2B49] mb-4">
                      Personal Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
                      <div className="space-y-2 text-gray-700">
                        <p>
                          <span className="font-medium">Gender:</span>{" "}
                          {selectedUser.Gender}
                        </p>
                        <p>
                          <span className="font-medium">Marital Status:</span>{" "}
                          {selectedUser.Marital_Status}
                        </p>
                      </div>
                      {selectedUser.DOB && (
                        <p className="flex items-center gap-2 text-gray-700">
                          <Calendar size={20} className="text-[#1A2B49]" />
                          <span>
                            {new Date(selectedUser.DOB).toLocaleDateString()}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-[#1A2B49] mb-4">
                      Education
                    </h3>
                    <div className="space-y-4 bg-gray-50 p-4 rounded-xl">
                      {selectedUser.School_Name && (
                        <div className="flex items-start gap-3 text-gray-700">
                          <GraduationCap
                            size={20}
                            className="text-[#1A2B49] mt-1"
                          />
                          <div>
                            <p className="font-medium">
                              {selectedUser.School_Name}
                            </p>
                            <p>
                              School Score: {selectedUser.Education_School}%
                            </p>
                          </div>
                        </div>
                      )}
                      {selectedUser.College_Name && (
                        <div className="flex items-start gap-3 text-gray-700 border-t border-gray-200 pt-4">
                          <GraduationCap
                            size={20}
                            className="text-[#1A2B49] mt-1"
                          />
                          <div>
                            <p className="font-medium">
                              {selectedUser.College_Name}
                            </p>
                            <p>
                              College Score: {selectedUser.Education_College}{" "}
                              CGPA
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedUser.Occupation_Address && (
                    <div>
                      <h3 className="text-xl font-semibold text-[#1A2B49] mb-4">
                        Work
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <p className="text-gray-700">
                          {selectedUser.Occupation_Address}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Connect;
