import React, { useState, useEffect, useRef } from "react";
import logoImage from "../../src/img/parivarlogo1.png";
import gallery11 from "../../src/img/gallery11.jpg";
import { Link, useNavigate } from "react-router-dom";

// CustomLogoLoader component remains unchanged
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

// Enhanced GallerySlider component with better transitions
const GallerySlider = ({ photos, onImageClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(null);

  const handlePrev = () => {
    setDirection('left');
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? photos.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setDirection('right');
    setCurrentIndex((prevIndex) =>
      prevIndex === photos.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleDotClick = (index) => {
    setDirection(index > currentIndex ? 'right' : 'left');
    setCurrentIndex(index);
  };

  return (
    <div className="relative w-full group">
      <div className="w-full h-64 overflow-hidden rounded-lg shadow-md">
        <img
          src={photos[currentIndex] || "https://via.placeholder.com/150"}
          alt="Slider Image"
          className={`w-full h-full object-cover cursor-pointer transition-transform duration-500 ease-in-out ${
            direction === 'right' ? 'slide-in-right' : direction === 'left' ? 'slide-in-left' : ''
          }`}
          onClick={() => onImageClick(photos[currentIndex])}
          onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
        />
      </div>
      {photos.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-900/70 text-white p-2 rounded-full hover:bg-gray-900 transition-all opacity-0 group-hover:opacity-100 duration-300"
            aria-label="Previous image"
          >
            ❮
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-900/70 text-white p-2 rounded-full hover:bg-gray-900 transition-all opacity-0 group-hover:opacity-100 duration-300"
            aria-label="Next image"
          >
            ❯
          </button>
        </>
      )}
      {photos.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {photos.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentIndex === index ? "bg-gray-900 scale-125" : "bg-gray-400"
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Gallery = () => {
  const [exhibitions, setExhibitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredExhibitions, setFilteredExhibitions] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const gallerySectionRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGalleryData = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        const commId = userData?.Comm_Id;

        if (!commId) {
          console.error("Comm_Id not found in local storage");
          setLoading(false);
          return;
        }

        const response = await fetch("https://parivaar.app/public/api/gallary");
        const data = await response.json();

        if (data.status === "success") {
          const filteredEvents = data.data.filter(
            (item) => item.user.Comm_Id === commId
          );

          const formattedExhibitions = filteredEvents.map((item) => ({
            id: item.CE_Id,
            title: item.CE_Name,
            description: item.CE_Description || "No description available",
            image: item.CE_Photo[0] || "https://via.placeholder.com/150",
            photos: item.CE_Photo,
            date: item.CE_Date || "Date not specified",
            place: item.CE_Place || "Place not specified",
          }));

          setExhibitions(formattedExhibitions);
        } else {
          console.error("API response status is not success:", data);
        }
      } catch (error) {
        console.error("Error fetching gallery data:", error);
        setExhibitions([
          {
            id: 1,
            title: "Les Fleurs du Soir",
            description: "The Evening Flowers",
            image:
              "https://i.pinimg.com/736x/05/b8/cb/05b8cbe7042fd24a2be77066bc26977c.jpg",
            photos: [
              "https://i.pinimg.com/736x/05/b8/cb/05b8cbe7042fd24a2be77066bc26977c.jpg",
            ],
            date: "N/A",
            place: "N/A",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredExhibitions([]);
    } else {
      const filtered = exhibitions.filter(
        (exhibition) =>
          exhibition.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          exhibition.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredExhibitions(filtered);
    }
  }, [searchQuery, exhibitions]);

  const handleCardClick = (exhibition) => {
    setSearchQuery("");
    navigate(`/gallery/${exhibition.id}`);
  };

  const scrollToGallery = () => {
    gallerySectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  if (loading) {
    return <CustomLogoLoader />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Add custom styles for slide animations */}
      <style>
        {`
          .slide-in-right {
            animation: slideInRight 0.5s ease-in-out;
          }
          .slide-in-left {
            animation: slideInLeft 0.5s ease-in-out;
          }
          @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          @keyframes slideInLeft {
            from { transform: translateX(-100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          .gallery-card {
            transition: all 0.3s ease;
          }
          .gallery-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          }
        `}
      </style>

      <section ref={gallerySectionRef} className="px-4 sm:px-6 lg:px-16 py-8">
        <div className="container mx-auto">
          <nav
            className="flex items-center gap-3 mb-8 text-sm font-medium bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-200"
            // aria-label="Breadcrumb"
          >
            <Link
              to="/home"
              className="text-[#1A2B49] font-bold hover:underline hover:text-gray-700 transition-colors"
            >
              Home
            </Link>
            <span className="text-gray-400"> / </span>
            <span className="text-[#1A2B49]">Gallery</span>
          </nav>
<div className="w-full  py-8 ">
  {/* Top Section: Heading + Search */}
  <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
    
    {/* Heading Section */}
    <div className="text-center md:text-left">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
        Community Gallery
      </h1>
      <p className="text-base md:text-lg text-gray-600 max-w-2xl">
        Explore our community's memorable events and exhibitions
      </p>
    </div>

    {/* Search Input with Suggestions */}
    <div className="relative w-full md:max-w-md">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => setIsSearchFocused(true)}
        onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
        placeholder="Search gallery by title or description..."
        className="w-full px-6 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent shadow-sm transition-all duration-300"
      />
      {/* Search Icon */}
      <svg
        className="absolute right-5 top-3.5 h-5 w-5 text-gray-400 pointer-events-none"
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

      {/* Suggestions Dropdown */}
      {(filteredExhibitions.length > 0 && isSearchFocused) && (
        <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-xl mt-2 top-full max-h-96 overflow-y-auto">
          {filteredExhibitions.map((exhibition) => (
            <div
              key={exhibition.id}
              onClick={() => handleCardClick(exhibition)}
              className="flex items-center p-4 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
            >
              <div className="flex-shrink-0 w-16 h-16 overflow-hidden rounded-md bg-gray-100">
                <img
                  src={exhibition.image}
                  alt={exhibition.title}
                  className="w-full h-full object-cover"
                  onError={(e) =>
                    (e.target.src = "https://via.placeholder.com/150")
                  }
                />
              </div>
              <div className="ml-4">
                <h3 className="text-base font-semibold text-gray-900">
                  {exhibition.title}
                </h3>
                <p className="text-sm text-gray-600 truncate">
                  {exhibition.description}
                </p>
                <div className="flex items-center mt-1 text-xs text-gray-500 space-x-2">
                  <span>{exhibition.date}</span>
                  <span>•</span>
                  <span>{exhibition.place}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
</div>



         

          {exhibitions.length === 0 ? (
            <div className="text-center py-20">
              <div className="mx-auto w-24 h-24 mb-6 text-gray-400">
                <svg
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No gallery items found
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                There are currently no gallery items available for your community. Check back later!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {exhibitions.map((exhibition) => (
                <div
                  key={exhibition.id}
                  onClick={() => handleCardClick(exhibition)}
                  className="gallery-card bg-white rounded-xl shadow-md overflow-hidden cursor-pointer border border-gray-100"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={exhibition.image}
                      alt={exhibition.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      onError={(e) =>
                        (e.target.src = "https://via.placeholder.com/150")
                      }
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                        {exhibition.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {exhibition.description}
                    </p>
                    <div className="flex items-center text-xs text-gray-500">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>{exhibition.date}</span>
                      <svg
                        className="w-4 h-4 mx-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
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
                      <span className="truncate">{exhibition.place}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Gallery;