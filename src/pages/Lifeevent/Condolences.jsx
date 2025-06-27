import { useState, useEffect, useRef } from "react";
import {
  Search,
  CircleChevronLeft,
  Flower2,
  User,
  CalendarDays,
  ChevronRight,
  X,
  Heart,
  Eye,
  Plus,
  Send,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import logoImage from "../../img/parivarlogo1.png";

// Constants and Utility Functions
const STATUS_COLORS = {
  approved: "bg-green-100 text-green-800 border-green-200",
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  default: "bg-gray-100 text-gray-800 border-gray-200",
};

const getStatusColor = (status) => STATUS_COLORS[status] || STATUS_COLORS.default;

const FORM_FIELDS = [
  { label: "Title", name: "N_Title", type: "text", placeholder: "Enter Condolences title", required: true },
  { label: "Date", name: "N_Date", type: "date", placeholder: "", required: true },
  { label: "Age", name: "N_Age", type: "number", placeholder: "Enter age" },
  { label: "Years", name: "N_Years", type: "number", placeholder: "Enter years" },
  { label: "Mobile", name: "N_Mobile", type: "tel", placeholder: "Enter mobile number" },
  { label: "Email", name: "N_Email", type: "email", placeholder: "Enter email" },
  { label: "Address", name: "N_Address", type: "text", placeholder: "Enter address" },
];

const CATEGORY_OPTIONS = [
  "Death Anniversary",
  "Death",
  "Other"
];

// Components
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

const DropdownItem = ({ condolence, onClick }) => (
  <div
    className="flex items-center gap-3 p-3 border-b border-gray-200 hover:bg-gray-100 cursor-pointer"
    onClick={onClick}
  >
    <Heart className="w-4 h-4 text-red-500" />
    <div>
      <p className="text-sm font-semibold">{condolence.N_Title}</p>
      <p className="text-xs text-gray-600">
        {condolence.N_MaleName || condolence.N_WomanName || "Not provided"}
      </p>
    </div>
  </div>
);

const CondolenceCard = ({ condolence }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  return (
    <div
      className={`relative bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 cursor-pointer border border-gray-100 ${
        isHovered ? "transform -translate-y-1 shadow-lg" : ""
      }`}
      onClick={() => navigate(`/condolences/${condolence.N_Id}`, { state: { source: "condolences" } })}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-64 overflow-hidden">
        <img
          src={condolence.N_Image?.[0] || "https://images.pexels.com/photos/262271/pexels-photo-262271.jpeg"}
          alt={condolence.N_Title}
          className={`w-full h-full object-cover transition-all duration-300 ${
            isHovered ? "scale-105 brightness-110" : ""
          }`}
          onError={(e) => {
            e.target.src = "https://images.pexels.com/photos/262271/pexels-photo-262271.jpeg";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className={`absolute top-4 right-4 bg-white/90 rounded-full p-2 transition-all duration-300 ${
          isHovered ? "scale-110 opacity-100" : "opacity-80"
        }`}>
          <Heart className="w-4 h-4 text-red-500" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h2 className="text-xl font-bold mb-2 truncate">{condolence.N_Title}</h2>
          <p className="text-sm text-gray-200 flex items-center gap-2">
            <User className="w-3 h-3" />
            {condolence.N_MaleName || condolence.N_WomanName || "Not provided"}
          </p>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center text-gray-600 mb-3">
          <CalendarDays className="w-4 h-4 mr-2 text-[#1A2B49]" />
          <span className="text-sm font-medium">
            {condolence.N_Date
              ? new Date(condolence.N_Date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "Not provided"}
          </span>
        </div>
        <p className="text-gray-700 line-clamp-2 italic mb-4 text-sm">
          {condolence.N_Description || "No description provided"}
        </p>
        <div className={`flex items-center justify-between transition-transform duration-300 ${
          isHovered ? "translate-x-1" : ""
        }`}>
          <button className="text-[#1A2B49] font-semibold hover:text-[#14223e] flex items-center text-sm">
            View Condolences
            <CircleChevronLeft className="w-4 h-4 ml-2 transform rotate-180" />
          </button>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Eye className="w-3 h-3" />
            <span>Details</span>
          </div>
        </div>
      </div>
    </div>
  );
};

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
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-xl z-50 overflow-y-auto">
      <div className="sticky top-0 p-6 border-b border-gray-100 bg-[#1A2B49] text-white z-10 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create Condolences
          </h2>
          <p className="text-sm opacity-90 mt-1">Fill in the details to honor a loved one</p>
        </div>
        <button
          onClick={() => setShowForm(false)}
          className="hover:bg-white/20 p-2 rounded-full"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      
      <form onSubmit={handleFormSubmit} className="flex flex-col h-full">
        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
          {FORM_FIELDS.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name]}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2B49]"
                placeholder={field.placeholder}
                required={field.required}
              />
            </div>
          ))}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              name="N_Category"
              value={formData.N_Category}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2B49]"
              required
            >
              {CATEGORY_OPTIONS.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2B49]"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {gender === "Male" ? "Male Name" : "Female Name"}
            </label>
            <input
              type="text"
              name={gender === "Male" ? "N_MaleName" : "N_WomanName"}
              value={gender === "Male" ? formData.N_MaleName : formData.N_WomanName}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2B49]"
              placeholder={`Enter ${gender.toLowerCase()} name`}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="N_Description"
              value={formData.N_Description}
              onChange={handleInputChange}
              rows="4"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2B49]"
              placeholder="Enter description"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
            <input
              type="file"
              name="N_Image"
              onChange={handleImageChange}
              multiple
              accept="image/*"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2B49]"
            />
            {previewImages.length > 0 && (
              <div className="mt-4 grid grid-cols-4 gap-2">
                {previewImages.map((preview, index) => (
                  <img
                    key={index}
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-20 object-cover rounded-lg border border-gray-200"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="sticky bottom-0 p-6 border-t border-gray-100 bg-white">
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-[#1A2B49] text-white rounded-lg hover:bg-[#14223e] font-semibold flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              Submit Condolences
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

// Main Component
const Condolences = () => {
  const [condolences, setCondolences] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [requests, setRequests] = useState([]);
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
  });
  const [gender, setGender] = useState("Male");
  const [previewImages, setPreviewImages] = useState([]);
  const navigate = useNavigate();
  const searchRef = useRef(null);

  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userCommId = userData.Comm_Id;
  const userId = userData.U_Id;

  // Data Fetching
  const fetchData = async (url, errorMessage) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const result = await response.json();
      return result;
    } catch (err) {
      console.error(errorMessage, err);
      throw err;
    }
  };

  const fetchCondolences = async () => {
    if (!userCommId) {
      setError("User community ID is missing. Please log in again.");
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const result = await fetchData(
        "https://parivaar.app/public/api/condolences",
        "Error fetching condolences:"
      );
      
      if (result.status && result.message === "Celebrations fetched successfully" && Array.isArray(result.data)) {
        const filteredCondolences = result.data.filter(
          (condolence) => condolence.user?.Comm_Id === userCommId && condolence.N_Status === "approved"
        );
        setCondolences(filteredCondolences);
      } else {
        throw new Error("Unexpected API response format");
      }
    } catch (err) {
      setError(`Failed to fetch Condolences: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    if (!userId) {
      setError("User ID is missing. Please log in again.");
      return;
    }
    
    try {
      const result = await fetchData(
        "https://parivaar.app/public/api/condolences",
        "Error fetching requests:"
      );
      
      if (result.status && result.message === "Celebrations fetched successfully" && Array.isArray(result.data)) {
        const userRequests = result.data.filter((request) => request.U_Id === userId.toString());
        setRequests(userRequests);
      } else {
        throw new Error("Unexpected API response format");
      }
    } catch (err) {
      setError(`Failed to fetch your requests: ${err.message}`);
    }
  };

  useEffect(() => {
    fetchCondolences();
    fetchRequests();
  }, []);

  // Form Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({ ...prev, N_Image: files }));
    setPreviewImages(files.map((file) => URL.createObjectURL(file)));
  };

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
    });
    setGender("Male");
    setPreviewImages([]);
    setShowForm(false);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    
    Object.keys(formData).forEach((key) => {
      if (key === "N_Image") {
        formData[key].forEach((image) => {
          formDataToSend.append("N_Image[]", image);
        });
      } else {
        formDataToSend.append(key, formData[key]);
      }
    });
    
    formDataToSend.append("U_Id", userId);
    
    try {
      const response = await fetch("https://parivaar.app/public/api/condolences", {
        method: "POST",
        body: formDataToSend,
      });
      const result = await response.json();
      
      if (result.status) {
        resetForm();
        fetchRequests();
        fetchCondolences();
        alert("Condolence submitted successfully!");
      } else {
        alert("Failed to submit condolence: " + result.message);
      }
    } catch (err) {
      console.error("Error submitting condolence:", err);
      alert("Failed to submit condolence");
    }
  };

  // Filtering and Rendering
  const filteredCondolences = condolences.filter(
    (condolence) =>
      condolence.N_Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      condolence.N_MaleName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      condolence.N_WomanName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      condolence.N_Description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <CustomLogoLoader />;

  return (
    <div className="min-h-screen bg-gray-50">
      {showForm && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setShowForm(false)}
        />
      )}
      
      <div className="container mx-auto px-4 py-8">
        <nav className="flex items-center gap-3 text-sm font-medium bg-white rounded-lg px-4 py-3 shadow-sm mb-8">
          <Link to="/home" className="text-[#1A2B49] font-bold hover:underline">
            Home
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-[#1A2B49] font-semibold">Condolences</span>
        </nav>
        
        {error ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-md border border-red-100 mb-8">
            <div className="bg-red-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-500" />
            </div>
            <div className="text-red-500 text-lg font-semibold mb-2">{error}</div>
            <p className="text-gray-600 mb-6">
              Please check your network connection or try again later.
            </p>
            <button
              onClick={() => {
                fetchCondolences();
                fetchRequests();
              }}
              className="px-6 py-3 bg-[#1A2B49] text-white rounded-lg hover:bg-[#14223e] font-semibold"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-[#1A2B49] flex items-center gap-3">
                  <Heart className="w-8 h-8 text-red-500" />
                  Community Condolences
                </h2>
                <p className="text-gray-600 font-medium pl-11">
                  {condolences.length} {condolences.length === 1 ? "Condolence" : "Condolences"} found
                </p>
                
                <div className="relative max-w-2xl">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search Condolences..."
                    className="w-full pl-12 pr-6 py-4 rounded-xl bg-white focus:outline-none shadow-md"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 max-h-64 overflow-y-auto">
                      {filteredCondolences.length > 0 ? (
                        filteredCondolences.map((condolence) => (
                          <DropdownItem
                            key={condolence.N_Id}
                            condolence={condolence}
                            onClick={() => navigate(`/condolences/${condolence.N_Id}`, { state: { source: "condolences" } })}
                          />
                        ))
                      ) : (
                        <div className="p-4">
                          <p className="text-gray-600 text-sm">No matching condolences found.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => setShowForm(true)}
                    className="flex-1 p-2 bg-[#1A2B49] text-white flex items-center justify-center gap-2 shadow-md"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Create Condolences</span>
                  </button>
                  <button
                    onClick={() => navigate("/condolences/requests")}
                    className="flex-1 p-2 bg-[#1A2B49] text-white flex items-center justify-center shadow-md"
                  >
                    <span>Your Requests</span>
                  </button>
                </div>
              </div>
            </div>
            
            {condolences.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {condolences.map((condolence) => (
                  <CondolenceCard key={condolence.N_Id} condolence={condolence} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl shadow-md border border-gray-100">
                <div className="bg-[#1A2B49]/10 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <Flower2 className="w-12 h-12 text-[#1A2B49]" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">No Condolences found</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  No Condolences are available. Be the first to create a Condolence.
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="px-6 py-3 bg-[#1A2B49] text-white rounded-lg hover:bg-[#14223e] font-semibold"
                >
                  Create First Condolence
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
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
    </div>
  );
};

export default Condolences;