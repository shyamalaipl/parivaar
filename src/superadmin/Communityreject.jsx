import { useState, useEffect } from "react";
import { RxCross2 } from "react-icons/rx";
import { MdOutlineDelete } from "react-icons/md";
import logoImage from "../../src/img/parivarlogo1.png"; // Adjust path

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
        className="ml-50"
        src={logoImage}
        alt="Rotating Logo"
        style={{
          width: "70px",
          height: "70px",
          animation: "spin 1s linear infinite",
          filter: "drop-shadow(0 0 5px rgba(0, 0, 0, 0.3))",
        }}
      />
    </div>
  );
};

const Communityreject = ({ setActivePage, activePage }) => {
  const [rejectedUsers, setRejectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://parivaar.app/public/api/users", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);
        const result = await response.json();
        // Filter users with Role_Id = 2 and U_Status = 2
        const filteredUsers = result.data.filter(
          (user) => user.Role_Id == 2 && user.U_Status == 2
        );
        const mappedUsers = filteredUsers.map((user) => ({
          id: user.U_Id,
          name: user.U_Name,
          number: user.U_Mobile,
          email: user.U_Email,
          communityname: user.Comm_Name || "N/A", // Fallback if Comm_Name is null
        }));
        setRejectedUsers(mappedUsers);
        setLoading(false);
      } catch (error) {
        setError("Error fetching data: " + error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `https://parivaar.app/public/api/users/${id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok)
        throw new Error(`Failed to delete user! Status: ${response.status}`);
      setRejectedUsers((prevUsers) =>
        prevUsers.filter((user) => user.id !== id)
      );
    } catch (error) {
      setError("Error deleting user: " + error.message);
    }
  };

  if (loading) return <CustomLogoLoader />;
  if (error) return <div className="p-8 text-red-600 text-center">{error}</div>;

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="flex items-center mb-8 justify-between">
        <h2 className="text-3xl font-bold bg-[#d40b04] bg-clip-text text-transparent">
          Rejected Users
        </h2>
        <button
          onClick={() => setActivePage && setActivePage("communitylist")}
          className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-all duration-300"
        >
          <RxCross2 size={24} />
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="bg-gradient-to-r from-red-400 to-red-200 text-black">
              <tr>
                <th className="p-4 text-left font-semibold">Name</th>
                <th className="p-4 text-left font-semibold">Number</th>
                <th className="p-4 text-left font-semibold">Email</th>
                <th className="p-4 text-left font-semibold">Community</th>

                <th className="p-4 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rejectedUsers.length > 0 ? (
                rejectedUsers.map((user) => (
                  <tr
                    key={user.id}
                    className={`border-b border-gray-200 hover:bg-gray-50 transition-all duration-200 ${
                      user.id % 2 == 0 ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    <td className="p-4 font-medium text-gray-900">
                      {user.name}
                    </td>
                    <td className="p-4 text-gray-700">{user.number}</td>
                    <td className="p-4 text-gray-700">{user.email}</td>
                    <td className="p-4">
                      <span className="px-3 py-1 text-sm font-semibold bg-red-100 text-red-800 rounded-full">
                        {user.communityname}
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transform hover:scale-105 transition-all duration-200"
                        title="Delete"
                      >
                        <MdOutlineDelete size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center p-6 text-gray-500">
                    ❌ No rejected users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Communityreject;
