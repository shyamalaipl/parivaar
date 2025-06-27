"use client";

import { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import {
  Plus,
  X,
  Calendar,
  Search,
  ChevronRight,
  ChevronLeft,
  Clock,
  CheckCircle,
  Trash2,
  Edit2,
  FileText,
  CalendarIcon,
  MapPin,
  Phone,
  CircleChevronLeft,
  Mail,
  BaggageClaim,
  Info,
  User,
} from "lucide-react";
import logoImage from "../../src/img/parivarlogo1.png";

// Custom Loader Component
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

const Newsmember = ({ setActivePage, activePage }) => {
  const [newsList, setNewsList] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedNewsId, setSelectedNewsId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editNewsId, setEditNewsId] = useState(null);
  const [editingNews, setEditingNews] = useState(null);
  const [selectedImage, setSelectedImage] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [currentSlide, setCurrentSlide] = useState(0);
  const formRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    category: "General",
    name: "",
    date: "",
    mobile: "",
    email: "",
    address: "",
    description: "",
    images: [],
  });

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const commId = user.Comm_Id;
  const userId = user.U_Id;
  const roleId = user.Role_Id;

  useEffect(() => {
    if (!roleId || roleId !== 2) {
      Swal.fire({
        title: "Unauthorized",
        text: "Only users with Role_Id 2 can access this page. Please log in with appropriate credentials.",
        icon: "error",
        confirmButtonColor: "#1A2B49",
      }).then(() => {
        window.location.href = "/login";
      });
    } else if (commId) {
      fetchNews();
    }
  }, [commId, roleId]);

  useEffect(() => {
    filterNews();
  }, [newsList, searchTerm, dateFilter, activeTab]);

  useEffect(() => {
    if (isFormOpen && formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isFormOpen]);

  const fetchNews = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("https://parivaar.app/public/api/notice");
      if (!response.ok) {
        throw new Error(
          `Failed to fetch news: ${response.status} ${response.statusText}`
        );
      }
      const data = await response.json();

      console.log("API Response:", data);

      // Safely filter news
      const filteredNews = data.data.filter((news) => {
        if (!news.user) {
          console.warn(`News item with ID ${news.N_Id} has no user data`);
          return false;
        }
        return news.user.Comm_Id == commId;
      });

      console.log("Filtered News:", filteredNews);
      setNewsList(filteredNews);
    } catch (error) {
      console.error("Fetch News Error:", error);
      Swal.fire({
        title: "Error",
        text: `Failed to fetch news: ${error.message}`,
        icon: "error",
        confirmButtonColor: "#1A2B49",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterNews = () => {
    let filtered = [...newsList];

    if (searchTerm) {
      filtered = filtered.filter(
        (news) =>
          news.N_Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (news.N_MaleName &&
            news.N_MaleName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (news.N_Description &&
            news.N_Description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (dateFilter) {
      filtered = filtered.filter((news) => news.N_Date == dateFilter);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (activeTab == "happening") {
      filtered = filtered.filter((news) => {
        const newsDate = new Date(news.N_Date);
        newsDate.setHours(0, 0, 0, 0);
        return newsDate >= today;
      });
    } else if (activeTab == "completed") {
      filtered = filtered.filter((news) => {
        const newsDate = new Date(news.N_Date);
        newsDate.setHours(0, 0, 0, 0);
        return newsDate < today;
      });
    }

    setFilteredNews(filtered);
  };

  const getTodaysNews = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return newsList.filter((news) => {
      const newsDate = new Date(news.N_Date);
      newsDate.setHours(0, 0, 0, 0);
      return newsDate.getTime() == today.getTime();
    });
  };

  const getPastNews = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return newsList.filter((news) => {
      const newsDate = new Date(news.N_Date);
      newsDate.setHours(0, 0, 0, 0);
      return newsDate < today;
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => {
      const validTypes = ["image/jpeg", "image/jpg", "image/png"];

      if (!validTypes.includes(file.type)) {
        Swal.fire({
          title: "Invalid File",
          text: `${file.name} is not a valid image type (jpg, jpeg, png only)`,
          icon: "error",
          confirmButtonColor: "#1A2B49",
        });
        return false;
      }

      if (file.size > 2 * 1024 * 1024) {
        Swal.fire({
          title: "File Too Large",
          text: `${file.name} exceeds 2MB limit. Please select a smaller file.`,
          icon: "error",
          confirmButtonColor: "#1A2B49",
        });
        return false;
      }

      return true;
    });

    if (validFiles.length > 0) {
      setFormData((prev) => ({ ...prev, images: validFiles }));
    } else {
      e.target.value = null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      Swal.fire({
        title: "Missing Fields",
        text: "Notice Title is required",
        icon: "warning",
        confirmButtonColor: "#1A2B49",
      });
      return;
    }

    const oversizedFiles = formData.images.filter(
      (file) => file.size > 2 * 1024 * 1024
    );
    if (oversizedFiles.length > 0) {
      Swal.fire({
        title: "File Size Error",
        text: "One or more selected files exceed the 2MB limit. Please select files smaller than 2MB.",
        icon: "error",
        confirmButtonColor: "#1A2B49",
      });
      return;
    }

    if (!roleId || roleId !== 2) {
      Swal.fire({
        title: "Unauthorized",
        text: "Only users with Role_Id 2 can post notices.",
        icon: "error",
        confirmButtonColor: "#1A2B49",
      }).then(() => {
        window.location.href = "/login";
      });
      return;
    }

    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("N_Title", formData.title);
      formDataToSend.append("N_Category", formData.category);
      formDataToSend.append("N_MaleName", formData.name || "");
      formDataToSend.append("N_Date", formData.date);
      formDataToSend.append("N_Mobile", formData.mobile || "");
      formDataToSend.append("N_Email", formData.email || "");
      formDataToSend.append("N_Address", formData.address || "");
      formDataToSend.append("N_Description", formData.description || "");
      formDataToSend.append("U_Id", userId);
      formDataToSend.append("Role_Id", roleId);

      formData.images.forEach((file, index) => {
        formDataToSend.append(`N_Image[${index}]`, file);
      });

      let response;
      if (isEditing) {
        formDataToSend.append("_method", "PUT");
        response = await fetch(
          `https://parivaar.app/public/api/notice/${editNewsId}`,
          {
            method: "POST",
            body: formDataToSend,
          }
        );
      } else {
        response = await fetch("https://parivaar.app/public/api/notice", {
          method: "POST",
          body: formDataToSend,
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        if (
          errorData.error ==
          "Unauthorized. Only users with Role_Id 2 can post notices."
        ) {
          Swal.fire({
            title: "Unauthorized",
            text: "Only users with Role_Id 2 can post notices. Please log in with appropriate credentials.",
            icon: "error",
            confirmButtonColor: "#1A2B49",
          }).then(() => {
            window.location.href = "/login";
          });
          return;
        }
        throw new Error(JSON.stringify(errorData.errors || errorData.message));
      }

      const updatedNews = await response.json();
      if (isEditing) {
        setNewsList((prev) =>
          prev.map((news) =>
            news.N_Id == editNewsId ? updatedNews.data : news
          )
        );
        Swal.fire({
          title: "Success",
          text: "Notice updated successfully",
          icon: "success",
          confirmButtonColor: "#1A2B49",
        });
      } else {
        setNewsList((prev) => [...prev, updatedNews.data]);
        Swal.fire({
          title: "Success",
          text: "Notice published successfully",
          icon: "success",
          confirmButtonColor: "#1A2B49",
        });
      }

      resetForm();
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Error",
        text: `Failed to ${isEditing ? "update" : "publish"} notice: ${
          error.message
        }`,
        icon: "error",
        confirmButtonColor: "#1A2B49",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = async (newsId) => {
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
        setIsLoading(true);
        try {
          const response = await fetch(
            `https://parivaar.app/public/api/notice/${newsId}`,
            {
              method: "DELETE",
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to delete notice");
          }

          setNewsList((prev) => prev.filter((news) => news.N_Id !== newsId));
          Swal.fire({
            title: "Deleted!",
            text: "Notice has been deleted successfully.",
            icon: "success",
            confirmButtonColor: "#1A2B49",
          });
        } catch (error) {
          console.error("Delete error:", error);
          Swal.fire({
            title: "Error",
            text: `Failed to delete notice: ${error.message}`,
            icon: "error",
            confirmButtonColor: "#1A2B49",
          });
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  const handleEditClick = (news) => {
    setIsFormOpen(true);
    setIsEditing(true);
    setEditNewsId(news.N_Id);
    setFormData({
      title: news.N_Title,
      category: news.N_Category,
      name: news.N_MaleName || "",
      date: news.N_Date,
      mobile: news.N_Mobile || "",
      email: news.N_Email || "",
      address: news.N_Address || "",
      description: news.N_Description || "",
      images: [],
    });
    setEditingNews(news);
  };

  const handleNewsClick = (newsId) => {
    setSelectedNewsId(selectedNewsId == newsId ? null : newsId);
  };

  const handleImageClick = (newsId, imageUrl) => {
    setSelectedImage((prev) => ({ ...prev, [newsId]: imageUrl }));
  };

  const nextSlide = () => {
    const todaysNews = getTodaysNews();
    setCurrentSlide((prev) => (prev == todaysNews.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    const todaysNews = getTodaysNews();
    setCurrentSlide((prev) => (prev == 0 ? todaysNews.length - 1 : prev - 1));
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      category: "",
      name: "",
      date: "",
      mobile: "",
      email: "",
      address: "",
      description: "",
      images: [],
    });
    setIsFormOpen(false);
    setIsEditing(false);
    setEditNewsId(null);
    setEditingNews(null);
  };

  const toggleForm = () => {
    if (!isFormOpen) {
      resetForm();
      setIsFormOpen(true);
    } else {
      setIsFormOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdf9f7] to-[#f0f4ff]">
      {isLoading && <CustomLogoLoader />}

      {/* Header Section */}
      <div className="bg-[#1A2B49] text-white py-2 rounded-xl px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              className="flex cursor-pointer items-center text-white"
              onClick={() => setActivePage("dashboardmember")}
            >
              <CircleChevronLeft size={30} className="mr-2" />
            </button>
          </div>
          <div className="div">
            <h1 className="text-3xl font-bold">Community News & Notices</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleForm}
              className="flex items-center gap-2 bg-white text-[#1A2B49] px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300"
            >
              <Plus className="w-5 h-5" />
              Add Notice
            </button>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-45 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Add Notice Form */}
      {isFormOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-[#00000080] bg-opacity-50">
          <div
            ref={formRef}
            className="bg-white rounded-lg shadow-md p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto transform transition-all duration-300 allg"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#1A2B49]">
                {isEditing ? "Edit Notice" : "Create New Notice"}
              </h2>
              <button
                onClick={toggleForm}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notice Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent"
                  required
                  disabled={isLoading}
                  placeholder="Enter notice title"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent"
                    required
                  >
                    <option value="General">General</option>
                    <option value="Event">Event</option>
                    <option value="Announcement">Announcement</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent"
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent min-h-[100px]"
                  placeholder="Enter notice details"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 bg-[#1A2B49] text-white font-medium rounded-lg hover:bg-[#1A2B49]/90 transition-colors duration-300 ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={isLoading}
                >
                  {isEditing ? "Update Notice" : "Publish Notice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        className={`max-w-7xl mx-auto px-6 py-6 ${
          isFormOpen ? "hidden" : "block"
        }`}
      >
        <div className="py-6 space-y-10">
          {/* Top Section: Today's Notices and Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Today's Notices Section */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-[#1A2B49] mb-4">
                Today's Notices
              </h2>
              {getTodaysNews().length > 0 ? (
                <div className="relative bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="flex items-center relative">
                    {/* Left Arrow */}
                    <button
                      onClick={prevSlide}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow hover:bg-gray-100 transition"
                      disabled={getTodaysNews().length <= 1}
                    >
                      <ChevronLeft className="w-5 h-5 text-[#1A2B49]" />
                    </button>

                    {/* News Slider */}
                    <div className="w-full overflow-hidden">
                      <div
                        className="flex transition-transform duration-500 ease-in-out"
                        style={{
                          transform: `translateX(-${currentSlide * 100}%)`,
                        }}
                      >
                        {getTodaysNews().map((news) => (
                          <div
                            key={news.N_Id}
                            className="w-full flex-shrink-0 p-6"
                          >
                            <div className="flex flex-col md:flex-row gap-6">
                              {/* Content */}
                              <div className="w-full ml-10 md:w-2/3 space-y-2">
                                <h3 className="text-xl font-semibold text-[#1A2B49]">
                                  {news.N_Title}
                                </h3>
                                <div className="flex items-center text-gray-600 text-sm">
                                  <Calendar className="w-4 h-4 mr-2" />
                                  {formatDate(news.N_Date)}
                                </div>
                                {news.N_Category && (
                                  <p className="text-gray-600">
                                    Category: {news.N_Category}
                                  </p>
                                )}
                                {news.N_MaleName && (
                                  <p className="text-gray-600">
                                    Name: {news.N_MaleName}
                                  </p>
                                )}
                                {news.N_Description && (
                                  <p className="text-gray-600">
                                    {news.N_Description}
                                  </p>
                                )}

                                <div className="flex items-center justify-between pt-4">
                                  <div className="text-sm text-gray-500">
                                    {news.N_Mobile && (
                                      <p>Contact: {news.N_Mobile}</p>
                                    )}
                                    {news.N_Email && (
                                      <p>Email: {news.N_Email}</p>
                                    )}
                                  </div>
                                  <div className="flex justify-end gap-4">
                                    <button
                                      onClick={() => handleEditClick(news)}
                                      className="text-blue-500 hover:text-blue-600 flex items-center gap-1 text-sm"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                      Edit
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteClick(news.N_Id)
                                      }
                                      className="text-red-500 hover:text-red-600 flex items-center gap-1 text-sm"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right Arrow */}
                    <button
                      onClick={nextSlide}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow hover:bg-gray-100 transition"
                      disabled={getTodaysNews().length <= 1}
                    >
                      <ChevronRight className="w-5 h-5 text-[#1A2B49]" />
                    </button>
                  </div>

                  {/* Slider Dots */}
                  {getTodaysNews().length > 1 && (
                    <div className="flex justify-center gap-2 py-4">
                      {getTodaysNews().map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentSlide(index)}
                          className={`w-2 h-2 rounded-full ${
                            currentSlide == index
                              ? "bg-[#1A2B49]"
                              : "bg-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-md p-6 text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-6 h-6 text-[#1A2B49]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1A2B49]">
                    No Today's Notices
                  </h3>
                  <p className="text-gray-600 mt-2">
                    There are no notices scheduled for today.
                  </p>
                </div>
              )}
            </div>

            {/* Stats Section */}
            <div className="space-y-4">
              {/* Total Notices */}
              <div className="bg-white rounded-lg shadow-md p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 uppercase">
                    Total Notices
                  </p>
                  <h3 className="text-2xl font-bold text-[#1A2B49]">
                    {newsList.length}
                  </h3>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
              </div>

              {/* Today's Notices */}
              <div className="bg-white rounded-lg shadow-md p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 uppercase">
                    Today's Notices
                  </p>
                  <h3 className="text-2xl font-bold text-[#1A2B49]">
                    {getTodaysNews().length}
                  </h3>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CalendarIcon className="w-5 h-5 text-green-600" />
                </div>
              </div>

              {/* Past Notices */}
              <div className="bg-white rounded-lg shadow-md p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 uppercase">
                    Past Notices
                  </p>
                  <h3 className="text-2xl font-bold text-[#1A2B49]">
                    {getPastNews().length}
                  </h3>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
       <div className="mb-6">
  <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
    {/* Search Input */}
    <div className="w-full">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search by name, date..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent"
        />
      </div>
    </div>

    {/* Buttons and Date Picker */}
    <div className="flex flex-col sm:flex-row gap-4 items-center w-full md:w-auto">
      {/* Tab Buttons */}
      <div className="flex gap-2">
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
          onClick={() => setActiveTab("happening")}
          className={`px-4 py-2 rounded-lg font-medium flex items-center gap-1 ${
            activeTab === "happening"
              ? "bg-[#1A2B49] text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          <Clock className="w-4 h-4" />
          Upcoming
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`px-4 py-2 rounded-lg font-medium flex items-center gap-1 ${
            activeTab === "completed"
              ? "bg-[#1A2B49] text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          Past
        </button>
      </div>

      {/* Date Picker */}
      <div className="relative w-full sm:w-auto">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Calendar className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent"
        />
      </div>
    </div>
  </div>
</div>

        {/* Notices List */}
        {filteredNews.length == 0 ? (
          <div className="text-center py-8 bg-white rounded-lg shadow-md">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-[#1A2B49]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1A2B49]">
              No Notices Found
            </h3>
            <p className="text-gray-600 mt-2">
              {searchTerm || dateFilter
                ? "No notices match your search criteria."
                : activeTab !== "all"
                ? `No ${activeTab} notices found.`
                : "Start by adding your first notice to share with the community."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredNews.map((news) => (
              <div
                key={news.N_Id}
                className={`bg-white rounded-lg shadow-md p-4 transition-all duration-300 hover:shadow-lg ${
                  selectedNewsId == news.N_Id ? "ring-2 ring-[#1A2B49]" : ""
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h2 className="text-lg font-bold text-[#1A2B49]">
                      {news.N_Title}
                    </h2>
                    {news.N_MaleName && (
                      <p className="text-gray-600 mt-1">{news.N_MaleName}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditClick(news)}
                      className="text-blue-500 hover:text-blue-700 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(news.N_Id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(news.N_Date)}
                </div>

                <div className="mb-4">
                  <button
                    onClick={() => handleNewsClick(news.N_Id)}
                    className="text-sm text-[#1A2B49] font-medium hover:underline flex items-center"
                  >
                    {selectedNewsId == news.N_Id
                      ? "Hide Details"
                      : "View Details"}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-4 w-4 ml-1 transition-transform duration-300 ${
                        selectedNewsId == news.N_Id ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </div>

                {/* Modal for Notice Details in Landscape Mode */}
                {selectedNewsId === news.N_Id && (
                  <div className="fixed inset-0 flex items-center justify-center z-50 bg-[#00000063] bg-opacity-60 backdrop-blur-sm">
                    <div className="bg-gradient-to-br from-[#fdf9f7] to-[#f0f4ff] rounded-2xl shadow-2xl p-8 w-full max-w-4xl max-h-[90vh] flex flex-col lg:flex-row transform transition-all duration-300">
                      <div className="flex-1 pr-0 lg:pr-6 space-y-6 overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                            {news.N_Title}
                          </h2>
                          <button
                            onClick={() => setSelectedNewsId(null)}
                            className="text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-full hover:bg-gray-100"
                            aria-label="Close modal"
                          >
                            <X className="w-6 h-6" />
                          </button>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mb-4">
                          <Calendar className="h-5 w-5 mr-2 text-[#1A2B49]" />
                          {formatDate(news.N_Date)}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {news.N_Category && (
                            <div>
                              <h3 className="font-semibold text-gray-800 text-sm mb-1">
                                Category:
                              </h3>
                              <p className="text-gray-700">{news.N_Category}</p>
                            </div>
                          )}
                          {news.N_MaleName && (
                            <div className="flex items-start gap-3">
                              <User className="w-5 h-5 text-[#1A2B49] mt-1 flex-shrink-0" />
                              <div>
                                <h3 className="font-semibold text-gray-800 text-sm mb-1">
                                  Name:
                                </h3>
                                <p className="text-gray-700">
                                  {news.N_MaleName}
                                </p>
                              </div>
                            </div>
                          )}
                          {news.N_Address && (
                            <div className="flex items-start gap-3">
                              <MapPin className="w-5 h-5 text-[#1A2B49] mt-1 flex-shrink-0" />
                              <div>
                                <h3 className="font-semibold text-gray-800 text-sm mb-1">
                                  Address:
                                </h3>
                                <p className="text-gray-700">
                                  {news.N_Address}
                                </p>
                              </div>
                            </div>
                          )}
                          {news.N_Mobile && (
                            <div className="flex items-start gap-3">
                              <Phone className="w-5 h-5 text-[#1A2B49] mt-1 flex-shrink-0" />
                              <div>
                                <h3 className="font-semibold text-gray-800 text-sm mb-1">
                                  Contact:
                                </h3>
                                <p className="text-gray-700">{news.N_Mobile}</p>
                              </div>
                            </div>
                          )}
                          {news.N_Email && (
                            <div className="flex items-start gap-3">
                              <Mail className="w-5 h-5 text-[#1A2B49] mt-1 flex-shrink-0" />
                              <div>
                                <h3 className="font-semibold text-gray-800 text-sm mb-1">
                                  Email:
                                </h3>
                                <p className="text-gray-700">{news.N_Email}</p>
                              </div>
                            </div>
                          )}
                          {news.N_Description && (
                            <div className="sm:col-span-2">
                              <div className="flex items-start gap-3">
                                <Info className="w-5 h-5 text-[#1A2B49] mt-1 flex-shrink-0" />
                                <div>
                                  <h3 className="font-semibold text-gray-800 text-sm mb-1">
                                    Description:
                                  </h3>
                                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                                    {news.N_Description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes allg {
          0% {
            opacity: 0;
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .allg {
          animation: allg 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Newsmember;
