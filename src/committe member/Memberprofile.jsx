import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Heart,
  Book,
  Home,
  Calendar,
  Code,
  CircleChevronLeft,
} from "lucide-react";
import Swal from "sweetalert2";
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
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        backdropFilter: "blur(5px)",
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

const MemberProfile = ({ setActivePage }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [originalProfile, setOriginalProfile] = useState({});
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showEnlargedImage, setShowEnlargedImage] = useState(false);
  const [isNewProfile, setIsNewProfile] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const sections = {
    "Personal Information": [
      { icon: User, label: "Name", name: "U_Name" },
      { icon: User, label: "Middle Name", name: "Middle_Name" },
      { icon: User, label: "Last Name", name: "Last_Name" },
      { icon: Mail, label: "Email", name: "U_Email" },
      {
        icon: Phone,
        label: "Mobile",
        name: "U_Mobile",
        type: "tel",
        maxLength: 10,
      },
      { icon: Heart, label: "Gender", name: "Gender", type: "radio" }, // Updated to radio
      {
        icon: Heart,
        label: "Marital Status",
        name: "Marital_Status",
        type: "select",
      }, // Updated to select
      { icon: Calendar, label: "Date of Birth", name: "DOB", type: "date" },
      { icon: MapPin, label: "Address", name: "Address" },
      { icon: Home, label: "City", name: "City" },
      { icon: Home, label: "State", name: "State" },
      { icon: Home, label: "Country", name: "Country" },
      { icon: MapPin, label: "Zipcode", name: "Zipcode" },
    ],
    "Professional Information": [
      { icon: Briefcase, label: "Occupation", name: "Occupation" },
      {
        icon: Briefcase,
        label: "Occupation Address",
        name: "Occupation_Address",
      },
    ],
    Education: [
      { icon: Book, label: "School Education", name: "Education_School" },
      { icon: Book, label: "School Name", name: "School_Name" },
      { icon: Book, label: "College Education", name: "Education_College" },
      { icon: Book, label: "College Name", name: "College_Name" },
    ],
    "Community Information": [
      { icon: User, label: "Community", name: "Comm_Name", readOnly: true },
      { icon: Code, label: "Community Code", name: "Comm_Id", readOnly: true },
    ],
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (!userData || !userData.U_Id) {
        setLoading(false);
        setIsNewProfile(true);
        return;
      }

      try {
        const response = await fetch("https://parivaar.app/public/api/users");
        const result = await response.json();

        if (result.status == "success" && Array.isArray(result.data)) {
          const matchedUser = result.data.find(
            (user) => user.U_Id == userData.U_Id
          );

          const userProfile = {
            U_Name: userData.U_Name || "",
            U_Email: userData.U_Email || "",
            U_Mobile: userData.U_Mobile || "",
            U_Status: 1,
            Comm_Id: userData.Comm_Id || "",
            Middle_Name: "",
            Last_Name: "",
            Address: "",
            City: "",
            State: "",
            Country: "",
            Zipcode: "",
            Gender: "",
            Occupation: "",
            Marital_Status: "",
            Education_School: "",
            Education_College: "",
            P_Image: "",
            School_Name: "",
            College_Name: "",
            Occupation_Address: "",
            DOB: "",
            Comm_Name: "",
          };

          if (matchedUser) {
            Object.assign(userProfile, {
              U_Name: matchedUser.U_Name || userData.U_Name || "",
              U_Email: matchedUser.U_Email || userData.U_Email || "",
              U_Mobile: matchedUser.U_Mobile || userData.U_Mobile || "",
              U_Status: matchedUser.U_Status == 1 ? 1 : 0,
              Comm_Id: matchedUser.Comm_Id || userData.Comm_Id || "",
              Middle_Name: matchedUser.Middle_Name || "",
              Last_Name: matchedUser.Last_Name || "",
              Address: matchedUser.Address || "",
              City: matchedUser.City || "",
              State: matchedUser.State || "",
              Country: matchedUser.Country || "",
              Zipcode: matchedUser.Zipcode || "",
              Gender: matchedUser.Gender || "",
              Occupation: matchedUser.Occupation || "",
              Marital_Status: matchedUser.Marital_Status || "",
              Education_School: matchedUser.Education_School || "",
              Education_College: matchedUser.Education_College || "",
              P_Image: matchedUser.P_Image || "",
              School_Name: matchedUser.School_Name || "",
              College_Name: matchedUser.College_Name || "",
              Occupation_Address: matchedUser.Occupation_Address || "",
              DOB: matchedUser.DOB || "",
              Comm_Name: matchedUser.Comm_Name || "",
            });
            setIsNewProfile(false);
          } else {
            setIsNewProfile(true);
          }

          setProfile(userProfile);
          setOriginalProfile(userProfile);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch user data",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name == "U_Mobile" && value.length > 10) return;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getChangedFields = () => {
    const changedFields = {};
    Object.keys(profile).forEach((key) => {
      if (profile[key] !== originalProfile[key] && key !== "P_Image") {
        if (key == "U_Status") {
          changedFields[key] = profile[key] == "Active" ? 1 : 0;
        } else if (key == "Education_School" || key == "Education_College") {
          changedFields[key] = profile[key] ? parseFloat(profile[key]) : null;
        } else if (profile[key] !== "") {
          changedFields[key] = profile[key];
        }
      }
    });
    return changedFields;
  };

  const handleSave = async () => {
    setIsEditing(false);
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const changedFields = getChangedFields();

      if (Object.keys(changedFields).length == 0 && !imageFile) {
        Swal.fire({
          icon: "info",
          title: "No Changes",
          text: "No changes to save.",
        });
        return;
      }

      let newImageUrl = profile.P_Image;

      if (isNewProfile) {
        const formData = new FormData();
        Object.entries(profile).forEach(([key, value]) => {
          if (value && key !== "P_Image") formData.append(key, value);
        });
        if (imageFile) formData.append("P_Image", imageFile);
        formData.append("U_Id", userData.U_Id);

        const response = await fetch("https://parivaar.app/public/api/users", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(JSON.stringify(errorData));
        }

        const result = await response.json();
        newImageUrl = result.data?.P_Image || newImageUrl;
        setIsNewProfile(false);
      } else {
        const payload = {
          U_Id: userData.U_Id,
          ...changedFields,
        };

        if (imageFile) {
          const reader = new FileReader();
          const base64Image = await new Promise((resolve) => {
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(imageFile);
          });
          payload.P_Image = base64Image;
        }

        const response = await fetch(
          `https://parivaar.app/public/api/users/${userData.U_Id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(JSON.stringify(errorData));
        }

        const result = await response.json();
        newImageUrl = result.data?.P_Image || newImageUrl;
      }

      const updatedProfile = {
        ...profile,
        P_Image: newImageUrl,
      };

      const updatedLocalStorage = {
        ...userData,
        U_Name: profile.U_Name,
        U_Email: profile.U_Email,
        U_Mobile: profile.U_Mobile,
      };
      localStorage.setItem("user", JSON.stringify(updatedLocalStorage));

      setProfile(updatedProfile);
      setOriginalProfile(updatedProfile);
      setImageFile(null);
      setSelectedImage(null);

      Swal.fire({
        icon: "success",
        title: "Success",
        text: isNewProfile
          ? "Profile created successfully!"
          : "Profile updated successfully!",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Failed to save profile: ${error.message}`,
      });
    }
  };

  if (loading) {
    return <CustomLogoLoader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br py-2 ">
      <div className="mx-auto bg-white rounded-2xl overflow-hidden">
        <div className="bg-[#1A2B49] p-6">
          <div className="flex justify-between items-center">
            <button
              className="flex cursor-pointer items-center text-white"
              onClick={() => setActivePage("dashboardmember")}
            >
              <CircleChevronLeft size={30} className="mr-2" />
            </button>
            <h1 className="text-3xl font-bold text-white">Member Profile</h1>
            <div className="space-x-3">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  isEditing
                    ? "bg-white text-[#1A2B49] hover:bg-gray-100"
                    : "bg-blue-500 text-white hover:bg-blue-400"
                }`}
              >
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
              {isEditing && (
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-400 transition-all duration-300"
                >
                  Save Changes
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-shrink-0">
              <div className="relative group">
                <img
                  src={
                    selectedImage ||
                    profile.P_Image ||
                    "https://via.placeholder.com/150"
                  }
                  alt="Profile"
                  className="w-40 h-40 rounded-full object-cover border-4 border-blue-100 shadow-lg transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                  onClick={() => setShowEnlargedImage(true)}
                />
                {isEditing && (
                  <div className="mt-4">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Change Profile Picture
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1">
              {Object.entries(sections).map(([sectionName, fields]) => (
                <div key={sectionName} className="mb-8">
                  <h2 className="text-xl font-semibold text-[#1A2B49] mb-4">
                    {sectionName}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {fields.map((field) => (
                      <div
                        key={field.name}
                        className={`bg-white p-4 rounded-xl border transition-all duration-300 ${
                          isEditing && !field.readOnly
                            ? "border-blue-200 shadow-md hover:shadow-lg"
                            : "border-gray-100"
                        }`}
                      >
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center gap-2 text-[#1A2B49]">
                            <field.icon size={20} />
                            <span className="font-medium text-sm">
                              {field.label}
                            </span>
                          </div>
                          {field.type == "radio" && field.name == "Gender" ? (
                            isEditing && !field.readOnly ? (
                              <div className="flex items-center space-x-6">
                                <label className="inline-flex items-center">
                                  <input
                                    type="radio"
                                    className="form-radio text-[#1A2B49]"
                                    name="Gender"
                                    value="Male"
                                    checked={profile.Gender == "Male"}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                  />
                                  <span className="ml-2">Male</span>
                                </label>
                                <label className="inline-flex items-center">
                                  <input
                                    type="radio"
                                    className="form-radio text-[#1A2B49]"
                                    name="Gender"
                                    value="Female"
                                    checked={profile.Gender == "Female"}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                  />
                                  <span className="ml-2">Female</span>
                                </label>
                              </div>
                            ) : (
                              <p className="text-gray-800 font-medium">
                                {profile.Gender || "Not provided"}
                              </p>
                            )
                          ) : field.type == "select" &&
                            field.name == "Marital_Status" ? (
                            isEditing && !field.readOnly ? (
                              <select
                                name="Marital_Status"
                                value={profile.Marital_Status || ""}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2B49] bg-gray-50"
                                disabled={!isEditing}
                              >
                                <option value="">Select Marital Status</option>
                                <option value="Married">Married</option>
                                <option value="Single">Single</option>
                              </select>
                            ) : (
                              <p className="text-gray-800 font-medium">
                                {profile.Marital_Status || "Not provided"}
                              </p>
                            )
                          ) : isEditing && !field.readOnly ? (
                            <input
                              type={field.type || "text"}
                              name={field.name}
                              value={profile[field.name] || ""}
                              onChange={handleChange}
                              maxLength={field.maxLength}
                              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2B49] bg-gray-50"
                              placeholder={`Enter ${field.label}`}
                            />
                          ) : (
                            <p className="text-gray-800 font-medium">
                              {profile[field.name] || "Not provided"}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showEnlargedImage && (
        <div
          className="fixed inset-0 bg-[#0000008b] bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setShowEnlargedImage(false)}
        >
          <img
            src={
              selectedImage ||
              profile.P_Image ||
              "https://via.placeholder.com/150"
            }
            alt="Enlarged Profile"
            className="max-w-[90%] max-h-[90vh] object-contain rounded-lg"
          />
        </div>
      )}
    </div>
  );
};

export default MemberProfile;
