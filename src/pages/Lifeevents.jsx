import {
  Cake,
  Heart,
  BellRing as Ring,
  Flower2,
  ChevronLeft,
  ChevronRight,
  X,
  Smile,
} from "lucide-react";
import { useState, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
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
        top: "64px",
        left: 0,
        right: "5px",
        bottom: 0,
        background: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        backdropFilter: "blur(10px)",
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
const LifeEvents = () => {
  const [notices, setNotices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [commId, setCommId] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Slider settings
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    beforeChange: (current, next) => setCurrentSlide(next),
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  };

  function NextArrow(props) {
    const { onClick } = props;
    return (
      <div
        className="absolute right-2 top-1/2 z-10 -translate-y-1/2 cursor-pointer rounded-full bg-black bg-opacity-50 p-2 text-white hover:bg-opacity-75"
        onClick={onClick}
      >
        <ChevronRight className="h-6 w-6" />
      </div>
    );
  }

  function PrevArrow(props) {
    const { onClick } = props;
    return (
      <div
        className="absolute left-2 top-1/2 z-10 -translate-y-1/2 cursor-pointer rounded-full bg-black bg-opacity-50 p-2 text-white hover:bg-opacity-75"
        onClick={onClick}
      >
        <ChevronLeft className="h-6 w-6" />
      </div>
    );
  }

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (userData.Comm_Id) {
          setCommId(userData.Comm_Id);
        } else {
          throw new Error("Community ID not found in user data");
        }
      } catch (e) {
        setError("Failed to parse user data");
        setLoading(false);
      }
    } else {
      setError("User data not found. Please login again.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!commId) return;

    const fetchNotices = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://parivaar.app/public/api/notice");
        if (!response.ok) throw new Error("Failed to fetch notices");

        const data = await response.json();

        const filteredNotices = data.data.filter(
          (notice) =>
            notice.Comm_Id == parseInt(commId) &&
            ["Birthday", "Death", "Anniversary", "DeathAnniversary"].includes(
              notice.N_Category
            )
        );

        setNotices(filteredNotices);
        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchNotices();
  }, [commId]);

  const events = [
    { title: "All", icon: <Smile className="w-12 h-12" />, category: "All" },
    {
      title: "Birthday",
      icon: <Cake className="w-12 h-12" />,
      category: "Birthday",
    },
    { title: "Death", icon: <Ring className="w-12 h-12" />, category: "Death" },
    {
      title: "Anniversary",
      icon: <Heart className="w-12 h-12" />,
      category: "Anniversary",
    },
    {
      title: "Death Anniversary",
      icon: <Flower2 className="w-12 h-12" />,
      category: "DeathAnniversary",
    },
  ];

  const filteredNotices = notices.filter((notice) => {
    const matchesCategory =
      selectedCategory == "All" || notice.N_Category == selectedCategory;
    const matchesSearch =
      searchTerm.toLowerCase() == "" ||
      notice.N_Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (notice.N_MaleName?.toLowerCase().includes(searchTerm.toLowerCase()) ??
        false) ||
      (notice.N_WomanName?.toLowerCase().includes(searchTerm.toLowerCase()) ??
        false);

    return (
      matchesCategory && (selectedCategory == "All" ? matchesSearch : true)
    );
  });

  if (loading) return <CustomLogoLoader />;

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="text-red-500" size={32} />
          </div>
          <h2 className="text-xl font-bold text-red-600 mb-2">
            Error Occurred
          </h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Search */}
      <div
        className="h-[50vh] bg-cover bg-center flex items-center justify-center relative"
        style={{
          backgroundImage:
            "url('https://i.pinimg.com/736x/e4/36/06/e43606c84660f068bb821c526c907eee.jpg)",
        }}
      >
        <div className="absolute inset-0 bg-[#1a2b4982] bg-opacity-40"></div>
        <div className="relative z-10 w-full max-w-4xl px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1A2B49] text-center mb-8 drop-shadow-lg">
            Community Life Events
          </h1>

          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search events..."
              className="w-full p-4 pl-12 rounded-lg bg-white bg-opacity-90 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1A2B49] shadow-lg"
              disabled={selectedCategory !== "All"}
            />
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 -mt-16 relative z-20">
        {/* Event Categories */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
          {events.map((event) => (
            <div
              key={event.category}
              onClick={() => {
                setSelectedCategory(event.category);
                setSearchTerm("");
              }}
              className="transform hover:scale-105 transition-all duration-300 cursor-pointer group"
            >
              <div
                className={`bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl h-full flex flex-col ${
                  selectedCategory == event.category
                    ? "ring-2 ring-[#1A2B49]"
                    : ""
                }`}
              >
                <div className="p-6 flex-grow">
                  <div className="flex items-center justify-center mb-4">
                    <div
                      className={`p-3 rounded-full transition-colors ${
                        selectedCategory == event.category
                          ? "bg-[#1A2B49] text-white"
                          : "bg-gray-100 text-[#1A2B49] group-hover:bg-[#1A2B49] group-hover:text-white"
                      }`}
                    >
                      {event.icon}
                    </div>
                  </div>
                  <h3
                    className={`text-lg font-semibold text-center ${
                      selectedCategory == event.category
                        ? "text-[#1A2B49]"
                        : "text-gray-700 group-hover:text-[#1A2B49]"
                    }`}
                  >
                    {event.title}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Notices List */}
        {filteredNotices.length > 0 ? (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {selectedCategory == "All"
                ? "All Events"
                : `${selectedCategory} Events`}
              <span className="ml-2 text-sm font-normal bg-[#1A2B49] text-white px-3 py-1 rounded-full">
                {filteredNotices.length} found
              </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNotices.map((notice) => (
                <div
                  key={notice.N_Id}
                  onClick={() => setSelectedNotice(notice)}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full flex flex-col"
                >
                  {notice.N_Image?.[0] && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={notice.N_Image[0]}
                        alt={notice.N_Title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-6 flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-gray-800">
                        {notice.N_Title}
                      </h3>
                      <span className="bg-[#1A2B49] text-white text-xs px-2 py-1 rounded-full">
                        {notice.N_Category}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">
                      {notice.N_Description?.length > 100
                        ? `${notice.N_Description.substring(0, 100)}...`
                        : notice.N_Description}
                    </p>
                    <div className="mt-auto">
                      <div className="flex items-center text-sm text-gray-500">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {new Date(notice.N_Date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        {notice.N_Address?.length > 30
                          ? `${notice.N_Address.substring(0, 30)}...`
                          : notice.N_Address}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <svg
                className="w-16 h-16 mx-auto text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                {notices.length == 0
                  ? "No events found for your community"
                  : "No matching events found"}
              </h3>
              <p className="mt-2 text-gray-500">
                {selectedCategory == "All"
                  ? "Try a different search term"
                  : "No events in this category yet"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Notice Details Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 bg-[gray] bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header with close button */}
            <div className="sticky z-15 top-0 bg-white p-4 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedNotice.N_Title}
              </h2>
              <button
                onClick={() => setSelectedNotice(null)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Image Slider */}
              {selectedNotice.N_Image?.length > 0 && (
                <div className="mb-8 relative">
                  <Slider {...sliderSettings}>
                    {selectedNotice.N_Image.map((img, index) => (
                      <div key={index} className="focus:outline-none">
                        <div className="h-96 overflow-hidden rounded-lg">
                          <img
                            src={img}
                            alt={`${selectedNotice.N_Title} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    ))}
                  </Slider>
                  <div className="text-center text-sm text-gray-500 mt-7">
                    {currentSlide + 1} of {selectedNotice.N_Image.length}
                  </div>
                </div>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Event Type
                    </h3>
                    <p className="mt-1 text-lg font-medium text-gray-900">
                      {selectedNotice.N_Category}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Date</h3>
                    <p className="mt-1 text-lg font-medium text-gray-900">
                      {new Date(selectedNotice.N_Date).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>

                  {selectedNotice.N_MaleName && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Male Name
                      </h3>
                      <p className="mt-1 text-lg font-medium text-gray-900">
                        {selectedNotice.N_MaleName}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {selectedNotice.N_WomanName && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Female Name
                      </h3>
                      <p className="mt-1 text-lg font-medium text-gray-900">
                        {selectedNotice.N_WomanName}
                      </p>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Contact
                    </h3>
                    <p className="mt-1 text-lg font-medium text-gray-900">
                      {selectedNotice.N_Mobile}
                    </p>
                    {selectedNotice.N_Email && (
                      <p className="mt-1 text-lg font-medium text-gray-900">
                        {selectedNotice.N_Email}
                      </p>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Location
                    </h3>
                    <p className="mt-1 text-lg font-medium text-gray-900">
                      {selectedNotice.N_Address}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Description
                </h3>
                <p className="mt-2 text-gray-700 whitespace-pre-line">
                  {selectedNotice.N_Description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LifeEvents;
