import { useState, useEffect } from "react";
import { RxCross2 } from "react-icons/rx";
import { MdOutlineDelete } from "react-icons/md";
import Swal from "sweetalert2";
 // Adjust the path to your logo image
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
        // background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        // backdropFilter: "blur(5px)",
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

const Userrejected = ({ setActivePage, activePage }) => {
  const [rejectedUsers, setRejectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRejectedUsers = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        const commId = userData?.Comm_Id;

        if (!commId) {
          throw new Error("Comm_Id not found in localStorage");
        }

        const response = await fetch("https://parivaar.app/public/api/users");
        if (!response.ok) {
          throw new Error("Failed to fetch rejected users");
        }

        const result = await response.json();
        const userList = result.data || [];
        if (!Array.isArray(userList)) {
          throw new Error("API response does not contain a users array");
        }

        const filteredUsers = userList.filter(
          (user) =>
            String(user.Comm_Id) == String(commId) &&
            user.Role_Id == 3 &&
            user.U_Status == 2
        );

        const formattedUsers = filteredUsers.map((user) => ({
          id: user.U_Id,
          username: user.U_Name || "Unknown",
          number: user.U_Mobile || "N/A",
          committeeId: user.Comm_Id,
          email: user.U_Email || "N/A",
          date: user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A",
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

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      background: '#fff',
      backdrop: `
        rgba(0,0,0,0.4)
        url("/images/nyan-cat.gif")
        left top
        no-repeat
      `
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(
            `https://parivaar.app/public/api/users/${id}`,
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

          setRejectedUsers(rejectedUsers.filter((user) => user.id !== id));
          Swal.fire({
            title: "Deleted!",
            text: "User has been deleted.",
            icon: "success",
            background: '#f0fdf4',
            iconColor: '#10b981',
            confirmButtonColor: '#059669'
          });
        } catch (error) {
          Swal.fire({
            title: "Error!",
            text: "Failed to delete user: " + error.message,
            icon: "error",
            background: '#fef2f2',
            iconColor: '#ef4444'
          });
        }
      }
    });
  };

  if (loading) {
    return <CustomLogoLoader />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#fdf9f7] to-[#f0f4ff]">
        <div className="max-w-md p-6 bg-white rounded-xl shadow-md">
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 className="mt-4 text-xl font-bold text-gray-900 text-center">Error Occurred</h3>
          <p className="mt-2 text-gray-600 text-center">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f4f4] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
              <span className="bg-red-100 text-red-800 p-2 rounded-full mr-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </span>
              Rejected Users
              <span className="ml-3 bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full">
                {rejectedUsers.length} {rejectedUsers.length === 1 ? 'user' : 'users'}
              </span>
            </h1>
            <p className="text-gray-600 mt-2">Manage users who have been rejected from your community</p>
          </div>
          <button
            onClick={() => setActivePage("usersadmin")}
            className="p-2 rounded-full bg-white shadow-sm hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <RxCross2 className="text-xl text-gray-600" />
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {rejectedUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Committee
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Rejected
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rejectedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                            <span className="text-red-600 font-medium">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.username}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.number}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          {user.committeeId}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition-colors"
                          title="Permanently delete"
                        >
                          <MdOutlineDelete size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center p-12">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No rejected users</h3>
              <p className="mt-1 text-gray-500">There are currently no rejected users in your community.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Userrejected;