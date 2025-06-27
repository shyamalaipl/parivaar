"use client";

import { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import {
  Plus,
  X,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Trash2,
  ImageIcon,
  User,
  FileText,
  Search,
  ChevronRight,
  ChevronLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  Bell,
  CircleChevronLeft,
  Edit,
  Eye,
} from "lucide-react";
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
        src={logoImage || "/placeholder.svg"}
        alt="Rot Великая Logo"
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

const Condolencemember = ({ setActivePage, activePage }) => {
  const [condolences, setCondolences] = useState([]);
  const [filteredCondolences, setFilteredCondolences] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    N_Title: "",
    N_Category: "Death",
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
  const [statusFilter, setStatusFilter] = useState("approved");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [selectedCondolence, setSelectedCondolence] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showRequestDetails, setShowRequestDetails] = useState(null);
  const [enlargedImage, setEnlargedImage] = useState(null);
  const formRef = useRef(null);

  const validImageTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/bmp",
    "image/webp",
  ];

  useEffect(() => {
    fetchCondolences();
  }, []);

  useEffect(() => {
    filterCondolences();
  }, [condolences, searchTerm, activeTab, statusFilter]);

  const fetchCondolences = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        "https://parivaar.app/public/api/condolences"
      );
      const result = await response.json();
      if (response.ok && result.status) {
        const userData = JSON.parse(localStorage.getItem("user"));
        const commId = userData?.Comm_Id;
        const filteredCondolences = result.data.filter(
          (condolence) => condolence.user.Comm_Id == commId
        );
        setCondolences(filteredCondolences);
        const pending = filteredCondolences.filter(
          (condolence) =>
            condolence.N_Status == "pending" &&
            condolence.user.Comm_Id == commId
        );
        setPendingRequests(pending);
      } else {
        throw new Error("Failed to fetch condolences");
      }
    } catch (error) {
      console.error("Error fetching condolences:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to load condolences. Please try again.",
        icon: "error",
        confirmButtonColor: "#1A2B49",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterCondolences = () => {
    let filtered = [...condolences];

    if (statusFilter) {
      filtered = filtered.filter(
        (condolence) => condolence.N_Status == statusFilter
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (condolence) =>
          condolence.N_Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (condolence.N_MaleName &&
            condolence.N_MaleName.toLowerCase().includes(
              searchTerm.toLowerCase()
            )) ||
          (condolence.N_WomanName &&
            condolence.N_WomanName.toLowerCase().includes(
              searchTerm.toLowerCase()
            )) ||
          (condolence.N_Description &&
            condolence.N_Description.toLowerCase().includes(
              searchTerm.toLowerCase()
            ))
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (activeTab == "today") {
      filtered = filtered.filter((condolence) => {
        const condolenceDate = new Date(condolence.N_Date);
        condolenceDate.setHours(0, 0, 0, 0);
        return condolenceDate.getTime() == today.getTime();
      });
    } else if (activeTab == "completed") {
      filtered = filtered.filter((condolence) => {
        const condolenceDate = new Date(condolence.N_Date);
        condolenceDate.setHours(0, 0, 0, 0);
        return condolenceDate < today;
      });
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.N_Date);
      const dateB = new Date(b.N_Date);
      dateA.setHours(0, 0, 0, 0);
      dateB.setHours(0, 0, 0, 0);

      const diffA = Math.abs(dateA.getTime() - today.getTime());
      const diffB = Math.abs(dateB.getTime() - today.getTime());

      if (diffA == diffB) {
        if (dateA >= today && dateB < today) return -1;
        if (dateA < today && dateB >= today) return 1;
        return dateA < dateB ? -1 : 1;
      }

      return diffA - diffB;
    });

    setFilteredCondolences(filtered);
  };

  const getTodaysCondolences = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return condolences.filter((condolence) => {
      const condolenceDate = new Date(condolence.N_Date);
      condolenceDate.setHours(0, 0, 0, 0);
      return (
        condolenceDate.getTime() == today.getTime() &&
        condolence.N_Status == "approved"
      );
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
      N_MaleName: e.target.value == "Male" ? formData.N_MaleName : "",
      N_WomanName: e.target.value == "Female" ? formData.N_WomanName : "",
    });
  };

  const handleCategoryChange = (e) => {
    setFormData({
      ...formData,
      N_Category: e.target.value,
      N_MaleName: "",
      N_WomanName: "",
      N_Name: "",
      N_Age: "",
    });
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    const previews = [];

    for (const file of files) {
      if (validImageTypes.includes(file.type)) {
        validFiles.push(file);
        previews.push(URL.createObjectURL(file));
      } else {
        Swal.fire({
          title: "Invalid File",
          text: `${file.name} is not a valid image. Please upload jpeg, jpg, png, gif, bmp, or webp files.`,
          icon: "error",
          confirmButtonColor: "#1A2B49",
        });
      }
    }

    setImages((prev) => [...prev, ...validFiles]);
    setPreviewImages((prev) => [...prev, ...previews]);
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageClick = (image) => {
    setEnlargedImage(image);
  };

  const getChangedFields = (original, current) => {
    const changed = {};
    Object.keys(current).forEach((key) => {
      if (current[key] !== original[key] && current[key] !== "") {
        changed[key] = current[key];
      }
    });
    return changed;
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

      const formDataToSend = new FormData();
      const payload = {
        ...formData,
        U_Id: userData.U_Id,
        Comm_Id: userData.Comm_Id,
      };

      if (isEditing) {
        payload.N_Id = selectedCondolence.N_Id;
        const changedFields = getChangedFields(originalFormData, formData);
        Object.keys(changedFields).forEach((key) => {
          formDataToSend.append(key, changedFields[key]);
        });
        formDataToSend.append("N_Id", selectedCondolence.N_Id);
      } else {
        Object.keys(payload).forEach((key) => {
          formDataToSend.append(key, payload[key]);
        });
      }

      if (images.length > 0) {
        images.forEach((image, index) => {
          formDataToSend.append(`N_Image[${index}]`, image);
        });
      } else if (
        isEditing &&
        selectedCondolence?.N_Image &&
        images.length == 0
      ) {
        formDataToSend.append(
          "N_Image",
          JSON.stringify(selectedCondolence.N_Image)
        );
      }

      const url = "https://parivaar.app/public/api/condolences";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });

      const result = await response.json();

      if (response.ok && result.status) {
        Swal.fire({
          title: isEditing ? "Updated!" : "Success!",
          text: isEditing
            ? "Condolence updated successfully!"
            : "Condolence added successfully!",
          icon: "success",
          confirmButtonColor: "#1A2B49",
        });
        resetForm();
        fetchCondolences();
      } else {
        const errorMessages = result.errors
          ? Object.values(result.errors).flat().join("\n")
          : `Failed to ${
              isEditing ? "update" : "add"
            } condolence. Please check your input.`;
        Swal.fire({
          title: "Error",
          text: errorMessages,
          icon: "error",
          confirmButtonColor: "#1A2B49",
        });
      }
    } catch (error) {
      console.error(
        `Error ${isEditing ? "updating" : "posting"} condolence:`,
        error
      );
      Swal.fire({
        title: "Error",
        text: `Failed to ${
          isEditing ? "update" : "add"
        } condolence. Please try again later.`,
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
      N_Category: "Death",
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
    setOriginalFormData(null);
    setImages([]);
    setPreviewImages([]);
    setGender("Male");
    setShowForm(false);
    setIsEditing(false);
    setSelectedCondolence(null);
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
            `https://parivaar.app/public/api/condolences/${N_Id}`,
            {
              method: "DELETE",
            }
          );

          if (response.ok) {
            Swal.fire({
              title: "Deleted!",
              text: "Condolence has been deleted.",
              icon: "success",
              confirmButtonColor: "#1A2B49",
            });
            setCondolences(condolences.filter((c) => c.N_Id !== N_Id));
            setPendingRequests(pendingRequests.filter((c) => c.N_Id !== N_Id));
          } else {
            throw new Error("Failed to delete condolence");
          }
        } catch (error) {
          console.error("Error deleting condolence:", error);
          Swal.fire({
            title: "Error",
            text: "Failed to delete condolence. Please try again.",
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
        `https://parivaar.app/public/api/condolences/${N_Id}`,
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
          text: "The condolence request has been approved.",
          icon: "success",
          confirmButtonColor: "#1A2B49",
        });
        fetchCondolences();
      } else {
        throw new Error("Failed to approve condolence");
      }
    } catch (error) {
      console.error("Error approving condolence:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to approve condolence. Please try again.",
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
        `https://parivaar.app/public/api/condolences/${N_Id}`,
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
          text: "The condolence request has been rejected.",
          icon: "info",
          confirmButtonColor: "#1A2B49",
        });
        fetchCondolences();
      } else {
        throw new Error("Failed to reject condolence");
      }
    } catch (error) {
      console.error("Error rejecting condolence:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to reject condolence. Please try again.",
        icon: "error",
        confirmButtonColor: "#1A2B49",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = (condolence) => {
    setSelectedCondolence(condolence);
  };

  const handleViewRequestDetails = (request) => {
    setShowRequestDetails(request);
  };

  const handleEditClick = (e, condolence) => {
    e.stopPropagation();
    setIsEditing(true);
    const formData = {
      N_Title: condolence.N_Title || "",
      N_Category: condolence.N_Category || "Death",
      N_MaleName: condolence.N_MaleName || "",
      N_WomanName: condolence.N_WomanName || "",
      N_Name: condolence.N_Name || "",
      N_Date: condolence.N_Date
        ? new Date(condolence.N_Date).toISOString().split("T")[0]
        : "",
      N_Age: condolence.N_Age || "",
      N_Years: condolence.N_Years || "",
      N_Mobile: condolence.N_Mobile || "",
      N_Email: condolence.N_Email || "",
      N_Address: condolence.N_Address || "",
      N_Description: condolence.N_Description || "",
      N_Status: condolence.N_Status || "pending",
    };
    setFormData(formData);
    setOriginalFormData({ ...formData });
    setGender(
      condolence.N_MaleName
        ? "Male"
        : condolence.N_WomanName
        ? "Female"
        : "Male"
    );
    setPreviewImages(condolence.N_Image || []);
    setImages([]);
    setSelectedCondolence(condolence);
    setShowForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Death":
        return <AlertCircle className="w-6 h-6" />;
      case "Death Anniversary":
        return <Calendar className="w-6 h-6" />;
      default:
        return <FileText className="w-6 h-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {isLoading && <CustomLogoLoader />}

      <div className="bg-[#1A2B49] rounded-xl text-white py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <button
            className="flex cursor-pointer items-center text-white"
            onClick={() => setActivePage("dashboardmember")}
          >
            <CircleChevronLeft size={30} className="mr-2" />
          </button>

          <h1 className="text-2xl font-bold text-center lg:text-left">
            Community Condolences
          </h1>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 text-sm py-2 w-full rounded-lg bg-white text-black focus:ring-2 focus:ring-[#1A2B49] focus:outline-none"
              />
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="flex items-center text-sm gap-2 bg-[#1A2B49] border border-white px-4 py-2 rounded-lg font-medium hover:bg-[#2A3B59] transition-all duration-300"
            >
              <Plus className="w-5 h-5" />
              Add Condolence
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-md p-0 col-span-1 max-h-96 overflow-y-auto">
              <div className="bg-[#1C2636] text-white text-lg font-bold py-3 px-4 rounded-t-xl sticky top-0 z-10">
                Condolences Requests
              </div>
              <div className="p-6">
                {pendingRequests.length > 0 ? (
                  pendingRequests
                    .sort((a, b) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const dateA = new Date(a.N_Date);
                      const dateB = new Date(b.N_Date);
                      dateA.setHours(0, 0, 0, 0);
                      dateB.setHours(0, 0, 0, 0);

                      if (
                        dateA.getTime() == today.getTime() &&
                        dateB.getTime() !== today.getTime()
                      )
                        return -1;
                      if (
                        dateB.getTime() == today.getTime() &&
                        dateA.getTime() !== today.getTime()
                      )
                        return 1;

                      return dateB.getTime() - dateA.getTime();
                    })
                    .map((request) => (
                      <div
                        key={request.N_Id}
                        className="border-b last:border-b-0 py-4"
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
                    ))
                ) : (
                  <div className="text-center py-6">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No requests available.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-0 col-span-1 max-h-96 overflow-y-auto">
              <div className="bg-[#1C2636] text-white text-lg font-bold py-3 px-4 rounded-t-xl sticky top-0 z-10">
                Today's Condolences
              </div>
              <div className="p-6">
                {getTodaysCondolences().length > 0 ? (
                  getTodaysCondolences().map((condolence) => (
                    <div
                      key={condolence.N_Id}
                      className="border-b last:border-b-0 py-4"
                    >
                      <h3 className="text-lg font-semibold text-[#1A2B49]">
                        {condolence.N_Title}
                      </h3>
                      <div className="flex items-center text-gray-600 mt-1">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{formatDate(condolence.N_Date)}</span>
                      </div>
                      <button
                        onClick={() => handleCardClick(condolence)}
                        className="text-blue-500 hover:underline mt-2 text-sm"
                      >
                        View Details
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">
                      There are no condolence notices today.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-6 col-span-1 max-h-96">
              <div className="bg-white rounded-xl shadow-md p-6 flex justify-between items-center flex-1">
                <div>
                  <p className="text-sm text-gray-500">TOTAL</p>
                  <h3 className="text-3xl font-bold text-[#1A2B49]">
                    {condolences.length}
                  </h3>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Bell className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 flex justify-between items-center flex-1">
                <div>
                  <p className="text-sm text-gray-500">TODAY'S</p>
                  <h3 className="text-3xl font-bold text-[#1A2B49]">
                    {getTodaysCondolences().length}
                  </h3>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 flex justify-between items-center flex-1">
                <div>
                  <p className="text-sm text-gray-500">PAST</p>
                  <h3 className="text-3xl font-bold text-[#1A2B49]">
                    {
                      condolences.filter((c) => new Date(c.N_Date) < new Date())
                        .length
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
                className={`px-4 py-2 rounded-lg font-medium shadow-md transition-all duration-300 ${
                  statusFilter == "approved"
                    ? "bg-green-500 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                Accepted Celebration
              </button>
              <button
                onClick={() => setStatusFilter("rejected")}
                className={`px-4 py-2 rounded-lg font-medium shadow-md transition-all duration-300 ${
                  statusFilter == "rejected"
                    ? "bg-red-500 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                Rejected Celebration
              </button>
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
                  activeTab == "all"
                    ? "bg-[#1A2B49] text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab("today")}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeTab == "today"
                    ? "bg-[#1A2B49] text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setActiveTab("completed")}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeTab == "completed"
                    ? "bg-[#1A2B49] text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                Past
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCondolences.map((condolence) => (
              <div
                key={condolence.N_Id}
                className="bg-white rounded-xl shadow-md p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">
                      {condolence.N_Category}
                    </p>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {condolence.N_Title}
                    </h3>
                    <div className="flex items-center text-gray-600 mt-2">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{formatDate(condolence.N_Date)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditClick(condolence)}
                      className="text-blue-500 hover:text-blue-600"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(condolence.N_Id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => handleCardClick(condolence)}
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
              className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#1A2B49]">
                  {isEditing ? "Edit Condolence" : "Add New Condolence"}
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
                        placeholder="Enter condolence title"
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
                        <option value="Death">Death</option>
                        <option value="Death Anniversary">
                          Death Anniversary
                        </option>
                        <option value="Others">Others</option>
                      </select>
                    </div>

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

                    {gender == "Male" ? (
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
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Female Name
                        </label>
                        <input
                          type="text"
                          name="N_WomanName"
                          value={formData.N_WomanName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent"
                          placeholder="Enter female name"
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
                        Age
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
                        placeholder="Enter mobile number"
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
                        placeholder="Enter condolence description"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Images
                      </label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-[#1A2B49] transition-colors">
                        <div className="space-y-1 text-center">
                          <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label className="relative cursor-pointer rounded-md font-medium text-[#1A2B49] hover:text-[#2A3B59] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#1A2B49]">
                              <span>Upload files</span>
                              <input
                                type="file"
                                multiple
                                accept="image/jpeg,image/jpg,image/png,image/gif,image/bmp,image/webp"
                                onChange={handleImageChange}
                                className="sr-only"
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            JPEG, JPG, PNG, GIF, BMP, WEBP up to 10MB
                          </p>
                        </div>
                      </div>
                      {previewImages.length > 0 && (
                        <div className="mt-4 grid grid-cols-3 gap-4">
                          {previewImages.map((preview, index) => (
                            <div key={index} className="relative">
                              <img
                                src={preview || "/placeholder.svg"}
                                alt={`Preview ${index + 1}`}
                                className="h-24 w-full object-cover rounded-lg cursor-pointer"
                                onClick={() => handleImageClick(preview)}
                              />
                              <button
                                onClick={() => handleRemoveImage(index)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
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
                    {isEditing ? "Update Condolence" : "Save Condolence"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedCondolence && !isEditing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-[#1A2B49]">
                    {selectedCondolence.N_Title}
                  </h2>
                  <button
                    onClick={() => setSelectedCondolence(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    {selectedCondolence.N_Image &&
                    selectedCondolence.N_Image.length > 0 ? (
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        {selectedCondolence.N_Image.map((img, index) => (
                          <img
                            key={index}
                            src={img || "/placeholder.svg"}
                            alt={`Condolence ${index + 1}`}
                            className="w-full h-40 object-cover rounded-lg cursor-pointer"
                            onClick={() => handleImageClick(img)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="w-full h-40 bg-blue-100 flex items-center justify-center rounded-lg mb-4">
                        {getCategoryIcon(selectedCondolence.N_Category)}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      <span className="font-bold">Category:</span>{" "}
                      {selectedCondolence.N_Category || "Others"}
                    </p>
                    {selectedCondolence.N_MaleName && (
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        <span className="font-bold">Male Name:</span>{" "}
                        {selectedCondolence.N_MaleName}
                      </p>
                    )}
                    {selectedCondolence.N_WomanName && (
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        <span className="font-bold">Female Name:</span>{" "}
                        {selectedCondolence.N_WomanName}
                      </p>
                    )}
                    {selectedCondolence.N_Name && (
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        <span className="font-bold">Name:</span>{" "}
                        {selectedCondolence.N_Name}
                      </p>
                    )}
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      <span className="font-bold">Date:</span>{" "}
                      {formatDate(selectedCondolence.N_Date)}
                    </p>
                    {selectedCondolence.N_Age && (
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        <span className="font-bold">Age:</span>{" "}
                        {selectedCondolence.N_Age} years
                      </p>
                    )}
                    {selectedCondolence.N_Years && (
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        <span className="font-bold">Years:</span>{" "}
                        {selectedCondolence.N_Years}
                      </p>
                    )}
                    {selectedCondolence.N_Mobile && (
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        <span className="font-bold">Mobile:</span>{" "}
                        {selectedCondolence.N_Mobile}
                      </p>
                    )}
                    {selectedCondolence.N_Email && (
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        <span className="font-bold">Email:</span>{" "}
                        {selectedCondolence.N_Email}
                      </p>
                    )}
                    {selectedCondolence.N_Address && (
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        <span className="font-bold">Address:</span>{" "}
                        {selectedCondolence.N_Address}
                      </p>
                    )}
                    {selectedCondolence.N_Description && (
                      <p className="text-sm font-medium text-gray-700">
                        <span className="font-bold">Description:</span>{" "}
                        {selectedCondolence.N_Description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showRequestDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
                            alt={`Condolence ${index + 1}`}
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
                    {showRequestDetails.N_MaleName && (
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        <span className="font-bold">Male Name:</span>{" "}
                        {showRequestDetails.N_MaleName}
                      </p>
                    )}
                    {showRequestDetails.N_WomanName && (
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        <span className="font-bold">Female Name:</span>{" "}
                        {showRequestDetails.N_WomanName}
                      </p>
                    )}
                    {showRequestDetails.N_Name && (
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        <span className="font-bold">Name:</span>{" "}
                        {showRequestDetails.N_Name}
                      </p>
                    )}
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      <span className="font-bold">Date:</span>{" "}
                      {formatDate(showRequestDetails.N_Date)}
                    </p>
                    {showRequestDetails.N_Age && (
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        <span className="font-bold">Age:</span>{" "}
                        {showRequestDetails.N_Age} years
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

        {enlargedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="relative max-w-4xl max-h-[90vh]">
              <button
                onClick={() => setEnlargedImage(null)}
                className="absolute top-2 right-2 bg-white text-black rounded-full p-2 hover:bg-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
              <img
                src={enlargedImage}
                alt="Enlarged view"
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Condolencemember;