import React, { useState, useEffect } from "react";
import axios from "axios";
import { CircleChevronLeft, Cross } from "lucide-react";
import { Link } from "react-router-dom";

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

const Communitydetails = () => {
  const [communityData, setCommunityData] = useState([]);
  const [commName, setCommName] = useState("");
  const [commId, setCommId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [enlargedImage, setEnlargedImage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        const communityId = userData?.Comm_Id;

        if (!communityId) {
          setError("Community ID not found in local storage");
          setLoading(false);
          return;
        }

        setCommId(communityId);

        const response = await axios.get(
          "https://parivaar.app/public/api/users"
        );
        const users = response.data.data;

        const filteredData = users.filter(
          (user) => user.Comm_Id == communityId
        );
        const community = filteredData[0]?.Comm_Name || "Community";
        setCommName(community);
        setCommunityData(filteredData);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch community data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const admins = communityData.filter((user) => user.Role_Id == 2);
  const members = communityData.filter((user) => user.Role_Id == 3);

  if (loading) return <CustomLogoLoader />;

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-500 max-w-md p-4 bg-red-50 rounded-lg">
          <svg
            className="w-12 h-12 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-lg font-medium">{error}</p>
        </div>
      </div>
    );

  const UserCard = ({ user, compact = false }) => (
    <div
      className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl ${
        compact ? "p-4" : "p-6 mb-6"
      }`}
    >
      <div
        className={`flex ${
          compact ? "flex-col" : "flex-col md:flex-row"
        } items-center gap-6`}
      >
        <div
          className={`${
            compact ? "w-20 h-20" : "w-32 h-32"
          } rounded-full overflow-hidden bg-gray-200 flex-shrink-0 cursor-pointer transition-transform duration-300 hover:scale-105`}
          onClick={() => user.P_Image && setEnlargedImage(user.P_Image)}
          aria-label="View profile image"
        >
          {user.P_Image ? (
            <img
              src={user.P_Image}
              alt={user.U_Name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <svg
              className="w-full h-full text-gray-400"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          )}
        </div>

        <div className="flex-1 w-full">
          <h3
            className={`${
              compact ? "text-lg" : "text-2xl"
            } font-bold text-gray-800 mb-2 text-center md:text-left`}
          >
            {user.U_Name}
          </h3>
          <div
            className={`grid ${
              compact ? "grid-cols-1 gap-2" : "grid-cols-1 sm:grid-cols-2 gap-4"
            }`}
          >
            <p className="text-gray-600 break-words">
              <span className="font-semibold">Email:</span>{" "}
              {user.U_Email || "N/A"}
            </p>
            <p className="text-gray-600">
              <span className="font-semibold">Mobile:</span>{" "}
              {user.U_Mobile || "N/A"}
            </p>
            {!compact && (
              <>
                <p className="text-gray-600">
                  <span className="font-semibold">Role:</span>{" "}
                  {user.role?.Role_Name || "N/A"}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Address:</span>{" "}
                  {user.Address || "N/A"}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">City:</span>{" "}
                  {user.City || "N/A"}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">State:</span>{" "}
                  {user.State || "N/A"}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Country:</span>{" "}
                  {user.Country || "N/A"}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Zipcode:</span>{" "}
                  {user.Zipcode || "N/A"}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Gender:</span>{" "}
                  {user.Gender || "N/A"}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Occupation:</span>{" "}
                  {user.Occupation || "N/A"}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Marital Status:</span>{" "}
                  {user.Marital_Status || "N/A"}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">DOB:</span>{" "}
                  {user.DOB || "N/A"}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const MemberCard = ({ user }) => (
    <div
      className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:bg-blue-50"
      onClick={() => setSelectedUser(user)}
      role="button"
      tabIndex="0"
      aria-label={`View details of ${user.U_Name}`}
      onKeyPress={(e) => e.key == "Enter" && setSelectedUser(user)}
    >
      <div
        className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 mb-4 cursor-pointer transition-transform duration-300 hover:scale-110"
        onClick={(e) => {
          e.stopPropagation();
          user.P_Image && setEnlargedImage(user.P_Image);
        }}
        aria-label="View profile image"
      >
        {user.P_Image ? (
          <img
            src={user.P_Image}
            alt={user.U_Name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <svg
            className="w-full h-full text-gray-400"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        )}
      </div>
      <h3 className="text-lg font-semibold text-gray-800 text-center truncate w-full">
        {user.U_Name}
      </h3>
      <p className="text-gray-600 text-sm">
        {user.role?.Role_Name || "Member"}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 p-4 md:p-8">
      {/* Community Name and Code */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 md:mb-12">
        {/* Back Link */}
        <div className="div">
          <Link
            to="/home"
            className="flex items-center text-[#1A2B49] font-semibold hover:underline"
          >
            <CircleChevronLeft className="mr-1 h-5 w-5" />
            Back
          </Link>
        </div>

        <div className="div">
          {/* Community Name */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 text-center md:text-left flex-1">
            {commName}
          </h1>
        </div>

        {/* Join Code Box */}
        <div className=" px-4 py-2 rounded-lg ">
          <p className="text-sm sm:text-base md:text-lg text-gray-600 font-medium">
            <span className="font-bold text-blue-600">{commId}</span>
          </p>
        </div>
      </div>

      {/* Admins Section */}
      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
          Admins
        </h2>
        {admins.length > 0 ? (
          <div className="space-y-6">
            {admins.map((admin) => (
              <UserCard key={admin.U_Id} user={admin} />
            ))}
          </div>
        ) : (
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <p className="text-gray-600">No admins found in this community</p>
          </div>
        )}
      </section>

      {/* Members Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            Members
          </h2>
          {members.length > 0 && (
            <p className="text-gray-600">
              {members.length} member{members.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {members.length > 0 ? (
          selectedUser ? (
            <div
              className="fixed inset-0 bg-[#0000008d] bg-opacity-80  w-full flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedUser(null)}
            >
              <div
                className="relative bg-transparent max-w-2xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="absolute -top-12 right-0 px-4 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-200 transition-all duration-300 flex items-center gap-2"
                  onClick={() => setSelectedUser(null)}
                  aria-label="Close user details"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <UserCard user={selectedUser} />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {members.map((member) => (
                <MemberCard key={member.U_Id} user={member} />
              ))}
            </div>
          )
        ) : (
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <p className="text-gray-600">No members found in this community</p>
          </div>
        )}
      </section>

      {/* Enlarged Image Modal */}
      {enlargedImage && (
        <div
          className="fixed inset-0 pt-10 bg-[#00000079] bg-opacity-90 flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={() => setEnlargedImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged profile image"
        >
          {/* Close Button */}
          <button
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition duration-300"
            onClick={(e) => {
              e.stopPropagation();
              setEnlargedImage(null);
            }}
            aria-label="Close image"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Enlarged Image */}
          <img
            src={enlargedImage}
            alt="Enlarged profile"
            className="max-w-[90vw] max-h-[80vh] object-contain rounded-xl shadow-2xl border border-white/20"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default Communitydetails;
