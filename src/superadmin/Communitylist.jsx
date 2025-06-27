import {
  User,
  Briefcase,
  Search,
  X,
  AlertTriangle,
  Edit,
  Filter,
  Download,
  Delete,
  DeleteIcon,
  Trash2,
  Eye,
  FileSpreadsheet,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ImCross } from "react-icons/im";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import logoImage from "../../src/img/parivarlogo1.png"; // Adjust path
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

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

const Communitylist = ({ setActivePage, activePage }) => {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOptions, setDropdownOptions] = useState([]);
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState("");
  const [showPackageDropdown, setShowPackageDropdown] = useState(false);
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newRequests, setNewRequests] = useState("0");
  const [rejectedCommunity, setRejectedCommunity] = useState("0");
  const usersPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch users
        const userResponse = await fetch(
          "https://parivaar.app/public/api/users",
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!userResponse.ok)
          throw new Error(`HTTP error! Status: ${userResponse.status}`);
        const userResult = await userResponse.json();

        // Fetch packages
        const packageResponse = await fetch(
          "https://parivaar.app/public/api/packages",
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!packageResponse.ok)
          throw new Error(`HTTP error! Status: ${packageResponse.status}`);
        const packageResult = await packageResponse.json();

        // Filter users with Role_Id = 2 and U_Status = 1
        const filteredUsers = userResult.data.filter(
          (user) => user.Role_Id == 2 && user.U_Status == 1
        );

        const mappedUsers = filteredUsers.map((user) => ({
          id: user.U_Id,
          commId: user.Comm_Id || "N/A",
          name: user.Comm_Name || "N/A",
          email: user.U_Email,
          number: user.U_Mobile,
          username: user.U_Name,
          packageName: user.package?.PackageName || "N/A",
          details: {
            address: user.Address || "N/A",
            city: user.City || "N/A",
            state: user.State || "N/A",
            country: user.Country || "N/A",
            zipcode: user.Zipcode || "N/A",
            dob: user.DOB || "N/A",
            gender: user.Gender || "N/A",
            maritalStatus: user.Marital_Status || "N/A",
            occupation: user.Occupation || "N/A",
          },
        }));

        // Calculate counts for new requests and rejected communities
        const pendingRequests = userResult.data.filter(
          (user) => user.U_Status == 0 && user.Role_Id == 2
        );
        const rejectedCommunities = userResult.data.filter(
          (user) => user.U_Status == 2 && user.Role_Id == 2
        );
        setNewRequests(pendingRequests.length.toString());
        setRejectedCommunity(rejectedCommunities.length.toString());

        setUsers(mappedUsers);
        setDropdownOptions(
          filteredUsers.map((user) => user.Comm_Name || user.U_Name)
        );
        setPackages(packageResult.data.map((pkg) => pkg.PackageName));
        setLoading(false);
      } catch (error) {
        setError("Error fetching data: " + error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim() == "") setDropdownOptions(users.map((user) => user.name));
    else {
      const filteredOptions = users
        .filter((user) => user.name.toLowerCase().includes(query.toLowerCase()))
        .map((user) => user.name)
        .sort();
      setDropdownOptions(filteredOptions);
    }
  };

  const handleSelectCommunity = (communityName) => {
    setSearchQuery(communityName);
    setDropdownOptions([]);
  };

  const handlePackageFilter = (packageName) => {
    setSelectedPackage(packageName);
    setShowPackageDropdown(false);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Are you sure you want to delete this user?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(
            `https://parivaar.app/public/api/users/${id}`,
            {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
            }
          );

          if (!response.ok)
            throw new Error(
              `Failed to delete user! Status: ${response.status}`
            );
          setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
          setDropdownOptions((prevOptions) =>
            prevOptions.filter(
              (name) => name !== users.find((u) => u.id == id).name
            )
          );
          Swal.fire({
            title: "Deleted!",
            text: "The user has been deleted.",
            icon: "success",
            confirmButtonColor: "#3085d6",
          });
        } catch (error) {
          setError("Error deleting user: " + error.message);
          Swal.fire({
            title: "Error!",
            text: "Failed to delete the user. Please try again.",
            icon: "error",
            confirmButtonColor: "#d33",
          });
        }
      }
    });
  };

  const handleDownloadExcel = () => {
    try {
      const workbook = XLSX.utils.book_new();
      workbook.Props = {
        Title: "Community List",
        Subject: "Community Information",
        Author: "Parivaar App",
        CreatedDate: new Date(),
      };

      const exportData = filteredUsers.map((user, index) => ({
        "S.No": index + 1,
        Code: user.commId,
        Name: user.username,
        Email: user.email,
        Number: user.number,
        "Community Name": user.name,
        Package: user.packageName,
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const colWidths = [
        { wch: 5 },
        { wch: 10 },
        { wch: 20 },
        { wch: 30 },
        { wch: 15 },
        { wch: 25 },
        { wch: 15 },
      ];
      worksheet["!cols"] = colWidths;
      XLSX.utils.book_append_sheet(workbook, worksheet, "Community List");
      XLSX.writeFile(workbook, "community_list.xlsx");
      setShowDownloadDropdown(false);
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: `Failed to generate Excel: ${error.message}`,
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const doc = new jsPDF("p", "mm", "a4");
      const { default: autoTable } = await import("jspdf-autotable");
      doc.addImage(logoImage, "PNG", 14, 10, 20, 20);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(17, 34, 77);
      doc.text("Community List", 40, 20);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 40, 28);
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(14, 35, 196, 35);

      const tableData = filteredUsers.map((user, index) => [
        index + 1,
        user.commId || "N/A",
        user.username || "N/A",
        user.email || "N/A",
        user.number || "N/A",
        user.name || "N/A",
        user.packageName || "N/A",
      ]);

      autoTable(doc, {
        head: [
          [
            "S.No",
            "Code",
            "Name",
            "Email",
            "Number",
            "Community Name",
            "Package",
          ],
        ],
        body: tableData,
        startY: 40,
        styles: {
          fontSize: 8,
          cellPadding: 3,
          overflow: "linebreak",
          halign: "left",
          valign: "middle",
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [17, 34, 77],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "center",
          lineColor: [200, 200, 200],
        },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        columnStyles: {
          0: { cellWidth: 10, halign: "center" },
          1: { cellWidth: 15, halign: "center" },
          2: { cellWidth: 25 },
          3: { cellWidth: 45 },
          4: { cellWidth: 25, halign: "center" },
          5: { cellWidth: 35 },
          6: { cellWidth: 25 },
        },
        margin: { top: 10, left: 14, right: 14, bottom: 10 },
        didDrawPage: (data) => {
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text(
            `Page ${data.pageNumber} of ${doc.internal.getNumberOfPages()}`,
            doc.internal.pageSize.width - 20,
            doc.internal.pageSize.height - 10,
            { align: "right" }
          );
          doc.addImage(
            logoImage,
            "PNG",
            14,
            doc.internal.pageSize.height - 15,
            10,
            10
          );
          doc.setFontSize(8);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(17, 34, 77);
          doc.text("Parivaar App", 26, doc.internal.pageSize.height - 10);
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

      doc.save("community_list.pdf");
      setShowDownloadDropdown(false);
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: `Failed to generate PDF: ${error.message}`,
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesPackage = selectedPackage
      ? user.packageName == selectedPackage
      : true;
    return matchesSearch && matchesPackage;
  });

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  if (loading) return <CustomLogoLoader />;
  if (error)
    return (
      <div className="p-6 text-center text-red-600 font-semibold text-lg">
        {error}
      </div>
    );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-lg shadow-sm gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-[#11224D]">
          Manage Community
        </h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={() => setActivePage("communityrequist")}
            className="px-4 py-2 rounded-lg border border-yellow-600 text-gray-700 hover:bg-yellow-50 hover:text-yellow-600 transition flex items-center justify-center sm:justify-start shadow-sm w-full sm:w-auto"
          >
            <AlertTriangle size={18} className="mr-2 text-yellow-600" />
            Community Request
            <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {newRequests}
            </span>
          </button>
          <button
            onClick={() => setActivePage("communityrejected")}
            className="px-4 py-2 rounded-lg border border-red-600 text-gray-700 hover:bg-red-50 hover:text-red-600 transition flex items-center justify-center sm:justify-start shadow-sm w-full sm:w-auto"
          >
            <ImCross size={15} className="mr-2 text-red-600" />
            Rejected Communities
            <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {rejectedCommunity}
            </span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 border border-gray-100">
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-lg font-semibold text-[#11224D] flex items-center">
            <User size={20} className="mr-2 text-[#11224D]" /> Community List
          </h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search Communities..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#11224D] shadow-sm"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              {dropdownOptions.length > 0 && searchQuery && (
                <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {dropdownOptions.map((option, index) => (
                    <li
                      key={index}
                      className="px-4 py-2.5 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => handleSelectCommunity(option)}
                    >
                      {option}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="relative w-full sm:w-auto">
              <button
                onClick={() => setShowPackageDropdown(!showPackageDropdown)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 flex items-center gap-2 shadow-sm"
                title="Filter by Package"
              >
                <Filter size={18} className="text-[#11224D]" />
                <span className="text-sm font-medium">Filter</span>
              </button>
              {showPackageDropdown && (
                <ul className="absolute z-10 mt-1 w-full sm:w-48 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto right-0">
                  <li
                    className="px-4 py-2.5 hover:bg-gray-100 cursor-pointer font-medium text-[#11224D] text-sm"
                    onClick={() => handlePackageFilter("")}
                  >
                    All Packages
                  </li>
                  <div className="border-t border-gray-200"></div>
                  {packages.map((pkg, index) => (
                    <li
                      key={index}
                      className="px-4 py-2.5 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => handlePackageFilter(pkg)}
                    >
                      {pkg}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="relative w-full sm:w-auto">
              <button
                onClick={() => setShowDownloadDropdown(!showDownloadDropdown)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 flex items-center gap-2 shadow-sm"
                title="Download Options"
              >
                <Download size={18} className="text-[#11224D]" />
                <span className="text-sm font-medium">Export</span>
              </button>
              {showDownloadDropdown && (
                <ul className="absolute z-10 mt-1 w-full sm:w-48 bg-white border border-gray-300 rounded-lg shadow-lg right-0">
                  <li
                    className="px-4 py-2.5 hover:bg-gray-100 cursor-pointer flex items-center gap-2 text-sm"
                    onClick={handleDownloadExcel}
                  >
                    <FileSpreadsheet size={16} className="text-green-600" />
                    <span>Download Excel</span>
                  </li>
                  <div className="border-t border-gray-200"></div>
                  <li
                    className="px-4 py-2.5 hover:bg-gray-100 cursor-pointer flex items-center gap-2 text-sm"
                    onClick={handleDownloadPDF}
                  >
                    <FileText size={16} className="text-red-600" />
                    <span>Download PDF</span>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Table for Desktop, Card for Mobile */}
        <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-[#11224D] font-semibold">
                <th className="p-3 border-b border-gray-200">Code</th>
                <th className="p-3 border-b border-gray-200">Community Name</th>
                <th className="p-3 border-b border-gray-200">Admin Name</th>
                <th className="p-3 border-b border-gray-200">Email</th>
                <th className="p-3 border-b border-gray-200">Number</th>
                <th className="p-3 border-b border-gray-200">Package</th>
                <th className="p-3 border-b border-gray-200 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.length > 0 ? (
                currentUsers.map((user, index) => (
                  <tr
                    key={user.id}
                    className={`hover:bg-gray-50 transition ${
                      index % 2 == 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="p-3 border-b border-gray-200 text-center font-mono">
                      {user.commId}
                    </td>
                    <td className="p-3 border-b border-gray-200">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {user.name}
                      </span>
                    </td>
                    <td className="p-3 border-b border-gray-200 font-medium">
                      {user.username}
                    </td>
                    <td className="p-3 border-b border-gray-200 text-[#11224D]">
                      {user.email}
                    </td>
                    <td className="p-3 border-b border-gray-200">
                      {user.number}
                    </td>
                    <td className="p-3 border-b border-gray-200">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium  text-gray-700">
                        {user.packageName}
                      </span>
                    </td>
                    <td className="p-3 border-b border-gray-200 text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleViewDetails(user)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50 transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-1.5 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center p-6 text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {currentUsers.length > 0 ? (
            currentUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-[#11224D]">
                      {user.username}
                    </span>
                    <span className="text-xs font-mono text-gray-600">
                      {user.commId}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Email:</span> {user.email}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Number:</span> {user.number}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Community:</span>
                    <span className="ml-1 px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      {user.name}
                    </span>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Package:</span>
                    <span className="ml-1 px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      {user.packageName}
                    </span>
                  </p>
                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      onClick={() => handleViewDetails(user)}
                      className="p-1.5 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="p-1.5 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50"
                      title="Delete User"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-6 text-gray-500 text-sm">
              No users found.
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600">
            Showing {indexOfFirstUser + 1} to{" "}
            {indexOfLastUser > filteredUsers.length
              ? filteredUsers.length
              : indexOfLastUser}{" "}
            of {filteredUsers.length} users
          </div>
          <div className="flex flex-wrap justify-center sm:justify-end gap-1">
            <button
              onClick={prevPage}
              className="px-3 py-2 border rounded-md hover:bg-gray-50 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              disabled={currentPage == 1}
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => paginate(i + 1)}
                className={`px-3 py-2 border rounded-md text-sm ${
                  currentPage == i + 1
                    ? "bg-[#11224D] text-white"
                    : "hover:bg-gray-50"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={nextPage}
              className="px-3 py-2 border rounded-md hover:bg-gray-50 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              disabled={currentPage == totalPages}
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal for User Details */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b pb-4">
              <h2 className="text-lg sm:text-xl font-bold text-[#11224D]">
                Community Details
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-gray-500">Code</p>
                  <p className="font-medium">{selectedUser.commId}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-500">Name</p>
                  <p className="font-medium">{selectedUser.username}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-gray-500">Email</p>
                <p className="font-medium text-[#11224D]">
                  {selectedUser.email}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-gray-500">Number</p>
                  <p className="font-medium">{selectedUser.number}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-500">Community Name</p>
                  <p className="font-medium">
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      {selectedUser.name}
                    </span>
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-gray-500">Package</p>
                <p className="font-medium">
                  <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    {selectedUser.packageName}
                  </span>
                </p>
              </div>
              <div className="border-t border-gray-200 my-4"></div>
              <h3 className="font-semibold text-[#11224D] mb-2">
                Additional Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-gray-500">Address</p>
                  <p className="font-medium">{selectedUser.details.address}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-500">City</p>
                  <p className="font-medium">{selectedUser.details.city}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-gray-500">State</p>
                  <p className="font-medium">{selectedUser.details.state}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-500">Country</p>
                  <p className="font-medium">{selectedUser.details.country}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-gray-500">Zipcode</p>
                  <p className="font-medium">{selectedUser.details.zipcode}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-500">Date of Birth</p>
                  <p className="font-medium">{selectedUser.details.dob}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-gray-500">Gender</p>
                  <p className="font-medium">{selectedUser.details.gender}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-500">Marital Status</p>
                  <p className="font-medium">
                    {selectedUser.details.maritalStatus}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-gray-500">Occupation</p>
                <p className="font-medium">{selectedUser.details.occupation}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-[#11224D] text-white rounded-lg hover:bg-opacity-90 transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Communitylist;
