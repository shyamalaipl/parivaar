import { useState, useEffect } from "react";
import {
  Briefcase,
  User,
  Users,
  X,
  Eye,
  Mail,
  Phone,
  MapPin,
  Home,
  Heart,
  Book,
  Calendar,
  Lock,
  ChevronDown,
  Search,
  AlertCircle,
  Plus,
  Globe,
} from "lucide-react";
import logoImage from "../img/parivarlogo1.png";

// First, let's add the CustomLogoLoader component
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
        background: "rgba(0, 0, 0, 0.7)",
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
          width: "50px",
          height: "50px",
          animation: "spin 1s linear infinite",
          filter: "drop-shadow(0 0 5px rgba(255, 255, 255, 0.3))",
        }}
      />
    </div>
  );
};

// EmptyState component for no data scenarios
const EmptyState = ({ message, icon: Icon }) => (
  <div className="flex flex-col items-center justify-center p-8 text-gray-400">
    <Icon size={48} className="mb-4 opacity-50" />
    <p className="text-lg font-medium">{message}</p>
  </div>
);

const DepartmentAdmin = ({ setActivePage, activePage }) => {
  // ... [Keep all your existing state declarations and functions]

  const [appointedMembers, setAppointedMembers] = useState([]);
  const [newAppoint, setNewAppoint] = useState({
    name: "",
    role: "",
    startDate: "",
    endDate: "",
    duration: "",
    uId: null,
  });
  const [users, setUsers] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [filter, setFilter] = useState("all");
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchAppointedMembers();
    fetchDesignations();
  }, []);

  const durations = [
    { label: "6 Months", value: 6 },
    { label: "1 Year", value: 12 },
    { label: "2 Years", value: 24 },
    { label: "3 Years", value: 36 },
    { label: "5 Years", value: 60 },
    { label: "10 Years", value: 120 },
  ];

  const fetchDesignations = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const commId = user.id;
      if (!commId) {
        setError("No user ID found in local storage. Please log in.");
        return;
      }

      const response = await fetch(
        "https://parivaar.app/public/api/designations",
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      let filteredDesignations = [];
      if (Array.isArray(data)) {
        filteredDesignations = data.filter(
          (desi) => desi.Comm_Id == parseInt(commId)
        );
      } else if (data.data && Array.isArray(data.data)) {
        filteredDesignations = data.data.filter(
          (desi) => desi.Comm_Id == parseInt(commId)
        );
      } else if (data.designations && Array.isArray(data.designations)) {
        filteredDesignations = data.designations.filter(
          (desi) => desi.Comm_Id == parseInt(commId)
        );
      } else {
        throw new Error("Unexpected API response format");
      }

      setDesignations(filteredDesignations);
    } catch (error) {
      console.error("Error fetching designations:", error);
      setError(`Failed to fetch designations: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointedMembers = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const commId = user.id;
      if (!commId) {
        console.error("No Comm_Id found in local storage");
        return;
      }

      const response = await fetch(
        "https://parivaar.app/public/api/committee-members",
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch members");

      const data = await response.json();
      const members = data.members || (Array.isArray(data) ? data : []);
      const filteredMembers = members.filter(
        (member) => member.Comm_Id == parseInt(commId)
      );

      setAppointedMembers(filteredMembers);
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  const fetchUserDetails = async (uId) => {
    try {
      const response = await fetch("https://parivaar.app/public/api/users", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch user details");

      const data = await response.json();
      const user = data.users.find((u) => u.U_Id == uId);
      if (user) {
        setSelectedUserDetails({
          U_Name: user.U_Name || "",
          U_Email: user.U_Email || "",
          U_Mobile: user.U_Mobile || "",
          U_Password: user.U_Password || "",
          U_Status: user.U_Status == 1 ? "Active" : "Inactive",
          Comm_Id: user.Comm_Id || "",
          Middle_Name: user.Middle_Name || "",
          Last_Name: user.Last_Name || "",
          Address: user.Address || "",
          City: user.City || "",
          State: user.State || "",
          Country: user.Country || "",
          Zipcode: user.Zipcode || "",
          Gender: user.Gender || "",
          Occupation: user.Occupation || "",
          Marital_Status: user.Marital_Status || "",
          Education_School: user.Education_School || "",
          Education_College: user.Education_College || "",
          P_Image: user.P_Image || "",
          School_Name: user.School_Name || "",
          College_Name: user.College_Name || "",
          Occupation_Address: user.Occupation_Address || "",
          DOB: user.DOB || "",
          Comm_Name: user.committee?.Comm_Name || "",
        });
        setShowModal(true);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      alert("Failed to fetch user details: " + error.message);
    }
  };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;

    if (name == "name") {
      setNewAppoint({ ...newAppoint, [name]: value });
      if (value.trim()) {
        try {
          const user = JSON.parse(localStorage.getItem("user") || "{}");
          const commId = user.id;
          if (!commId) return;

          const response = await fetch(
            "https://parivaar.app/public/api/users",
            {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            }
          );
          if (!response.ok) throw new Error("Failed to fetch users");

          const data = await response.json();
          const filteredUsers = data.users.filter(
            (user) =>
              user.Comm_Id == parseInt(commId) &&
              user.Role_Id == 4 &&
              user.U_Status == 1 &&
              user.U_Name.toLowerCase().includes(value.toLowerCase())
          );

          setUsers(filteredUsers);
          setShowDropdown(true);
        } catch (error) {
          console.error("Error fetching users:", error);
        }
      } else {
        setShowDropdown(false);
      }
    } else if (name == "startDate" && newAppoint.duration) {
      const start = new Date(value);
      const monthsToAdd = parseInt(newAppoint.duration);
      const end = new Date(start.setMonth(start.getMonth() + monthsToAdd));
      setNewAppoint({
        ...newAppoint,
        [name]: value,
        endDate: end.toISOString().split("T")[0],
      });
    } else if (name == "duration" && newAppoint.startDate) {
      const start = new Date(newAppoint.startDate);
      const monthsToAdd = parseInt(value);
      const end = new Date(start.setMonth(start.getMonth() + monthsToAdd));
      setNewAppoint({
        ...newAppoint,
        [name]: value,
        endDate: end.toISOString().split("T")[0],
      });
    } else {
      setNewAppoint({ ...newAppoint, [name]: value });
    }
  };

  const handleUserSelect = (user) => {
    setNewAppoint({ ...newAppoint, name: user.U_Name, uId: user.U_Id });
    setShowDropdown(false);
  };

  const handleViewDetails = () => {
    if (newAppoint.uId) {
      fetchUserDetails(newAppoint.uId);
    } else {
      alert("Please select a member first.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const commId = user.id;

    if (
      !newAppoint.name ||
      !newAppoint.role ||
      !newAppoint.startDate ||
      !commId ||
      !newAppoint.uId
    ) {
      alert("Please fill in all required fields and ensure you're logged in.");
      return;
    }

    const selectedDesignation = designations.find(
      (d) => d.Desi_Name == newAppoint.role
    );
    const durationLabel =
      durations.find((d) => d.value == parseInt(newAppoint.duration))?.label ||
      "";

    const payload = {
      Comm_Id: parseInt(commId),
      Desi_Type_Id: selectedDesignation?.Desi_Type_Id,
      StartDate: newAppoint.startDate + " 00:00:00",
      Duration: durationLabel,
      U_Id: newAppoint.uId,
    };

    try {
      const response = await fetch(
        "https://parivaar.app/public/api/committee-members",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) throw new Error("Failed to add member");

      const result = await response.json();
      console.log("Member added:", result);

      setNewAppoint({
        name: "",
        role: "",
        startDate: "",
        endDate: "",
        duration: "",
        uId: null,
      });
      fetchAppointedMembers();
    } catch (error) {
      console.error("Error adding member:", error);
      alert("Error adding member: " + error.message);
    }
  };

  const filteredMembers = appointedMembers.filter((member) => {
    if (filter == "all") return true;
    if (filter == "active") return member.Status == "A";
    if (filter == "inactive") return member.Status == "I";
    return true;
  });

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {loading && <CustomLogoLoader />}

      {/* Header Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1A2B49]">
              Department Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your organization's roles and appointments
            </p>
          </div>
          <div className="flex gap-3">
            <div className="px-4 py-2 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">
                Active Members
              </p>
              <p className="text-2xl font-bold text-blue-700">
                {appointedMembers.filter((m) => m.Status == "A").length}
              </p>
            </div>
            <div className="px-4 py-2 bg-amber-50 rounded-lg">
              <p className="text-sm text-amber-600 font-medium">
                Inactive Members
              </p>
              <p className="text-2xl font-bold text-amber-700">
                {appointedMembers.filter((m) => m.Status == "I").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Assign Role Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#1A2B49] flex items-center">
            <Briefcase className="mr-2" />
            Assign a Role
          </h2>
          <button
            onClick={() => setActivePage("designationCreation")}
            className="px-6 py-2 bg-[#1A2B49] text-white rounded-lg hover:bg-[#1A2B49]/90 transition-all duration-300 flex items-center gap-2"
          >
            <Plus size={20} />
            Add Designation
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form fields with enhanced styling */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Member Name Input */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Member Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  value={newAppoint.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent transition-all duration-300"
                  placeholder="Search member..."
                />
                <button
                  type="button"
                  onClick={handleViewDetails}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1A2B49] transition-colors duration-300"
                >
                  <Eye size={20} />
                </button>
              </div>
              {/* Dropdown with enhanced styling */}
              {showDropdown && users.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                  {users.map((user) => (
                    <div
                      key={user.U_Id}
                      onClick={() => handleUserSelect(user)}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 transition-colors duration-200"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#1A2B49] text-white flex items-center justify-center">
                        {user.U_Name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {user.U_Name}
                        </p>
                        <p className="text-sm text-gray-500">{user.U_Email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                name="role"
                value={newAppoint.role}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent transition-all duration-300"
              >
                <option value="">Select Role</option>
                {designations.map((desi) => (
                  <option key={desi.Desi_Type_Id} value={desi.Desi_Name}>
                    {desi.Desi_Name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date and Duration Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={newAppoint.startDate}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration
              </label>
              <select
                name="duration"
                value={newAppoint.duration}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent transition-all duration-300"
              >
                <option value="">Select Duration</option>
                {durations.map((duration) => (
                  <option key={duration.value} value={duration.value}>
                    {duration.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={newAppoint.endDate}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent transition-all duration-300"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-[#1A2B49] text-white rounded-lg hover:bg-[#1A2B49]/90 transition-all duration-300 flex items-center gap-2"
            >
              <Users size={20} />
              Assign Role
            </button>
          </div>
        </form>
      </div>

      {/* Appointed Members Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#1A2B49] flex items-center">
            <Users className="mr-2" />
            Appointed Members
          </h2>
          <div className="flex gap-4">
            {["all", "active", "inactive"].map((filterType) => (
              <button
                key={filterType}
                onClick={() => handleFilterChange(filterType)}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  filter == filterType
                    ? "bg-[#1A2B49] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Members Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                  Member
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                  Start Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                  End Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr
                  key={member.Mam_Id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#1A2B49] text-white flex items-center justify-center">
                        {member.user?.U_Name?.[0] || "?"}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {member.user?.U_Name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {member.user?.U_Email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                      {member.designation?.Desi_Name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {member.StartDate?.split(" ")[0]}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {member.EndDate?.split(" ")[0]}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        member.Status == "A"
                          ? "bg-green-50 text-green-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {member.Status == "A" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => fetchUserDetails(member.user?.U_Id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      >
                        <Eye size={18} />
                      </button>
                      {/* <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200">
                        <X size={18} />
                      </button> */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredMembers.length == 0 && (
            <EmptyState message="No members found" icon={Users} />
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {showModal && selectedUserDetails && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-[#1A2B49] text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  {selectedUserDetails.P_Image ? (
                    <img
                      src={selectedUserDetails.P_Image}
                      alt="Profile"
                      className="w-16 h-16 rounded-full object-cover border-4 border-white/20"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                      <User size={32} className="text-white/70" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-2xl font-bold">
                      {selectedUserDetails.U_Name}{" "}
                      {selectedUserDetails.Middle_Name}{" "}
                      {selectedUserDetails.Last_Name}
                    </h3>
                    <p className="text-white/70">
                      {selectedUserDetails.Comm_Name || "No Community"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    label: "Email",
                    value: selectedUserDetails.U_Email,
                    icon: Mail,
                  },
                  {
                    label: "Phone",
                    value: selectedUserDetails.U_Mobile,
                    icon: Phone,
                  },
                  {
                    label: "Address",
                    value: selectedUserDetails.Address,
                    icon: MapPin,
                  },
                  {
                    label: "City",
                    value: selectedUserDetails.City,
                    icon: Home,
                  },
                  {
                    label: "State",
                    value: selectedUserDetails.State,
                    icon: MapPin,
                  },
                  {
                    label: "Country",
                    value: selectedUserDetails.Country,
                    icon: Globe,
                  },
                  {
                    label: "Gender",
                    value: selectedUserDetails.Gender,
                    icon: User,
                  },
                  {
                    label: "Date of Birth",
                    value: selectedUserDetails.DOB,
                    icon: Calendar,
                  },
                  {
                    label: "Occupation",
                    value: selectedUserDetails.Occupation,
                    icon: Briefcase,
                  },
                  {
                    label: "Education",
                    value:
                      selectedUserDetails.Education_College ||
                      selectedUserDetails.Education_School,
                    icon: Book,
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-xl p-4 flex items-start gap-3"
                  >
                    <div className="p-2 bg-[#1A2B49]/10 rounded-lg">
                      <item.icon size={20} className="text-[#1A2B49]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {item.label}
                      </p>
                      <p className="text-base font-medium text-gray-900">
                        {item.value || "Not provided"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Additional Information */}
              {/* <div className="mt-6 bg-red-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-red-600 mb-2">
                  <Lock size={20} />
                  <h4 className="font-medium">Sensitive Information</h4>
                </div>
                <p className="text-red-700">Password and other sensitive details are hidden for security</p>
              </div> */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentAdmin;
