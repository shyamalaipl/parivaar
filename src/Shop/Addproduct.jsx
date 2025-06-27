import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import logoImage from "../../src/img/parivarlogo1.png"; // Adjust path if needed

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
        top: "0px",
        left: 0,
        right: "5px",
        bottom: 0,
        background: "transparent",
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

const Addproduct = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    M_Category: "Electronics",
    M_Title: "",
    M_Description: "",
    M_Name: "",
    M_Mobile: "",
    M_Address: "",
    M_Images: [],
    M_Price: "",
    M_Status: "Active",
    Comm_Id: "",
    U_Id: "",
  });
  const [loading, setLoading] = useState(false);

  const categories = [
    "Electronics",
    "Furniture",
    "Clothes",
    "Footwear",
    "Books",
    "Vehicles",
    "Real Estate",
    "Toys",
    "Sports",
    "Fitness",
    "Handicrafts",
    "Others",
  ];

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser || !storedUser.U_Id) {
      Swal.fire({
        icon: "error",
        title: "Not Logged In",
        text: "Please log in to add a product.",
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/login");
      });
      return;
    }

    console.log("Stored User:", storedUser);
    console.log("U_Id being set:", storedUser.U_Id);
    console.log("Comm_Id being set:", storedUser.Comm_Id);

    setFormData((prevState) => ({
      ...prevState,
      M_Name: storedUser.U_Name,
      M_Mobile: storedUser.U_Mobile,
      U_Id: storedUser.U_Id,
      Comm_Id: storedUser.Comm_Id,
    }));
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    // Check each file size
    const oversizedFiles = files.filter((file) => file.size > 2 * 1024 * 1024); // 2MB in bytes

    if (oversizedFiles.length > 0) {
      Swal.fire({
        icon: "error",
        title: "File too large",
        text: "One or more images exceed 2MB limit. Please upload smaller files.",
        confirmButtonText: "OK",
      });
      e.target.value = "";
      return;
    }

    if (files.length > 0) {
      setFormData({ ...formData, M_Images: files });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.U_Id) {
      setLoading(false);
      Swal.fire({
        icon: "error",
        title: "Invalid User ID",
        text: "User ID is missing. Please log in again.",
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/login");
      });
      return;
    }

    if (formData.M_Images.length == 0) {
      setLoading(false);
      Swal.fire({
        icon: "error",
        title: "No Images Selected",
        text: "Please select at least one product image.",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("M_Category", formData.M_Category);
      formDataToSend.append("M_Title", formData.M_Title);
      formDataToSend.append("M_Description", formData.M_Description);
      formDataToSend.append("M_Name", formData.M_Name);
      formDataToSend.append("M_Mobile", formData.M_Mobile);
      formDataToSend.append("M_Address", formData.M_Address);

      // Append images with correct field name
      formData.M_Images.forEach((image, index) => {
        formDataToSend.append(`M_Image[]`, image); // Changed to M_Image[]
      });

      formDataToSend.append("M_Price", formData.M_Price);
      formDataToSend.append("M_Status", formData.M_Status);
      formDataToSend.append("Comm_Id", String(formData.Comm_Id));
      formDataToSend.append("U_Id", String(formData.U_Id));

      // Log FormData entries for debugging
      console.log("FormData being sent:");
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}: ${value}`);
      }

      // Include Authorization header if required
      const token = localStorage.getItem("token"); // Adjust based on your auth system
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await fetch(
        "https://parivaar.app/public/api/marketplaces",
        {
          method: "POST",
          headers: headers,
          body: formDataToSend,
        }
      );

      const result = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Product Added!",
          text: "Your product has been successfully listed.",
          confirmButtonText: "OK",
        });
        setFormData({
          M_Category: "Electronics",
          M_Title: "",
          M_Description: "",
          M_Name: formData.M_Name,
          M_Mobile: formData.M_Mobile,
          M_Address: "",
          M_Images: [],
          M_Price: "",
          M_Status: "Active",
          Comm_Id: formData.Comm_Id,
          U_Id: formData.U_Id,
        });
        document.getElementById("M_Images").value = ""; // Clear file input
      } else {
        const errorMessage =
          result.errors?.M_Image?.[0] ||
          result.errors?.U_Id?.[0] ||
          result.message ||
          "Unknown error occurred";
        console.error("API Error Response:", result);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: `Failed to add product: ${errorMessage}`,
          confirmButtonText: "Try Again",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong. Please try again later.",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      {loading && <CustomLogoLoader />}
      <div className="max-w-7xl mx-auto">
        <nav className="flex items-center gap-3 mb-10 text-sm font-medium bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-200" aria-label="breadcrumb">
          <Link
            to="/home"
            className="text-[#1A2B49] font-medium hover:text-blue-800"
          >
            Home
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link
            to="/shop"
            className="text-[#1A2B49] font-medium hover:text-blue-800"
          >
            Marketplace
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-500">Add Product</span>
        </nav>

        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-[#1A2B49] py-4 px-6">
            <h2 className="text-2xl font-bold text-white">Add Your Product</h2>
            <p className="text-blue-100">
              Fill in the details to list your product
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-6 space-y-6"
            encType="multipart/form-data"
          >
            <div>
              <label
                htmlFor="M_Title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="M_Title"
                name="M_Title"
                value={formData.M_Title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>

            <div>
              <label
                htmlFor="M_Description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="M_Description"
                name="M_Description"
                rows={4}
                value={formData.M_Description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="M_Price"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="M_Price"
                  name="M_Price"
                  value={formData.M_Price}
                  onChange={handleChange}
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="M_Category"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="M_Category"
                  name="M_Category"
                  value={formData.M_Category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="M_Address"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="M_Address"
                name="M_Address"
                value={formData.M_Address}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>

            <div>
              <label
                htmlFor="M_Images"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Product Images <span className="text-red-500">*</span>
              </label>
              <input
                id="M_Images"
                type="file"
                name="M_Images"
                onChange={handleImageUpload}
                className="w-full px-4 py-2"
                accept="image/jpeg,image/png,image/jpg,image/gif"
                multiple
                required
              />
              {formData.M_Images.length > 0 && (
                <p className="mt-2 text-sm text-gray-500">
                  {formData.M_Images.length} image(s) selected
                </p>
              )}
            </div>

            <div>
              <button
                type="submit"
                className="w-full bg-[#1A2B49] text-white py-3 px-4 rounded-lg"
              >
                List My Product
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Addproduct;
