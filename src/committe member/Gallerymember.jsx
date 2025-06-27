
"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  Trash2,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Calendar,
  MapPin,
  Search,
  Download,
  Plus,
  X,
  Grid,
  List,
  Filter,
  Clock,
  Camera,
  ChevronDown,
  Eye,
  CircleChevronLeft,
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

const GalleryMember = ({ setActivePage }) => {
  const [galleryData, setGalleryData] = useState({
    CE_Name: "",
    CE_Date: "",
    CE_Place: "",
    CE_Description: "",
    CE_Photo: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [galleryItems, setGalleryItems] = useState([]);
  const [filteredGallery, setFilteredGallery] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [tempSearchTerm, setTempSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("newest");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [galleryStats, setGalleryStats] = useState({
    totalImages: 0,
    recentUploads: 0,
  });
  const [fullScreenImage, setFullScreenImage] = useState(null);

  const userData = JSON.parse(localStorage.getItem("user")) || {};
  const commId = userData.Comm_Id;
  const userId = userData.U_Id;

  useEffect(() => {
    fetchGalleryData();
  }, []);

  useEffect(() => {
    if (selectedItem) {
      setCurrentImageIndex(0);
    }
  }, [selectedItem]);

  useEffect(() => {
    filterGallery();
  }, [galleryItems, searchTerm, sortBy]);

  const fetchGalleryData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("https://parivaar.app/public/api/gallary");
      if (!response.ok) throw new Error("Failed to fetch gallery data");
      const data = await response.json();
      if (data.status == "success") {
        const filteredData = data.data.filter(
          (item) => item.user.Comm_Id == commId
        );
        setGalleryItems(filteredData);

        const totalImages = filteredData.reduce(
          (sum, item) => sum + (item.CE_Photo ? item.CE_Photo.length : 0),
          0
        );

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentUploads = filteredData.filter((item) => {
          const uploadDate = new Date(item.created_at);
          return uploadDate >= thirtyDaysAgo;
        }).length;

        setGalleryStats({
          totalImages: totalImages,
          recentUploads: recentUploads,
        });
      }
    } catch (error) {
      console.error("Error fetching gallery data:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load gallery data",
        confirmButtonColor: "#1A2B49",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterGallery = () => {
    let result = [...galleryItems];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          (item.CE_Name && item.CE_Name.toLowerCase().includes(searchLower)) ||
          (item.CE_Place &&
            item.CE_Place.toLowerCase().includes(searchLower)) ||
          (item.CE_Description &&
            item.CE_Description.toLowerCase().includes(searchLower))
      );
    }

    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case "name_asc":
        result.sort((a, b) => (a.CE_Name || "").localeCompare(b.CE_Name || ""));
        break;
      case "name_desc":
        result.sort((a, b) => (b.CE_Name || "").localeCompare(a.CE_Name || ""));
        break;
      default:
        break;
    }

    setFilteredGallery(result);
  };

  const handleSearch = () => {
    setSearchTerm(tempSearchTerm);
  };

  const handleClearSearch = () => {
    setTempSearchTerm("");
    setSearchTerm("");
  };

  const handleKeyPress = (e) => {
    if (e.key == "Enter") {
      handleSearch();
    }
  };

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#1A2B49",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        setIsLoading(true);
        const response = await fetch(
          `https://parivaar.app/public/api/gallary/${id}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          setGalleryItems((prevData) =>
            prevData.filter((item) => item.CE_Id !== id)
          );
          if (selectedItem && selectedItem.CE_Id == id) {
            setSelectedItem(null);
          }
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "Images have been deleted.",
            confirmButtonColor: "#1A2B49",
          });
        } else {
          throw new Error("Failed to delete");
        }
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to delete the images",
        confirmButtonColor: "#1A2B49",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGalleryData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      const maxSize = 10 * 1024 * 1024;
      const validFiles = Array.from(files).filter((file) => {
        const validTypes = ["image/jpeg", "image/jpg", "image/png"];
        if (!validTypes.includes(file.type)) {
          Swal.fire({
            icon: "warning",
            title: "Invalid File Type",
            text: `${file.name} is not a valid image type (jpg, jpeg, png only)`,
            confirmButtonColor: "#1A2B49",
          });
          return false;
        }
        if (file.size > maxSize) {
          Swal.fire({
            icon: "warning",
            title: "File Too Large",
            text: `${file.name} exceeds 2MB limit`,
            confirmButtonColor: "#1A2B49",
          });
          return false;
        }
        return true;
      });

      setGalleryData((prev) => ({
        ...prev,
        [name]: [...prev.CE_Photo, ...validFiles],
      }));

      const previews = validFiles.map((file) => URL.createObjectURL(file));
      setPreviewImages((prev) => [...prev, ...previews]);
    }
  };

  const removeImage = (index) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
    setGalleryData((prev) => ({
      ...prev,
      CE_Photo: prev.CE_Photo.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !galleryData.CE_Name ||
      !galleryData.CE_Date ||
      !galleryData.CE_Place ||
      !galleryData.CE_Description
    ) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "All fields are required!",
        confirmButtonColor: "#1A2B49",
      });
      return;
    }

    if (!galleryData.CE_Photo || galleryData.CE_Photo.length == 0) {
      Swal.fire({
        icon: "warning",
        title: "Missing Images",
        text: "Please upload at least one photo!",
        confirmButtonColor: "#1A2B49",
      });
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("CE_Name", galleryData.CE_Name);
    formData.append("CE_Date", galleryData.CE_Date);
    formData.append("CE_Place", galleryData.CE_Place);
    formData.append("CE_Description", galleryData.CE_Description);
    formData.append("U_Id", userId);

    galleryData.CE_Photo.forEach((photo, index) => {
      formData.append(`CE_Photo[${index}]`, photo);
    });

    try {
      const response = await fetch("https://parivaar.app/public/api/gallary", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Images Added Successfully",
          text: "Your images have been uploaded to the gallery!",
          confirmButtonColor: "#1A2B49",
        });
        setGalleryData({
          CE_Name: "",
          CE_Date: "",
          CE_Place: "",
          CE_Description: "",
          CE_Photo: [],
        });
        setPreviewImages([]);
        setShowForm(false);
        fetchGalleryData();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `An error occurred while uploading the images: ${error.message}`,
        confirmButtonColor: "#1A2B49",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev == 0 ? selectedItem.CE_Photo.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev == selectedItem.CE_Photo.length - 1 ? 0 : prev + 1
    );
  };

  const downloadImage = (url, name) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = name || "image.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdf9f7] to-[#f0f4ff]">
      {isLoading && <CustomLogoLoader />}

      {/* Header */}
      <div className="bg-[#1A2B49] text-white rounded-xl py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <button
            className="flex cursor-pointer items-center text-white"
            onClick={() => setActivePage("dashboardmember")}
          >
            <CircleChevronLeft size={30} className="mr-2" />
          </button>

          <h1 className="text-2xl font-bold text-center lg:text-left">
            Community Gallery
          </h1>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute text-sm left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                value={tempSearchTerm}
                onChange={(e) => setTempSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                onBlur={handleSearch}
                className="pl-10 pr-1 text-sm py-2 w-full rounded-lg bg-white text-black focus:ring-2 focus:ring-[#1A2B49] focus:outline-none"
              />
              {tempSearchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-[#1A2B49] border border-white px-4 py-2 rounded-lg font-medium hover:bg-[#2A3B59] transition-all text-sm duration-300"
            >
              {showForm ? (
                <X className="w-5 h-5" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
              {showForm ? "Cancel" : "Add Gallery"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {!showForm && (
        <>
          <div className="max-w-7xl mx-auto px-6 py-5">
            <div className="flex justify-end mb-4 items-center">
              <div className="flex gap-2">
                <div className="relative">
                  <button
                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                    className="px-3 py-3 text-[10px] bg-white border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors"
                  >
                    <Filter size={15} />
                    <span>Sort</span>
                    <ChevronDown size={16} />
                  </button>

                  {showSortDropdown && (
                    <div className="absolute right-0 z-10 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg">
                      <ul className="py-1">
                        <li>
                          <button
                            onClick={() => {
                              setSortBy("newest");
                              setShowSortDropdown(false);
                            }}
                            className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                              sortBy == "newest"
                                ? "bg-gray-100 font-medium"
                                : ""
                            }`}
                          >
                            Newest First
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => {
                              setSortBy("oldest");
                              setShowSortDropdown(false);
                            }}
                            className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                              sortBy == "oldest"
                                ? "bg-gray-100 font-medium"
                                : ""
                            }`}
                          >
                            Oldest First
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => {
                              setSortBy("name_asc");
                              setShowSortDropdown(false);
                            }}
                            className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                              sortBy == "name_asc"
                                ? "bg-gray-100 font-medium"
                                : ""
                            }`}
                          >
                            Name (A-Z)
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => {
                              setSortBy("name_desc");
                              setShowSortDropdown(false);
                            }}
                            className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                              sortBy == "name_desc"
                                ? "bg-gray-100 font-medium"
                                : ""
                            }`}
                          >
                            Name (Z-A)
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-3 ${
                      viewMode == "grid"
                        ? "bg-[#1A2B49] text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    } transition-colors`}
                  >
                    <Grid size={15} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-3 ${
                      viewMode == "list"
                        ? "bg-[#1A2B49] text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    } transition-colors`}
                  >
                    <List size={15} />
                  </button>
                </div>
              </div>
            </div>

            {filteredGallery.length == 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <Camera size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No Images
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  {searchTerm
                    ? "No images match your search criteria. Try adjusting your search terms."
                    : "There are no images in the gallery yet. Add your first images to get started!"}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="mt-6 px-6 py-2 bg-[#1A2B49] text-white font-medium rounded-lg hover:bg-[#1A2B49]/90 transition-colors inline-flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Add Images
                  </button>
                )}
              </div>
            ) : viewMode == "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGallery.map((item) => (
                  <div
                    key={item.CE_Id}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
                  >
                    <div className="relative h-48">
                      <img
                        src={
                          item.CE_Photo[0] ||
                          "https://via.placeholder.com/300x200?text=No+Image"
                        }
                        alt={item.CE_Name || "Gallery Image"}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => setSelectedItem(item)}
                        onError={(e) =>
                          (e.target.src =
                            "https://via.placeholder.com/300x200?text=No+Image")
                        }
                      />
                      {item.CE_Photo.length > 1 && (
                        <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
                          {item.CE_Photo.length} photos
                        </div>
                      )}
                      <div className="absolute top-2 right-2 flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItem(item);
                          }}
                          className="p-2 bg-white/90 backdrop-blur-sm text-[#1A2B49] rounded-full hover:bg-white transition-colors"
                          title="View Gallery"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.CE_Id);
                          }}
                          className="p-2 bg-white/90 backdrop-blur-sm text-red-600 rounded-full hover:bg-white transition-colors"
                          title="Delete Images"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between">
                        <h3
                          className="text-lg font-semibold text-[#1A2B49] mb-1 cursor-pointer hover:text-[#2A3B59] transition-colors line-clamp-1"
                          onClick={() => setSelectedItem(item)}
                        >
                          {item.CE_Name || "Untitled"}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>{formatDate(item.CE_Date)}</span>
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="truncate">
                          {item.CE_Place || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredGallery.map((item) => (
                  <div
                    key={item.CE_Id}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100"
                  >
                    <div className="flex flex-col sm:flex-row">
                      <div className="relative sm:w-48 h-48">
                        <img
                          src={
                            item.CE_Photo[0] ||
                            "https://via.placeholder.com/300x200?text=No+Image"
                          }
                          alt={item.CE_Name || "Gallery Image"}
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => setSelectedItem(item)}
                          onError={(e) =>
                            (e.target.src =
                              "https://via.placeholder.com/300x200?text=No+Image")
                          }
                        />
                        {item.CE_Photo.length > 1 && (
                          <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
                            {item.CE_Photo.length} photos
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3
                              className="text-lg font-semibold text-[#1A2B49] mb-1 cursor-pointer hover:text-[#2A3B59] transition-colors"
                              onClick={() => setSelectedItem(item)}
                            >
                              {item.CE_Name || "Untitled"}
                            </h3>
                            <div className="flex items-center text-sm text-gray-500 mb-1">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span>{formatDate(item.CE_Date)}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <MapPin className="w-4 h-4 mr-1" />
                              <span>{item.CE_Place || "N/A"}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedItem(item)}
                              className="p-2 bg-gray-100 text-[#1A2B49] rounded-full hover:bg-gray-200 transition-colors"
                              title="View Gallery"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(item.CE_Id)}
                              className="p-2 bg-gray-100 text-red-600 rounded-full hover:bg-gray-200 transition-colors"
                              title="Delete Images"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                        {item.CE_Description && (
                          <p className="mt-2 text-gray-600 line-clamp-2 text-sm">
                            {item.CE_Description}
                          </p>
                        )}
                        {item.CE_Photo.length > 1 && (
                          <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                            {item.CE_Photo.slice(0, 5).map((photo, index) => (
                              <img
                                key={index}
                                src={
                                  photo ||
                                  "https://via.placeholder.com/100?text=No+Image"
                                }
                                alt={`Thumbnail ${index + 1}`}
                                className="h-16 w-16 object-cover rounded-lg flex-shrink-0"
                                onError={(e) =>
                                  (e.target.src =
                                    "https://via.placeholder.com/100?text=No+Image")
                                }
                              />
                            ))}
                            {item.CE_Photo.length > 5 && (
                              <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 flex-shrink-0">
                                +{item.CE_Photo.length - 5}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Upload Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-allgase">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#1A2B49]">
                Add New Images
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setGalleryData({
                    CE_Name: "",
                    CE_Date: "",
                    CE_Place: "",
                    CE_Description: "",
                    CE_Photo: [],
                  });
                  setPreviewImages([]);
                }}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  name="CE_Name"
                  value={galleryData.CE_Name}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent"
                  placeholder="Enter name"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="CE_Date"
                    value={galleryData.CE_Date}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="CE_Place"
                    value={galleryData.CE_Place}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent"
                    placeholder="Enter location"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="CE_Description"
                  value={galleryData.CE_Description}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent min-h-[120px]"
                  placeholder="Describe the images..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photos *
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-[#1A2B49] transition-colors">
                  <div className="space-y-1 text-center">
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer rounded-md font-medium text-[#1A2B49] hover:text-[#2A3B59] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#1A2B49]">
                        <span>Upload files</span>
                        <input
                          type="file"
                          name="CE_Photo"
                          onChange={handleFileChange}
                          accept="image/jpeg,image/png,image/jpg"
                          multiple
                          className="sr-only"
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG up to 2MB</p>
                  </div>
                </div>

                {previewImages.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {previewImages.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview || "/placeholder.svg"}
                          alt={`Preview ${index + 1}`}
                          className="h-24 w-full object-cover rounded-lg cursor-pointer"
                          onClick={() => setFullScreenImage(preview)}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setGalleryData({
                      CE_Name: "",
                      CE_Date: "",
                      CE_Place: "",
                      CE_Description: "",
                      CE_Photo: [],
                    });
                    setPreviewImages([]);
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#1A2B49] text-white font-medium rounded-lg hover:bg-[#1A2B49]/90 transition-colors flex items-center gap-2"
                >
                  <Camera size={18} />
                  Upload Images
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gallery Details Modal with Image Carousel */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#1A2B49]">
                {selectedItem.CE_Name || "Untitled"}
              </h2>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="relative bg-black h-[60vh]">
                <img
                  src={
                    selectedItem.CE_Photo[currentImageIndex] ||
                    "https://via.placeholder.com/800x600?text=No+Image"
                  }
                  alt={`Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-contain cursor-pointer"
                  onClick={() => setFullScreenImage(selectedItem.CE_Photo[currentImageIndex])}
                  onError={(e) =>
                    (e.target.src =
                      "https://via.placeholder.com/800x600?text=No+Image")
                  }
                />

                {selectedItem.CE_Photo.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}

                <div className="absolute bottom-4 left-0 right-0 flex justify-between items-center px-4">
                  <div className="bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {selectedItem.CE_Photo.length}
                  </div>
                </div>
              </div>

              {selectedItem.CE_Photo.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto bg-gray-100">
                  {selectedItem.CE_Photo.map((photo, index) => (
                    <img
                      key={index}
                      src={
                        photo || "https://via.placeholder.com/100?text=No+Image"
                      }
                      alt={`Thumbnail ${index + 1}`}
                      className={`h-20 w-20 object-cover rounded-lg cursor-pointer transition-all duration-200 ${
                        currentImageIndex == index
                          ? "border-2 border-[#1A2B49] opacity-100"
                          : "border-2 border-transparent opacity-70 hover:opacity-100"
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                      onError={(e) =>
                        (e.target.src =
                          "https://via.placeholder.com/100?text=No+Image")
                      }
                    />
                  ))}
                </div>
              )}

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-[#1A2B49] mb-4">
                      Details
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <Calendar className="w-5 h-5 text-[#1A2B49] mt-0.5 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Date</p>
                          <p className="font-medium">
                            {formatDate(selectedItem.CE_Date)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <MapPin className="w-5 h-5 text-[#1A2B49] mt-0.5 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Location</p>
                          <p className="font-medium">
                            {selectedItem.CE_Place || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <Clock className="w-5 h-5 text-[#1A2B49] mt-0.5 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Added On</p>
                          <p className="font-medium">
                            {formatDate(selectedItem.created_at)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <Camera className="w-5 h-5 text-[#1A2B49] mt-0.5 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Photos</p>
                          <p className="font-medium">
                            {selectedItem.CE_Photo.length}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-[#1A2B49] mb-4">
                      Description
                    </h3>
                    <p className="text-gray-600 whitespace-pre-line">
                      {selectedItem.CE_Description ||
                        "No description provided."}
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex gap-4">
                  <button
                    onClick={() => handleDelete(selectedItem.CE_Id)}
                    className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 size={18} />
                    Delete Images
                  </button>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Image Modal */}
      {fullScreenImage && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={fullScreenImage}
              alt="Full screen image"
              className="max-w-full max-h-full object-contain"
              onError={(e) =>
                (e.target.src =
                  "https://via.placeholder.com/800x600?text=No+Image")
              }
            />
            <button
              onClick={() => setFullScreenImage(null)}
              className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes allgase {
          0% {
            opacity: 0;
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-allgase {
          animation: allgase 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default GalleryMember;
