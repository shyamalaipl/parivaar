
"use client"

import { useState, useEffect } from "react"
import { useParams, Link, useLocation } from "react-router-dom"
import { Flower2, User, CalendarDays, MapPin, Heart, Phone, Mail, ChevronRight, X } from "lucide-react"
import logoImage from "../../img/parivarlogo1.png"


// Define getStatusColor
const getStatusColor = (status) => {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-800 border-green-200"
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "rejected":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

// Loader component
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

const CondolencesDetails = () => {
  const { id } = useParams()
  const [condolence, setCondolence] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const location = useLocation()
  const source = location.state?.source || "condolences" // Default to "condolences" if no source is provided

  useEffect(() => {
    const fetchCondolence = async () => {
      try {
        setLoading(true)
        const response = await fetch("https://parivaar.app/public/api/condolences", {
          headers: { "Content-Type": "application/json" },
        })
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        const result = await response.json()
        if (result.status && Array.isArray(result.data)) {
          const found = result.data.find((item) => item.N_Id.toString() === id)
          if (found) {
            setCondolence(found)
          } else {
            setError("Condolences not found")
          }
        } else {
          setError("Unexpected API response format")
        }
      } catch (err) {
        setError(`Failed to fetch Condolences details: ${err.message}`)
        console.error("Error fetching condolence:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchCondolence()
  }, [id])

  if (loading) return <CustomLogoLoader />
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center py-12 bg-white rounded-2xl shadow-xl max-w-2xl mx-auto border border-red-100">
          <div className="bg-red-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <div className="text-red-600 text-xl font-semibold mb-2">{error}</div>
          <p className="text-gray-600 mb-6">Please check your network connection or try again later.</p>
          <Link
            to="/condolences"
            className="px-6 py-3 bg-gradient-to-r from-[#1A2B49] to-[#2A3B59] text-white rounded-xl hover:from-[#14223e] hover:to-[#1A2B49] transition-all duration-300 font-semibold"
          >
            Back to Condolences
          </Link>
        </div>
      </div>
    )
  }
  if (!condolence) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <nav
          className="flex items-center gap-3 mb-8 text-sm font-medium bg-white rounded-lg px-4 py-3 shadow-sm border border-gray-200"
          aria-label="breadcrumb"
        >
          <Link to="/home" className="text-[#1A2B49] font-bold hover:underline transition-colors duration-200">
            Home
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          {source === "requests" ? (
            <>
              <Link
                to="/condolences/requests"
                className="text-[#1A2B49] font-bold hover:underline transition-colors duration-200"
              >
                Your Requests
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </>
          ) : (
            <>
              <Link
                to="/condolences"
                className="text-[#1A2B49] font-bold hover:underline transition-colors duration-200"
              >
                Condolences
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </>
          )}
          <span className="text-[#1A2B49] font-semibold">{condolence.N_Title}</span>
        </nav>
        <div className="bg-white rounded-3xl shadow-2xl max-w-5xl mx-auto flex flex-col sm:flex-row overflow-hidden">
          <div className="w-full sm:w-1/2 relative bg-gradient-to-br from-gray-50 to-gray-100">
            <img
              src={
                condolence.N_Image?.[0] ||
                "https://images.pexels.com/photos/262271/pexels-photo-262271.jpeg" ||
                "/placeholder.svg"
              }
              alt={condolence.N_Title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "https://images.pexels.com/photos/262271/pexels-photo-262271.jpeg"
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A2B49]/40 via-transparent to-transparent"></div>
            <div className="absolute top-4 left-4">
              <div className="bg-white/90 backdrop-blur-sm rounded-full p-2">
                <Flower2 className="w-5 h-5 text-[#1A2B49]" />
              </div>
            </div>
          </div>
          <div className="w-full sm:w-1/2 p-8 overflow-y-auto bg-gradient-to-br from-white to-gray-50">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[#1A2B49] mb-2">{condolence.N_Title}</h2>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-gray-600">Condolences</span>
                </div>
              </div>


               {source === "requests" ? (
            <>
              <Link
                to="/condolences/requests"
                className="text-[#1A2B49] font-bold hover:underline transition-colors duration-200"
              >
                <X className="w-6 h-6 text-gray-600" />
              </Link>
            
            </>
          ) : (
            <>
              <Link
                to="/condolences"
                className="text-[#1A2B49] font-bold hover:underline transition-colors duration-200"
              >
           <X className="w-6 h-6 text-gray-600" />
              </Link>
             
            </>
          )}
           
            </div>
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-[#1A2B49] mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Personal Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500 w-16">Name:</span>
                    <span className="text-sm font-semibold text-gray-800">
                      {condolence.N_MaleName || condolence.N_WomanName || "Not provided"}
                    </span>
                  </div>
                  {condolence.N_Age && (
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-500 w-16">Age:</span>
                      <span className="text-sm text-gray-800">{condolence.N_Age} years</span>
                    </div>
                  )}
                </div>
              </div>
              {(condolence.N_Date || condolence.N_Address) && (
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-[#1A2B49] mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Details
                  </h3>
                  <div className="space-y-3">
                    {condolence.N_Date && (
                      <div className="flex items-center gap-3">
                        <CalendarDays className="w-4 h-4 text-[#1A2B49]" />
                        <span className="text-sm text-gray-800">
                          {new Date(condolence.N_Date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                    {condolence.N_Address && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-[#1A2B49] mt-0.5" />
                        <span className="text-sm text-gray-800">{condolence.N_Address}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {condolence.N_Description && (
                <div className="bg-gradient-to-r from-[#1A2B49]/5 to-transparent rounded-xl p-4 border-l-4 border-[#1A2B49]">
                  <p className="text-sm text-gray-700 italic leading-relaxed">"{condolence.N_Description}"</p>
                </div>
              )}
              {(condolence.N_Mobile || condolence.N_Email) && (
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-[#1A2B49] mb-3 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Contact Information
                  </h3>
                  <div className="space-y-3">
                    {condolence.N_Mobile && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-[#1A2B49]" />
                        <span className="text-sm text-gray-800">{condolence.N_Mobile}</span>
                      </div>
                    )}
                    {condolence.N_Email && (
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-[#1A2B49]" />
                        <span className="text-sm text-gray-800">{condolence.N_Email}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-500">Status:</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(condolence.N_Status)}`}
                >
                  {condolence.N_Status.charAt(0).toUpperCase() + condolence.N_Status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CondolencesDetails
