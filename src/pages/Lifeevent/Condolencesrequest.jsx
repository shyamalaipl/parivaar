import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  Flower2,
  ChevronRight,
  X,
  Plus,
  Clock,
  Eye,
  Search,
  CircleChevronLeft,
  User,
  CalendarDays,
  MapPin,
  Heart,
  Mail,
  Phone,
  Send,
} from "lucide-react"
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

// Dropdown item component
const DropdownItem = ({ request, onClick }) => {
  return (
    <div
      className="px-4 py-3 hover:bg-gray-100 cursor-pointer flex items-center gap-3 border-b border-gray-200 last:border-b-0 transition-colors duration-200"
      onClick={onClick}
    >
      <Heart className="w-4 h-4 text-red-500 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{request.N_Title}</p>
        <p className="text-xs text-gray-600 truncate">
          {request.N_MaleName || request.N_WomanName || "Not provided"}
        </p>
      </div>
    </div>
  );
};

// Enhanced sliding form component
const CondolenceForm = ({
  formData,
  setFormData,
  handleInputChange,
  handleImageChange,
  handleFormSubmit,
  setShowForm,
  gender,
  setGender,
  previewImages,
  resetForm,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setShowForm(false)}
      />
      <div className="relative w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl bg-white shadow-2xl transform transition-transform duration-300 ease-in-out overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 px-4 sm:px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-[#1A2B49] to-[#2A3B59] text-white">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2 truncate">
              <Plus className="w-5 h-5 flex-shrink-0" />
              Create Condolences
            </h2>
            <p className="text-xs sm:text-sm opacity-90 mt-1 truncate">Fill in the details to honor a loved one</p>
          </div>
          <button
            onClick={() => setShowForm(false)}
            className="ml-4 hover:bg-white/20 p-2 rounded-full transition-colors duration-200 flex-shrink-0"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleFormSubmit} className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-white">
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6 space-y-4">
              {/* Basic Information Section */}
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
                <h3 className="text-base sm:text-lg font-semibold text-[#1A2B49] mb-4 flex items-center gap-2">
                  <Flower2 className="w-5 h-5" />
                  Basic Information
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="N_Title"
                      value={formData.N_Title}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent focus:outline-none text-sm transition-all duration-200"
                      placeholder="Enter Condolences title"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="N_Date"
                        value={formData.N_Date}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent focus:outline-none text-sm transition-all duration-200"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        name="N_Category"
                        value={formData.N_Category}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent focus:outline-none text-sm transition-all duration-200"
                        required
                      >
                        <option value="Death Anniversary">Death Anniversary</option>
                        <option value="Death">Death</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent focus:outline-none text-sm transition-all duration-200"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {gender === "Male" ? "Male Name" : "Female Name"}
                      </label>
                      <input
                        type="text"
                        name={gender === "Male" ? "N_MaleName" : "N_WomanName"}
                        value={gender === "Male" ? formData.N_MaleName : formData.N_WomanName}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent focus:outline-none text-sm transition-all duration-200"
                        placeholder={`Enter ${gender.toLowerCase()} name`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                      <input
                        type="number"
                        name="N_Age"
                        value={formData.N_Age}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent focus:outline-none text-sm transition-all duration-200"
                        placeholder="Enter age"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Years</label>
                      <input
                        type="number"
                        name="N_Years"
                        value={formData.N_Years}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent focus:outline-none text-sm transition-all duration-200"
                        placeholder="Enter years"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
                <h3 className="text-base sm:text-lg font-semibold text-[#1A2B49] mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Contact Information
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mobile</label>
                      <input
                        type="tel"
                        name="N_Mobile"
                        value={formData.N_Mobile}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent focus:outline-none text-sm transition-all duration-200"
                        placeholder="Enter mobile number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        name="N_Email"
                        value={formData.N_Email}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent focus:outline-none text-sm transition-all duration-200"
                        placeholder="Enter email"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <input
                      type="text"
                      name="N_Address"
                      value={formData.N_Address}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent focus:outline-none text-sm transition-all duration-200"
                      placeholder="Enter address"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Details Section */}
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
                <h3 className="text-base sm:text-lg font-semibold text-[#1A2B49] mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Additional Details
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      name="N_Description"
                      value={formData.N_Description}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent focus:outline-none text-sm transition-all duration-200 resize-none"
                      placeholder="Enter description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
                    <div className="flex items-center gap-4">
                      <label className="flex-1 cursor-pointer">
                        <div className="w-full p-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#1A2B49] transition-all duration-200 flex items-center justify-center">
                          <div className="flex items-center gap-3 text-gray-500">
                            <Heart className="w-6 h-6" />
                            <span className="font-medium text-sm">Choose images</span>
                          </div>
                        </div>
                        <input
                          type="file"
                          name="N_Image"
                          onChange={handleImageChange}
                          multiple
                          accept="image/*"
                          className="hidden"
                        />
                      </label>
                    </div>
                    
                    {previewImages.length > 0 && (
                      <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {previewImages.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-20 object-cover rounded-lg border border-gray-200"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 px-4 sm:px-6 py-4 border-t border-gray-100 bg-white shadow-lg">
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 sm:px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 sm:px-6 py-3 bg-gradient-to-r from-[#1A2B49] to-[#2A3B59] text-white rounded-lg hover:from-[#14223e] hover:to-[#1A2B49] transition-all duration-300 font-semibold flex items-center justify-center gap-2 text-sm"
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                Submit Condolences
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

// Request card component
const RequestCard = ({ request }) => {
  const [isHovered, setIsHovered] = useState(false)
  const navigate = useNavigate()

  return (
    <div
      className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-100 hover:border-[#1A2B49]/40 transition-all duration-300 cursor-pointer group relative overflow-hidden hover:shadow-lg"
      onClick={() => navigate(`/condolences/${request.N_Id}`, { state: { source: "requests" } })}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#1A2B49]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 group-hover:text-[#1A2B49] transition-colors line-clamp-2 flex-1">
            {request.N_Title}
          </h3>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-transform duration-300 whitespace-nowrap ${getStatusColor(request.N_Status)}`}
            style={{
              transform: isHovered ? "scale(1.05)" : "scale(1)",
            }}
          >
            {request.N_Status.charAt(0).toUpperCase() + request.N_Status.slice(1)}
          </span>
        </div>

        {/* Content */}
        <div className="space-y-3 mb-4">
          <p className="text-gray-600 text-sm line-clamp-3 italic leading-relaxed">
            {request.N_Description || "No description provided"}
          </p>
          
          {(request.N_MaleName || request.N_WomanName) && (
            <div className="flex items-center gap-2 text-gray-700">
              <User className="w-4 h-4 text-[#1A2B49]" />
              <span className="text-sm font-medium">
                {request.N_MaleName || request.N_WomanName}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{new Date(request.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 text-[#1A2B49] font-medium group-hover:gap-3 transition-all duration-300 text-sm">
            <Eye className="w-4 h-4" />
            <span>View Details</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </div>
        </div>
      </div>
    </div>
  )
}

const CondolencesRequest = () => {
  const [requests, setRequests] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    N_Title: "",
    N_Category: "Death",
    N_MaleName: "",
    N_WomanName: "",
    N_Date: "",
    N_Age: "",
    N_Years: "",
    N_Mobile: "",
    N_Email: "",
    N_Address: "",
    N_Description: "",
    N_Image: [],
  })
  const [gender, setGender] = useState("Male")
  const [previewImages, setPreviewImages] = useState([])
  const navigate = useNavigate()
  const searchRef = useRef(null)

  const userData = JSON.parse(localStorage.getItem("user") || "{}")
  const userId = userData.U_Id

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    if (!userId) {
      setError("User ID is missing. Please log in again.")
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const response = await fetch("https://parivaar.app/public/api/condolences", {
        headers: {
          "Content-Type": "application/json",
        },
      })
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("API endpoint not found (404). Please check the URL.")
        } else if (response.status === 500) {
          throw new Error("Server error (500). Please try again later.")
        } else {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
      }
      const result = await response.json()
      console.log("Requests API Response:", result)
      if (
        result.status &&
        result.message === "Celebrations fetched successfully" &&
        Array.isArray(result.data)
      ) {
        const userRequests = result.data.filter((request) => request.U_Id === userId.toString())
        console.log("User Requests:", userRequests)
        setRequests(userRequests)
      } else {
        throw new Error("Unexpected API response format")
      }
    } catch (err) {
      console.error("Error fetching requests:", err)
      setError(`Failed to fetch your requests: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    setFormData((prev) => ({ ...prev, N_Image: files }))
    const previews = files.map((file) => URL.createObjectURL(file))
    setPreviewImages(previews)
  }

  const resetForm = () => {
    setFormData({
      N_Title: "",
      N_Category: "Death",
      N_MaleName: "",
      N_WomanName: "",
      N_Date: "",
      N_Age: "",
      N_Years: "",
      N_Mobile: "",
      N_Email: "",
      N_Address: "",
      N_Description: "",
      N_Image: [],
    })
    setGender("Male")
    setPreviewImages([])
    setShowForm(false)
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    const formDataToSend = new FormData()
    Object.keys(formData).forEach((key) => {
      if (key === "N_Image") {
        formData[key].forEach((image) => {
          formDataToSend.append("N_Image[]", image)
        })
      } else {
        formDataToSend.append(key, formData[key])
      }
    })
    formDataToSend.append("U_Id", userId)
    try {
      const response = await fetch("https://parivaar.app/public/api/condolences", {
        method: "POST",
        body: formDataToSend,
      })
      const result = await response.json()
      if (result.status) {
        resetForm()
        fetchRequests()
        alert("Condolence submitted successfully!")
      } else {
        alert("Failed to submit condolence: " + result.message)
      }
    } catch (err) {
      console.error("Error submitting condolence:", err)
      alert("Failed to submit condolence")
    }
  }

  const filteredRequests = requests.filter(
    (request) =>
      request.N_Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.N_MaleName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.N_WomanName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.N_Description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <CustomLogoLoader />

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Main Container */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-6">
        {/* Breadcrumb Navigation */}
        <div className="pt-6 sm:pt-8">
          <nav
            className="flex items-center gap-3 text-sm font-medium bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-200"
            aria-label="breadcrumb"
          >
            <Link 
              to="/home" 
              className="text-[#1A2B49] font-bold hover:underline transition-colors duration-200"
            >
              Home
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link 
              to="/condolences" 
              className="text-[#1A2B49] font-bold hover:underline transition-colors duration-200"
            >
              Condolences
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-[#1A2B49] font-semibold">Your Requests</span>
          </nav>
        </div>

        {/* Main Content */}
        <div className="py-6 sm:py-8">
          {/* Error State */}
          {error && (
            <div className="max-w-2xl mx-auto mb-8">
              <div className="text-center py-8 sm:py-12 bg-white rounded-2xl shadow-xl border border-red-100">
                <div className="bg-red-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-red-500" />
                </div>
                <div className="text-red-600 text-xl font-semibold mb-2">{error}</div>
                <p className="text-gray-600 mb-6">Please check your network connection or try again later.</p>
                <button
                  onClick={fetchRequests}
                  className="px-6 py-3 bg-gradient-to-r from-[#1A2B49] to-[#2A3B59] text-white rounded-xl hover:from-[#14223e] hover:to-[#1A2B49] transition-all duration-300 font-semibold"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6 sm:gap-8">
              {/* Title and Search */}
              <div className="flex-1 max-w-4xl">
                <div className="mb-6">
                  <h2 className="text-3xl sm:text-4xl font-bold text-[#1A2B49] mb-3 flex items-center gap-3">
                    <Flower2 className="w-8 h-8 text-[#1A2B49]" />
                    Your Requests
                  </h2>
                  <p className="text-gray-600 font-medium">
                    {requests.length} {requests.length === 1 ? "request" : "requests"} found
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  {/* <Search className="absolute left-4 sm:left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 sm:w-6 sm:h-10" /> */}
                  <input
                    ref={searchRef}
                    type="text"
                    placeholder="Search requests by name, title, or description..."
                    className="w-full pl-12 sm:pl-16 pr-6 py-4 sm:py-5 rounded-2xl bg-white/95 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#1A2B49] focus:bg-white shadow-lg border border-gray-200 text-gray-800 placeholder-gray-500 font-medium transition-all duration-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  
                  {/* Search Dropdown */}
                  {searchTerm && (
                    <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 max-h-64 overflow-y-auto">
                      {filteredRequests.length > 0 ? (
                        filteredRequests.map((request) => (
                          <DropdownItem
                            key={request.N_Id}
                            request={request}
                            onClick={() => {
                              navigate(`/condolences/${request.N_Id}`, { state: { source: "requests" } });
                              setSearchTerm("");
                            }}
                          />
                        ))
                      ) : (
                        <div className="p-4">
                          <p className="text-gray-600 text-sm">No matching requests found.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="flex-shrink-0">
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <button
                    onClick={() => setShowForm(true)}
                    className="w-full px-6 py-4 bg-gradient-to-r from-[#1A2B49] to-[#2A3B59] text-white rounded-xl hover:from-[#14223e] hover:to-[#1A2B49] flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Create Condolences</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div>
            {requests.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                {requests.map((request) => (
                  <RequestCard key={request.N_Id} request={request} />
                ))}
              </div>
            ) : (
              <div className="max-w-2xl mx-auto">
                <div className="text-center py-16 sm:py-20 bg-white rounded-2xl shadow-xl border border-gray-100">
                  <div className="bg-gradient-to-br from-[#1A2B49]/10 to-[#2A3B59]/10 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                    <Flower2 className="w-12 h-12 text-[#1A2B49]" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">No requests found</h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    You haven't submitted any Condolences requests yet.
                  </p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="px-6 py-3 bg-gradient-to-r from-[#1A2B49] to-[#2A3B59] text-white rounded-xl hover:from-[#14223e] hover:to-[#1A2B49] transition-all duration-300 font-semibold"
                  >
                    Create Condolences
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <CondolenceForm
          formData={formData}
          setFormData={setFormData}
          handleInputChange={handleInputChange}
          handleImageChange={handleImageChange}
          handleFormSubmit={handleFormSubmit}
          setShowForm={setShowForm}
          gender={gender}
          setGender={setGender}
          previewImages={previewImages}
          resetForm={resetForm}
        />
      )}

      {/* Styles */}
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
        
        .container {
          max-width: 1440px;
        }
        
        @media (max-width: 1024px) {
          .xl\\:grid-cols-4 {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
        
        @media (max-width: 768px) {
          .lg\\:grid-cols-3 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        
        @media (max-width: 640px) {
          .sm\\:grid-cols-2 {
            grid-template-columns: repeat(1, minmax(0, 1fr));
          }
        }
      `}</style>
    </div>
  )
}

export default CondolencesRequest