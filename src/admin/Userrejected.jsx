import { useState, useEffect } from "react";
import { RxCross2 } from "react-icons/rx";

const Userrejected = ({ setActivePage, activePage }) => {
  const [rejectedUsers, setRejectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRejectedUsers = async () => {
      try {
        // Get admin data from localStorage
        const adminData = JSON.parse(localStorage.getItem("user"));
        const adminId = adminData?.id;

        if (!adminId) {
          throw new Error("Admin ID not found in localStorage");
        }

        // Fetch rejected users from API
        const response = await fetch(
          "https://parivaar.app/public/api/user-list?status=2"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch rejected users");
        }

        const result = await response.json();

        // Filter users where Comm_Id matches admin's id
        const filteredUsers = result.data.filter(
          (user) => user.Comm_Id == Number(adminId)
        );

        // Format the data for display
        const formattedUsers = filteredUsers.map((user) => ({
          id: user.U_Id,
          username: user.U_Name,
          number: user.U_Mobile,
          committeeId: user.Comm_Id,
        }));

        setRejectedUsers(formattedUsers);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchRejectedUsers();
  }, []);

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center mb-6 justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            🚫 Rejected Users
          </h2>
        </div>
        <div>
          <RxCross2
            onClick={() => setActivePage("usersadmin")}
            className="text-2xl cursor-pointer hover:text-gray-600 transition-colors"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-white shadow-lg rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gradient-to-r from-red-500 to-red-600 text-white text-left">
              <th className="p-4 text-lg">Username</th>
              <th className="p-4 text-lg">Number</th>
              <th className="p-4 text-lg">Committee ID</th>
            </tr>
          </thead>
          <tbody>
            {rejectedUsers.length > 0 ? (
              rejectedUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b hover:bg-gray-100 transition duration-200"
                >
                  <td className="p-4 font-medium text-gray-700">
                    {user.username}
                  </td>
                  <td className="p-4 text-gray-600">{user.number}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 text-sm font-semibold text-black rounded-full">
                      {user.committeeId}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center p-6 text-gray-500">
                  ❌ No rejected users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Userrejected;
