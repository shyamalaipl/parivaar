import React, { useState, useEffect } from "react";
import { Search, Plus, X, Edit } from "lucide-react";
import axios from "axios";
import logoImage from "../../src/img/parivarlogo1.png"; // Adjust path

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
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <img
        className="ml-50"
        src={logoImage}
        alt="Rotating Logo"
        style={{
          width: "70px",
          height: "70px",
          animation: "spin 1s linear infinite",
          filter: "drop-shadow(0 0 5px rgba(0, 0, 0, 0.3))",
        }}
      />
    </div>
  );
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-red-600">
          <h2>Something went wrong!</h2>
          <p>{this.state.error?.message || "Unknown error occurred"}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-[#172030] text-white rounded-lg"
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const Discountmaster = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // Track edit mode
  const [currentDiscountId, setCurrentDiscountId] = useState(null); // Track discount being edited
  const [formData, setFormData] = useState({
    D_Name: "",
    St_Date: "",
    En_Date: "",
    DT_Id: "",
    DVT_Id: "",
    Dic_Value: "",
  });
  const [discounts, setDiscounts] = useState([]);
  const [discountTypes, setDiscountTypes] = useState([]);
  const [valueTypes, setValueTypes] = useState([]);
  const [error, setError] = useState(null);

  // Fetch discounts from API
  useEffect(() => {
    const fetchDiscounts = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          "https://parivaar.app/public/api/discount-masters"
        );
        console.log("API GET Response:", response.data);
        if (Array.isArray(response.data)) {
          setDiscounts(response.data);
          const uniqueDiscountTypes = [
            ...new Set(
              response.data
                .map((item) => item.discount_type?.Type_Name)
                .filter(Boolean)
            ),
          ];
          const uniqueValueTypes = [
            ...new Set(
              response.data
                .map((item) => item.discount_value_type?.VT_Name)
                .filter(Boolean)
            ),
          ];
          setDiscountTypes(uniqueDiscountTypes);
          setValueTypes(uniqueValueTypes);
        } else {
          throw new Error("Invalid API response: Expected an array");
        }
      } catch (error) {
        console.error("Error fetching discounts:", error);
        setError("Failed to load discounts. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDiscounts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle Edit Button Click
  const handleEdit = (discount) => {
    setFormData({
      D_Name: discount.D_Name || "",
      St_Date: discount.St_Date
        ? new Date(discount.St_Date).toISOString().split("T")[0]
        : "",
      En_Date: discount.En_Date
        ? new Date(discount.En_Date).toISOString().split("T")[0]
        : "",
      DT_Id: discount.DT_Id || "",
      DVT_Id: discount.DVT_Id || "",
      Dic_Value: discount.Dic_Value || "",
    });
    setIsEditMode(true);
    setCurrentDiscountId(discount.D_Id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = {
        D_Name: formData.D_Name,
        St_Date: formData.St_Date,
        En_Date: formData.En_Date,
        DT_Id: parseInt(formData.DT_Id) || 1,
        DVT_Id: parseInt(formData.DVT_Id) || 1,
        Dic_Value: formData.Dic_Value,
      };
      console.log("Submitting payload:", payload);

      let response;
      if (isEditMode) {
        // Update existing discount (PUT)
        response = await axios.put(
          `https://parivaar.app/public/api/discount-masters/${currentDiscountId}`,
          payload
        );
        console.log("PUT Response:", response.data);

        if (!response.data?.data || !response.data.data.D_Id) {
          throw new Error("Invalid response from server");
        }

        // Update local state
        setDiscounts((prev) =>
          prev.map((discount) =>
            discount.D_Id == currentDiscountId
              ? {
                  ...response.data.data,
                  discount_type: {
                    Type_Name:
                      discountTypes[parseInt(formData.DT_Id) - 1] || "Quantity",
                  },
                  discount_value_type: {
                    VT_Name:
                      valueTypes[parseInt(formData.DVT_Id) - 1] ||
                      "Flat Discount",
                  },
                }
              : discount
          )
        );
        alert("Discount package updated successfully!");
      } else {
        // Create new discount (POST)
        response = await axios.post(
          "https://parivaar.app/public/api/discount-masters",
          payload
        );
        console.log("POST Response:", response.data);

        if (!response.data?.data || !response.data.data.D_Id) {
          throw new Error("Invalid response from server");
        }

        const newDiscount = {
          ...response.data.data,
          discount_type: {
            Type_Name:
              discountTypes[parseInt(formData.DT_Id) - 1] || "Quantity",
          },
          discount_value_type: {
            VT_Name:
              valueTypes[parseInt(formData.DVT_Id) - 1] || "Flat Discount",
          },
        };

        setDiscounts((prev) => [...prev, newDiscount]);
        alert("Discount package added successfully!");
      }

      // Close modal and reset form
      setIsModalOpen(false);
      setIsEditMode(false);
      setCurrentDiscountId(null);
      setFormData({
        D_Name: "",
        St_Date: "",
        En_Date: "",
        DT_Id: "",
        DVT_Id: "",
        Dic_Value: "",
      });
    } catch (error) {
      console.error(
        `Error ${isEditMode ? "updating" : "posting"} discount:`,
        error
      );
      alert(
        `Failed to ${isEditMode ? "update" : "add"} discount package: ${
          error.message || "Unknown error"
        }`
      );
      setError(
        `Failed to ${isEditMode ? "update" : "add"} discount: ${
          error.message || "Unknown error"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="p-8 text-red-600">
        <h2>Error</h2>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-[#172030] text-white rounded-lg"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      {isLoading && <CustomLogoLoader />}
      <div className="min-h-screen bg-[white] text-[#172030] p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#172030] to-[#364154] bg-clip-text text-transparent">
            Discount Master
          </h1>
          <button
            onClick={() => {
              setIsEditMode(false);
              setFormData({
                D_Name: "",
                St_Date: "",
                En_Date: "",
                DT_Id: "",
                DVT_Id: "",
                Dic_Value: "",
              });
              setIsModalOpen(true);
            }}
            className="bg-[#172030] hover:bg-[#2a3547] text-white px-6 py-3 rounded-xl flex items-center gap-2"
          >
            <Plus size={20} />
            Create Discount
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <table className="w-full">
            <thead className="bg-[#172030]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase">
                  Value
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase">
                  Start Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase">
                  End Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {discounts.map((discount) => (
                <tr key={discount.D_Id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {discount.D_Id || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {discount.D_Name || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {discount.discount_type?.Type_Name || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {discount.discount_value_type?.VT_Name == "Flat Discount"
                      ? `₹${discount.Dic_Value || 0}`
                      : `${discount.Dic_Value || 0}%`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {discount.St_Date
                      ? new Date(discount.St_Date).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {discount.En_Date
                      ? new Date(discount.En_Date).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleEdit(discount)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit Discount"
                    >
                      <Edit size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-[#172030]">
                  {isEditMode ? "Edit Discount" : "Create Discount"}
                </h3>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsEditMode(false);
                    setCurrentDiscountId(null);
                    setFormData({
                      D_Name: "",
                      St_Date: "",
                      En_Date: "",
                      DT_Id: "",
                      DVT_Id: "",
                      Dic_Value: "",
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Discount Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Name
                  </label>
                  <input
                    type="text"
                    name="D_Name"
                    value={formData.D_Name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#172030]"
                    required
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="St_Date"
                    value={formData.St_Date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#172030]"
                    required
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="En_Date"
                    value={formData.En_Date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#172030]"
                    required
                  />
                </div>

                {/* Discount Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Type
                  </label>
                  <select
                    name="DT_Id"
                    value={formData.DT_Id}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#172030]"
                    required
                  >
                    <option value="">Select Discount Type</option>
                    {discountTypes.map((type, index) => (
                      <option key={index} value={index + 1}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Discount Value */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Value
                  </label>
                  <input
                    type="number"
                    name="Dic_Value"
                    value={formData.Dic_Value}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#172030]"
                    required
                  />
                </div>

                {/* Value Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Value Type
                  </label>
                  <select
                    name="DVT_Id"
                    value={formData.DVT_Id}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#172030]"
                    required
                  >
                    <option value="">Select Value Type</option>
                    {valueTypes.map((type, index) => (
                      <option key={index} value={index + 1}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setIsEditMode(false);
                      setCurrentDiscountId(null);
                      setFormData({
                        D_Name: "",
                        St_Date: "",
                        En_Date: "",
                        DT_Id: "",
                        DVT_Id: "",
                        Dic_Value: "",
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#172030] text-white rounded-lg text-sm font-medium"
                  >
                    {isEditMode ? "Update" : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default Discountmaster;
