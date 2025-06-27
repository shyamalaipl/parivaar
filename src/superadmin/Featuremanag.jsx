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

const Featuremaster = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [features, setFeatures] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch features
  const fetchFeatures = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://parivaar.app/public/api/package-features"
      );
      const data = await response.json();
      setFeatures(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch features");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchFeatures();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Create or Update feature
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.name.trim() == "") return;

    setIsLoading(true);
    try {
      const url = isEditMode
        ? `https://parivaar.app/public/api/package-features/${currentId}`
        : "https://parivaar.app/public/api/package-features";
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Package_Fea_Name: formData.name,
          Package_Fea_Description: formData.description || null,
        }),
      });

      if (!response.ok) throw new Error("Operation failed");

      // Refresh the list
      await fetchFeatures();

      // Reset form
      setFormData({ name: "", description: "" });
      setIsModalOpen(false);
      setIsEditMode(false);
      setCurrentId(null);
      setError(null);
    } catch (err) {
      setError("Failed to save feature");
    } finally {
      setIsLoading(false);
    }
  };

  // Edit feature
  const handleEdit = (id) => {
    const featureToEdit = features.find((item) => item.Package_Fea_Id == id);
    if (featureToEdit) {
      setFormData({
        name: featureToEdit.Package_Fea_Name,
        description: featureToEdit.Package_Fea_Description || "",
      });
      setIsEditMode(true);
      setCurrentId(id);
      setIsModalOpen(true);
    }
  };

  // Delete feature
  const handleDelete = async (id) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://parivaar.app/public/api/package-features/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete");

      await fetchFeatures();
      setError(null);
    } catch (err) {
      setError("Failed to delete feature");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#172030] p-8">
      {isLoading && <CustomLogoLoader />} {/* Added CustomLogoLoader */}
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#172030] to-[#364154] bg-clip-text text-transparent">
          Feature Master
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#172030] hover:bg-[#2a3547] text-white px-6 py-3 rounded-xl flex items-center gap-2"
          disabled={isLoading}
        >
          <Plus size={20} />
          Add Feature
        </button>
      </div>
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      {/* Loading State */}
      {/* {isLoading && <div className="text-center py-4">Loading...</div>} */}
      {/* Table */}
      {!isLoading && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <table className="w-full">
            <thead className="bg-[#172030]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase">
                  Feature Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase">
                  Description
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {features.map((item) => (
                <tr key={item.Package_Fea_Id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {item.Package_Fea_Id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {item.Package_Fea_Name}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {item.Package_Fea_Description || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleEdit(item.Package_Fea_Id)}
                        className="text-blue-600 hover:text-blue-800"
                        disabled={isLoading}
                      >
                        <Edit size={18} />
                      </button>
                      {/* <button
                        onClick={() => handleDelete(item.Package_Fea_Id)}
                        className="text-red-600 hover:text-red-800"
                        disabled={isLoading}
                      >
                        <Trash2 size={18} />
                      </button> */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0000006e] bg-opacity-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#172030]">
                {isEditMode ? "Edit Feature" : "Add Feature"}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setIsEditMode(false);
                  setFormData({ name: "", description: "" });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Feature Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Feature Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#172030]"
                  placeholder="Enter feature name (e.g., Member Management)"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#172030]"
                  placeholder="Enter feature description (optional)"
                  rows="3"
                  disabled={isLoading}
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsEditMode(false);
                    setFormData({ name: "", description: "" });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#172030] text-white rounded-lg text-sm font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : isEditMode ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Featuremaster;
