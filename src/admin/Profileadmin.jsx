import React, { useState, useEffect } from "react";
import { User, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { RxCross2 } from "react-icons/rx";
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
        background: "",
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
          margin: "0px 0px 0px 160px",
          animation: "spin 1s linear infinite",
          filter: "drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))",
        }}
      />
    </div>
  );
};
const Profileadmin = ({ setActivePage }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    mobile: "",
    name: "",
    cast: "",
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchCommitteeData = async () => {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (!userData || userData.role_id !== 2) {
        navigate("/");
        return;
      }

      const commId = userData.id;

      try {
        const response = await fetch(
          "https://parivaar.app/public/api/committee"
        );
        const result = await response.json();

        if (result.status == "success") {
          const matchedCommittee = result.data.find(
            (committee) => committee.Comm_Id == commId
          );

          if (matchedCommittee) {
            setFormData({
              username: matchedCommittee.Comm_Username || "",
              email: matchedCommittee.Comm_Email || userData.email,
              mobile: matchedCommittee.Comm_Mobile || userData.mobile,
              name: matchedCommittee.Comm_Name || "",
              cast: matchedCommittee.Comm_Cast || "",
            });
          } else {
            Swal.fire({
              icon: "info",
              title: "No Match",
              text: "No committee found for this Comm_Id",
              confirmButtonColor: "#1A2B49",
            });
            setFormData({
              username: userData.name || "",
              email: userData.email || "",
              mobile: userData.mobile || "",
              name: "",
              cast: "",
            });
          }
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Fetch Error",
          text: error.message,
          confirmButtonColor: "#1A2B49",
        });
        const userData = JSON.parse(localStorage.getItem("user"));
        setFormData({
          username: userData.name || "",
          email: userData.email || "",
          mobile: userData.mobile || "",
          name: "",
          cast: "",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCommitteeData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSaveChanges = async () => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const commId = userData.id;

    try {
      const response = await fetch(
        `https://parivaar.app/public/api/committee/${commId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            Comm_Username: formData.username,
            Comm_Email: formData.email,
            Comm_Mobile: formData.mobile,
            Comm_Name: formData.name,
            Comm_Cast: formData.cast,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update committee data");
      }

      const result = await response.json();
      Swal.fire({
        icon: "success",
        title: "Updated",
        text: "Committee data updated successfully",
        confirmButtonColor: "#1A2B49",
      });
      setIsEditing(false);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Update Error",
        text: error.message,
        confirmButtonColor: "#1A2B49",
      });
    }
  };

  const clearLocalStorage = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  if (loading) {
    return <CustomLogoLoader />;
  }

  return (
    <div className="min-h-screen bg-gray-50 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex">
            <div className="w-64 bg-[#1A2B49] p-6 text-white">
              <nav className="space-y-2">
                <button className="flex items-center gap-1 text-white bg-white/10 w-full p-2 rounded-lg">
                  <User size={20} />
                  <span>Personal Information</span>
                </button>
                <Link to="/">
                  <button
                    onClick={clearLocalStorage}
                    className="flex items-center space-x-3 text-gray-300 hover:bg-white/10 w-full p-3 rounded-lg"
                  >
                    <LogOut size={20} />
                    <span>Log Out</span>
                  </button>
                </Link>
              </nav>
            </div>

            <div className="flex-1 p-8">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Personal Information</h1>
                <RxCross2
                  onClick={() => setActivePage("admindashboard")}
                  className="text-bold text-2xl cursor-pointer"
                />
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1A2B49] focus:ring focus:ring-[#1A2B49] focus:ring-opacity-50"
                      value={formData.username}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1A2B49] focus:ring focus:ring-[#1A2B49] focus:ring-opacity-50"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Mobile
                    </label>
                    <input
                      type="tel"
                      name="mobile"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1A2B49] focus:ring focus:ring-[#1A2B49] focus:ring-opacity-50"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Community Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1A2B49] focus:ring focus:ring-[#1A2B49] focus:ring-opacity-50"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Cast
                  </label>
                  <input
                    type="text"
                    name="cast"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1A2B49] focus:ring focus:ring-[#1A2B49] focus:ring-opacity-50"
                    value={formData.cast}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1A2B49]"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveChanges}
                        className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1A2B49] hover:bg-[#243B6B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1A2B49]"
                      >
                        Save Changes
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1A2B49] hover:bg-[#243B6B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1A2B49]"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profileadmin;
