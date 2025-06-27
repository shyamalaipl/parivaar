"use client";

import { useState, useEffect } from "react";
import {
  User,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  FileSpreadsheet,
  FileText,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ImCross } from "react-icons/im";
import logoImage from "../../src/img/parivarlogo1.png"; // Adjust the path to your logo
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import Swal from "sweetalert2";

// CustomLogoLoader Component
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

const Usersuperlist = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterCommCode, setFilterCommCode] = useState("");
  const [filterCommName, setFilterCommName] = useState("");
  const [showCommCodeInput, setShowCommCodeInput] = useState(false);
  const [showCommInput, setShowCommInput] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [commCodeSuggestions, setCommCodeSuggestions] = useState([]);
  const [commSuggestions, setCommSuggestions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [formData, setFormData] = useState({
    U_Name: "",
    U_Email: "",
    U_Mobile: "",
    Comm_Name: "",
    Comm_Id: "",
  });
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [showDownloadInput, setShowDownloadInput] = useState(false);
  const [downloadCommCode, setDownloadCommCode] = useState("");
  const [downloadType, setDownloadType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  // Fetch users with Role_Id = 3 and U_Status = 1, and map Comm_Name from Role_Id = 2
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://parivaar.app/public/api/users", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();

        // Filter users with Role_Id = 3 and U_Status = 1
        let filteredUsers = data.data.filter(
          (user) => user.Role_Id == 3 && user.U_Status == 1
        );

        // Get users with Role_Id = 2 to map Comm_Name
        const role2Users = data.data.filter((user) => user.Role_Id == 2);

        // Map Comm_Name for each filtered user based on matching Comm_Id
        filteredUsers = filteredUsers.map((user) => {
          const matchingRole2User = role2Users.find(
            (role2User) => role2User.Comm_Id == user.Comm_Id
          );
          return {
            ...user,
            Comm_Name: matchingRole2User
              ? matchingRole2User.Comm_Name
              : user.Comm_Name || "N/A",
          };
        });

        setUsers(filteredUsers);
        setFilteredUsers(filteredUsers);

        // Community Code suggestions
        const uniqueCommCodes = [
          ...new Set(
            filteredUsers.map((user) => user.Comm_Id).filter((code) => code)
          ),
        ];
        setCommCodeSuggestions(uniqueCommCodes);

        // Community Name suggestions
        const uniqueCommNames = [
          ...new Set(
            filteredUsers
              .map((user) => user.Comm_Name)
              .filter((name) => name && name !== "N/A")
          ),
        ];
        setCommSuggestions(uniqueCommNames);

        setLoading(false);
      } catch (error) {
        setError("Error fetching users: " + error.message);
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Create or Update user
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        ...formData,
        Role_Id: 3,
        U_Status: 1,
      };
      const url = isEditMode
        ? `https://parivaar.app/public/api/users/${currentUserId}`
        : "https://parivaar.app/public/api/users";
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      const result = await response.json();
      const newUser = result.data || { ...payload, U_Id: Date.now() }; // Fallback ID for demo

      if (isEditMode) {
        setUsers(
          users.map((user) => (user.U_Id == currentUserId ? newUser : user))
        );
        setFilteredUsers(
          filteredUsers.map((user) =>
            user.U_Id == currentUserId ? newUser : user
          )
        );
      } else {
        setUsers([...users, newUser]);
        setFilteredUsers([...filteredUsers, newUser]);
      }

      setIsModalOpen(false);
      setFormData({
        U_Name: "",
        U_Email: "",
        U_Mobile: "",
        Comm_Name: "",
        Comm_Id: "",
      });
      setIsEditMode(false);
      setCurrentUserId(null);
      setLoading(false);

      Swal.fire({
        title: isEditMode ? "Updated!" : "Added!",
        text: isEditMode
          ? "User has been updated successfully."
          : "User has been added successfully.",
        icon: "success",
        confirmButtonColor: "#182232",
      });
    } catch (error) {
      setError("Error saving user: " + error.message);
      setLoading(false);

      Swal.fire({
        title: "Error!",
        text: `Failed to ${isEditMode ? "update" : "add"} user: ${
          error.message
        }`,
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  };

  // Delete user
  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setLoading(true);
          const response = await fetch(
            `https://parivaar.app/public/api/users/${id}`,
            {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
            }
          );

          if (!response.ok)
            throw new Error(`HTTP error! Status: ${response.status}`);
          setUsers(users.filter((user) => user.U_Id !== id));
          setFilteredUsers(filteredUsers.filter((user) => user.U_Id !== id));
          setLoading(false);

          Swal.fire({
            title: "Deleted!",
            text: "User has been deleted successfully.",
            icon: "success",
            confirmButtonColor: "#182232",
          });
        } catch (error) {
          setError("Error deleting user: " + error.message);
          setLoading(false);

          Swal.fire({
            title: "Error!",
            text: `Failed to delete user: ${error.message}`,
            icon: "error",
            confirmButtonColor: "#d33",
          });
        }
      }
    });
  };

  // Open edit modal
  const handleEdit = (user) => {
    setFormData({
      U_Name: user.U_Name,
      U_Email: user.U_Email,
      U_Mobile: user.U_Mobile,
      Comm_Name: user.Comm_Name || "",
      Comm_Id: user.Comm_Id || "",
    });
    setIsEditMode(true);
    setCurrentUserId(user.U_Id);
    setIsModalOpen(true);
  };

  // Apply filters
  const applyFilters = () => {
    let tempUsers = [...users];
    let filterCount = 0;

    if (filterCommCode) {
      tempUsers = tempUsers.filter(
        (user) => user.Comm_Id?.toString() == filterCommCode
      );
      filterCount = 1;
      setFilterCommName("");
    } else if (filterCommName) {
      tempUsers = tempUsers.filter(
        (user) => user.Comm_Name?.toLowerCase() == filterCommName.toLowerCase()
      );
      filterCount = 1;
      setFilterCommCode("");
    }

    if (searchQuery) {
      tempUsers = tempUsers.filter(
        (user) =>
          user.U_Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.U_Email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.U_Mobile.includes(searchQuery)
      );
    }

    setFilteredUsers(tempUsers);
    setActiveFilters(filterCount);
    setIsFilterOpen(false);
    setShowCommCodeInput(false);
    setShowCommInput(false);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Clear filters
  const clearFilters = () => {
    setFilterCommCode("");
    setFilterCommName("");
    setFilteredUsers(users);
    setActiveFilters(0);
    setIsFilterOpen(false);
    setShowCommCodeInput(false);
    setShowCommInput(false);
    setSearchQuery("");
    setCurrentPage(1); // Reset to first page when clearing filters
  };

  // Download Excel
  const downloadExcel = (data) => {
    try {
      // Create a workbook
      const workbook = XLSX.utils.book_new();

      // Add metadata
      workbook.Props = {
        Title: "Users List",
        Subject: "User Information",
        Author: "Parivaar App",
        CreatedDate: new Date(),
      };

      // Prepare data for export
      const exportData = data.map((user, index) => ({
        "S.No": index + 1,
        ID: user.U_Id,
        Name: user.U_Name,
        Email: user.U_Email,
        Mobile: user.U_Mobile,
        "Community Name": user.Comm_Name || "N/A",
        "Community Code": user.Comm_Id || "N/A",
      }));

      // Create worksheet with custom styling
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      const colWidths = [
        { wch: 5 }, // S.No
        { wch: 10 }, // ID
        { wch: 20 }, // Name
        { wch: 30 }, // Email
        { wch: 15 }, // Mobile
        { wch: 25 }, // Community Name
        { wch: 15 }, // Community Code
      ];

      worksheet["!cols"] = colWidths;

      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Users List");

      // Generate and download the Excel file
      XLSX.writeFile(workbook, "users_list.xlsx");
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: `Failed to Horizongenerate Excel: ${error.message}`,
        icon: "error",
        confirmButtonColor: "#d33",
      });
      console.error("Excel generation error:", error);
    }
  };

  // Download PDF
  const downloadPDF = async (data) => {
    try {
      // Create a new PDF document
      const doc = new jsPDF("p", "mm", "a4");

      // Dynamically import jspdf-autotable
      const { default: autoTable } = await import("jspdf-autotable");

      // Add logo to the PDF
      const imgData = logoImage;
      doc.addImage(imgData, "PNG", 14, 10, 20, 20);

      // Title and date      doc.setFontSize(18)
      doc.setFont("helvetica", "bold");
      doc.setTextColor(24, 34, 50); // #182232
      doc.text("Users List", 40, 20);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 40, 28);

      // Add a horizontal line
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(14, 35, 196, 35);

      // Prepare table data
      const tableData = data.map((user, index) => [
        index + 1,
        user.U_Id || "N/A",
        user.U_Name || "N/A",
        user.U_Email || "N/A",
        user.U_Mobile || "N/A",
        user.Comm_Name || "N/A",
        user.Comm_Id || "N/A",
      ]);

      // Generate table using autoTable
      autoTable(doc, {
        head: [
          [
            "S.No",
            "ID",
            "Name",
            "Email",
            "Mobile",
            "Community Name",
            "Community Code",
          ],
        ],
        body: tableData,
        startY: 40,
        styles: {
          fontSize: 9,
          cellPadding: 3,
          overflow: "linebreak",
          halign: "left",
          valign: "middle",
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [24, 34, 50], // #182232
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "center",
          lineColor: [200, 200, 200],
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250],
        },
        columnStyles: {
          0: { cellWidth: 10, halign: "center" },
          1: { cellWidth: 15, halign: "center" },
          2: { cellWidth: 25 },
          3: { cellWidth: 40 },
          4: { cellWidth: 20, halign: "center" },
          5: { cellWidth: 30 },
          6: { cellWidth: 20, halign: "center" },
        },
        margin: { top: 10, left: 14, right: 14, bottom: 10 },
        didDrawPage: (data) => {
          // Add footer with page number and logo
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text(
            `Page ${data.pageNumber} of ${doc.internal.getNumberOfPages()}`,
            doc.internal.pageSize.width - 20,
            doc.internal.pageSize.height - 10,
            { align: "right" }
          );

          // Add small logo in footer
          doc.addImage(
            imgData,
            "PNG",
            14,
            doc.internal.pageSize.height - 15,
            10,
            10
          );

          // Add company name next to logo
          doc.setFontSize(8);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(24, 34, 50); // #182232
          doc.text("Parivaar App", 26, doc.internal.pageSize.height - 10);

          // Add horizontal line above footer
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.5);
          doc.line(
            14,
            doc.internal.pageSize.height - 18,
            196,
            doc.internal.pageSize.height - 18
          );
        },
      });

      // Save the PDF
      doc.save("users_list.pdf");
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: `Failed to generate PDF: ${error.message}`,
        icon: "error",
        confirmButtonColor: "#d33",
      });
      console.error("PDF generation error:", error);
    }
  };

  // Handle download
  const handleDownload = () => {
    if (!downloadCommCode) {
      setError("Please enter a community code");
      Swal.fire({
        title: "Error!",
        text: "Please enter a community code",
        icon: "warning",
        confirmButtonColor: "#182232",
      });
      return;
    }

    const downloadUsers = users.filter(
      (user) =>
        user.Comm_Id?.toString() == downloadCommCode &&
        user.Role_Id == 3 &&
        user.U_Status == 1
    );

    if (downloadUsers.length == 0) {
      setError("No users found for the provided community code");
      Swal.fire({
        title: "No Data!",
        text: "No users found for the provided community code",
        icon: "info",
        confirmButtonColor: "#182232",
      });
      return;
    }

    const data = downloadUsers.map((user) => ({
      U_Id: user.U_Id,
      U_Name: user.U_Name,
      U_Email: user.U_Email,
      U_Mobile: user.U_Mobile,
      Comm_Name: user.Comm_Name || "N/A",
      Comm_Id: user.Comm_Id || "N/A",
    }));

    if (downloadType == "excel") {
      downloadExcel(data);
    } else if (downloadType == "pdf") {
      downloadPDF(data);
    }

    setShowDownloadInput(false);
    setDownloadCommCode("");
    setDownloadType("");
    setIsDownloadOpen(false);
  };

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <CustomLogoLoader />;
  if (error)
    return (
      <div className="p-8 text-red-600 text-center font-semibold">{error}</div>
    );

  return (
    <div className="container mx-auto p-4 bg-white text-[#182232] min-h-screen">
      <div className="flex justify-between border-b-2 pb-5 items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          <User size={24} className="mr-2 text-[#182232]" />
          Total Users:{" "}
          <span className="ml-2 text-[#182232] bg-gray-100 px-3 py-1 rounded-full">
            {filteredUsers.length}
          </span>
        </h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyUp={applyFilters}
              className="bg-white text-[#182232] p-2.5 rounded-full pl-10 shadow-md w-80 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#182232] focus:border-transparent"
            />
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          </div>
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 bg-white text-[#182232] px-4 py-2.5 rounded-full shadow-md hover:bg-gray-50 border border-gray-200"
            >
              <Filter size={18} />
              <span>Filter</span>
              {activeFilters > 0 && (
                <span className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {activeFilters}
                </span>
              )}
            </button>
          </div>
          <div className="relative">
            <button
              onClick={() => setIsDownloadOpen(!isDownloadOpen)}
              className="flex items-center gap-2 bg-white text-[#182232] px-4 py-2.5 rounded-full shadow-md hover:bg-gray-50 border border-gray-200"
            >
              <Download size={18} />
              <span>Export</span>
            </button>
            {isDownloadOpen && (
              <div className="absolute top-12 right-0 bg-white text-[#182232] rounded-lg shadow-lg w-48 z-10 border border-gray-200 overflow-hidden">
                <button
                  onClick={() => {
                    setDownloadType("excel");
                    setShowDownloadInput(true);
                    setIsDownloadOpen(false);
                  }}
                  className=" w-full text-left px-4 py-2.5 hover:bg-gray-100 flex items-center gap-2"
                >
                  <FileSpreadsheet size={16} className="text-green-600" />
                  <span>Download Excel</span>
                </button>
                <div className="border-t border-gray-200"></div>
                <button
                  onClick={() => {
                    setDownloadType("pdf");
                    setShowDownloadInput(true);
                    setIsDownloadOpen(false);
                  }}
                  className=" w-full text-left px-4 py-2.5 hover:bg-gray-100 flex items-center gap-2"
                >
                  <FileText size={16} className="text-red-600" />
                  <span>Download PDF</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Download Input Modal */}
      {showDownloadInput && (
        <div className="fixed inset-0 bg-[#00000077] bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4 border-b pb-4">
              <h3 className="text-xl font-bold text-[#182232]">
                Enter Community Code
              </h3>
              <button
                onClick={() => {
                  setShowDownloadInput(false);
                  setDownloadCommCode("");
                  setDownloadType("");
                }}
                className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Community Code
              </label>
              <input
                type="text"
                placeholder="Enter Community Code"
                value={downloadCommCode}
                onChange={(e) => setDownloadCommCode(e.target.value)}
                className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#182232] focus:border-transparent"
              />
              {downloadCommCode && (
                <div className="max-h-40 overflow-y-auto bg-white text-[#182232] rounded-lg shadow-md mt-2 border border-gray-200">
                  {commCodeSuggestions
                    .filter((code) =>
                      code.toString().includes(downloadCommCode)
                    )
                    .map((code, index) => (
                      <div
                        key={index}
                        onClick={() => setDownloadCommCode(code)}
                        className="p-2.5 hover:bg-gray-100 cursor-pointer"
                      >
                        {code}
                      </div>
                    ))}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowDownloadInput(false);
                  setDownloadCommCode("");
                  setDownloadType("");
                }}
                className="px-4 py-2 bg-gray-200 text-[#182232] rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-[#182232] text-white rounded-lg hover:bg-opacity-90 transition-colors"
              >
                {downloadType == "excel" ? "Download Excel" : "Download PDF"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-[#182232] text-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          isFilterOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">Filters</h3>
            <button
              onClick={() => setIsFilterOpen(false)}
              className="p-1 rounded-full hover:bg-gray-700 transition-colors"
            >
              <ImCross className="text-white" />
            </button>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => {
                setShowCommCodeInput(!showCommCodeInput);
                setShowCommInput(false);
              }}
              className="w-full text-left py-3 px-4 bg-white text-[#182232] rounded-lg shadow-md hover:bg-gray-100 transition-colors font-medium"
            >
              Filter by Community Code
            </button>

            {showCommCodeInput && (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Enter Community Code"
                  value={filterCommCode}
                  onChange={(e) => setFilterCommCode(e.target.value)}
                  className="w-full bg-white text-[#182232] p-2.5 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-white"
                />
                {filterCommCode && (
                  <div className="max-h-40 overflow-y-auto bg-white text-[#182232] rounded-lg shadow-md">
                    {commCodeSuggestions
                      .filter((code) =>
                        code.toString().includes(filterCommCode)
                      )
                      .map((code, index) => (
                        <div
                          key={index}
                          onClick={() => setFilterCommCode(code)}
                          className="p-2.5 hover:bg-gray-100 cursor-pointer"
                        >
                          {code}
                        </div>
                      ))}
                  </div>
                )}
                <button
                  onClick={applyFilters}
                  className="bg-white text-[#182232] px-4 py-2.5 rounded-lg w-full shadow-md hover:bg-gray-100 font-medium transition-colors"
                >
                  Apply Filter
                </button>
              </div>
            )}

            <button
              onClick={() => {
                setShowCommInput(!showCommInput);
                setShowCommCodeInput(false);
              }}
              className="w-full text-left py-3 px-4 bg-white text-[#182232] rounded-lg shadow-md hover:bg-gray-100 transition-colors font-medium"
            >
              Filter by Community Name
            </button>

            {showCommInput && (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Search Community"
                  value={filterCommName}
                  onChange={(e) => setFilterCommName(e.target.value)}
                  className="w-full bg-white text-[#182232] p-2.5 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-white"
                />
                {filterCommName && (
                  <div className="max-h-40 overflow-y-auto bg-white text-[#182232] rounded-lg shadow-md">
                    {commSuggestions
                      .filter((name) =>
                        name
                          .toLowerCase()
                          .includes(filterCommName.toLowerCase())
                      )
                      .map((name, index) => (
                        <div
                          key={index}
                          onClick={() => setFilterCommName(name)}
                          className="p-2.5 hover:bg-gray-100 cursor-pointer"
                        >
                          {name}
                        </div>
                      ))}
                  </div>
                )}
                <button
                  onClick={applyFilters}
                  className="bg-white text-[#182232] px-4 py-2.5 rounded-lg w-full shadow-md hover:bg-gray-100 font-medium transition-colors"
                >
                  Apply Filter
                </button>
              </div>
            )}
          </div>

          <button
            onClick={clearFilters}
            className="w-full py-3 px-4 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 mt-6 transition-colors font-medium"
          >
            Clear All Filters
          </button>
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0000006a] bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4 border-b pb-4">
              <h3 className="text-xl font-bold text-[#182232]">
                {isEditMode ? "Edit User" : "Add New User"}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setFormData({
                    U_Name: "",
                    U_Email: "",
                    U_Mobile: "",
                    Comm_Name: "",
                    Comm_Id: "",
                  });
                  setIsEditMode(false);
                  setCurrentUserId(null);
                }}
                className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.U_Name}
                  onChange={(e) =>
                    setFormData({ ...formData, U_Name: e.target.value })
                  }
                  className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#182232] focus:border-transparent"
                  required
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.U_Email}
                  onChange={(e) =>
                    setFormData({ ...formData, U_Email: e.target.value })
                  }
                  className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#182232] focus:border-transparent"
                  required
                  placeholder="example@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number
                </label>
                <input
                  type="text"
                  value={formData.U_Mobile}
                  onChange={(e) =>
                    setFormData({ ...formData, U_Mobile: e.target.value })
                  }
                  className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#182232] focus:border-transparent"
                  required
                  placeholder="Enter mobile number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Community Name
                </label>
                <input
                  type="text"
                  value={formData.Comm_Name}
                  onChange={(e) =>
                    setFormData({ ...formData, Comm_Name: e.target.value })
                  }
                  className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#182232] focus:border-transparent"
                  placeholder="Enter community name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Community Code
                </label>
                <input
                  type="text"
                  value={formData.Comm_Id}
                  onChange={(e) =>
                    setFormData({ ...formData, Comm_Id: e.target.value })
                  }
                  className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#182232] focus:border-transparent"
                  placeholder="Enter community code"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setFormData({
                      U_Name: "",
                      U_Email: "",
                      U_Mobile: "",
                      Comm_Name: "",
                      Comm_Id: "",
                    });
                    setIsEditMode(false);
                    setCurrentUserId(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-[#182232] rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#182232] text-white rounded-lg hover:bg-opacity-90 transition-colors"
                >
                  {isEditMode ? "Update User" : "Add User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
        <table className="min-w-full border-collapse bg-white">
          <thead>
            <tr className="bg-[#182232] text-white">
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                Id
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                Number
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                Community Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                Community Code
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentUsers.length > 0 ? (
              currentUsers.map((user, index) => (
                <tr
                  key={user.U_Id}
                  classReplace
                  with:className={`${
                    index % 2 == 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-gray-100 transition-colors duration-200`}
                >
                  <td className="px-6 py-4 text-sm font-semibold text-[#182232] whitespace-nowrap">
                    {user.U_Id}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-[#182232] whitespace-nowrap">
                    {user.U_Name}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-[#182232] break-all">
                    {user.U_Email}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-[#182232] whitespace-nowrap">
                    {user.U_Mobile}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#182232] font-semibold whitespace-nowrap">
                    {user.Comm_Name && user.Comm_Name !== "N/A" ? (
                      <span className="px-2.5 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        {user.Comm_Name}
                      </span>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#182232] font-semibold whitespace-nowrap">
                    {user.Comm_Id ? (
                      <span className="px-2.5 py-1 rounded-full text-xs bg-purple-100 text-purple-800 font-mono">
                        {user.Comm_Id}
                      </span>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-[#182232] whitespace-nowrap">
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-1.5 text-blue-500 hover:text-blue-700 rounded-full hover:bg-blue-50 transition-colors"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.U_Id)}
                        className="p-1.5 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  No users found. Try clearing filters or adding a new user.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredUsers.length > 0 && (
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {indexOfFirstUser + 1} to{" "}
            {indexOfLastUser > filteredUsers.length
              ? filteredUsers.length
              : indexOfLastUser}{" "}
            of {filteredUsers.length} users
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
              className="px-3 py-2 border rounded-md hover:bg-gray-50 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentPage == 1}
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Show 5 pages max with current page in the middle when possible
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else {
                let start = Math.max(1, currentPage - 2);
                const end = Math.min(totalPages, start + 4);
                start = Math.max(1, end - 4);
                pageNum = start + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => paginate(pageNum)}
                  className={`px-3.5 py-2 border rounded-md ${
                    currentPage == pageNum
                      ? "bg-[#182232] text-white"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() =>
                currentPage < totalPages && setCurrentPage(currentPage + 1)
              }
              className="px-3 py-2 border rounded-md hover:bg-gray-50 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentPage == totalPages}
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Usersuperlist;
