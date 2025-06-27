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

const Durationtype = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [durationTypes, setDurationTypes] = useState([]);
  const [formData, setFormData] = useState({ Dur_Type: "" });
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Added loading state

  // Fetch duration types from API
  useEffect(() => {
    const fetchDurationTypes = async () => {
      setIsLoading(true); // Show loader
      try {
        const response = await fetch(
          "https://parivaar.app/public/api/duration-types"
        );
        if (!response.ok)
          throw new Error(`Failed to fetch duration types: ${response.status}`);
        const data = await response.json();
        console.log("API GET Response:", data); // Debug log
        if (Array.isArray(data)) {
          setDurationTypes(data);
        } else {
          throw new Error("Invalid API response: Expected an array");
        }
      } catch (error) {
        console.error("Error fetching duration types:", error);
        setError("Failed to load duration types. Please try again later.");
      } finally {
        setIsLoading(false); // Hide loader
      }
    };
    fetchDurationTypes();
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
    if (formData.Dur_Type.trim() == "") {
      alert("Duration type cannot be empty");
      return;
    }

    setIsLoading(true); // Show loader
    try {
      let result;
      if (isEditMode) {
        // Update existing duration type (PUT)
        const response = await fetch(
          `https://parivaar.app/public/api/duration-types/${currentId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Dur_Type: formData.Dur_Type }),
          }
        );
        if (!response.ok)
          throw new Error(`Failed to update duration type: ${response.status}`);
        result = await response.json();
        console.log("PUT Response:", result); // Debug log

        if (!result.DT_Id) {
          throw new Error("Invalid response from server");
        }

        // Update local state
        setDurationTypes(
          durationTypes.map((item) => (item.DT_Id == currentId ? result : item))
        );
        alert("Duration type updated successfully!");
      } else {
        // Add new duration type (POST)
        const response = await fetch(
          "https://parivaar.app/public/api/duration-types",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Dur_Type: formData.Dur_Type }),
          }
        );
        if (!response.ok)
          throw new Error(`Failed to create duration type: ${response.status}`);
        result = await response.json();
        console.log("POST Response:", result); // Debug log

        if (!result.DT_Id) {
          throw new Error("Invalid response from server");
        }

        // Add to local state
        setDurationTypes([...durationTypes, result]);
        alert("Duration type added successfully!");
      }

      // Reset form and close modal
      setFormData({ Dur_Type: "" });
      setIsModalOpen(false);
      setIsEditMode(false);
      setCurrentId(null);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      alert(
        `Failed to ${isEditMode ? "update" : "add"} duration type: ${
          error.message || "Unknown error"
        }`
      );
      setError(
        `Failed to ${isEditMode ? "update" : "add"} duration type: ${
          error.message || "Unknown error"
        }`
      );
    } finally {
      setIsLoading(false); // Hide loader
    }
  };

  const handleEdit = (id) => {
    const durationTypeToEdit = durationTypes.find((item) => item.DT_Id == id);
    if (durationTypeToEdit) {
      setFormData({ Dur_Type: durationTypeToEdit.Dur_Type });
      setIsEditMode(true);
      setCurrentId(id);
      setIsModalOpen(true);
    }
  };

  const handleDelete = async (id) => {
    setIsLoading(true); // Show loader
    try {
      const response = await fetch(
        `https://parivaar.app/public/api/duration-types/${id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!response.ok)
        throw new Error(`Failed to delete duration type: ${response.status}`);
      console.log("DELETE Response:", await response.json()); // Debug log

      // Remove from local state
      setDurationTypes(durationTypes.filter((item) => item.DT_Id !== id));
      alert("Duration type deleted successfully!");
    } catch (error) {
      console.error("Error deleting duration type:", error);
      alert(
        `Failed to delete duration type: ${error.message || "Unknown error"}`
      );
      setError(
        `Failed to delete duration type: ${error.message || "Unknown error"}`
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
            Duration Type Master
          </h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#172030] hover:bg-[#2a3547] text-white px-6 py-3 rounded-xl flex items-center gap-2"
          >
            <Plus size={20} />
            Add Duration Type
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
                  Duration Type
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
              {durationTypes.map((item) => (
                <tr key={item.DT_Id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {item.DT_Id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {item.Dur_Type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {item.created_at
                      ? new Date(item.created_at).toLocaleString()
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleEdit(item.DT_Id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.DT_Id)}
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
                  {isEditMode ? "Edit Duration Type" : "Add Duration Type"}
                </h3>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsEditMode(false);
                    setFormData({ Dur_Type: "" });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Duration Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration Type
                  </label>
                  <input
                    type="text"
                    name="Dur_Type"
                    value={formData.Dur_Type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#172030]"
                    placeholder="Enter duration type (e.g., Day, Month, Year)"
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
                      setFormData({ Dur_Type: "" });
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

export default Durationtype;
