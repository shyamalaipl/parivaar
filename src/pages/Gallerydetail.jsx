import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
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

const GallerySlider = ({ photos, onImageClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? photos.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === photos.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleDotClick = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div className="relative w-full">
      {/* Slider Image */}
      <div className="w-full h-96 overflow-hidden rounded-lg shadow-lg">
        <img
          src={photos[currentIndex] || "https://via.placeholder.com/150"}
          alt="Slider Image"
          className="w-full h-full object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
          onClick={() => onImageClick(photos[currentIndex], currentIndex)}
          onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
        />
      </div>

      {/* Navigation Buttons */}
      {photos.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-900/80 text-white p-3 rounded-full hover:bg-gray-900 transition-all duration-200 shadow-md"
          >
            ❮
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-900/80 text-white p-3 rounded-full hover:bg-gray-900 transition-all duration-200 shadow-md"
          >
            ❯
          </button>
        </>
      )}

      {/* Dots */}
      {photos.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {photos.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                currentIndex === index ? "bg-gray-900 scale-125" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Gallerydetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exhibition, setExhibition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLandscapeMode, setIsLandscapeMode] = useState(false);

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
          const numericId = parseInt(id, 10);
          const filteredEvents = data.data.filter(
            (item) => item.user.Comm_Id === commId && item.CE_Id === numericId
          );

          if (filteredEvents.length > 0) {
            const item = filteredEvents[0];
            setExhibition({
              id: item.CE_Id,
              title: item.CE_Name,
              description: item.CE_Description || "No description available",
              image: item.CE_Photo[0] || "https://via.placeholder.com/150",
              photos: item.CE_Photo,
              date: item.CE_Date || "Date not specified",
              place: item.CE_Place || "Place not specified",
            });
          } else {
            console.error(`No exhibition found for CE_Id: ${id} and Comm_Id: ${commId}`);
            navigate("/gallery");
          }
        } else {
          console.error("API response status is not success:", data);
          navigate("/gallery");
        }
      } catch (error) {
        console.error("Error fetching gallery data:", error);
        navigate("/gallery");
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryData();
  }, [id, navigate]);

  // Preload images to improve performance
  useEffect(() => {
    if (exhibition?.photos) {
      exhibition.photos.forEach((photo) => {
        const img = new Image();
        img.src = photo;
      });
    }
  }, [exhibition]);

  // Keyboard navigation for enlarged view
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedImage) return;
      if (e.key === "ArrowLeft") navigateImages("prev");
      if (e.key === "ArrowRight") navigateImages("next");
      if (e.key === "Escape") closeImageView();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage, currentImageIndex]);

  const handleImageClick = (photo, index = 0) => {
    setSelectedImage(photo);
    setCurrentImageIndex(index);
    setIsLandscapeMode(false);
  };

  const closeImageView = () => {
    setSelectedImage(null);
    setIsLandscapeMode(false);
  };

  const toggleLandscapeMode = () => {
    setIsLandscapeMode(!isLandscapeMode);
  };

  const navigateImages = (direction) => {
    if (!exhibition) return;

    let newIndex;
    if (direction === "prev") {
      newIndex = currentImageIndex === 0 ? exhibition.photos.length - 1 : currentImageIndex - 1;
    } else {
      newIndex = currentImageIndex === exhibition.photos.length - 1 ? 0 : currentImageIndex + 1;
    }

    setCurrentImageIndex(newIndex);
    setSelectedImage(exhibition.photos[newIndex]);
  };

  if (loading) {
    return <CustomLogoLoader />;
  }

  if (!exhibition || !exhibition.photos || exhibition.photos.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">No images available for this gallery.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb Navigation */}
      <div className="container mx-auto px-6 py-6">
        <nav className="flex items-center gap-2 text-sm" aria-label="breadcrumb">
          <Link
            to="/home"
            className="text-[#1A2B49] font-medium hover:underline hover:text-gray-700 transition-colors"
          >
            Home
          </Link>
          <span className="text-gray-400"> / </span>
          <Link
            to="/gallery"
            className="text-[#1A2B49] font-medium hover:underline hover:text-gray-700 transition-colors"
          >
            Gallery
          </Link>
          <span className="text-gray-400"> / </span>
          <span className="text-[#1A2B49] font-semibold">{exhibition.title}</span>
        </nav>
      </div>

      {/* Gallery Detail Section */}
      <section className="pb-16 px-6 lg:px-16">
        <div className="container mx-auto">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                {exhibition.title}
              </h1>
              <div className="flex flex-wrap gap-4 text-gray-600">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{exhibition.date}</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{exhibition.place}</span>
                </div>
              </div>
            </div>

            {/* Slider */}
            <div className="p-6">
              <GallerySlider
                photos={exhibition.photos}
                onImageClick={handleImageClick}
              />
            </div>

            {/* Thumbnails */}
            <div className="px-6 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                All Images ({exhibition.photos.length})
              </h3>
              <div className="flex flex-wrap justify-start gap-3">
                {exhibition.photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-24 h-24 md:w-20 md:h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-all duration-200 group-hover:shadow-md"
                      onClick={() => handleImageClick(photo, index)}
                      onError={(e) =>
                        (e.target.src = "https://via.placeholder.com/150")
                      }
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Details */}
            <div className="p-6 border-t border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Event Details</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {exhibition.description}
              </p>

              <div className="flex flex-wrap justify-between gap-4 mt-6">
                <div className="flex-1 min-w-[200px]">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Date
                  </h4>
                  <p className="text-gray-900">{exhibition.date}</p>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Location
                  </h4>
                  <p className="text-gray-900">{exhibition.place}</p>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Total Images
                  </h4>
                  <p className="text-gray-900">{exhibition.photos.length}</p>
                </div>
              </div>
            </div>

            {/* Back Button */}
            <div className="p-6 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => navigate("/gallery")}
                className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-300 shadow-md hover:shadow-lg flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Gallery
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Enlarged Image View */}
      {selectedImage && (
        <div
          className={`fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${
            selectedImage ? "opacity-100" : "opacity-0 pointer-events-none"
          } ${isLandscapeMode ? "bg-black" : ""}`}
        >
          <div className={`relative ${isLandscapeMode ? "w-full h-full" : "max-w-6xl w-full"}`}>
            {/* Close Button */}
            <button
              onClick={closeImageView}
              className="absolute right-0 text-white text-3xl hover:text-gray-300 transition-colors p-2"
            >
              ✕
            </button>

            {/* Landscape Mode Toggle */}
            <button
              onClick={toggleLandscapeMode}
              className="absolute right-12 text-white text-xl hover:text-gray-300 transition-colors p-2"
              title={isLandscapeMode ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isLandscapeMode ? "↗" : "⛶"}
            </button>

            {/* Navigation Arrows */}
            <button
              onClick={() => navigateImages("prev")}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-900/80 text-white p-3 rounded-full hover:bg-gray-900 transition-all duration-200 shadow-of-md z-10"
            >
              ❮
            </button>

            <button
              onClick={() => navigateImages("next")}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-900/80 text-white p-3 rounded-full hover:bg-gray-900 transition-all duration-200 shadow-md z-10"
            >
              ❯
            </button>

            {/* Image Display */}
            <div className="flex justify-center items-center h-full">
              <img
                src={selectedImage}
                alt="Enlarged view"
                className={`${
                  isLandscapeMode ? "w-full h-full object-contain" : "max-w-full max-h-[80vh] object-contain"
                } rounded-lg shadow-xl transition-transform duration-300`}
                onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
              />
            </div>

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-900/70 text-white px-3 py-1 rounded-full text-sm">
              {currentImageIndex + 1} / {exhibition.photos.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallerydetail;