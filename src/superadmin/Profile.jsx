import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ P_Image: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [navigate, condition] = useNavigate();

  // Fields to display (all read-only except P_Image)
  const displayFields = [
    "U_Name",
    "U_Email",
    "U_Mobile",
    "Middle_Name",
    "Last_Name",
    "Address",
    "City",
    "P_Image",
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get U_Id from localStorage
        const user = JSON.parse(localStorage.getItem("user"));
        const uId = user?.U_Id;

        if (!uId) {
          throw new Error("User ID not found in localStorage");
        }

        // Fetch user data from API
        const response = await fetch("https://parivaar.app/public/api/users");
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        const result = await response.json();

        // Find user matching U_Id
        const userDataFromApi = result.data.find((user) => user.U_Id == uId);
        if (!userDataFromApi) {
          throw new Error("User not found in API response");
        }

        // Filter only required fields
        const filteredData = {};
        displayFields.forEach((field) => {
          filteredData[field] = userDataFromApi[field] || "";
        });

        setUserData(filteredData);
        setFormData({ P_Image: filteredData.P_Image || "" });
      } catch (err) {
        setError(err.message);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleEditToggle = () => {
    setEditMode(!editMode);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ P_Image: reader.result });
      };
      reader.readAsDataURL(file); // Convert to base64
    }
  };

  const handleSave = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const uId = user?.U_Id;

      if (!uId) {
        throw new Error("User ID not found in localStorage");
      }

      // Send only P_Image in the PUT request
      const response = await fetch(
        `https://parivaar.app/public/api/users/${uId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ P_Image: formData.P_Image }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update profile image");
      }

      const updatedData = await response.json();
      // Update only P_Image in userData
      setUserData((prev) => ({
        ...prev,
        P_Image: updatedData.data.P_Image || formData.P_Image,
      }));
      setEditMode(false);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 pt-20">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">User Profile</h1>

        {loading ? (
          <p className="text-gray-500">Loading user data...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : userData ? (
          <div className="space-y-4">
            {editMode ? (
              <div className="space-y-4">
                {/* Display all fields as read-only except P_Image */}
                {displayFields.map((key) => (
                  <div key={key} className="flex flex-col">
                    <label className="text-sm font-medium text-gray-500 capitalize">
                      {key.replace("_", " ")}
                    </label>
                    {key == "P_Image" ? (
                      <>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="mt-1 p-2 border border-gray-300 rounded-md"
                        />
                        {formData.P_Image && (
                          <img
                            src={formData.P_Image}
                            alt="Profile"
                            className="mt-2 w-32 h-32 object-cover rounded-md"
                          />
                        )}
                      </>
                    ) : (
                      <p className="mt-1 text-lg text-gray-800">
                        {userData[key] || (
                          <span className="text-gray-400">Not available</span>
                        )}
                      </p>
                    )}
                  </div>
                ))}
                <div className="flex space-x-4">
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleEditToggle}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {displayFields.map((key) => (
                  <div key={key} className="border-b border-gray-100 pb-4">
                    <h3 className="text-sm font-medium text-gray-500 capitalize">
                      {key.replace("_", " ")}
                    </h3>
                    {key == "P_Image" && userData[key] ? (
                      <img
                        src={userData[key]}
                        alt="Profile"
                        className="mt-1 w-32 h-32 object-cover rounded-md"
                      />
                    ) : (
                      <p className="mt-1 text-lg text-gray-800">
                        {userData[key] || (
                          <span className="text-gray-400">Not available</span>
                        )}
                      </p>
                    )}
                  </div>
                ))}
                <button
                  onClick={handleEditToggle}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Edit Profile Image
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500">No user data available.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
