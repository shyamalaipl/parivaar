import React, { useState, useEffect } from "react";
import { Search, Plus, X, Edit, Trash2 } from "lucide-react";
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

const Pricetype = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [priceTypes, setPriceTypes] = useState([]);
  const [formData, setFormData] = useState({ Pri_Type: "" });
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Added loading state

  // Fetch price types from API
  useEffect(() => {
    const fetchPriceTypes = async () => {
      setIsLoading(true); // Show loader
      try {
        const response = await fetch(
          "https://parivaar.app/public/api/price-types"
        );
        if (!response.ok)
          throw new Error(`Failed to fetch price types: ${response.status}`);
        const data = await response.json();
        console.log("API GET Response:", data); // Debug log
        if (Array.isArray(data)) {
          setPriceTypes(data);
        } else {
          throw new Error("Invalid API response: Expected an array");
        }
      } catch (error) {
        console.error("Error fetching price types:", error);
        setError("Failed to load price types. Please try again later.");
      } finally {
        setIsLoading(false); // Hide loader
      }
    };
    fetchPriceTypes();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.Pri_Type.trim() == "") {
      alert("Price type cannot be empty");
      return;
    }

    setIsLoading(true); // Show loader
    try {
      let result;
      if (isEditMode) {
        // Update existing price type (PUT)
        const response = await fetch(
          `https://parivaar.app/public/api/price-types/${currentId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Pri_Type: formData.Pri_Type }),
          }
        );
        if (!response.ok)
          throw new Error(`Failed to update price type: ${response.status}`);
        result = await response.json();
        console.log("PUT Response:", result); // Debug log

        if (!result.PT_Id) {
          throw new Error("Invalid response from server");
        }

        // Update local state
        setPriceTypes(
          priceTypes.map((item) => (item.PT_Id == currentId ? result : item))
        );
        alert("Price type updated successfully!");
      } else {
        // Add new price type (POST)
        const response = await fetch(
          "https://parivaar.app/public/api/price-types",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Pri_Type: formData.Pri_Type }),
          }
        );
        if (!response.ok)
          throw new Error(`Failed to create price type: ${response.status}`);
        result = await response.json();
        console.log("POST Response:", result); // Debug log

        if (!result.PT_Id) {
          throw new Error("Invalid response from server");
        }

        // Add to local state
        setPriceTypes([...priceTypes, result]);
        alert("Price type added successfully!");
      }

      // Reset form and close modal
      setFormData({ Pri_Type: "" });
      setIsModalOpen(false);
      setIsEditMode(false);
      setCurrentId(null);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      alert(
        `Failed to ${isEditMode ? "update" : "add"} price type: ${
          error.message || "Unknown error"
        }`
      );
      setError(
        `Failed to ${isEditMode ? "update" : "add"} price type: ${
          error.message || "Unknown error"
        }`
      );
    } finally {
      setIsLoading(false); // Hide loader
    }
  };

  const handleEdit = (id) => {
    const priceTypeToEdit = priceTypes.find((item) => item.PT_Id == id);
    if (priceTypeToEdit) {
      setFormData({ Pri_Type: priceTypeToEdit.Pri_Type });
      setIsEditMode(true);
      setCurrentId(id);
      setIsModalOpen(true);
    }
  };

  const handleDelete = async (id) => {
    setIsLoading(true); // Show loader
    try {
      const response = await fetch(
        `https://parivaar.app/public/api/price-types/${id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!response.ok)
        throw new Error(`Failed to delete price type: ${response.status}`);
      console.log("DELETE Response:", await response.json()); // Debug log

      // Remove from local state
      setPriceTypes(priceTypes.filter((item) => item.PT_Id !== id));
      alert("Price type deleted successfully!");
    } catch (error) {
      console.error("Error deleting price type:", error);
      alert(`Failed to delete price type: ${error.message || "Unknown error"}`);
      setError(
        `Failed to delete price type: ${error.message || "Unknown error"}`
      );
    } finally {
      setIsLoading(false); // Hide loader
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
      {isLoading && <CustomLogoLoader />}{" "}
      {/* Render loader when isLoading is true */}
      <div className="min-h-screen bg-white text-[#172030] p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#172030] to-[#364154] bg-clip-text text-transparent">
            Price Type Master
          </h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#172030] hover:bg-[#2a3547] text-white px-6 py-3 rounded-xl flex items-center gap-2"
          >
            <Plus size={20} />
            Add Price Type
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
                  Price Type
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase">
                  Created At
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {priceTypes.map((item) => (
                <tr key={item.PT_Id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {item.PT_Id || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {item.Pri_Type || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {item.created_at
                      ? new Date(item.created_at).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleEdit(item.PT_Id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.PT_Id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
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
                  {isEditMode ? "Edit Price Type" : "Add Price Type"}
                </h3>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsEditMode(false);
                    setFormData({ Pri_Type: "" });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Price Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price Type
                  </label>
                  <input
                    type="text"
                    name="Pri_Type"
                    value={formData.Pri_Type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#172030]"
                    placeholder="Enter price type (e.g., Subscription, Fixed)"
                    required
                  />
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setIsEditMode(false);
                      setFormData({ Pri_Type: "" });
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

export default Pricetype;
