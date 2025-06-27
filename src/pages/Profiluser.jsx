import React, { useState, useEffect } from "react";
import {
  User,
  Lock,
  LogOut,
  Calendar,
  Briefcase,
  Book,
  Pencil,
  CircleChevronLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

const Profileuser = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    postalCode: "",
    dateOfBirth: "",
    communityName: "",
    communityCode: "",
    castName: "",
    gender: "",
    middleName: "",
    city: "",
    state: "",
    country: "",
    occupationName: "",
    occupationAddress: "",
    maritalStatus: "",
    schoolPercentage: "",
    schoolName: "",
    collegeCGPA: "",
    collegeName: "",
    commId: null,
    P_Image: null,
  });

  const [activeSection, setActiveSection] = useState("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [changedField, setChangedField] = useState(null);
  const [showEnlargedImage, setShowEnlargedImage] = useState(false); // New state for enlarged image

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.U_Id && user.Comm_Id) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.U_Name || "",
        email: user.U_Email || "",
        phone: user.U_Mobile || "",
        castName: user.Role_Name || "",
        commId: user.Comm_Id || null,
      }));
      fetchUserDetails(user.U_Id);
      fetchCommunityDetails(user.Comm_Id);
    }
  }, []);

  const fetchCommunityDetails = async (commId) => {
    try {
      const response = await fetch("https://parivaar.app/public/api/users", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch community details");
      const { data } = await response.json();
      const communityUser = data.find(
        (u) => u.Comm_Id == commId && u.Role_Id == 2
      );
      if (communityUser) {
        setFormData((prev) => ({
          ...prev,
          communityName: communityUser.Comm_Name || "",
          communityCode: communityUser.Comm_Id || "",
        }));
      }
    } catch (error) {
      console.error("Error fetching community details:", error);
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      const response = await fetch("https://parivaar.app/public/api/users", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch user details");
      const { data } = await response.json();
      const userData = data.find((u) => u.U_Id == userId);
      if (userData) {
        setFormData((prev) => ({
          ...prev,
          firstName: userData.U_Name || prev.firstName,
          email: userData.U_Email || prev.email,
          phone: userData.U_Mobile || prev.phone,
          middleName: userData.Middle_Name || "",
          lastName: userData.Last_Name || "",
          address: userData.Address || "",
          city: userData.City || "",
          state: userData.State || "",
          country: userData.Country || "",
          postalCode: userData.Zipcode || "",
          gender: userData.Gender || "",
          occupationName: userData.Occupation || "",
          maritalStatus: userData.Marital_Status || "",
          schoolPercentage: userData.Education_School?.toString() || "",
          schoolName: userData.School_Name || "",
          collegeCGPA: userData.Education_College?.toString() || "",
          collegeName: userData.College_Name || "",
          commId: userData.Comm_Id || prev.commId,
          P_Image: userData.P_Image || null,
        }));
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setChangedField(name);
    if (name == "phone") {
      if (/^\d{0,10}$/.test(value)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else if (name == "schoolPercentage" || name == "collegeCGPA") {
      if (/^\d*\.?\d*$/.test(value)) {
        if (name == "collegeCGPA") {
          const numValue = parseFloat(value);
          if (value == "" || (numValue >= 0 && numValue <= 10)) {
            setFormData((prev) => ({ ...prev, [name]: value }));
          }
        } else {
          setFormData((prev) => ({ ...prev, [name]: value }));
        }
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setChangedField("P_Image");
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, P_Image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user.U_Id;
    if (!userId) return;

    if (!changedField) {
      Swal.fire({
        icon: "warning",
        title: "No Changes",
        text: "No field was modified to save.",
        confirmButtonColor: "#1A2B49",
      });
      return;
    }

    const fieldMap = {
      firstName: "U_Name",
      email: "U_Email",
      phone: "U_Mobile",
      middleName: "Middle_Name",
      lastName: "Last_Name",
      address: "Address",
      city: "City",
      state: "State",
      country: "Country",
      postalCode: "Zipcode",
      gender: "Gender",
      occupationName: "Occupation",
      maritalStatus: "Marital_Status",
      schoolPercentage: "Education_School",
      schoolName: "School_Name",
      collegeCGPA: "Education_College",
      collegeName: "College_Name",
      P_Image: "P_Image",
    };

    const payload = {
      U_Id: userId,
      [fieldMap[changedField]]:
        changedField == "schoolPercentage" || changedField == "collegeCGPA"
          ? formData[changedField]
            ? parseFloat(formData[changedField])
            : null
          : changedField == "P_Image"
          ? formData.P_Image
          : formData[changedField] || "",
    };

    try {
      const response = await fetch(
        `https://parivaar.app/public/api/users/${userId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          "Failed to update user details: " + JSON.stringify(errorData.errors)
        );
      }

      const updatedData = await response.json();
      console.log("User details updated:", updatedData);

      if (["firstName", "email", "phone"].includes(changedField)) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...user,
            U_Name: formData.firstName,
            U_Email: formData.email,
            U_Mobile: formData.phone,
          })
        );
      }

      Swal.fire({
        icon: "success",
        title: "Profile Updated",
        text: "Your profile has been successfully updated!",
        confirmButtonColor: "#1A2B49",
      });

      setIsEditing(false);
      setSelectedImage(null);
      setChangedField(null);
    } catch (error) {
      console.error("Error updating user details:", error);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "Failed to save changes: " + error.message,
        confirmButtonColor: "#1A2B49",
      });
    }
  };

  const handleDiscardChanges = () => {
    Swal.fire({
      icon: "warning",
      title: "Discard Changes?",
      text: "Are you sure you want to discard your changes?",
      showCancelButton: true,
      confirmButtonColor: "#1A2B49",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, discard",
      cancelButtonText: "No, keep editing",
    }).then((result) => {
      if (result.isConfirmed) {
        setIsEditing(false);
        setSelectedImage(null);
        setChangedField(null);
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        fetchUserDetails(user.U_Id);
        fetchCommunityDetails(user.Comm_Id);
        Swal.fire({
          icon: "info",
          title: "Changes Discarded",
          text: "Your changes have been discarded.",
          confirmButtonColor: "#1A2B49",
        });
      }
    });
  };

  const clearLocalStorage = () => {
    localStorage.removeItem("user");
  };

  const inputClass = isEditing
    ? "mt-1 block w-full p-1 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1A2B49]"
    : "mt-1 block w-full p-1 border border-gray-300 pointer-events-none";

  return (
    <>
      <div className="container mx-auto px-5">
        <nav
          className="flex items-center gap-2 mt-10 text-sm"
          aria-label="breadcrumb"
        >
          <Link to="/home" className="text-[#1A2B49] font-bold hover:underline">
            <CircleChevronLeft className="" />
          </Link>
        </nav>
      </div>
      <div className="min-h-screen mt py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="flex">
              <div className="w-64 bg-[#1A2B49] p-6 text-white">
                <div className="text-center mb-8">
                  <div className="relative inline-block">
                    <img
                      src={
                        formData.P_Image ||
                        "https://static.vecteezy.com/system/resources/previews/018/765/138/original/user-profile-icon-in-flat-style-member-avatar-illustration-on-isolated-background-human-permission-sign-business-concept-vector.jpg"
                      }
                      alt="Profile"
                      className="w-24 h-24 rounded-full mx-auto mb-4 object-cover cursor-pointer"
                      onClick={() => setShowEnlargedImage(true)} // Click handler to show enlarged image
                    />
                    <div className="absolute bottom-0 right-0 bg-green-500 w-5 h-5 rounded-full border-2 border-white"></div>
                  </div>
                  <h2 className="text-xl font-semibold">
                    {formData.firstName} {formData.lastName}
                  </h2>
                  <p className="text-gray-300">{formData.castName}</p>
                </div>

                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveSection("personal")}
                    className={`flex items-center space-x-3 w-full px-1 py-3 rounded-lg ${
                      activeSection == "personal"
                        ? "text-white bg-white/10"
                        : "text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    <User size={20} />
                    <span>Personal Information</span>
                  </button>
                  <button
                    onClick={() => setActiveSection("education")}
                    className={`flex items-center space-x-3 w-full px-1 py-3 rounded-lg ${
                      activeSection == "education"
                        ? "text-white bg-white/10"
                        : "text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    <Book size={20} />
                    <span>Education Detail</span>
                  </button>
                  <button
                    onClick={() => setActiveSection("occupation")}
                    className={`flex items-center space-x-3 w-full px-1 py-3 rounded-lg ${
                      activeSection == "occupation"
                        ? "text-white bg-white/10"
                        : "text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    <Briefcase size={20} />
                    <span>Occupation Detail</span>
                  </button>
                  <button
                    onClick={() => setActiveSection("login")}
                    className={`flex items-center space-x-3 w-full px-1 py-3 rounded-lg ${
                      activeSection == "login"
                        ? "text-white bg-white/10"
                        : "text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    <Lock size={20} />
                    <span>Login & Password</span>
                  </button>
                  <Link to="/">
                    <button
                      onClick={clearLocalStorage}
                      className="flex items-center space-x-3 text-gray-300 hover:bg-white/10 w-full px-1 py-3 rounded-lg"
                    >
                      <LogOut size={20} />
                      <span>Log Out</span>
                    </button>
                  </Link>
                </nav>
              </div>

              <div className="flex-1 p-8">
                {activeSection == "personal" && (
                  <>
                    <div className="flex justify-between items-center mb-6">
                      <h1 className="text-2xl font-bold">
                        Personal Information
                      </h1>
                      {!isEditing ? (
                        <button onClick={() => setIsEditing(true)}>
                          <Pencil
                            size={20}
                            className="text-gray-600 cursor-pointer hover:text-[#1A2B49]"
                          />
                        </button>
                      ) : (
                        <div className="flex space-x-4">
                          <button
                            type="button"
                            onClick={handleDiscardChanges}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Discard Changes
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveChanges}
                            className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-[#1A2B49] hover:bg-[#243B6B]"
                          >
                            Save Changes
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="space-y-6">
                      {isEditing && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Profile Image
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className={inputClass}
                          />
                        </div>
                      )}

                      <div className="mb-6">
                        <div className="flex items-center space-x-6">
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              className="form-radio text-[#1A2B49]"
                              name="gender"
                              checked={formData.gender == "Male"}
                              onChange={() => {
                                setFormData({ ...formData, gender: "Male" });
                                setChangedField("gender");
                              }}
                              disabled={!isEditing}
                            />
                            <span className="ml-2">Male</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              className="form-radio text-[#1A2B49]"
                              name="gender"
                              checked={formData.gender == "Female"}
                              onChange={() => {
                                setFormData({ ...formData, gender: "Female" });
                                setChangedField("gender");
                              }}
                              disabled={!isEditing}
                            />
                            <span className="ml-2">Female</span>
                          </label>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            First Name
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            className={inputClass}
                            value={formData.firstName}
                            onChange={handleInputChange}
                            readOnly={!isEditing}
                            tabIndex={isEditing ? 0 : -1}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Middle Name
                          </label>
                          <input
                            type="text"
                            name="middleName"
                            className={inputClass}
                            value={formData.middleName}
                            onChange={handleInputChange}
                            readOnly={!isEditing}
                            tabIndex={isEditing ? 0 : -1}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Last Name
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            className={inputClass}
                            value={formData.lastName}
                            onChange={handleInputChange}
                            readOnly={!isEditing}
                            tabIndex={isEditing ? 0 : -1}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Community Name
                          </label>
                          <input
                            type="text"
                            name="communityName"
                            className={inputClass}
                            value={formData.communityName}
                            readOnly
                            tabIndex={-1}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Community Code
                          </label>
                          <input
                            type="text"
                            name="communityCode"
                            className={inputClass}
                            value={formData.communityCode}
                            readOnly
                            tabIndex={-1}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Cast Name
                          </label>
                          <input
                            type="text"
                            name="castName"
                            className={inputClass}
                            value={formData.castName}
                            readOnly
                            tabIndex={-1}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Marital Status
                          </label>
                          <select
                            name="maritalStatus"
                            className={inputClass}
                            value={formData.maritalStatus}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            tabIndex={isEditing ? 0 : -1}
                          >
                            <option value="">Select Marital Status</option>
                            <option value="Married">Married</option>
                            <option value="Single">Single</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Address
                        </label>
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          rows="2"
                          className={inputClass}
                          placeholder="Enter your full address"
                          readOnly={!isEditing}
                          tabIndex={isEditing ? 0 : -1}
                        ></textarea>
                      </div>

                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            maxLength="10"
                            className={inputClass}
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="Enter 10-digit number"
                            readOnly={!isEditing}
                            tabIndex={isEditing ? 0 : -1}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Date of Birth
                          </label>
                          <input
                            type="date"
                            name="dateOfBirth"
                            className={inputClass}
                            value={formData.dateOfBirth}
                            onChange={handleInputChange}
                            readOnly={!isEditing}
                            tabIndex={isEditing ? 0 : -1}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              City
                            </label>
                            <input
                              type="text"
                              name="city"
                              className={inputClass}
                              value={formData.city}
                              onChange={handleInputChange}
                              readOnly={!isEditing}
                              tabIndex={isEditing ? 0 : -1}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              State
                            </label>
                            <input
                              type="text"
                              name="state"
                              className={inputClass}
                              value={formData.state}
                              onChange={handleInputChange}
                              readOnly={!isEditing}
                              tabIndex={isEditing ? 0 : -1}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Country
                            </label>
                            <input
                              type="text"
                              name="country"
                              className={inputClass}
                              value={formData.country}
                              onChange={handleInputChange}
                              readOnly={!isEditing}
                              tabIndex={isEditing ? 0 : -1}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Postal Code
                            </label>
                            <input
                              type="text"
                              name="postalCode"
                              className={inputClass}
                              value={formData.postalCode}
                              onChange={handleInputChange}
                              readOnly={!isEditing}
                              tabIndex={isEditing ? 0 : -1}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {activeSection == "education" && (
                  <>
                    <div className="flex justify-between items-center mb-6">
                      <h1 className="text-2xl font-bold">Education Detail</h1>
                      {!isEditing ? (
                        <button onClick={() => setIsEditing(true)}>
                          <Pencil
                            size={20}
                            className="text-gray-600 hover:text-[#1A2B49]"
                          />
                        </button>
                      ) : (
                        <div className="flex space-x-4">
                          <button
                            type="button"
                            onClick={handleDiscardChanges}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Discard Changes
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveChanges}
                            className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-[#1A2B49] hover:bg-[#243B6B]"
                          >
                            Save Changes
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            School Percentage
                          </label>
                          <input
                            type="text"
                            name="schoolPercentage"
                            className={inputClass}
                            value={formData.schoolPercentage}
                            onChange={handleInputChange}
                            placeholder="e.g., 85.5"
                            readOnly={!isEditing}
                            tabIndex={isEditing ? 0 : -1}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            School Name
                          </label>
                          <input
                            type="text"
                            name="schoolName"
                            className={inputClass}
                            value={formData.schoolName}
                            onChange={handleInputChange}
                            readOnly={!isEditing}
                            tabIndex={isEditing ? 0 : -1}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            College CGPA
                          </label>
                          <input
                            type="text"
                            name="collegeCGPA"
                            className={inputClass}
                            value={formData.collegeCGPA}
                            onChange={handleInputChange}
                            placeholder="e.g., 8.5 (0-10)"
                            readOnly={!isEditing}
                            tabIndex={isEditing ? 0 : -1}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            College Name
                          </label>
                          <input
                            type="text"
                            name="collegeName"
                            className={inputClass}
                            value={formData.collegeName}
                            onChange={handleInputChange}
                            readOnly={!isEditing}
                            tabIndex={isEditing ? 0 : -1}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {activeSection == "occupation" && (
                  <>
                    <div className="flex justify-between items-center mb-6">
                      <h1 className="text-2xl font-bold">Occupation Detail</h1>
                      {!isEditing ? (
                        <button onClick={() => setIsEditing(true)}>
                          <Pencil
                            size={20}
                            className="text-gray-600 cursor-pointer hover:text-[#1A2B49]"
                          />
                        </button>
                      ) : (
                        <div className="flex space-x-4">
                          <button
                            type="button"
                            onClick={handleDiscardChanges}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Discard Changes
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveChanges}
                            className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-[#1A2B49] hover:bg-[#243B6B]"
                          >
                            Save Changes
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Occupation Name
                        </label>
                        <input
                          type="text"
                          name="occupationName"
                          className={inputClass}
                          value={formData.occupationName}
                          onChange={handleInputChange}
                          readOnly={!isEditing}
                          tabIndex={isEditing ? 0 : -1}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Occupation Address
                        </label>
                        <textarea
                          name="occupationAddress"
                          value={formData.occupationAddress}
                          onChange={handleInputChange}
                          rows="2"
                          className={inputClass}
                          placeholder="Enter occupation address"
                          readOnly={!isEditing}
                          tabIndex={isEditing ? 0 : -1}
                        ></textarea>
                      </div>
                    </div>
                  </>
                )}

                {activeSection == "login" && (
                  <>
                    <div className="flex justify-between items-center mb-6">
                      <h1 className="text-2xl font-bold">Login & Password</h1>
                      {!isEditing ? (
                        <button onClick={() => setIsEditing(true)}>
                          <Pencil
                            size={20}
                            className="text-gray-600 hover:text-[#1A2B49]"
                          />
                        </button>
                      ) : (
                        <div className="flex space-x-4">
                          <button
                            type="button"
                            onClick={handleDiscardChanges}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Discard Changes
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveChanges}
                            className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-[#1A2B49] hover:bg-[#243B6B]"
                          >
                            Save Changes
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          className={inputClass}
                          value={formData.phone}
                          onChange={handleInputChange}
                          readOnly={!isEditing}
                          tabIndex={isEditing ? 0 : -1}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          className={inputClass}
                          value={formData.email}
                          onChange={handleInputChange}
                          readOnly={!isEditing}
                          tabIndex={isEditing ? 0 : -1}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enlarged Image Modal */}
      {showEnlargedImage && (
        <div
          className="fixed inset-0 pt-20   bg-[#0000008b] bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setShowEnlargedImage(false)}
        >
          <img
            src={
              formData.P_Image ||
              "https://static.vecteezy.com/system/resources/previews/018/765/138/original/user-profile-icon-in-flat-style-member-avatar-illustration-on-isolated-background-human-permission-sign-business-concept-vector.jpg"
            }
            alt="Enlarged Profile"
            className="max-w-[90%] max-h-[90vh] object-contain rounded-lg"
          />
        </div>
      )}
    </>
  );
};

export default Profileuser;
