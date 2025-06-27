"use client";

import { useState, useEffect } from "react";
import {
  ShoppingBag,
  Trash2,
  Search,
  Filter,
  Tag,
  DollarSign,
  Package,
  ShoppingCart,
  Grid,
  List,
  ChevronDown,
  X,
  Download,
  Eye,
  Clock,
  MapPin,
  Phone,
  User,
  CircleChevronLeft,
} from "lucide-react";
import Swal from "sweetalert2";
import logoImage from "../../src/img/parivarlogo1.png";

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
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        backdropFilter: "blur(5px)",
      }}
    >
      <img
        src={logoImage || "/placeholder.svg"}
        alt="Rotating Logo"
        style={{
          width: "60px",
          height: "60px",
          animation: "spin 1s linear infinite",
          filter: "drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))",
        }}
      />
    </div>
  );
};

const Marketmember = ({ setActivePage }) => {
  const [marketItems, setMarketItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [tempSearchTerm, setTempSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState(["All"]);
  const [viewMode, setViewMode] = useState("grid");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [revenueStats, setRevenueStats] = useState({
    totalProducts: 0,
    totalRevenue: 0,
    pendingApproval: 0,
    activeListings: 0,
  });

  const userData = JSON.parse(localStorage.getItem("user")) || {};
  const commId = userData.Comm_Id;

  // Update cart count from localStorage
  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartCount(cart.length);
  };

  // Fetch marketplace items and match with users
  const fetchMarketItems = async () => {
    setLoading(true);
    try {
      // Fetch marketplace items
      const marketResponse = await fetch(
        "https://parivaar.app/public/api/marketplaces"
      );
      if (!marketResponse.ok)
        throw new Error("Failed to fetch marketplace items");
      const marketResult = await marketResponse.json();
      const marketData = marketResult.data || [];

      // Filter by Active status
      const activeItems = marketData.filter(
        (item) => item.M_Status == "Active"
      );

      // Fetch users to match Comm_Id
      const usersResponse = await fetch(
        "https://parivaar.app/public/api/users"
      );
      if (!usersResponse.ok) throw new Error("Failed to fetch users");
      const usersResult = await usersResponse.json();
      const usersData = usersResult.data || [];

      // Filter items by matching Comm_Id
      const filteredItems = activeItems.filter((item) =>
        usersData.some(
          (user) => user.Comm_Id == commId && user.U_Id == item.U_Id
        )
      );

      setMarketItems(filteredItems);

      // Extract unique categories
      const uniqueCategories = [
        "All",
        ...new Set(
          filteredItems.map((item) => item.M_Category).filter(Boolean)
        ),
      ];
      setCategories(uniqueCategories);

      // Calculate revenue stats
      const totalRevenue = filteredItems.reduce((sum, item) => {
        return sum + Number.parseFloat(item.M_Price) * 0.05;
      }, 0);

      setRevenueStats({
        totalProducts: filteredItems.length,
        totalRevenue: totalRevenue.toFixed(2),
        pendingApproval: 0,
        activeListings: filteredItems.length,
      });

      if (filteredItems.length == 0) {
        Swal.fire({
          icon: "info",
          title: "No Items",
          text: "No marketplace items found for this community",
          confirmButtonColor: "#1A2B49",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Fetch Error",
        text: error.message,
        confirmButtonColor: "#1A2B49",
      });
      setMarketItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Update item status to Inactive
  const updateMarketItemStatus = (itemId) => {
    const itemToUpdate = marketItems.find((item) => item.M_Id == itemId);
    if (!itemToUpdate) return;

    Swal.fire({
      title: "Are you sure?",
      text: "Are you sure you want to deactivate this item?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1A2B49",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, deactivate it!",
      cancelButtonText: "No",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setLoading(true);
          const response = await fetch(
            `https://parivaar.app/public/api/marketplaces/${itemId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ M_Status: "Inactive" }),
            }
          );

          if (!response.ok) throw new Error("Failed to update item status");

          // Update state to remove the deactivated item
          setMarketItems(marketItems.filter((item) => item.M_Id !== itemId));
          setSelectedItem(null);

          Swal.fire({
            icon: "success",
            title: "Item Deactivated",
            text: "The marketplace item has been successfully deactivated",
            confirmButtonColor: "#1A2B49",
          });
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Update Error",
            text: error.message,
            confirmButtonColor: "#1A2B49",
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Filter and sort items
  useEffect(() => {
    let result = [...marketItems];

    // Apply category filter
    if (selectedCategory !== "All") {
      result = result.filter((item) => item.M_Category == selectedCategory);
    }

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          (item.M_Title && item.M_Title.toLowerCase().includes(searchLower)) ||
          (item.M_Description &&
            item.M_Description.toLowerCase().includes(searchLower)) ||
          (item.M_Category &&
            item.M_Category.toLowerCase().includes(searchLower)) ||
          (item.M_Name && item.M_Name.toLowerCase().includes(searchLower))
      );
    }

    // Apply sorting
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case "price_high":
        result.sort(
          (a, b) => Number.parseFloat(b.M_Price) - Number.parseFloat(a.M_Price)
        );
        break;
      case "price_low":
        result.sort(
          (a, b) => Number.parseFloat(a.M_Price) - Number.parseFloat(b.M_Price)
        );
        break;
      default:
        break;
    }

    setFilteredItems(result);
  }, [marketItems, searchTerm, selectedCategory, sortBy]);

  useEffect(() => {
    fetchMarketItems();
    updateCartCount();

    // Add event listener for cart updates
    window.addEventListener("storage", updateCartCount);

    // Cleanup function
    return () => {
      window.removeEventListener("storage", updateCartCount);
    };
  }, []);

  const handleCardClick = (item) => {
    setSelectedItem(item);
  };

  const closeDetails = () => {
    setSelectedItem(null);
  };

  const getCategoryColor = (category) => {
    const colors = {
      Electronics: "bg-blue-100 text-blue-800",
      Clothing: "bg-pink-100 text-pink-800",
      Furniture: "bg-amber-100 text-amber-800",
      Books: "bg-emerald-100 text-emerald-800",
      Toys: "bg-purple-100 text-purple-800",
      Sports: "bg-red-100 text-red-800",
      Home: "bg-teal-100 text-teal-800",
      Beauty: "bg-fuchsia-100 text-fuchsia-800",
      Food: "bg-orange-100 text-orange-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleSearch = () => {
    setSearchTerm(tempSearchTerm);
  };

  const handleClearSearch = () => {
    setTempSearchTerm("");
    setSearchTerm("");
  };

  const handleKeyPress = (e) => {
    if (e.key == "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdf9f7] to-[#f0f4ff]">
      {loading && <CustomLogoLoader />}

      {/* Header */}
      <div className="bg-[#1A2B49] rounded-xl text-white py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <button
            className="flex  cursor-pointer items-center text-white"
            onClick={() => setActivePage("dashboardmember")}
          >
            <CircleChevronLeft size={30} className="mr-2" />
          </button>

          <h1 className="text-2xl font-bold text-center lg:text-left">
            Marketplace Management
          </h1>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, category..."
                value={tempSearchTerm}
                onChange={(e) => setTempSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                onBlur={handleSearch}
                className="pl-10 pr-4 py-2 w-full rounded-lg bg-white text-black focus:ring-2 focus:ring-[#1A2B49] focus:outline-none"
              />
              {tempSearchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* <div className="flex items-center gap-3">
            
              <button className="flex items-center gap-2 bg-[#1A2B49] border border-white px-4 py-2 rounded-lg font-medium hover:bg-[#2A3B59] transition-all duration-300">
                <Download className="w-5 h-5" />
                Export Data
              </button>
            </div> */}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto mt-3 px-6 ">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Products</p>
                <h3 className="text-3xl font-bold text-[#1A2B49] mt-1">
                  {revenueStats.totalProducts}
                </h3>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active Listings</p>
                <h3 className="text-3xl font-bold text-[#1A2B49] mt-1">
                  {revenueStats.activeListings}
                </h3>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Sold Products</p>
                <h3 className="text-3xl font-bold text-[#1A2B49] mt-1">
                  {revenueStats.pendingApproval}
                </h3>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Results Summary */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          {/* Left Side: Product Info + Controls */}
          <div className="items-center  gap-4 justify-end flex md:gap-6 w-full">
            {/* Product Info */}
            {/* <div className="">
              <h2 className="text-xl font-semibold text-gray-800">
                {filteredItems.length}{" "}
                {filteredItems.length == 1 ? "Product" : "Products"}
                {selectedCategory !== "All" && ` in ${selectedCategory}`}
                {searchTerm && ` matching "${searchTerm}"`}
              </h2>
            </div> */}

            {/* Controls: Category | Sort | View Mode */}
            <div className="flex  flex-wrap gap-3 items-center">
              {/* Category Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="px-4 py-2 cursor-pointer bg-white border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition"
                >
                  <Filter size={15} />
                  <span className="text-sm">{selectedCategory}</span>
                  <ChevronDown size={15} />
                </button>
                {showCategoryDropdown && (
                  <div className="absolute z-20 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg">
                    <ul className="py-1 max-h-60 overflow-auto">
                      {categories.map((category) => (
                        <li key={category}>
                          <button
                            onClick={() => {
                              setSelectedCategory(category);
                              setShowCategoryDropdown(false);
                            }}
                            className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                              selectedCategory == category
                                ? "bg-gray-100 font-medium"
                                : ""
                            }`}
                          >
                            {category}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition"
                >
                  <span className="text-sm">Sort</span>
                  <ChevronDown size={15} />
                </button>
                {showSortDropdown && (
                  <div className="absolute right-0 z-20 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg">
                    <ul className="py-1">
                      {[
                        { label: "Newest First", value: "newest" },
                        { label: "Oldest First", value: "oldest" },
                        { label: "Price: High to Low", value: "price_high" },
                        { label: "Price: Low to High", value: "price_low" },
                      ].map(({ label, value }) => (
                        <li key={value}>
                          <button
                            onClick={() => {
                              setSortBy(value);
                              setShowSortDropdown(false);
                            }}
                            className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                              sortBy == value ? "bg-gray-100 font-medium" : ""
                            }`}
                          >
                            {label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* View Mode Toggle */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-3 ${
                    viewMode == "grid"
                      ? "bg-[#1A2B49] text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  } transition`}
                >
                  <Grid size={15} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-3 ${
                    viewMode == "list"
                      ? "bg-[#1A2B49] text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  } transition`}
                >
                  <List size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* Right Side: Clear Filters Button */}
          {(selectedCategory !== "All" || searchTerm) && (
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSearchTerm("");
                setTempSearchTerm("");
              }}
              className="text-[#1A2B49] hover:underline flex items-center gap-1 self-start md:self-auto"
            >
              <X size={16} />
              Clear Filters
            </button>
          )}
        </div>

        {/* Marketplace Items */}
        {filteredItems.length == 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No Products Found
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {searchTerm || selectedCategory !== "All"
                ? "No products match your current filters. Try adjusting your search criteria."
                : "There are no products in the marketplace yet."}
            </p>
          </div>
        ) : viewMode == "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.M_Id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="relative h-48">
                  <img
                    src={
                      item.M_Image && item.M_Image[0]
                        ? item.M_Image[0]
                        : "https://via.placeholder.com/300x200?text=No+Image"
                    }
                    alt={item.M_Title}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => handleCardClick(item)}
                    onError={(e) =>
                      (e.target.src =
                        "https://via.placeholder.com/300x200?text=No+Image")
                    }
                  />
                  {item.M_Category && (
                    <div
                      className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                        item.M_Category
                      )}`}
                    >
                      {item.M_Category}
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardClick(item);
                      }}
                      className="p-2 bg-white/90 backdrop-blur-sm text-[#1A2B49] rounded-full hover:bg-white transition-colors"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateMarketItemStatus(item.M_Id);
                      }}
                      className="p-2 bg-white/90 backdrop-blur-sm text-red-600 rounded-full hover:bg-white transition-colors"
                      title="Deactivate Item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3
                    className="text-lg font-semibold text-[#1A2B49] mb-1 cursor-pointer hover:text-[#2A3B59] transition-colors line-clamp-1"
                    onClick={() => handleCardClick(item)}
                  >
                    {item.M_Title}
                  </h3>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[#1A2B49] font-bold">₹{item.M_Price}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(item.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <User size={14} className="mr-1" />
                    <span className="truncate">
                      {item.M_Name || "Unknown Seller"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <div
                key={item.M_Id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100"
              >
                <div className="flex flex-col sm:flex-row">
                  <div className="relative sm:w-48 h-48">
                    <img
                      src={
                        item.M_Image && item.M_Image[0]
                          ? item.M_Image[0]
                          : "https://via.placeholder.com/300x200?text=No+Image"
                      }
                      alt={item.M_Title}
                      className="w-full h-full object-cover"
                      onError={(e) =>
                        (e.target.src =
                          "https://via.placeholder.com/300x200?text=No+Image")
                      }
                    />
                    {item.M_Category && (
                      <div
                        className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                          item.M_Category
                        )}`}
                      >
                        {item.M_Category}
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-[#1A2B49] mb-1">
                          {item.M_Title}
                        </h3>
                        <p className="text-[#1A2B49] font-bold mb-2">
                          ₹{item.M_Price}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCardClick(item)}
                          className="p-2 bg-gray-100 text-[#1A2B49] rounded-full hover:bg-gray-200 transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => updateMarketItemStatus(item.M_Id)}
                          className="p-2 bg-gray-100 text-red-600 rounded-full hover:bg-gray-200 transition-colors"
                          title="Deactivate Item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <div className="flex items-center text-gray-600">
                        <User size={14} className="mr-1" />
                        <span>{item.M_Name || "Unknown Seller"}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock size={14} className="mr-1" />
                        <span>{formatDate(item.created_at)}</span>
                      </div>
                      {item.M_Mobile && (
                        <div className="flex items-center text-gray-600">
                          <Phone size={14} className="mr-1" />
                          <span>{item.M_Mobile}</span>
                        </div>
                      )}
                      {item.M_Address && (
                        <div className="flex items-center text-gray-600">
                          <MapPin size={14} className="mr-1" />
                          <span className="truncate">{item.M_Address}</span>
                        </div>
                      )}
                    </div>

                    {item.M_Description && (
                      <p className="mt-2 text-gray-600 line-clamp-2 text-sm">
                        {item.M_Description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detailed View Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-2xl font-bold text-[#1A2B49]">
                  {selectedItem.M_Title}
                </h2>
                <button
                  onClick={closeDetails}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <div className="bg-gray-100 rounded-xl overflow-hidden mb-4">
                      <img
                        src={
                          selectedItem.M_Image && selectedItem.M_Image[0]
                            ? selectedItem.M_Image[0]
                            : "https://via.placeholder.com/500x400?text=No+Image"
                        }
                        alt={selectedItem.M_Title}
                        className="w-full h-64 md:h-[100vh] object-cover"
                        onError={(e) =>
                          (e.target.src =
                            "https://via.placeholder.com/500x400?text=No+Image")
                        }
                      />
                    </div>

                    {/* Image Gallery */}
                    {selectedItem.M_Image &&
                      selectedItem.M_Image.length > 1 && (
                        <div className="grid grid-cols-4 gap-2">
                          {selectedItem.M_Image.map((img, index) => (
                            <img
                              key={index}
                              src={
                                img ||
                                "https://via.placeholder.com/100?text=No+Image"
                              }
                              alt={`${selectedItem.M_Title} - Image ${
                                index + 1
                              }`}
                              className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                              onError={(e) =>
                                (e.target.src =
                                  "https://via.placeholder.com/100?text=No+Image")
                              }
                            />
                          ))}
                        </div>
                      )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-2xl font-bold text-[#1A2B49]">
                        ₹{selectedItem.M_Price}
                      </h3>
                      {selectedItem.M_Category && (
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(
                            selectedItem.M_Category
                          )}`}
                        >
                          {selectedItem.M_Category}
                        </span>
                      )}
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center">
                        <User className="w-5 h-5 text-[#1A2B49] mr-2" />
                        <div>
                          <p className="text-sm text-gray-500">Seller</p>
                          <p className="font-medium">
                            {selectedItem.M_Name || "Unknown Seller"}
                          </p>
                        </div>
                      </div>

                      {selectedItem.M_Mobile && (
                        <div className="flex items-center">
                          <Phone className="w-5 h-5 text-[#1A2B49] mr-2" />
                          <div>
                            <p className="text-sm text-gray-500">Contact</p>
                            <p className="font-medium">
                              {selectedItem.M_Mobile}
                            </p>
                          </div>
                        </div>
                      )}

                      {selectedItem.M_Address && (
                        <div className="flex items-center">
                          <MapPin className="w-5 h-5 text-[#1A2B49] mr-2" />
                          <div>
                            <p className="text-sm text-gray-500">Location</p>
                            <p className="font-medium">
                              {selectedItem.M_Address}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center">
                        <Clock className="w-5 h-5 text-[#1A2B49] mr-2" />
                        <div>
                          <p className="text-sm text-gray-500">Listed On</p>
                          <p className="font-medium">
                            {formatDate(selectedItem.created_at)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <Tag className="w-5 h-5 text-[#1A2B49] mr-2" />
                        <div>
                          <p className="text-sm text-gray-500">Status</p>
                          <p className="font-medium text-green-600">Active</p>
                        </div>
                      </div>
                    </div>

                    {selectedItem.M_Description && (
                      <div>
                        <h4 className="font-semibold text-[#1A2B49] mb-2">
                          Description
                        </h4>
                        <p className="text-gray-600 whitespace-pre-line">
                          {selectedItem.M_Description}
                        </p>
                      </div>
                    )}

                    <div className="pt-4 flex gap-3">
                      <button
                        onClick={() =>
                          updateMarketItemStatus(selectedItem.M_Id)
                        }
                        className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Trash2 size={18} />
                        Deactivate Item
                      </button>
                      <button
                        onClick={closeDetails}
                        className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketmember;
