import { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  UserCheck,
  Search,
  Bell,
  ChevronDown,
  Check,
  X,
  Eye,
  UserPlus2,
  UserCheck2,
} from "lucide-react";
import { FiUserX } from "react-icons/fi";

const SuperAdminDashboard = ({ setActivePage, activePage }) => {
  const [totalCommunity, setTotalCommunity] = useState("0");
  const [newRequests, setNewRequests] = useState("0");
  const [activeCommunity, setActiveCommunity] = useState("0");
  const [rejectedCommunity, setRejectedCommunity] = useState("0");
  const [totalUsers, setTotalUsers] = useState("0");
  const [loading, setLoading] = useState(true);
  const [communityRequests, setCommunityRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [allDemos, setAllDemos] = useState([]);
  const [searchTermDemo, setSearchTermDemo] = useState("");
  const [selectedDemo, setSelectedDemo] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [dateFilter, setDateFilter] = useState("all");
  const [customDate, setCustomDate] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch users
        const usersResponse = await fetch(
          "https://parivaar.app/public/api/users"
        );
        const usersResult = await usersResponse.json();
        if (usersResult.status == "success") {
          const users = usersResult.data;
          const pendingRequests = users.filter(
            (user) => user.U_Status == 0 && user.Role_Id == 2
          );
          setCommunityRequests(pendingRequests);
          setNewRequests(pendingRequests.length.toString());
          setTotalCommunity(
            users
              .filter((user) => user.U_Status == 1 && user.Role_Id == 2)
              .length.toString()
          );
          setActiveCommunity(
            users
              .filter((user) => user.U_Status == 1 && user.Role_Id == 2)
              .length.toString()
          );
          setRejectedCommunity(
            users
              .filter((user) => user.U_Status == 2 && user.Role_Id == 2)
              .length.toString()
          );
          setTotalUsers(
            users
              .filter((user) => user.U_Status == 1 && user.Role_Id == 3)
              .length.toString()
          );
        }

        // Fetch all demos
        const demosResponse = await fetch(
          "https://parivaar.app/public/api/schedule-demo"
        );
        const demosResult = await demosResponse.json();

        const formattedDemos = demosResult.map((item) => ({
          ...item,
          status:
            item.sche_status == 0
              ? "pending"
              : item.sche_status == 1
              ? "accepted"
              : "rejected",
        }));
        setAllDemos(formattedDemos);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleApprove = async (userId) => {
    try {
      setLoading(true);
      const payload = { U_Status: 1 };
      const response = await fetch(
        `https://parivaar.app/public/api/users/${userId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        setCommunityRequests((prevRequests) =>
          prevRequests.filter((request) => request.U_Id !== userId)
        );
        setNewRequests((prev) => (parseInt(prev) - 1).toString());
        setActiveCommunity((prev) => (parseInt(prev) + 1).toString());
      }
    } catch (error) {
      console.error("Error approving request:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (userId) => {
    try {
      setLoading(true);
      const payload = { U_Status: 2 };
      const response = await fetch(
        `https://parivaar.app/public/api/users/${userId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        setCommunityRequests((prevRequests) =>
          prevRequests.filter((request) => request.U_Id !== userId)
        );
        setNewRequests((prev) => (parseInt(prev) - 1).toString());
        setRejectedCommunity((prev) => (parseInt(prev) + 1).toString());
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptDemo = async (demoId) => {
    try {
      setLoading(true);
      const payload = { sche_status: 1 };
      const response = await fetch(
        `https://parivaar.app/public/api/schedule-demo/${demoId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (response.ok) {
        setAllDemos((prev) =>
          prev.map((demo) =>
            demo.sche_id == demoId
              ? { ...demo, sche_status: 1, status: "accepted" }
              : demo
          )
        );
      }
    } catch (error) {
      console.error("Error accepting demo:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectDemo = async (demoId) => {
    try {
      setLoading(true);
      const payload = { sche_status: 2 };
      const response = await fetch(
        `https://parivaar.app/public/api/schedule-demo/${demoId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (response.ok) {
        setAllDemos((prev) =>
          prev.map((demo) =>
            demo.sche_id == demoId
              ? { ...demo, sche_status: 2, status: "rejected" }
              : demo
          )
        );
      }
    } catch (error) {
      console.error("Error rejecting demo:", error);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const todayStr = `${year}-${month}-${day}`;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredRequests = communityRequests
    .filter(
      (request) =>
        request.U_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.U_Email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.U_Mobile?.includes(searchTerm)
    )
    .slice(0, 3);

 const getFilteredDemos = () => {
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  return allDemos
    .filter((demo) => demo.sche_status == 0 && demo.sche_date >= todayStr)
    .filter((demo) => {
      if (dateFilter == "all") return true;
      if (dateFilter == "today") return demo.sche_date == todayStr;
      if (dateFilter == "yesterday")
        return false; // Exclude yesterday as it's in the past
      if (dateFilter == "tomorrow")
        return demo.sche_date == formatDate(tomorrow);
      if (dateFilter == "custom" && customDate)
        return demo.sche_date == customDate && demo.sche_date >= todayStr;
      return true;
    })
    .filter(
      (demo) =>
        demo.sche_name
          ?.toLowerCase()
          .includes(searchTermDemo.toLowerCase()) ||
        demo.sche_email
          ?.toLowerCase()
          .includes(searchTermDemo.toLowerCase()) ||
        demo.sche_phone?.includes(searchTermDemo)
    )
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 3);
};

const todayDemos = allDemos.filter(
  (demo) => demo.sche_status == 1 && demo.sche_date >= todayStr
);



  const filteredPendingDemos = getFilteredDemos();

  const stats = [
    {
      title: "New Requests",
      value: newRequests,
      icon: <UserPlus size={24} />,
      change: "+18%",
      color: " text-[white] bg-[orange]",
      navigateTo: "communityrequist",
    },
    {
      title: "Total Community",
      value: totalCommunity,
      icon: <Users size={24} />,
      change: "+12%",
      color: "text-[white] bg-[#2B7FFF]",
      navigateTo: "communitylist",
    },
    {
      title: "Total Members",
      value: totalUsers,
      icon: <Users size={24} />,
      change: "+12%",
      color: "text-[white] bg-[#2B7FFF]",
      navigateTo: "userssuperlist",
    },
    {
      title: "Active Community",
      value: activeCommunity,
      icon: <UserCheck2 size={24} />,
      change: "+7%",
      color: " text-[white] bg-[green]",
      navigateTo: "communitylist",
    },
    {
      title: "Rejected Community",
      value: rejectedCommunity,
      icon: <FiUserX size={24} />,
      change: "-3%",
      color: "bg-[red] text-[white]",
      navigateTo: "communityrejected",
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
  {stats.map((stat, index) => (
    <div
      key={index}
      className="relative bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
      onClick={() => stat.navigateTo && setActivePage(stat.navigateTo)}
    >
      {/* Decorative gradient background element */}
      <div
        className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br opacity-10 rounded-bl-full"
        style={{
          backgroundColor: stat.color.split("bg-")[1]?.split(" ")[0] || "#ccc",
        }}
      />

      {/* Main content */}
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-600 text font-medium">{stat.title}</p>

          <h3 className="text-3xl font-bold mt-2 bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600">
            {stat.value}
          </h3>

          <div className="flex items-center mt-3">
            {/* You can place badges, icons, or status indicators here */}
            {stat.detail && (
              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                {stat.detail}
              </span>
            )}
          </div>
        </div>

        {/* Icon with background */}
        <div className={`p-3 rounded-full ${stat.color} bg-opacity-20 shadow-md`}>
          <div className="text-white">{stat.icon}</div>
        </div>
      </div>
    </div>
  ))}
</div>


      {/* Quick Stats & Activity */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 sm:col-span-2">
          <div className="p-4 sm:p-6 border-b border-gray-100 from-blue-50 to-blue-100">
            <h2 className="text-base sm:text-lg font-semibold text-black flex items-center gap-2">
              Today Demo
            </h2>
          </div>
          <div className="p-4 sm:p-6">
            {todayDemos.length > 0 ? (
              <ul className="space-y-4">
                {todayDemos.map((demo) => (
                  <li
                    key={demo.sche_id}
                    className="flex bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <UserPlus className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {demo.sche_name}
                      </p>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">Email:</span>{" "}
                          {demo.sche_email}
                        </p>
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">Phone:</span>{" "}
                          {demo.sche_phone}
                        </p>
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">Time:</span>{" "}
                          {demo.sche_time_slots}
                        </p>
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">Note:</span>{" "}
                          {demo.additional_note || "N/A"}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedDemo(demo)}
                        className="mt-3 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer border text-xs transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No demos scheduled for today
              </p>
            )}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 sm:col-span-1">
          <div className="p-4 sm:p-6 border-b border-gray-100">
            <h2 className="text-base sm:text-lg font-semibold">Quick Stats</h2>
          </div>
          <div className="p-4 sm:p-6">
            <ul className="space-y-3">
              <li className="flex justify-between items-center">
                <span className="text-gray-600 text-xs sm:text-sm">
                  Pending Requests
                </span>
                <span className="font-semibold text-blue-600 text-xs sm:text-sm">
                  {newRequests}
                </span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-gray-600 text-xs sm:text-sm">
                  Active Communities
                </span>
                <span className="font-semibold text-green-600 text-xs sm:text-sm">
                  {activeCommunity}
                </span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-gray-600 text-xs sm:text-sm">
                  Rejected Communities
                </span>
                <span className="font-semibold text-red-600 text-xs sm:text-sm">
                  {rejectedCommunity}
                </span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-gray-600 text-xs sm:text-sm">
                  Total Users
                </span>
                <span className="font-semibold text-xs sm:text-sm">
                  {totalUsers}
                </span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-gray-600 text-xs sm:text-sm">
                  Average Users per Community
                </span>
                <span className="font-semibold text-xs sm:text-sm">
                  {activeCommunity > 0
                    ? Math.round(
                        parseInt(totalUsers) / parseInt(activeCommunity)
                      )
                    : 0}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Recent Demo Requests */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 border-b border-gray-100 gap-4">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-orange-500" />
            <h2 className="text-base sm:text-lg font-semibold">
              Recent Demo Requests
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1C2636] focus:border-[#1C2636] text-sm"
                placeholder="Search demo requests..."
                value={searchTermDemo}
                onChange={(e) => setSearchTermDemo(e.target.value)}
              />
            </div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full sm:w-auto p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1C2636] focus:border-[#1C2636] text-sm"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="custom">Custom Date</option>
            </select>
            {dateFilter == "custom" && (
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="w-full sm:w-auto p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1C2636] focus:border-[#1C2636] text-sm"
              />
            )}
            <button
              onClick={() => setActivePage("demomanag")}
              className="w-full sm:w-auto px-4 py-2 bg-orange-500 text-white cursor-pointer rounded-lg hover:bg-orange-600 transition-colors text-sm"
            >
              View All Demo Requests
            </button>
          </div>
        </div>

        {/* Table for larger screens */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time Slot
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPendingDemos.length > 0 ? (
                filteredPendingDemos.map((demo) => (
                  <tr key={demo.sche_id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                          {demo.sche_name?.charAt(0) || "D"}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {demo.sche_name || "Unknown"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {demo.sche_email || "N/A"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {demo.sche_phone || "N/A"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(demo.sche_date)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {demo.sche_time_slots || "N/A"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAcceptDemo(demo.sche_id)}
                          className="p-2 bg-green-100 text-green-600 rounded-md hover:bg-green-200 transition-colors"
                          title="Accept"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleRejectDemo(demo.sche_id)}
                          className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                          title="Reject"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <button
                          className="p-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors"
                          title="View Details"
                          onClick={() => setSelectedDemo(demo)}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-4 text-center text-sm text-gray-500"
                  >
                    {searchTermDemo || dateFilter !== "all"
                      ? "No matching demo requests found"
                      : "No pending demo requests"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Card layout for mobile */}
        <div className="block sm:hidden p-4">
          {filteredPendingDemos.length > 0 ? (
            filteredPendingDemos.map((demo) => (
              <div
                key={demo.sche_id}
                className="bg-gray-50 rounded-lg p-4 mb-4 shadow-sm"
              >
                <div className="flex items-center mb-2">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                    {demo.sche_name?.charAt(0) || "D"}
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">
                      {demo.sche_name || "Unknown"}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-900 space-y-1">
                  <p>
                    <strong>Email:</strong> {demo.sche_email || "N/A"}
                  </p>
                  <p>
                    <strong>Phone:</strong> {demo.sche_phone || "N/A"}
                  </p>
                  <p>
                    <strong>Date:</strong> {formatDate(demo.sche_date)}
                  </p>
                  <p>
                    <strong>Time Slot:</strong> {demo.sche_time_slots || "N/A"}
                  </p>
                </div>
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={() => handleAcceptDemo(demo.sche_id)}
                    className="p-2 bg-green-100 text-green-600 rounded-md hover:bg-green-200 transition-colors"
                    title="Accept"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleRejectDemo(demo.sche_id)}
                    className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                    title="Reject"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <button
                    className="p-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors"
                    title="View Details"
                    onClick={() => setSelectedDemo(demo)}
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center">
              {searchTermDemo || dateFilter !== "all"
                ? "No matching demo requests found"
                : "No pending demo requests"}
            </p>
          )}
        </div>
      </div>

      {/* Recent Community Requests */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 border-b border-gray-100 gap-4">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-[#1C2636]" />
            <h2 className="text-base sm:text-lg font-semibold">
              Recent Community Requests
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1C2636] focus:border-[#1C2636] text-sm"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => setActivePage("communityrequist")}
              className="w-full sm:w-auto px-4 py-2 bg-[#1C2636] text-white rounded-lg hover:bg-white hover:text-[#1C2636] border cursor-pointer transition-colors text-sm"
            >
              View All Requests
            </button>
          </div>
        </div>

        {/* Table for larger screens */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mobile
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((request) => (
                  <tr key={request.U_Id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                          {request.U_Name?.charAt(0) || "U"}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {request.U_Name || "Unknown"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {request.Comm_Name || "Community"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.U_Email || "N/A"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.U_Mobile || "N/A"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(request.created_at)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(request.U_Id)}
                          className="p-2 bg-green-100 text-green-600 rounded-md hover:bg-green-200 transition-colors"
                          title="Approve"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleReject(request.U_Id)}
                          className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                          title="Reject"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <button
                          className="p-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors"
                          title="View Details"
                          onClick={() => setSelectedRequest(request)}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-4 py-4 text-center text-sm text-gray-500"
                  >
                    {searchTerm
                      ? "No matching requests found"
                      : "No pending community requests"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Card layout for mobile */}
        <div className="block sm:hidden p-4">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((request) => (
              <div
                key={request.U_Id}
                className="bg-gray-50 rounded-lg p-4 mb-4 shadow-sm"
              >
                <div className="flex items-center mb-2">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                    {request.U_Name?.charAt(0) || "U"}
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">
                      {request.U_Name || "Unknown"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {request.Comm_Name || "Community"}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-900 space-y-1">
                  <p>
                    <strong>Email:</strong> {request.U_Email || "N/A"}
                  </p>
                  <p>
                    <strong>Mobile:</strong> {request.U_Mobile || "N/A"}
                  </p>
                  <p>
                    <strong>Date:</strong> {formatDate(request.created_at)}
                  </p>
                </div>
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={() => handleApprove(request.U_Id)}
                    className="p-2 bg-green-100 text-green-600 rounded-md hover:bg-green-200 transition-colors"
                    title="Approve"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleReject(request.U_Id)}
                    className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                    title="Reject"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <button
                    className="p-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors"
                    title="View Details"
                    onClick={() => setSelectedRequest(request)}
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center">
              {searchTerm
                ? "No matching requests found"
                : "No pending community requests"}
            </p>
          )}
        </div>

        {filteredRequests.length > 0 && (
          <div className="px-4 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-medium">{filteredRequests.length}</span> of{" "}
              <span className="font-medium">{communityRequests.length}</span>{" "}
              requests
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button className="w-full sm:w-auto px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50">
                Previous
              </button>
              <button className="w-full sm:w-auto px-3 py-1 bg-[#1C2636] text-white rounded-md text-sm hover:bg-blue-600">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal for Demo Details */}
      {selectedDemo && (
        <div className="fixed inset-0 bg-[#00000067] bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 sm:p-6 rounded-lg w-full max-w-sm sm:max-w-md">
            <h3 className="text-lg sm:text-xl font-semibold mb-4">
              Demo Details
            </h3>
            <div className="text-sm space-y-2">
              <p>
                <strong>Name:</strong> {selectedDemo.sche_name}
              </p>
              <p>
                <strong>Email:</strong> {selectedDemo.sche_email}
              </p>
              <p>
                <strong>Phone:</strong> {selectedDemo.sche_phone}
              </p>
              <p>
                <strong>City:</strong> {selectedDemo.sche_city || "Unknown"}
              </p>
              <p>
                <strong>Date:</strong> {formatDate(selectedDemo.sche_date)}
              </p>
              <p>
                <strong>Time Slot:</strong> {selectedDemo.sche_time_slots}
              </p>
              <p>
                <strong>Note:</strong> {selectedDemo.additional_note || "N/A"}
              </p>
            </div>
            <button
              onClick={() => setSelectedDemo(null)}
              className="mt-4 w-full px-4 py-2 bg-[#1C2636] text-white rounded hover:bg-blue-600 text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Modal for Community Request Details */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-[#00000067] bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 sm:p-6 rounded-lg w-full max-w-sm sm:max-w-md">
            <h3 className="text-lg sm:text-xl font-semibold mb-4">
              Community Request Details
            </h3>
            <div className="text-sm space-y-2">
              <p>
                <strong>Name:</strong> {selectedRequest.U_Name || "Unknown"}
              </p>
              <p>
                <strong>Community:</strong> {selectedRequest.Comm_Name || "N/A"}
              </p>
              <p>
                <strong>Email:</strong> {selectedRequest.U_Email || "N/A"}
              </p>
              <p>
                <strong>Mobile:</strong> {selectedRequest.U_Mobile || "N/A"}
              </p>
              <p>
                <strong>Request Date:</strong>{" "}
                {formatDate(selectedRequest.created_at)}
              </p>
            </div>
            <button
              onClick={() => setSelectedRequest(null)}
              className="mt-4 w-full px-4 py-2 bg-[#1C2636] text-white rounded hover:bg-blue-600 text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
