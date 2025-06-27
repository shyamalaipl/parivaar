import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Users, UserPlus, UserCheck } from "lucide-react";
import { FiUserX } from "react-icons/fi";

const Admindashboard = ({ setActivePage, activePage }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMembers: 0,
    newRequests: 0,
    rejectedUsers: 0,
  });

  const data = [
    { name: "Jan", value: 400 },
    { name: "Feb", value: 300 },
    { name: "Mar", value: 500 },
    { name: "Apr", value: 700 },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get Comm_Id from localStorage
        const userData = JSON.parse(localStorage.getItem("user"));
        const commId = userData?.Comm_Id;

        const response = await fetch("https://parivaar.app/public/api/users");
        const data = await response.json();

        if (data.status == "success") {
          const users = data.users;

          // Filter users based on Comm_Id
          const committeeUsers = users.filter((user) => user.Comm_Id == commId);

          // Calculate counts
          const totalUsersCount = committeeUsers.filter(
            (user) => user.Role_Id == 4 && user.U_Status == 1
          ).length;

          const totalMembersCount = committeeUsers.filter(
            (user) => user.Role_Id == 3 && user.U_Status == 1
          ).length;

          const newRequestsCount = committeeUsers.filter(
            (user) => user.Role_Id == 4 && user.U_Status == 0
          ).length;

          const rejectedUsersCount = committeeUsers.filter(
            (user) => user.Role_Id == 4 && user.U_Status == 2
          ).length;

          setStats({
            totalUsers: totalUsersCount,
            totalMembers: totalMembersCount,
            newRequests: newRequestsCount,
            rejectedUsers: rejectedUsersCount,
          });
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  const statItems = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: <Users size={24} />,
      color: "text-[black] bg-[white]",
      onClick: () => setActivePage("usersadmin"),
    },
    {
      title: "Total Members",
      value: stats.totalMembers,
      icon: <Users size={24} />,
      color: "text-[black] bg-[white]",
      onClick: () => setActivePage("memberlist"),
    },
    {
      title: "New Requests",
      value: stats.newRequests,
      icon: <UserPlus size={24} />,
      color: "bg-[#00C951] textwhite]",
      onClick: () => setActivePage("userrequist"),
    },
    {
      title: "Rejected User",
      value: stats.rejectedUsers,
      icon: <FiUserX size={24} />,
      color: "bg-[#FF6467] text-[black]",
      onClick: () => setActivePage("userrejected"),
    },
  ];

  return (
    <>
      <div className="">
        <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {statItems.map((stat, index) => (
            <div
              key={index}
              onClick={stat.onClick}
              className="rounded-xl h-[25vh] bg-[#1A2433] text-[white] shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[white] text-sm">{stat.title}</p>
                  <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                  <div className={`text-${stat.color.split("-")[1]}-600`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Admindashboard;
