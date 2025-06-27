import React, { useState, useEffect } from "react";
import { FaCheck } from "react-icons/fa6";
import { MdOutlineDelete } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
import { PiEye } from "react-icons/pi";
import Swal from "sweetalert2";

const Userrequest = ({ setActivePage, activePage }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const adminData = JSON.parse(localStorage.getItem("user"));
        const adminId = adminData?.id;

        const response = await fetch(
          "https://parivaar.app/public/api/user-list?status=0"
        );
        if (!response.ok) throw new Error("Failed to fetch user requests");

        const result = await response.json();
        const filteredRequests = result.data.filter(
          (user) => user.Comm_Id == Number(adminId)
        );

        const formattedRequests = filteredRequests.map((user) => ({
          id: user.U_Id,
          name: user.U_Name,
          number: user.U_Mobile,
          communityId: user.Comm_Id,
        }));

        setRequests(formattedRequests);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleApprove = async (id) => {
    setIsProcessing(true);
    try {
      const response = await fetch(
        "https://parivaar.app/public/api/user/action",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "approve",
            id: id,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to approve user");

      const data = await response.json();
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "User approved successfully",
        timer: 3000,
        showConfirmButton: false,
      });
      setRequests(requests.filter((request) => request.id !== id));
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async (id) => {
    setIsProcessing(true);
    try {
      const response = await fetch(
        "https://parivaar.app/public/api/user/action",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "reject",
            id: id,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to decline user");

      const data = await response.json();
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "User request rejected",
        timer: 3000,
        showConfirmButton: false,
      });
      setRequests(requests.filter((request) => request.id !== id));
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error)
    return <div className="p-8 text-center text-red-600">Error: {error}</div>;

  return (
    <div className="p-8 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">User Requests</h2>
        <RxCross2
          onClick={() => setActivePage("usersadmin")}
          className="text-2xl cursor-pointer hover:text-gray-600 transition-colors"
        />
      </div>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {successMessage}
        </div>
      )}

      <div>
        {requests.length == 0 ? (
          <p className="text-gray-600">
            No user requests found for your community.
          </p>
        ) : (
          <ul className="bg-white rounded-lg shadow-md p-6">
            {requests.map((request) => (
              <li
                key={request.id}
                className="mb-4 p-4 rounded-md border border-gray-200 hover:shadow-lg transition-shadow duration-300 flex justify-between items-center"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {request.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Number: {request.number}
                  </p>
                  <p className="text-sm text-gray-600">
                    Community ID: {request.communityId}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    className="flex items-center cursor-pointer justify-center w-8 h-8 rounded-full bg-green-600 hover:bg-green-700 text-white transition-colors duration-300 disabled:bg-gray-400"
                    onClick={() => handleApprove(request.id)}
                    disabled={isProcessing}
                  >
                    <FaCheck size={16} />
                  </button>
                  <button
                    className="flex items-center justify-center cursor-pointer w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors duration-300 disabled:bg-gray-400"
                    onClick={() => handleDecline(request.id)}
                    disabled={isProcessing}
                  >
                    <RxCross2 size={16} />
                  </button>
                  <button
                    className="flex items-center justify-center cursor-pointer w-8 h-8 rounded-full bg-blue-800 hover:bg-blue-900 text-white transition-colors duration-300"
                    // Add view functionality if needed
                  >
                    <PiEye size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Userrequest;
