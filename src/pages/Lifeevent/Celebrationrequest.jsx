import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Gift,
  X,
  Sparkles,
  ChevronRight,
  Eye,
  Clock,
  Cake,
  Plus,
  Search,
  Phone,
  Heart,
  Send,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logoImage from "../../img/parivarlogo1.png";

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

const RequestCard = ({ request }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <motion.div
      className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 cursor-pointer group relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{
        y: -1,
        boxShadow: "0 10px 25px rgba(26, 43, 73, 0.15)",
        transition: { duration: 0.3 },
      }}
      onClick={() => navigate(`/celebration/${request.N_Id}`, { state: { from: "celebrationrequest" } })}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-[#1A2B49]/5 to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <motion.h3
            className="text-base font-bold text-gray-800 line-clamp-1 group-hover:text-[#1A2B49] transition-colors duration-300 flex items-center gap-2"
            animate={{ color: isHovered ? "#1A2B49" : "#1f2937" }}
          >
            <Gift className="w-4 h-4 text-[#1A2B49]" />
            {request.N_Title}
          </motion.h3>
          <motion.span
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(request.N_Status)}`}
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.3 }}
          >
            {request.N_Status.charAt(0).toUpperCase() + request.N_Status.slice(1)}
          </motion.span>
        </div>
        <p className="text-gray-600 mb-3 line-clamp-2 text-sm italic leading-relaxed">
          {request.N_Description || "No description provided"}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{new Date(request.created_at || request.N_Date).toLocaleDateString()}</span>
          </div>
          <motion.div
            className="flex items-center gap-1 text-[#1A2B49] font-semibold"
            animate={{ gap: isHovered ? 8 : 4 }}
            transition={{ duration: 0.3 }}
          >
            <Eye className="w-3 h-3" />
            <span>View Details</span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

const Celebrationrequest = () => {
  const [userRequests, setUserRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    N_Title: "",
    N_Category: "",
    N_MaleName: "",
    N_Date: "",
    N_Age: "",
    N_Mobile: "",
    N_Address: "",
    N_Description: "",
    N_Image: [],
  });
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = userData.U_Id;
  const userCommId = userData.Comm_Id;

  useEffect(() => {
    const fetchUserCelebrations = async () => {
      if (!userId) {
        setError("User data is missing. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch("https://parivaar.app/public/api/celebration", {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("API endpoint not found (404). Please check the URL.");
          } else if (response.status === 500) {
            throw new Error("Server error (500). Please try again later.");
          } else {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
        }

        const result = await response.json();
        if (result.status && result.message === "Celebrations fetched successfully" && Array.isArray(result.data)) {
          const userSpecificRequests = result.data.filter(
            (celebration) => celebration.U_Id === userId.toString()
          );
          setUserRequests(userSpecificRequests);
        } else {
          throw new Error("Unexpected API response format");
        }
      } catch (err) {
        setError(`Failed to fetch your celebrations: ${err.message}`);
        console.error("Error fetching celebrations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserCelebrations();
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData({ ...formData, N_Image: files });
  };

  const removeImage = (index) => {
    const newImages = formData.N_Image.filter((_, i) => i !== index);
    setFormData({ ...formData, N_Image: newImages });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.N_Title) {
      alert("Celebration Title is required!");
      return;
    }

    if (!userCommId || !userId) {
      alert("User data is missing. Please log in again.");
      return;
    }

    const data = new FormData();
    data.append("N_Title", formData.N_Title);
    data.append("N_Category", formData.N_Category);
    data.append("N_MaleName", formData.N_MaleName);
    data.append("N_Date", formData.N_Date);
    data.append("N_Age", formData.N_Age);
    data.append("N_Mobile", formData.N_Mobile);
    data.append("N_Address", formData.N_Address);
    data.append("N_Description", formData.N_Description);
    data.append("Comm_Id", userCommId);
    data.append("U_Id", userId);

    formData.N_Image.forEach((image) => {
      data.append("N_Image[]", image);
    });

    try {
      setLoading(true);
      const response = await fetch("https://parivaar.app/public/api/celebration", {
        method: "POST",
        body: data,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      if (result.status && result.message === "Celebration created successfully") {
        alert("Celebration created successfully!");
        setShowForm(false);
        setFormData({
          N_Title: "",
          N_Category: "",
          N_MaleName: "",
          N_Date: "",
          N_Age: "",
          N_Mobile: "",
          N_Address: "",
          N_Description: "",
          N_Image: [],
        });
        // Refresh the list of celebrations
        const response = await fetch("https://parivaar.app/public/api/celebration", {
          headers: {
            "Content-Type": "application/json",
          },
        });
        const result = await response.json();
        if (result.status && Array.isArray(result.data)) {
          const userSpecificRequests = result.data.filter(
            (celebration) => celebration.U_Id === userId.toString()
          );
          setUserRequests(userSpecificRequests);
        }
      } else {
        throw new Error(result.message || "Failed to create celebration.");
      }
    } catch (err) {
      console.error("Error creating celebration:", err);
      alert("Failed to create celebration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredRequests  = () => {
    return userRequests.filter(
      (request) =>
        request.N_Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.N_Description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredRequests = getFilteredRequests();

  if (loading) return <CustomLogoLoader />;

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-6">
        <nav
          className="flex items-center gap-3 mt-8 text-sm font-medium bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-200"
          aria-label="breadcrumb"
        >
          <Link to="/home" className="text-[#1A2B49] font-bold hover:underline transition-colors duration-200">
            Home
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <Link to="/celebration" className="text-[#1A2B49] font-bold hover:underline transition-colors duration-200">
            Celebrations
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-[#1A2B49] font-semibold">Your Celebrations</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {error && (
          <motion.div
            className="text-center py-12 bg-white rounded-2xl shadow-xl max-w-2xl mx-auto border border-red-100 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-red-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-500" />
            </div>
            <div className="text-red-600 text-xl font-semibold mb-2">{error}</div>
            <p className="text-gray-600 mb-6">Please check your network connection or try again later.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-[#1A2B49] to-[#2a3b5a] text-white rounded-xl hover:from-[#14223e] hover:to-[#1A2B49] transition-all duration-300 font-semibold"
            >
              Try Again
            </button>
          </motion.div>
        )}

        <div className="flex flex-col gap-8">
          <div>
            <div className="mb-10 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
              <div>
                <h2 className="text-3xl font-bold text-[#1A2B49] mb-3 flex items-center gap-3">
                  <Sparkles className="w-8 h-8 text-yellow-500" />
                  Your Celebrations
                </h2>
                <p className="text-gray-600 font-medium">
                  {userRequests.length} {userRequests.length === 1 ? "celebration" : "celebrations"} found
                </p>
              </div>
              <div className="flex items-center gap-6">
                <div className="relative w-full max-w-md" ref={dropdownRef}>
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search your celebrations by title or description..."
                    className="w-full pl-12 pr-4 py-2 bg-[#f0f0f0] rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1A2B49] text-gray-800 placeholder-gray-500"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setIsDropdownOpen(e.target.value.length > 0);
                    }}
                    onFocus={() => setIsDropdownOpen(searchTerm.length > 0)}
                  />
                  <AnimatePresence>
                    {isDropdownOpen && filteredRequests.length > 0 && (
                      <motion.div
                        className="absolute z-50 w-full bg-white rounded-xl shadow-xl mt-2 max-h-60 overflow-y-auto border border-gray-200"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        {filteredRequests.map((request) => (
                          <motion.div
                            key={request.N_Id}
                            className="px-4 py-3 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                            onClick={() => {
                              navigate(`/celebration/${request.N_Id}`, { state: { from: "celebrationrequest" } });
                              setIsDropdownOpen(false);
                              setSearchTerm("");
                            }}
                            whileHover={{ backgroundColor: "#f3f4f6" }}
                          >
                            <Gift className="w-4 h-4 text-[#1A2B49]" />
                            <span className="text-sm font-medium text-gray-800">{request.N_Title}</span>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <motion.button
                  onClick={() => setShowForm(true)}
                  className="p-2 bg-gradient-to-r from-[#2A3B59] to-[#1A2B49] text-white rounded-xl flex items-center justify-center gap-3 shadow-lg font-semibold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Celebration</span>
                </motion.button>
              </div>
            </div>

            {userRequests.length > 0 ? (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {filteredRequests.map((request, index) => (
                  <motion.div
                    key={request.N_Id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <RequestCard request={request} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                className="text-center py-20 bg-white rounded-2xl shadow-xl border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="bg-gradient-to-br from-[#1A2B49]/10 to-[#2A3B59]/10 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <Cake className="w-12 h-12 text-[#1A2B49]" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">No celebrations found</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  You haven't submitted any celebration requests yet.
                </p>
                <motion.button
                  onClick={() => setShowForm(true)}
                  className="px-6 py-3 bg-gradient-to-r from-[#1A2B49] to-[#2A3B59] text-white rounded-xl font-semibold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Create First Celebration
                </motion.button>
              </motion.div>
            )}
          </div>
        </div>

        {showForm && (
          <motion.div
            className="fixed inset-0 bg-gradient-to-br from-[#1A2B49]/40 to-[#2a3b5a]/40 backdrop-blur-md z-50 flex justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-[90%] sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-white h-full overflow-auto shadow-2xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <div className="px-6 py-8 bg-gradient-to-br from-white to-gray-50">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
                  <div>
                    <h2 className="text-2xl font-bold text-[#1A2B49] flex items-center gap-3">
                      <Gift className="w-6 h-6" />
                      Create Celebration
                    </h2>
                    <p className="text-gray-600 mt-1">Share your joyful moments</p>
                  </div>
                  <motion.button
                    onClick={() => setShowForm(false)}
                    className="hover:bg-gray-100 p-2 rounded-full transition-colors duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-6 h-6 text-gray-600" />
                  </motion.button>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-[#1A2B49] mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Basic Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-[#1A2B49] mb-2">
                          Celebration Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.N_Title}
                          onChange={(e) => setFormData({ ...formData, N_Title: e.target.value })}
                          className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A2B49] focus:bg-white transition-all duration-300"
                          placeholder="Enter celebration title"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-[#1A2B49] mb-2">Category</label>
                          <select
                            value={formData.N_Category}
                            onChange={(e) => setFormData({ ...formData, N_Category: e.target.value })}
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A2B49] focus:bg-white transition-all duration-300"
                          >
                            <option value="">Select Category</option>
                            <option value="Birthday">Birthday</option>
                            <option value="Anniversary">Anniversary</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-[#1A2B49] mb-2">Name</label>
                          <input
                            type="text"
                            value={formData.N_MaleName}
                            onChange={(e) => setFormData({ ...formData, N_MaleName: e.target.value })}
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A2B49] focus:bg-white transition-all duration-300"
                            placeholder="Enter name"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-[#1A2B49] mb-2">Date</label>
                          <input
                            type="date"
                            value={formData.N_Date}
                            onChange={(e) => setFormData({ ...formData, N_Date: e.target.value })}
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A2B49] focus:bg-white transition-all duration-300"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-[#1A2B49] mb-2">Age</label>
                          <input
                            type="number"
                            value={formData.N_Age}
                            onChange={(e) => setFormData({ ...formData, N_Age: e.target.value })}
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A2B49] focus:bg-white transition-all duration-300"
                            placeholder="Enter age"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-[#1A2B49] mb-4 flex items-center gap-2">
                      <Phone className="w-5 h-5" />
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-[#1A2B49] mb-2">Mobile Number</label>
                        <input
                          type="tel"
                          value={formData.N_Mobile}
                          onChange={(e) => setFormData({ ...formData, N_Mobile: e.target.value })}
                          className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A2B49] focus:bg-white transition-all duration-300"
                          placeholder="Enter mobile number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#1A2B49] mb-2">Address</label>
                        <input
                          type="text"
                          value={formData.N_Address}
                          onChange={(e) => setFormData({ ...formData, N_Address: e.target.value })}
                          className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A2B49] focus:bg-white transition-all duration-300"
                          placeholder="Enter address"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-[#1A2B49] mb-4 flex items-center gap-2">
                      <Heart className="w-5 h-5" />
                      Celebration Details
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-[#1A2B49] mb-2">Description</label>
                        <textarea
                          value={formData.N_Description}
                          onChange={(e) => setFormData({ ...formData, N_Description: e.target.value })}
                          className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A2B49] focus:bg-white transition-all duration-300"
                          placeholder="Share your celebration story..."
                          rows="4"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#1A2B49] mb-2">Celebration Images</label>
                        <div className="flex items-center gap-4">
                          <label className="flex-1 cursor-pointer">
                            <div className="w-full p-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl hover:border-[#1A2B49] transition-all duration-300 flex items-center justify-center">
                              <div className="flex items-center gap-3 text-gray-500">
                                <Gift className="w-6 h-6" />
                                <span className="font-medium">Choose celebration images</span>
                              </div>
                            </div>
                            <input
                              type="file"
                              multiple
                              onChange={handleImageChange}
                              className="hidden"
                              accept="image/*"
                            />
                          </label>
                        </div>
                        {formData.N_Image.length > 0 && (
                          <div className="mt-4 text-sm text-gray-600 flex items-center gap-2">
                            <Gift className="w-4 h-4" />
                            <span>
                              {formData.N_Image.length} {formData.N_Image.length === 1 ? "image" : "images"} selected
                            </span>
                          </div>
                        )}
                        {formData.N_Image.length > 0 && (
                          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {formData.N_Image.map((file, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={URL.createObjectURL(file) || "/placeholder.svg"}
                                  alt={`Preview ${index}`}
                                  className="h-24 w-full object-cover rounded-lg border border-gray-200"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-6 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors duration-200 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-8 py-3 bg-gradient-to-r from-[#1A2B49] to-[#2a3b5a] text-white rounded-xl flex items-center gap-2 font-semibold shadow-lg hover:scale-105 active:scale-95 transition-transform"
                    >
                      <Send className="w-5 h-5" />
                      Submit Celebration
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>

      <style jsx>{`
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </motion.div>
  );
};

export default Celebrationrequest;