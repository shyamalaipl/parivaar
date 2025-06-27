import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Calendar, Search } from "lucide-react";
import { Link } from "react-router-dom";
import logoImage from "../img/parivarlogo1.png";

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

// Fallback image (added to fix undefined reference)
const fallbackImage = "https://via.placeholder.com/400x300?text=No+Image";

// Utility function to format and validate date
const formatDate = (dateString, options) => {
  if (!dateString) return "Date not available";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleDateString("en-US", options);
};

const News = () => {
  const [notices, setNotices] = useState([]);
  const [filteredNotices, setFilteredNotices] = useState([]);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [dateFilter, setDateFilter] = useState("all");
  const [customDate, setCustomDate] = useState("");
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const searchRef = useRef(null);

  // Fetch notices
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        const commId = userData?.Comm_Id;

        if (!commId) {
          console.error("Comm_Id not found in local storage");
          setError("Comm_Id not found in local storage");
          setLoading(false);
          return;
        }

        const response = await fetch("https://parivaar.app/public/api/notice", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("API Response:", data);

        if (data && Array.isArray(data.data)) {
          const filteredNotices = data.data
            .filter((notice) => notice.user && notice.user.Comm_Id == commId)
            .map((notice) => ({
              ...notice,
              N_Image: Array.isArray(notice.N_Image)
                ? notice.N_Image
                : notice.N_Image
                ? [notice.N_Image]
                : [],
            }));
          setNotices(filteredNotices);
          setFilteredNotices(filteredNotices);
        } else {
          setError(`Unexpected API response: ${data?.message || "No message"}`);
        }
      } catch (error) {
        console.error("Error fetching notices:", error.message);
        setError(`Failed to fetch notices: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Search, date filtering, and suggestions
  useEffect(() => {
    if (notices.length === 0) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let filtered = [...notices];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (notice) =>
          notice.N_Title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          notice.N_Description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Generate suggestions for dropdown
    if (searchQuery) {
      const matchingSuggestions = notices
        .filter((notice) =>
          notice.N_Title?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .map((notice) => notice.N_Title)
        .slice(0, 5);
      setSuggestions(matchingSuggestions);
    } else {
      setSuggestions([]);
    }

    // Apply date filter
    switch (dateFilter) {
      case "today":
        filtered = filtered.filter((notice) => {
          const noticeDate = new Date(notice.N_Date);
          noticeDate.setHours(0, 0, 0, 0);
          return noticeDate.getTime() === today.getTime();
        });
        break;
      case "lastMonth":
        const firstDayOfMonth = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          1
        );
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        filtered = filtered.filter((notice) => {
          const noticeDate = new Date(notice.N_Date);
          return noticeDate >= firstDayOfMonth && noticeDate <= lastDayOfMonth;
        });
        break;
      case "lastYear":
        const firstDayOfYear = new Date(today.getFullYear() - 1, 0, 1);
        const lastDayOfYear = new Date(today.getFullYear() - 1, 11, 31);
        filtered = filtered.filter((notice) => {
          const noticeDate = new Date(notice.N_Date);
          return noticeDate >= firstDayOfYear && noticeDate <= lastDayOfYear;
        });
        break;
      case "custom":
        if (customDate) {
          const selectedDate = new Date(customDate);
          selectedDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter((notice) => {
            const noticeDate = new Date(notice.N_Date);
            noticeDate.setHours(0, 0, 0, 0);
            return noticeDate.getTime() === selectedDate.getTime();
          });
        }
        break;
      default:
        break;
    }

    setFilteredNotices(filtered);
  }, [dateFilter, customDate, notices, searchQuery]);

  const handleNoticeClick = (notice) => {
    setSelectedNotice(notice);
    setCurrentImageIndex(0);
  };

  const closeModal = () => {
    setSelectedNotice(null);
  };

  const handleReadMoreClick = () => {
    setIsButtonClicked(true);
    const noticesSection = document.getElementById("latest-notices");
    noticesSection?.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => setIsButtonClicked(false), 300);
  };

  const nextImage = () => {
    if (selectedNotice && selectedNotice.N_Image.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === selectedNotice.N_Image.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedNotice && selectedNotice.N_Image.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? selectedNotice.N_Image.length - 1 : prev - 1
      );
    }
  };

  const handleCustomDateChange = (e) => {
    setCustomDate(e.target.value);
    setDateFilter("custom");
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setShowDropdown(false);
  };

  if (loading) {
    return <CustomLogoLoader />;
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gray-50 flex items-center justify-center"
      >
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-900">Error</h3>
          <p className="mt-2 text-gray-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
          >
            Retry
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-[#fdfdf7] to-[#f6f8ff]"
    >
      <div className="container mx-auto px-10">
        <nav
          className="flex items-center gap-3 mt-8 text-sm font-medium bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-200"
          aria-label="breadcrumb"
        >
          <Link
            to="/home"
            className="text-[#1A2B49] font-bold hover:underline"
          >
            Home
          </Link>
          <span className="text-gray-400"> / </span>
          <span className="text-[#1A2B49]">Notice</span>
        </nav>
      </div>

      <section
        id="latest-notices"
        className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-5 lg:py-10"
      >
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 sm:mb-12 gap-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center sm:text-left">
            Latest Notices
          </h2>
          <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
            <div className="relative" ref={searchRef}>
              <input
                type="text"
                placeholder="Search notices..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(e.target.value.length > 0);
                }}
                onFocus={() => searchQuery && setShowDropdown(true)}
                className="bg-white border border-gray-300 rounded-lg px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-[#1A2B49] focus:border-[#1A2B49] shadow-sm"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              {showDropdown && suggestions.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-[#1A2B49] focus:border-[#1A2B49] shadow-sm"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="lastMonth">Last Month</option>
                <option value="lastYear">Last Year</option>
                <option value="custom">Custom Date</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
            {dateFilter === "custom" && (
              <div className="relative">
                <input
                  type="date"
                  value={customDate}
                  onChange={handleCustomDateChange}
                  className="bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 shadow-sm"
                />
                <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-500" />
              </div>
            )}
          </div>
        </div>

        {filteredNotices.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            <div className="max-w-xs w-full bg-white border border-blue-100 rounded-xl p-4">
              <div className="flex items-center gap-4">
                <span className="flex-shrink-0 flex items-center justify-center bg-blue-400 rounded-full p-2 text-white">
                  <svg
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                  >
                    <path
                      clipRule="evenodd"
                      d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z"
                      fillRule="evenodd"
                    ></path>
                  </svg>
                </span>
                <p className="font-semibold text-gray-500">No notices found</p>
              </div>
              <p className="mt-4 text-gray-500">
                {dateFilter === "today"
                  ? "No notices published today."
                  : dateFilter === "lastMonth"
                  ? "No notices published last month."
                  : dateFilter === "lastYear"
                  ? "No notices published last year."
                  : dateFilter === "custom"
                  ? "No notices match the selected date."
                  : searchQuery
                  ? "No notices match your search."
                  : "No notices available for your community."}
              </p>
              {(dateFilter !== "all" || searchQuery) && (
                <div className="mt-6">
                  <button
                    onClick={() => {
                      setDateFilter("all");
                      setSearchQuery("");
                      setShowDropdown(false);
                    }}
                    className="block w-full bg-[#1A2B49] text-white font-semibold rounded-lg px-5 py-3 text-sm text-center hover:bg-[#1a2b49d8] transition-colors"
                  >
                    Show All Notices
                  </button>
                  <button
                    onClick={() => {
                      setDateFilter("all");
                      setSearchQuery("");
                      setShowDropdown(false);
                    }}
                    className="block w-full mt-2 bg-gray-50 text-gray-500 font-semibold rounded-lg px-5 py-3 text-sm text-center hover:bg-gray-200 transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotices.map((notice) => (
              <motion.div
                key={notice.N_Id}
                onClick={() => handleNoticeClick(notice)}
                className="bg-white rounded-lg shadow-xs overflow-hidden cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
                }}
              >
                <div className="relative">
                  <div className="absolute top-0 left-2 text-[#17428c] text-xs font-semibold px-2 py-1 rounded">
                    {notice.N_Category || "General"}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                    {notice.N_Title || "Untitled Notice"}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {notice.N_Description || "No description available"}
                  </p>
                  <div className="flex items-center text-gray-500 text-sm mt-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {formatDate(notice.N_Date, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <AnimatePresence>
        {selectedNotice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-[#00000076] bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center shadow-sm">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {selectedNotice.N_Title || "Untitled Notice"}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500 hover:text-gray-700" />
                </button>
              </div>

              <div className="p-4 sm:p-6">
                {selectedNotice.N_Image?.length > 0 && (
                  <div className="mb-6 relative">
                    <div className="relative w-full h-64 sm:h-96 overflow-hidden rounded-lg">
                      <img
                        src={selectedNotice.N_Image[currentImageIndex] || fallbackImage}
                        alt={selectedNotice.N_Title || "Notice Image"}
                        className="w-full h-full object-cover"
                      />
                      {selectedNotice.N_Image.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 p-2 rounded-full hover:bg-black/70 transition-colors"
                          >
                            <ChevronLeft className="w-6 h-6 text-white" />
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 p-2 rounded-full hover:bg-black/70 transition-colors"
                          >
                            <ChevronRight className="w-6 h-6 text-white" />
                          </button>
                          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
                            {selectedNotice.N_Image.map((_, index) => (
                              <div
                                key={index}
                                className={`w-2 h-2 rounded-full transition-all ${
                                  index === currentImageIndex ? "bg-white w-4" : "bg-white/50"
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">
                        {formatDate(selectedNotice.N_Date, {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Category</p>
                      <p className="font-medium">{selectedNotice.N_Category || "General"}</p>
                    </div>
                  </div>

                  {selectedNotice.N_MaleName && (
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{selectedNotice.N_MaleName}</p>
                    </div>
                  )}

                  {selectedNotice.N_WomanName && (
                    <div>
                      <p className="text-sm text-gray-500">Woman Name</p>
                      <p className="font-medium">{selectedNotice.N_WomanName}</p>
                    </div>
                  )}

                  {selectedNotice.N_Mobile && (
                    <div>
                      <p className="text-sm text-gray-500">Mobile</p>
                      <p className="font-medium">{selectedNotice.N_Mobile}</p>
                    </div>
                  )}

                  {selectedNotice.N_Email && (
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{selectedNotice.N_Email}</p>
                    </div>
                  )}

                  {selectedNotice.N_Address && (
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium">{selectedNotice.N_Address}</p>
                    </div>
                  )}

                  {selectedNotice.N_Description && (
                    <div>
                      <p className="text-sm text-gray-500">Description</p>
                      <p className="font-medium whitespace-pre-line">{selectedNotice.N_Description}</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded transition-colors shadow-md hover:shadow-lg"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default News;