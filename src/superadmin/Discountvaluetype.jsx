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

const Discountvaluetype = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [discountValueTypes, setDiscountValueTypes] = useState([]);
  const [formData, setFormData] = useState({ type: "" });
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch discount value types
  const fetchDiscountValueTypes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://parivaar.app/public/api/dis-val-types"
      );
      const data = await response.json();
      setDiscountValueTypes(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch discount value types");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchDiscountValueTypes();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Create or Update discount value type
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.type.trim() == "") return;

    setIsLoading(true);
    try {
      const url = isEditMode
        ? `https://parivaar.app/public/api/dis-val-types/${currentId}`
        : "https://parivaar.app/public/api/dis-val-types";
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ VT_Name: formData.type }),
      });

      if (!response.ok) throw new Error("Operation failed");

      // Refresh the list
      await fetchDiscountValueTypes();

      // Reset form
      setFormData({ type: "" });
      setIsModalOpen(false);
      setIsEditMode(false);
      setCurrentId(null);
      setError(null);
    } catch (err) {
      setError("Failed to save discount value type");
    } finally {
      setIsLoading(false);
    }
  };

  // Edit discount value type
  const handleEdit = (id) => {
    const discountValueTypeToEdit = discountValueTypes.find(
      (item) => item.DVT_Id == id
    );
    if (discountValueTypeToEdit) {
      setFormData({ type: discountValueTypeToEdit.VT_Name });
      setIsEditMode(true);
      setCurrentId(id);
      setIsModalOpen(true);
    }
  };

  // Delete discount value type
  const handleDelete = async (id) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://parivaar.app/public/api/dis-val-types/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete");

      await fetchDiscountValueTypes();
      setError(null);
    } catch (err) {
      setError("Failed to delete discount value type");
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
          Discount Value Type Master
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#172030] hover:bg-[#2a3547] text-white px-6 py-3 rounded-xl flex items-center gap-2"
          disabled={isLoading}
        >
          <Plus size={20} />
          Add Discount Value Type
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
                  Discount Value Type
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
              {discountValueTypes.map((item) => (
                <tr key={item.DVT_Id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {item.DVT_Id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {item.VT_Name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {new Date(item.created_at).toISOString().split("T")[0]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleEdit(item.DVT_Id)}
                        className="text-blue-600 hover:text-blue-800"
                        disabled={isLoading}
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.DVT_Id)}
                        className="text-red-600 hover:text-red-800"
                        disabled={isLoading}
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
      )}
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#172030]">
                {isEditMode
                  ? "Edit Discount Value Type"
                  : "Add Discount Value Type"}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setIsEditMode(false);
                  setFormData({ type: "" });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Value Type
                </label>
                <input
                  type="text"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#172030]"
                  placeholder="Enter discount value type (e.g., Flat Discount, Percentage Discount)"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsEditMode(false);
                    setFormData({ type: "" });
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

export default Discountvaluetype;
