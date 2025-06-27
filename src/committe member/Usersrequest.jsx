import React, { useState, useEffect } from "react";
import { FaCheck } from "react-icons/fa6";
import { MdOutlineDelete } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
import { PiEye } from "react-icons/pi";
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

const Userrequest = ({ setActivePage, activePage }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetailsLoading, setUserDetailsLoading] = useState(false);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        const commId = userData?.Comm_Id;

        if (!commId) {
          throw new Error("Comm_Id not found in localStorage");
        }

        const response = await fetch("https://parivaar.app/public/api/users");
        if (!response.ok) {
          throw new Error("Failed to fetch user requests");
        }

        const result = await response.json();
        const userList = result.data || [];
        if (!Array.isArray(userList)) {
          throw new Error("API response does not contain a users array");
        }

        const filteredRequests = userList.filter(
          (user) =>
            String(user.Comm_Id) == String(commId) &&
            user.Role_Id == 3 &&
            user.U_Status == 0
        );

        const formattedRequests = filteredRequests.map((user) => ({
          id: user.U_Id,
          name: user.U_Name || "Unknown",
          number: user.U_Mobile || "N/A",
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
        `https://parivaar.app/public/api/users/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            U_Status: 1,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to approve user");
      }

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "User approved successfully",
        timer: 3000,
        showConfirmButton: false,
        background: '#f0fdf4',
        iconColor: '#10b981'
      });
      setRequests(requests.filter((request) => request.id !== id));
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
        background: '#fef2f2',
        iconColor: '#ef4444'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async (id) => {
    setIsProcessing(true);
    try {
      const response = await fetch(
        `https://parivaar.app/public/api/users/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            U_Status: 2,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to decline user");
      }

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "User request rejected",
        timer: 3000,
        showConfirmButton: false,
        background: '#f0fdf4',
        iconColor: '#10b981'
      });
      setRequests(requests.filter((request) => request.id !== id));
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
        background: '#fef2f2',
        iconColor: '#ef4444'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleView = async (id) => {
    setUserDetailsLoading(true);
    setShowModal(true);
    try {
      const response = await fetch(
        `https://parivaar.app/public/api/users/${id}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch user details");
      }
      const result = await response.json();
      setSelectedUser(result.data || {});
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
        background: '#fef2f2',
        iconColor: '#ef4444'
      });
      setShowModal(false);
    } finally {
      setUserDetailsLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  if (loading) return <CustomLogoLoader />;

  if (error) return (
    <div className="p-8 text-center">
      <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-lg p-6 shadow-sm">
        <div className="text-red-600 font-medium mb-2">Error</div>
        <p className="text-red-700">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-[#fdf9f7] to-[#f0f4ff] min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            User Requests
            <span className="ml-2 bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
              {requests.length} pending
            </span>
          </h2>
          <button
            onClick={() => setActivePage("usersadmin")}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <RxCross2 className="text-2xl text-gray-600" />
          </button>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg shadow-sm">
            <div className="flex items-center text-green-800">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {successMessage}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {requests.length === 0 ? (
            <div className="p-8 text-center">
              <div className="max-w-md mx-auto">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">No pending requests</h3>
                <p className="mt-1 text-gray-500">There are currently no user requests for your community.</p>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {requests.map((request) => (
                <li key={request.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {request.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{request.name}</h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                          <p className="text-sm text-gray-600 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                            </svg>
                            {request.number}
                          </p>
                          <p className="text-sm text-gray-600 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            Community ID: {request.communityId}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApprove(request.id)}
                        disabled={isProcessing}
                        className="p-2 rounded-full bg-green-100 hover:bg-green-200 text-green-700 transition-colors disabled:opacity-50"
                        title="Approve"
                      >
                        <FaCheck size={16} />
                      </button>
                      <button
                        onClick={() => handleDecline(request.id)}
                        disabled={isProcessing}
                        className="p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-700 transition-colors disabled:opacity-50"
                        title="Decline"
                      >
                        <RxCross2 size={16} />
                      </button>
                      <button
                        onClick={() => handleView(request.id)}
                        className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors"
                        title="View Details"
                      >
                        <PiEye size={16} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Modal for User Details */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800">User Details</h3>
              <button
                onClick={closeModal}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <RxCross2 className="text-2xl text-gray-600" />
              </button>
            </div>
            
            <div className="p-6">
              {userDetailsLoading ? (
                <CustomLogoLoader />
              ) : selectedUser ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Personal Information</h4>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <span className="w-24 text-sm text-gray-600">Name:</span>
                          <span className="text-sm font-medium text-gray-900">{selectedUser.U_Name || "N/A"}</span>
                        </div>
                        <div className="flex items-start">
                          <span className="w-24 text-sm text-gray-600">Mobile:</span>
                          <span className="text-sm font-medium text-gray-900">{selectedUser.U_Mobile || "N/A"}</span>
                        </div>
                        <div className="flex items-start">
                          <span className="w-24 text-sm text-gray-600">Email:</span>
                          <span className="text-sm font-medium text-gray-900">{selectedUser.U_Email || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Dates</h4>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <span className="w-24 text-sm text-gray-600">Created At:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {selectedUser.created_at
                              ? new Date(selectedUser.created_at).toLocaleString()
                              : "N/A"}
                          </span>
                        </div>
                        <div className="flex items-start">
                          <span className="w-24 text-sm text-gray-600">Updated At:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {selectedUser.updated_at
                              ? new Date(selectedUser.updated_at).toLocaleString()
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Account Information</h4>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <span className="w-24 text-sm text-gray-600">Community ID:</span>
                          <span className="text-sm font-medium text-gray-900">{selectedUser.Comm_Id || "N/A"}</span>
                        </div>
                        <div className="flex items-start">
                          <span className="w-24 text-sm text-gray-600">Role:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {selectedUser.Role_Id === 3 ? "Member" : "N/A"}
                          </span>
                        </div>
                        <div className="flex items-start">
                          <span className="w-24 text-sm text-gray-600">Status:</span>
                          <span className={`text-sm font-medium ${
                            selectedUser.U_Status == 0 ? 'text-yellow-600' :
                            selectedUser.U_Status == 1 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {selectedUser.U_Status == 0
                              ? "Pending"
                              : selectedUser.U_Status == 1
                              ? "Approved"
                              : "Rejected"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No details available</h3>
                  <p className="mt-1 text-sm text-gray-500">Could not load user information.</p>
                </div>
              )}
            </div>
            
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Userrequest;