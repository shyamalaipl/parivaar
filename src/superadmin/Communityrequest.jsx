import React, { useState, useEffect } from "react";
import { FaCheck } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import logoImage from "../../src/img/parivarlogo1.png"; // Adjust path
import toast, { Toaster } from "react-hot-toast";

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

const Communityrequest = ({ setActivePage, activePage }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://parivaar.app/public/api/users", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);
        const result = await response.json();
        const filteredData = result.data.filter(
          (item) => item.Role_Id == 2 && item.U_Status == 0
        );
        const mappedData = filteredData.map((user) => ({
          id: user.U_Id,
          name: user.U_Name,
          number: user.U_Mobile,
          email: user.U_Email,
          communityname: user.Comm_Name || "N/A",
          commId: user.Comm_Id || "N/A",
          panNo: user.PAN_No || "N/A",
        }));
        setRequests(mappedData);
        setLoading(false);
      } catch (error) {
        setError(`Failed to fetch data from the API: ${error.message}`);
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleApprove = async (id) => {
    try {
      setActionLoading(true);
      const payload = { U_Status: 1 };
      const response = await fetch(
        `https://parivaar.app/public/api/users/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        setRequests(requests.filter((request) => request.id !== id));
        toast.success("Request Approved Successfully!", {
          duration: 3000,
          position: "top-right",
        });
      } else {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    } catch (error) {
      setError("Error approving request: " + error.message);
      toast.error("Failed to Approve Request!", {
        duration: 3000,
        position: "top-right",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async (id) => {
    try {
      setActionLoading(true);
      const payload = { U_Status: 2 };
      const response = await fetch(
        `https://parivaar.app/public/api/users/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        setRequests(requests.filter((request) => request.id !== id));
        toast.success("Request Rejected Successfully!", {
          duration: 3000,
          position: "top-right",
        });
      } else {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    } catch (error) {
      setError("Error rejecting request: " + error.message);
      toast.error("Failed to Reject Request!", {
        duration: 3000,
        position: "top-right",
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <CustomLogoLoader />;
  if (error)
    return <div className="p-8 text-red-600 text-center">Error: {error}</div>;

  return (
    <div className="px-2 py-0 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {actionLoading && <CustomLogoLoader />}
      <Toaster />
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-3xl font-bold bg-gradient-to-r text-[#132756] bg-clip-text">
          User Requests
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
            <thead className="bg-[#182131] text-white">
              <tr>
                <th className="p-4 text-left font-semibold">Name</th>
                <th className="p-4 text-left font-semibold">Number</th>
                <th className="p-4 text-left font-semibold">Email</th>
                <th className="p-4 text-left font-semibold">Community Name</th>
                <th className="p-4 text-left font-semibold">Code</th>
                <th className="p-4 text-left font-semibold">PAN No</th>
                <th className="p-4 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length > 0 ? (
                requests.map((request, index) => (
                  <tr
                    key={request.id}
                    className={`border-b border-gray-200 hover:bg-gray-50 transition-all duration-200 ${
                      index % 2 == 0 ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    <td className="p-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {request.name || "N/A"}
                      </span>
                    </td>
                    <td className="p-4 text-gray-700">
                      {request.number || "N/A"}
                    </td>
                    <td className="p-4 text-gray-700">
                      {request.email || "N/A"}
                    </td>
                    <td className="p-4 font-medium text-gray-900">
                      {request.communityname}
                    </td>
                    <td className="p-4 text-gray-700">{request.commId}</td>
                    <td className="p-4 text-gray-700">{request.panNo}</td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center space-x-3">
                        <button
                          onClick={() => handleApprove(request.id)}
                          className="p-2 rounded-full bg-green-500 text-white hover:bg-green-600 transform hover:scale-105 transition-all duration-200"
                          title="Approve"
                        >
                          <FaCheck size={16} />
                        </button>
                        <button
                          onClick={() => handleDecline(request.id)}
                          className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transform hover:scale-105 transition-all duration-200"
                          title="Decline"
                        >
                          <RxCross2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center p-6 text-gray-500">
                    ❌ No User Requests
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

export default Communityrequest;
