import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  CircleChevronLeft,
  Gift,
  User,
  Calendar,
  Phone,
  MapPin,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
} from "lucide-react";
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

const CelebrationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [celebration, setCelebration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullScreen, setShowFullScreen] = useState(false);

  // Determine the back navigation path based on location.state
  const backPath = location.state?.from === "celebrationrequest" ? "/celebrationrequest" : "/celebration";

  useEffect(() => {
    const fetchCelebration = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://parivaar.app/public/api/celebration/${id}`, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Celebration not found");
          } else {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
        }

        const result = await response.json();
        if (result.status && result.data) {
          setCelebration(result.data);
        } else {
          throw new Error("Unexpected API response format");
        }
      } catch (err) {
        setError(`Failed to fetch celebration: ${err.message}`);
        console.error("Error fetching celebration:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCelebration();
  }, [id]);

  const handleNextImage = () => {
    if (celebration?.N_Image?.length > 1) {
      setCurrentImageIndex((prev) => (prev === celebration.N_Image.length - 1 ? 0 : prev + 1));
    }
  };

  const handlePrevImage = () => {
    if (celebration?.N_Image?.length > 1) {
      setCurrentImageIndex((prev) => (prev === 0 ? celebration.N_Image.length - 1 : prev - 1));
    }
  };

  if (loading) {
    return <CustomLogoLoader />;
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl shadow-xl max-w-2xl mx-auto border border-red-100">
        <div className="bg-red-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <X className="w-8 h-8 text-red-500" />
        </div>
        <div className="text-red-600 text-xl font-semibold mb-2">{error}</div>
        <button
          onClick={() => navigate(backPath)}
          className="px-6 py-3 bg-gradient-to-r from-[#1A2B49] to-[#2a3b5a] text-white rounded-xl hover:from-[#14223e] hover:to-[#1A2B49] transition-all duration-300 font-semibold"
        >
          Back to Celebrations
        </button>
      </div>
    );
  }

  if (!celebration) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl shadow-xl max-w-2xl mx-auto border border-red-100">
        <div className="text-red-600 text-xl font-semibold mb-2">Celebration not found</div>
        <button
          onClick={() => navigate(backPath)}
          className="px-6 py-3 bg-gradient-to-r from-[#1A2B49] to-[#2a3b5a] text-white rounded-xl hover:from-[#14223e] hover:to-[#1A2B49] transition-all duration-300 font-semibold"
        >
          Back to Celebrations
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10">
      <div className="max-w-7xl mx-auto px-6">
        <button
          onClick={() => navigate(backPath)}
          className="flex items-center text-[#1A2B49] cursor-pointer hover:text-black mb-6 transition-colors duration-200 bg-white rounded-xl px-4 py-2 shadow-sm border border-gray-200"
        >
          <CircleChevronLeft className="w-5 h-5 mr-2" />
          Back to Celebrations
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Section */}
          <div className="space-y-6">
            <div className="relative h-[450px] rounded-3xl overflow-hidden shadow-2xl border border-[#1A2B49] bg-gradient-to-br from-gray-50 to-gray-100">
              {celebration.N_Image && celebration.N_Image.length > 0 ? (
                <>
                  <img
                    src={celebration.N_Image[currentImageIndex] || "/placeholder.svg"}
                    alt={`${celebration.N_Title} - Image ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
                    onClick={() => setShowFullScreen(true)}
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1513151233558-d860c5398176?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80";
                    }}
                  />
                  <button
                    onClick={() => setShowFullScreen(true)}
                    className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors backdrop-blur-sm"
                  >
                    <Maximize2 className="w-5 h-5" />
                  </button>
                  {celebration.N_Image.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors backdrop-blur-sm"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors backdrop-blur-sm"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#1A2B49] to-transparent p-6">
                    <h1 className="text-3xl font-bold text-white drop-shadow-md flex items-center gap-3">
                      <Gift className="w-8 h-8" />
                      {celebration.N_Title}
                    </h1>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#1A2B49]/10 to-[#2A3B59]/10">
                  <Gift className="w-24 h-24 text-[#1A2B49] animate-bounce" />
                </div>
              )}
            </div>
            {celebration.N_Image && celebration.N_Image.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {celebration.N_Image.map((image, index) => (
                  <img
                    key={index}
                    src={image || "/placeholder.svg"}
                    alt={`Thumbnail ${index + 1}`}
                    className={`w-20 h-20 object-cover rounded-xl cursor-pointer transition-all duration-200 ${
                      index === currentImageIndex
                        ? "border-3 border-[#1A2B49] scale-110 shadow-lg"
                        : "opacity-70 hover:opacity-100 hover:scale-105"
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1513151233558-d860c5398176?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80";
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <h3 className="text-xl font-semibold mb-4 flex items-center text-[#1A2B49]">
                <User className="w-5 h-5 mr-2" />
                Celebration Details
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm font-medium text-[#1A2B49] w- 20">Name:</span>
                  <span className="flex-1 font-semibold text-gray-800">
                    {celebration.N_MaleName || "Not provided"}
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm font-medium text-[#1A2B49] w-20">Age:</span>
                  <span className="flex-1 font-semibold text-gray-800">
                    {celebration.N_Age || "Not provided"} years
                  </span>
                </div>
                <div classediv className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm font-medium text-[#1A2B49] w-20">Date:</span>
                  <span className="flex-1 font-semibold text-gray-800">
                    {celebration.N_Date
                      ? new Date(celebration.N_Date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Not provided"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#1A2B49] to-[#2a3b5a] p-6 rounded-2xl shadow-xl text-white transform transition-all hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-6 h-6" />
                <h3 className="text-lg font-semibold">Celebration Message</h3>
              </div>
              <p className="text-lg italic border-l-4 border-white pl-4 py-2 relative leading-relaxed">
                <span className="absolute -left-2 top-0 w-2 h-2 bg-white rounded-full animate-ping"></span>
                {celebration.N_Description || "No description available"}
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <h3 className="text-xl font-semibold mb-4 flex items-center text-[#1A2B49]">
                <Phone className="w-5 h-5 mr-2" />
                Contact Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Phone className="w-4 h-4 text-[#1A2B49]" />
                  <span className="text-sm font-medium text-gray-500 w-20">Phone:</span>
                  <span className="flex-1 font-semibold text-gray-800">
                    {celebration.N_Mobile || "Not provided"}
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <MapPin className="w-4 h-4 text-[#1A2B49]" />
                  <span className="text-sm font-medium text-gray-500 w-20">Address:</span>
                  <span className="flex-1 font-semibold text-gray-800">
                    {celebration.N_Address || "Not provided"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Image View */}
      {showFullScreen && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <button
            onClick={() => setShowFullScreen(false)}
            className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 p-3 rounded-full transition-colors backdrop-blur-sm"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={celebration.N_Image[currentImageIndex] || "/placeholder.svg"}
            alt={`${celebration.N_Title} - Fullscreen`}
            className="max-w-full max-h-full object-contain"
            onError={(e) => {
              e.target.src =
                "https://images.unsplash.com/photo-1513151233558-d860c539Feb-4.0.3&auto=format&fit=crop&w=1470&q=80";
            }}
          />
        </div>
      )}
    </div>
  );
};

export default CelebrationDetails;