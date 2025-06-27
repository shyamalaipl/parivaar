import { X, Pencil, Trash2 } from "lucide-react"; // Added Pencil and Trash2 icons
import { useState, useEffect } from "react";

const DesignationCreation = ({ setActivePage, activePage }) => {
  const [designations, setDesignations] = useState([]);
  const [designationName, setDesignationName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingDesignation, setEditingDesignation] = useState(null); // For tracking edit state
  const [editedName, setEditedName] = useState(""); // For editing designation name

  useEffect(() => {
    fetchDesignations();
  }, []);

  const handleInputChange = (e) => {
    setDesignationName(e.target.value);
  };

  const fetchDesignations = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const commId = user.id;

      if (!commId) {
        setError("No user ID found in local storage. Please log in.");
        return;
      }

      const response = await fetch(
        "https://parivaar.app/public/api/designations",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Add Authorization header if API requires it (e.g., Bearer token)
            // "Authorization": `Bearer ${user.token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data); // Debug: Check the full response

      // Handle different possible response structures and filter by Comm_Id
      let filteredDesignations = [];
      if (Array.isArray(data)) {
        filteredDesignations = data.filter(
          (desi) => desi.Comm_Id == parseInt(commId)
        );
      } else if (data.data && Array.isArray(data.data)) {
        filteredDesignations = data.data.filter(
          (desi) => desi.Comm_Id == parseInt(commId)
        );
      } else if (data.designations && Array.isArray(data.designations)) {
        filteredDesignations = data.designations.filter(
          (desi) => desi.Comm_Id == parseInt(commId)
        );
      } else {
        throw new Error("Unexpected API response format");
      }

      const formattedDesignations = filteredDesignations.map((desi, index) => ({
        id: desi.Desi_Type_Id || index + 1, // Using Desi_Type_Id as per your API response
        name: desi.Desi_Name,
      }));

      setDesignations(formattedDesignations);
    } catch (error) {
      console.error("Error fetching designations:", error);
      setError(`Failed to fetch designations: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!designationName.trim()) return;

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const commId = user.id;

      if (!commId) {
        alert("Please log in first");
        return;
      }

      const payload = {
        Comm_Id: parseInt(commId),
        Desi_Name: designationName,
      };

      console.log("Payload being sent:", payload);

      const response = await fetch(
        "https://parivaar.app/public/api/designations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Add Authorization header if required
            // "Authorization": `Bearer ${user.token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add designation");
      }

      const result = await response.json();
      console.log("Designation added:", result);

      setDesignationName("");
      await fetchDesignations();
    } catch (error) {
      console.error("Error adding designation:", error);
      alert(`Error adding designation: ${error.message}`);
    }
  };

  const handleEditDesignation = async (designation) => {
    if (editingDesignation?.id == designation.id) {
      // Save the edit
      try {
        setLoading(true);
        const payload = {
          Desi_Name: editedName, // Only send Desi_Name as per requirement
        };

        const response = await fetch(
          `https://parivaar.app/public/api/designations/${designation.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              // Add Authorization header if required
              // "Authorization": `Bearer ${user.token}`,
            },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to update designation");
        }

        setEditingDesignation(null);
        setEditedName("");
        await fetchDesignations();
      } catch (error) {
        console.error("Error updating designation:", error);
        alert(`Error updating designation: ${error.message}`);
      } finally {
        setLoading(false);
      }
    } else {
      // Start editing
      setEditingDesignation(designation);
      setEditedName(designation.name);
    }
  };

  const handleDeleteDesignation = async (desiId) => {
    if (!window.confirm("Are you sure you want to delete this designation?"))
      return;

    try {
      setLoading(true);
      const response = await fetch(
        `https://parivaar.app/public/api/designations/${desiId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            // Add Authorization header if required
            // "Authorization": `Bearer ${user.token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete designation");
      }

      await fetchDesignations();
    } catch (error) {
      console.error("Error deleting designation:", error);
      alert(`Error deleting designation: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="div flex justify-between cursor-pointer">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Designation Creation
          </h1>
          <X onClick={() => setActivePage("departmentadmin")} />
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Add New Designation
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="designationName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Designation Name
              </label>
              <input
                id="designationName"
                type="text"
                value={designationName}
                onChange={handleInputChange}
                placeholder="Enter designation name"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
              >
                Add Designation
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Designation List
          </h2>
          {loading ? (
            <p className="text-gray-500 text-center py-4">
              Loading designations...
            </p>
          ) : error ? (
            <p className="text-red-500 text-center py-4">{error}</p>
          ) : designations.length == 0 ? (
            <p className="text-gray-500 text-center py-4">
              No designations added yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                      ID
                    </th>
                    <th className="p-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                      Designation Name
                    </th>
                    <th className="p-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {designations.map((designation) => (
                    <tr
                      key={designation.id}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="p-3 border-b border-gray-200 text-gray-700">
                        {designation.id}
                      </td>
                      <td className="p-3 border-b border-gray-200 text-gray-700">
                        {editingDesignation?.id == designation.id ? (
                          <input
                            type="text"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          designation.name
                        )}
                      </td>
                      <td className="p-3 border-b border-gray-200">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditDesignation(designation)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteDesignation(designation.id)
                            }
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
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
        </div>
      </div>
    </div>
  );
};

export default DesignationCreation;
