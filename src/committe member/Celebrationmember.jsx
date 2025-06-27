import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import {
  Calendar,
  Gift,
  Trash2,
  Plus,
  X,
  Upload,
  Heart,
  Cake,
  Search,
  ChevronRight,
  ChevronLeft,
  Clock,
  CheckCircle,
  Bell,
  User,
  CircleChevronLeft,
  Edit,
  Eye,
} from "lucide-react";
import logoImage from "../../src/img/parivarlogo1.png";

// Custom Loader Component
const CustomLoader = () => {
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
        src={logoImage || "/placeholder.svg"}
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

const Celebration = ({ setActivePage }) => {
  const [celebrations, setCelebrations] = useState([]);
  const [filteredCelebrations, setFilteredCelebrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    N_Title: "",
    N_Category: "Birthday",
    N_MaleName: "",
    N_WomanName: "",
    N_Name: "",
    N_Date: "",
    N_Age: "",
    N_Years: "",
    N_Mobile: "",
    N_Email: "",
    N_Address: "",
    N_Description: "",
    N_Status: "pending",
  });
  const [originalFormData, setOriginalFormData] = useState(null);
  const [gender, setGender] = useState("Male");
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [selectedCelebration, setSelectedCelebration] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showRequestDetails, setShowRequestDetails] = useState(null);
  const [statusFilter, setStatusFilter] = useState("approved");
  const [enlargedImage, setEnlargedImage] = useState(null);
  const formRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagesToRemove, setImagesToRemove] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const validImageTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/bmp",
    "image/webp",
  ];

  useEffect(() => {
    fetchCelebrations();
  }, []);

  useEffect(() => {
    filterCelebrations();
  }, [celebrations, searchTerm, activeTab, statusFilter]);

  const fetchCelebrations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        "https://parivaar.app/public/api/celebration"
      );
      const result = await response.json();

      console.log("API Response:", result);

      if (
        response.ok &&
        result.status &&
        result.message === "Celebrations fetched successfully"
      ) {
        const userData = JSON.parse(localStorage.getItem("user"));
        console.log("User Data:", userData);

        const commId = userData?.Comm_Id;
        if (!commId) {
          console.warn("Community ID not found in local storage");
          setCelebrations([]);
          setPendingRequests([]);
          return;
        }

        const filteredCelebrations = result.data.filter((celebration) => {
          return celebration.user?.Comm_Id === commId;
        });

        console.log("Filtered Celebrations:", filteredCelebrations);

        setCelebrations(filteredCelebrations);
        const pending = filteredCelebrations.filter(
          (celebration) => celebration.N_Status === "pending"
        );
        setPendingRequests(pending);
      } else {
        console.error("API response invalid:", result);
        throw new Error("Failed to fetch celebrations");
      }
    } catch (error) {
      console.error("Error fetching celebrations:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to load celebrations. Please try again.",
        icon: "error",
        confirmButtonColor: "#1A2B49",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterCelebrations = () => {
    let filtered = [...celebrations];

    filtered = filtered.filter(
      (celebration) => celebration.N_Status === statusFilter
    );

    if (searchTerm) {
      filtered = filtered.filter(
        (celebration) =>
          celebration.N_Title?.toLowerCase().includes(
            searchTerm.toLowerCase()
          ) ||
          (celebration.N_MaleName &&
            celebration.N_MaleName.toLowerCase().includes(
              searchTerm.toLowerCase()
            )) ||
          (celebration.N_WomanName &&
            celebration.N_WomanName.toLowerCase().includes(
              searchTerm.toLowerCase()
            )) ||
          (celebration.N_Name &&
            celebration.N_Name.toLowerCase().includes(
              searchTerm.toLowerCase()
            )) ||
          (celebration.N_Description &&
            celebration.N_Description.toLowerCase().includes(
              searchTerm.toLowerCase()
            ))
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (activeTab === "today") {
      filtered = filtered.filter((celebration) => {
        const celebrationDate = new Date(celebration.N_Date);
        celebrationDate.setHours(0, 0, 0, 0);
        return celebrationDate.getTime() === today.getTime();
      });
    } else if (activeTab === "completed") {
      filtered = filtered.filter((celebration) => {
        const celebrationDate = new Date(celebration.N_Date);
        celebrationDate.setHours(0, 0, 0, 0);
        return celebrationDate < today;
      });
    }

    setFilteredCelebrations(filtered);
  };

  const getTodaysCelebrations = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return celebrations
      .filter((celebration) => celebration.N_Status === statusFilter)
      .filter((celebration) => {
        const celebrationDate = new Date(celebration.N_Date);
        celebrationDate.setHours(0, 0, 0, 0);
        return celebrationDate.getTime() === today.getTime();
      });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleGenderChange = (e) => {
    setGender(e.target.value);
    setFormData({
      ...formData,
      N_MaleName: e.target.value === "Male" ? formData.N_MaleName : "",
      N_WomanName: e.target.value === "Female" ? formData.N_WomanName : "",
    });
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setFormData({
      ...formData,
      N_Category: category,
      N_MaleName: "",
      N_WomanName: "",
      N_Name: "",
      N_Age: "",
      N_Years: "",
    });
    if (category !== "Birthday") {
      setGender("Male");
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => validImageTypes.includes(file.type));

    if (validFiles.length !== files.length) {
      Swal.fire({
        title: "Invalid File Type",
        text: "Please select valid image files (JPEG, PNG, GIF, BMP, WEBP).",
        icon: "warning",
        confirmButtonColor: "#1A2B49",
      });
    }

    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));

    setImages((prev) => [...prev, ...validFiles]);
    setSelectedFiles((prev) => [...prev, ...validFiles]);
    setPreviewImages((prev) => [...prev, ...newPreviews]);
  };

  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.N_Title.trim()) {
      Swal.fire({
        title: "Missing Information",
        text: "Title is required",
        icon: "error",
        confirmButtonColor: "#1A2B49",
      });
      return;
    }

    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData?.U_Id || !userData?.Comm_Id) {
      Swal.fire({
        title: "Error",
        text: "User data is missing. Please log in again.",
        icon: "error",
        confirmButtonColor: "#1A2B49",
      });
      return;
    }

    try {
      setIsLoading(true);
      const url = isEditing
        ? `https://parivaar.app/public/api/celebration/${selectedCelebration.N_Id}`
        : "https://parivaar.app/public/api/celebration";
      const method = isEditing ? "PUT" : "POST";

      if (isEditing) {
        // Initialize payload with required fields
        const payload = {
          U_Id: userData.U_Id,
          Comm_Id: userData.Comm_Id,
        };

        // Compare formData with originalFormData to include only changed fields
        Object.keys(formData).forEach((key) => {
          if (originalFormData && formData[key] !== originalFormData[key]) {
            payload[key] = formData[key];
          }
        });

        // Handle images for PUT request
        payload.images_to_remove = imagesToRemove;
        payload.existing_images = existingImages.filter(
          (img) => !imagesToRemove.includes(img)
        );
        if (images.length > 0) {
          const base64Images = await Promise.all(
            images.map(async (file) => await convertImageToBase64(file))
          );
          payload.N_Image = base64Images;
        } else {
          payload.N_Image = [];
        }

        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();
        if (response.ok && result.status) {
          Swal.fire({
            title: "Updated!",
            text: "Celebration updated successfully!",
            icon: "success",
            confirmButtonColor: "#1A2B49",
          });
          resetForm();
          fetchCelebrations();
        } else {
          const errorMessages = result.errors
            ? Object.values(result.errors).flat().join("\n")
            : "Failed to update celebration. Please check your input.";
          Swal.fire({
            title: "Error",
            text: errorMessages,
            icon: "error",
            confirmButtonColor: "#1A2B49",
          });
        }
      } else {
        // For POST request: Send all fields as FormData
        const formDataToSend = new FormData();
        const payload = {
          N_Title: formData.N_Title,
          N_Category: formData.N_Category,
          N_MaleName: formData.N_Category === "Others" ? formData.N_Name : formData.N_MaleName || "",
          N_WomanName: formData.N_Category !== "Others" ? formData.N_WomanName || "" : "",
          N_Name: formData.N_Category === "Others" ? formData.N_Name || "" : "",
          N_Date: formData.N_Date || "",
          N_Age: formData.N_Age || "",
          N_Years: formData.N_Years || "",
          N_Mobile: formData.N_Mobile || "",
          N_Email: formData.N_Email || "",
          N_Address: formData.N_Address || "",
          N_Description: formData.N_Description || "",
          N_Status: formData.N_Status || "pending",
          U_Id: userData.U_Id,
          Comm_Id: userData.Comm_Id,
        };

        Object.keys(payload).forEach((key) => {
          if (key !== "N_Image") {
            formDataToSend.append(key, payload[key]);
          }
        });

        images.forEach((file, index) => {
          formDataToSend.append(`N_Image[${index}]`, file);
        });

        const response = await fetch(url, {
          method,
          body: formDataToSend,
        });

        const result = await response.json();
        if (response.ok && result.status) {
          Swal.fire({
            title: "Success!",
            text: "Celebration added successfully!",
            icon: "success",
            confirmButtonColor: "#1A2B49",
          });
          resetForm();
          fetchCelebrations();
        } else {
          const errorMessages = result.errors
            ? Object.values(result.errors).flat().join("\n")
            : "Failed to save celebration. Please check your input.";
          Swal.fire({
            title: "Error",
            text: errorMessages,
            icon: "error",
            confirmButtonColor: "#1A2B49",
          });
        }
      }
    } catch (error) {
      console.error(
        `Error ${isEditing ? "updating" : "posting"} celebration:`,
        error
      );
      Swal.fire({
        title: "Error",
        text: `Failed to ${isEditing ? "update" : "add"} celebration. Please try again later.`,
        icon: "error",
        confirmButtonColor: "#1A2B49",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      N_Title: "",
      N_Category: "Birthday",
      N_MaleName: "",
      N_WomanName: "",
      N_Name: "",
      N_Date: "",
      N_Age: "",
      N_Years: "",
      N_Mobile: "",
      N_Email: "",
      N_Address: "",
      N_Description: "",
      N_Status: "pending",
    });
    setImages([]);
    setPreviewImages([]);
    setSelectedFiles([]);
    setImagesToRemove([]);
    setExistingImages([]);
    setOriginalFormData(null);
    setGender("Male");
    setShowForm(false);
    setIsEditing(false);
    setSelectedCelebration(null);
  };

  const handleDelete = async (N_Id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1A2B49",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setIsLoading(true);
          const response = await fetch(
            `https://parivaar.app/public/api/celebration/${N_Id}`,
            {
              method: "DELETE",
            }
          );

          if (response.ok) {
            Swal.fire({
              title: "Deleted!",
              text: "Celebration has been deleted.",
              icon: "success",
              confirmButtonColor: "#1A2B49",
            });
            setCelebrations(celebrations.filter((c) => c.N_Id !== N_Id));
            setPendingRequests(pendingRequests.filter((c) => c.N_Id !== N_Id));
          } else {
            throw new Error("Failed to delete celebration");
          }
        } catch (error) {
          console.error("Error deleting celebration:", error);
          Swal.fire({
            title: "Error",
            text: "Failed to delete celebration. Please try again.",
            icon: "error",
            confirmButtonColor: "#1A2B49",
          });
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  const handleApproveRequest = async (N_Id) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `https://parivaar.app/public/api/celebration/${N_Id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ N_Status: "approved" }),
        }
      );

      if (response.ok) {
        Swal.fire({
          title: "Approved!",
          text: "The celebration request has been approved.",
          icon: "success",
          confirmButtonColor: "#1A2B49",
        });
        fetchCelebrations();
      } else {
        throw new Error("Failed to approve celebration");
      }
    } catch (error) {
      console.error("Error approving celebration:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to approve celebration. Please try again.",
        icon: "error",
        confirmButtonColor: "#1A2B49",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectRequest = async (N_Id) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `https://parivaar.app/public/api/celebration/${N_Id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ N_Status: "rejected" }),
        }
      );

      if (response.ok) {
        Swal.fire({
          title: "Rejected",
          text: "The celebration request has been rejected.",
          icon: "info",
          confirmButtonColor: "#1A2B49",
        });
        fetchCelebrations();
      } else {
        throw new Error("Failed to reject celebration");
      }
    } catch (error) {
      console.error("Error rejecting celebration:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to reject celebration. Please try again.",
        icon: "error",
        confirmButtonColor: "#1A2B49",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = (celebration) => {
    setSelectedCelebration(celebration);
  };

  const handleViewRequestDetails = (request) => {
    setShowRequestDetails(request);
  };

  const handleEditClick = (e, celebration) => {
    e.stopPropagation();
    setIsEditing(true);
    const formDataToSet = {
      N_Title: celebration.N_Title || "",
      N_Category: celebration.N_Category || "Birthday",
      N_MaleName: celebration.N_MaleName || "",
      N_WomanName: celebration.N_WomanName || "",
      N_Name: celebration.N_Name || "",
      N_Date: celebration.N_Date
        ? new Date(celebration.N_Date).toISOString().split("T")[0]
        : "",
      N_Age: celebration.N_Age || "",
      N_Years: celebration.N_Years || "",
      N_Mobile: celebration.N_Mobile || "",
      N_Email: celebration.N_Email || "",
      N_Address: celebration.N_Address || "",
      N_Description: celebration.N_Description || "",
      N_Status: celebration.N_Status || "pending",
    };
    setFormData(formDataToSet);
    setOriginalFormData(formDataToSet);
    setGender(
      celebration.N_MaleName
        ? "Male"
        : celebration.N_WomanName
        ? "Female"
        : "Male"
    );
    setPreviewImages(celebration.N_Image || []);
    setExistingImages(celebration.N_Image || []);
    setImages([]);
    setSelectedFiles([]);
    setImagesToRemove([]);
    setSelectedCelebration(celebration);
    setShowForm(true);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Birthday":
        return <Cake className="w-6 h-6" />;
      case "Anniversary":
        return <Heart className="w-6 h-6" />;
      default:
        return <Gift className="w-6 h-6" />;
    }
  };

  const nextSlide = () => {
    const todaysCelebrations = getTodaysCelebrations();
    setCurrentSlide((prev) =>
      prev === todaysCelebrations.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    const todaysCelebrations = getTodaysCelebrations();
    setCurrentSlide((prev) =>
      prev === 0 ? todaysCelebrations.length - 1 : prev - 1
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const removeImage = (index) => {
    const updatedPreviews = [...previewImages];
    const updatedFiles = [...images];

    const removedImage = updatedPreviews[index];
    updatedPreviews.splice(index, 1);
    if (index < images.length) {
      updatedFiles.splice(index, 1);
      setImages(updatedFiles);
      setSelectedFiles(updatedFiles);
    } else {
      setImagesToRemove((prev) => [...prev, removedImage]);
      setExistingImages((prev) => prev.filter((img) => img !== removedImage));
    }

    setPreviewImages(updatedPreviews);
  };

  const handleImageClick = (imageUrl) => {
    setEnlargedImage(imageUrl);
  };

  return (
    <div className="div bg-gradient-to-br from-[#fdf9f7] to-[#f0f4ff]">
      <div className="min-h-screen bg-gradient-to-br from-[#fdf9f7] to-[#f0f4ff]">
        {isLoading && <CustomLoader />}

        {enlargedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100] p-4">
            <div className="relative max-w-4xl w-full">
              <img
                src={enlargedImage}
                alt="Enlarged"
                className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
              />
              <button
                onClick={() => setEnlargedImage(null)}
                className="absolute top-2 right-2 bg-white rounded-full p-2 text-black hover:bg-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        <div className="bg-[#1A2B49] rounded-xl text-white py-4 px-4">
          <div className="max-w-7xl mx-auto flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <button
              className="flex cursor-pointer items-center text-white"
              onClick={() => setActivePage("dashboardmember")}
            >
              <CircleChevronLeft size={30} className="mr-2" />
            </button>
            <h1 className="text-2xl font-bold text-center lg:text-left">
              Community Celebrations
            </h1>
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
              {/* <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, date..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 text-sm py-2 rounded-lg bg-white text-black focus:ring-2 focus:ring-[#1A2B49] focus:outline-none"
                />
              </div> */}
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 text-sm bg-[#1A2B49] border border-white px-4 py-2 rounded-lg font-medium hover:bg-[#2A3B59] transition-all duration-300"
              >
                <Plus className="w-5 h-5" />
                Add Celebration
              </button>
            </div>
          </div>
        </div>

        <div className="max-mx-auto py-8">
          <div className="mb-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-md p-4 col-span-1 lg:col-span-1">
                <div className="max-h-90 overflow-y-auto">
                  <div className="text-[#1A2B49] border-b-2 text-lg font-bold py-3 rounded-t-md sticky top-0 z-10">
                    Today's Celebration
                  </div>
                  {getTodaysCelebrations().length > 0 ? (
                    getTodaysCelebrations().map((celebration) => (
                      <div
                        key={celebration.N_Id}
                        className="border-b last:border-b-0 py-4"
                      >
                        <div className="div flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-[#1A2B49]">
                            {celebration.N_Title}
                          </h3>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => handleEditClick(e, celebration)}
                              className="text-blue-500 hover:text-blue-600"
                            >
                              {/* <Edit className="w-5 h-5" /> */}
                            </button>
                            <button
                              onClick={() => handleCardClick(celebration)}
                              className="text-blue-500 hover:underline text-sm"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center text-gray-600 mt-1">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>{formatDate(celebration.N_Date)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <Gift className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">
                        There are no celebration notices today.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {pendingRequests.length > 0 && (
                <div className="bg-white rounded-xl shadow-md p-4 col-span-1">
                  <div className="max-h-78 overflow-y-auto">
                    <div className="text-[#1C2636] text-lg font-bold border-b-2 py-3 px-4 rounded-t-md sticky top-0 z-10">
                      Celebration Requests
                    </div>
                    {pendingRequests
                      .filter((request) => {
                        const requestDate = new Date(request.N_Date);
                        requestDate.setHours(0, 0, 0, 0);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return requestDate.getTime() >= today.getTime();
                      })
                      .sort((a, b) => {
                        const dateA = new Date(a.N_Date);
                        const dateB = new Date(b.N_Date);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const isTodayA = dateA.getTime() === today.getTime();
                        const isTodayB = dateB.getTime() === today.getTime();
                        if (isTodayA && !isTodayB) return -1;
                        if (!isTodayA && isTodayB) return 1;
                        return dateA - dateB;
                      })
                      .map((request) => (
                        <div
                          key={request.N_Id}
                          className="border-b p-4 shadow-lg last:border-b-0 py-4"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm text-gray-500 mb-1">
                                {request.N_Category}
                              </p>
                              <h3 className="text-lg font-semibold text-[#1A2B49]">
                                {request.N_Title}
                              </h3>
                              <div className="flex items-center text-gray-600 mt-1">
                                <Calendar className="w-4 h-4 mr-2" />
                                <span>{formatDate(request.N_Date)}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2 lg:mt-0">
                              <button
                                onClick={() => handleViewRequestDetails(request)}
                                className="text-blue-500 hover:text-blue-600"
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleApproveRequest(request.N_Id)}
                                className="text-green-500 hover:text-green-600"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleRejectRequest(request.N_Id)}
                                className="text-red-500 hover:text-red-600"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-6 col-span-1">
                <div className="bg-white rounded-xl shadow-md p-6 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">TOTAL</p>
                    <h3 className="text-3xl font-bold text-[#1A2B49]">
                      {celebrations.length}
                    </h3>
                  </div>
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Bell className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">TODAY'S</p>
                    <h3 className="text-3xl font-bold text-[#1A2B49]">
                      {getTodaysCelebrations().length}
                    </h3>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">PAST</p>
                    <h3 className="text-3xl font-bold text-[#1A2B49]">
                      {
                        celebrations.filter(
                          (c) => new Date(c.N_Date) < new Date()
                        ).length
                      }
                    </h3>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStatusFilter("approved")}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-md ${
                    statusFilter === "approved"
                      ? "bg-green-500 text-white"
                      : "bg-white text-gray-700 hover:bg-green-100"
                  }`}
                >
                  Accepted 
                </button>
                <button
                  onClick={() => setStatusFilter("rejected")}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-md ${
                    statusFilter === "rejected"
                      ? "bg-red-500 text-white"
                      : "bg-white text-gray-700 hover:bg-red-100"
                  }`}
                >
                  Rejected
                </button>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, date..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 text-sm border py-2 rounded-lg bg-white text-black focus:ring-1 focus:ring-[#1A2B49] focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent"
                  onChange={(e) => {
                    const date = e.target.value;
                    if (date) {
                      setSearchTerm(date);
                    }
                  }}
                />
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    activeTab === "all"
                      ? "bg-[#1A2B49] text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveTab("today")}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    activeTab === "today"
                      ? "bg-[#1A2B49] text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Upcoming
                </button>
                <button
                  onClick={() => setActiveTab("completed")}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    activeTab === "completed"
                      ? "bg-[#1A2B49] text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Past
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCelebrations.map((celebration) => (
                <div
                  key={celebration.N_Id}
                  className="bg-white rounded-xl shadow-md p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">
                        {celebration.N_Category}
                      </p>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {celebration.N_Title}
                      </h3>
                      <div className="flex items-center text-gray-600 mt-2">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{formatDate(celebration.N_Date)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleEditClick(e, celebration)}
                        className="text-blue-500 hover:text-blue-600"
                      >
                        {/* <Edit className="w-5 h-5" /> */}
                      </button>
                      <button
                        onClick={() => handleDelete(celebration.N_Id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCardClick(celebration)}
                    className="text-blue-500 hover:underline mt-2"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>

          {showForm && (
            <div className="fixed pt-20 inset-0 bg-[#0000006b] bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div
                ref={formRef}
                className="bg-[#fcfcfc] rounded-2xl shadow-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-[#1A2B49]">
                    {isEditing ? "Edit Celebration" : "Add New Celebration"}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="N_Title"
                          value={formData.N_Title}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent"
                          placeholder="Enter celebration title"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category
                        </label>
                        <select
                          name="N_Category"
                          value={formData.N_Category}
                          onChange={handleCategoryChange}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent"
                        >
                          <option value="Birthday">Birthday</option>
                          <option value="Anniversary">Anniversary</option>
                          <option value="Others">Others</option>
                        </select>
                      </div>
                      {formData.N_Category === "Birthday" && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Gender
                            </label>
                            <select
                              value={gender}
                              onChange={handleGenderChange}
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent"
                            >
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {gender === "Male" ? "Male Name" : "Female Name"}
                            </label>
                            <input
                              type="text"
                              name={
                                gender === "Male" ? "N_MaleName" : "N_WomanName"
                              }
                              value={
                                gender === "Male"
                                  ? formData.N_MaleName
                                  : formData.N_WomanName
                              }
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent"
                              placeholder={`Enter ${gender.toLowerCase()} name`}
                            />
                          </div>
                        </>
                      )}
                      {formData.N_Category === "Anniversary" && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Male Name
                            </label>
                            <input
                              type="text"
                              name="N_MaleName"
                              value={formData.N_MaleName}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent"
                              placeholder="Enter male name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Woman Name
                            </label>
                            <input
                              type="text"
                              name="N_WomanName"
                              value={formData.N_WomanName}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent"
                              placeholder="Enter woman name"
                            />
                          </div>
                        </>
                      )}
                      {formData.N_Category === "Others" && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                          </label>
                          <input
                            type="text"
                            name="N_Name"
                            value={formData.N_Name}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent"
                            placeholder="Enter name"
                          />
                        </div>
                      )}
                    </div>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date
                        </label>
                        <input
                          type="date"
                          name="N_Date"
                          value={formData.N_Date}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Age (if applicable)
                        </label>
                        <input
                          type="number"
                          name="N_Age"
                          value={formData.N_Age}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent"
                          placeholder="Enter age"
                        />
                      </div>
                  
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Years (if applicable)
                        </label>
                        <input
                          type="number"
                          name="N_Years"
                          value={formData.N_Years}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent"
                          placeholder="Enter years"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mobile
                        </label>
                        <input
                          type="tel"
                          name="N_Mobile"
                          value={formData.N_Mobile}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          name="N_Email"
                          value={formData.N_Email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent"
                          placeholder="Enter email address"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address
                        </label>
                        <textarea
                          name="N_Address"
                          value={formData.N_Address}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent"
                          rows="3"
                          placeholder="Enter address"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          name="N_Description"
                          value={formData.N_Description}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent"
                          rows="4"
                          placeholder="Enter celebration description"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Images
                        </label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-[#1A2B49] transition-colors bg-white shadow-sm">
                          <div className="space-y-2 text-center">
                            <Upload className="mx-auto h-10 w-10 text-gray-400" />
                            <div className="flex text-sm text-gray-600 justify-center gap-1">
                              <label className="relative cursor-pointer rounded-md font-medium text-[#1A2B49] hover:text-[#2A3B59] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#1A2B49]">
                                <span>Select files</span>
                                <input
                                  type="file"
                                  multiple
                                  accept="image/*"
                                  onChange={handleImageChange}
                                  className="sr-only"
                                />
                              </label>
                              <span>or drag and drop</span>
                            </div>
                            <p className="text-xs text-gray-500">
                              JPEG, JPG, PNG, GIF, BMP, WEBP — Max size 10MB each
                            </p>
                          </div>
                        </div>
                        {previewImages.length > 0 && (
                          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                            {previewImages.map((preview, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={preview}
                                  alt={`Preview ${index + 1}`}
                                  className="h-24 w-full object-cover rounded-xl shadow-md cursor-pointer"
                                  onClick={() => handleImageClick(preview)}
                                />
                                <button
                                  onClick={() => removeImage(index)}
                                  className="absolute top-1 right-1 bg-white rounded-full p-1 text-red-600 hover:text-red-800 hover:bg-gray-100 shadow group-hover:block"
                                  title="Remove image"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-4 mt-8">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="px-6 py-3 bg-[#1A2B49] text-white rounded-lg hover:bg-[#2A3B59] transition-colors"
                    >
                      {isEditing ? "Update Celebration" : "Save Celebration"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedCelebration && !isEditing && (
            <div className="fixed inset-0 bg-[#0000006d] bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-gradient-to-br from-[#fdfcfb] to-[#f0f4ff] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-[#1A2B49]">
                      {selectedCelebration.N_Title}
                    </h2>
                    <button
                      onClick={() => setSelectedCelebration(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      {selectedCelebration.N_Image &&
                      selectedCelebration.N_Image.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          {selectedCelebration.N_Image.map((img, index) => (
                            <img
                              key={index}
                              src={img || "/placeholder.svg"}
                              alt={`Celebration ${index + 1}`}
                              className="w-full h-40 object-cover rounded-lg cursor-pointer"
                              onClick={() => handleImageClick(img)}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="w-full h-40 bg-blue-100 flex items-center justify-center rounded-lg mb-4">
                          {getCategoryIcon(selectedCelebration.N_Category)}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        <span className="font-bold">Category:</span>{" "}
                        {selectedCelebration.N_Category || "Others"}
                      </p>
                      {selectedCelebration.N_Category === "Others" ? (
                        selectedCelebration.N_Name && (
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            <span className="font-bold">Name:</span>{" "}
                            {selectedCelebration.N_Name}
                          </p>
                        )
                      ) : (
                        <>
                          {selectedCelebration.N_MaleName && (
                            <p className="text-sm font-medium text-gray-700 mb-2">
                              <span className="font-bold">Male Name:</span>{" "}
                              {selectedCelebration.N_MaleName}
                            </p>
                          )}
                          {selectedCelebration.N_WomanName && (
                            <p className="text-sm font-medium text-gray-700 mb-2">
                              <span className="font-bold">Woman Name:</span>{" "}
                              {selectedCelebration.N_WomanName}
                            </p>
                          )}
                        </>
                      )}
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        <span className="font-bold">Date:</span>{" "}
                        {formatDate(selectedCelebration.N_Date)}
                      </p>
                      {selectedCelebration.N_Age && (
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          <span className="font-bold">Age:</span>{" "}
                          {selectedCelebration.N_Age}
                        </p>
                      )}
                      {selectedCelebration.N_Years && (
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          <span className="font-bold">Years:</span>{" "}
                          {selectedCelebration.N_Years}
                        </p>
                      )}
                      {selectedCelebration.N_Mobile && (
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          <span className="font-bold">Mobile:</span>{" "}
                          {selectedCelebration.N_Mobile}
                        </p>
                      )}
                      {selectedCelebration.N_Email && (
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          <span className="font-bold">Email:</span>{" "}
                          {selectedCelebration.N_Email}
                        </p>
                      )}
                      {selectedCelebration.N_Address && (
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          <span className="font-bold">Address:</span>{" "}
                          {selectedCelebration.N_Address}
                        </p>
                      )}
                      {selectedCelebration.N_Description && (
                        <p className="text-sm font-medium text-gray-700">
                          <span className="font-bold">Description:</span>{" "}
                          {selectedCelebration.N_Description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showRequestDetails && (
            <div className="fixed inset-0 bg-[#00000068] bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-[#1A2B49]">
                      {showRequestDetails.N_Title}
                    </h2>
                    <button
                      onClick={() => setShowRequestDetails(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      {showRequestDetails.N_Image &&
                      showRequestDetails.N_Image.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          {showRequestDetails.N_Image.map((img, index) => (
                            <img
                              key={index}
                              src={img || "/placeholder.svg"}
                              alt={`Celebration ${index + 1}`}
                              className="w-full h-40 object-cover rounded-lg cursor-pointer"
                              onClick={() => handleImageClick(img)}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="w-full h-40 bg-blue-100 flex items-center justify-center rounded-lg mb-4">
                          {getCategoryIcon(showRequestDetails.N_Category)}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        <span className="font-bold">Category:</span>{" "}
                        {showRequestDetails.N_Category || "Others"}
                      </p>
                      {showRequestDetails.N_Category === "Others" ? (
                        showRequestDetails.N_Name && (
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            <span className="font-bold">Name:</span>{" "}
                            {showRequestDetails.N_Name}
                          </p>
                        )
                      ) : (
                        <>
                          {showRequestDetails.N_MaleName && (
                            <p className="text-sm font-medium text-gray-700 mb-2">
                              <span className="font-bold">Male Name:</span>{" "}
                              {showRequestDetails.N_MaleName}
                            </p>
                          )}
                          {showRequestDetails.N_WomanName && (
                            <p className="text-sm font-medium text-gray-700 mb-2">
                              <span className="font-bold">Woman Name:</span>{" "}
                              {showRequestDetails.N_WomanName}
                            </p>
                          )}
                        </>
                      )}
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        <span className="font-bold">Date:</span>{" "}
                        {formatDate(showRequestDetails.N_Date)}
                      </p>
                      {showRequestDetails.N_Age && (
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          <span className="font-bold">Age:</span>{" "}
                          {showRequestDetails.N_Age}
                        </p>
                      )}
                      {showRequestDetails.N_Years && (
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          <span className="font-bold">Years:</span>{" "}
                          {showRequestDetails.N_Years}
                        </p>
                      )}
                      {showRequestDetails.N_Mobile && (
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          <span className="font-bold">Mobile:</span>{" "}
                          {showRequestDetails.N_Mobile}
                        </p>
                      )}
                      {showRequestDetails.N_Email && (
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          <span className="font-bold">Email:</span>{" "}
                          {showRequestDetails.N_Email}
                        </p>
                      )}
                      {showRequestDetails.N_Address && (
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          <span className="font-bold">Address:</span>{" "}
                          {showRequestDetails.N_Address}
                        </p>
                      )}
                      {showRequestDetails.N_Description && (
                        <p className="text-sm font-medium text-gray-700">
                          <span className="font-bold">Description:</span>{" "}
                          {showRequestDetails.N_Description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Celebration;