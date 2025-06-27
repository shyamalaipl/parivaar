import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FiFilter } from "react-icons/fi";
import FilterSidebar from "../Shop/filter-sidebar";
import { IoSearch } from "react-icons/io5";
import Shopimg from "../img/shop.jpg";
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
    <div className="fixed inset-0 top-16 bg-white flex justify-center items-center z-50 backdrop-blur-md">
      <img
        src={logoImage}
        alt="Rotating Logo"
        className="w-12 h-12 animate-spin drop-shadow-md"
      />
    </div>
  );
};

const Shop = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const filterSidebarRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "https://parivaar.app/public/api/marketplaces"
        );
        const data = await response.json();

        if (data.message == "All marketplace items fetched successfully") {
          const formattedProducts = data.data
            .filter((item) => item.M_Status == "Active")
            .map((item) => ({
              id: item.M_Id,
              name: item.M_Title,
              price: parseFloat(item.M_Price),
              description: item.M_Description,
              images: item.M_Image,
              sellerName: item.M_Name,
              mobile: item.M_Mobile,
              address: item.M_Address,
              category: item.M_Category,
              status: item.M_Status,
              additionalInfo: [
                { label: "Seller", value: item.M_Name },
                { label: "Contact", value: item.M_Mobile },
                { label: "Address", value: item.M_Address },
              ],
            }));
          setProducts(formattedProducts);
          setFilteredProducts(formattedProducts);
        } else {
          throw new Error("Failed to fetch marketplace items");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query) {
      const filtered = filteredProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.description.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim() !== "") {
      setShowResults(false);
    }
  };

  const handleSelectProduct = (id) => {
    navigate(`/product/${id}`);
    setShowResults(false);
  };

  const clearAllFilters = () => {
    setFilteredProducts(products);
    if (filterSidebarRef.current) {
      filterSidebarRef.current.resetFilters();
    }
  };

  if (loading) {
    return <CustomLogoLoader />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg w-full max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-500 text-white py-2 px-6 rounded-full hover:bg-red-600 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Heading Section */}
        <div className="text-center my-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#1A2B49]">
            Marketplace
          </h2>
          <nav
            className="flex items-center gap-2 mt-10 text-sm"
            aria-label="breadcrumb"
          >
            <Link
              to="/home"
              className="text-[#1A2B49] font-bold hover:underline"
            >
              Home
            </Link>
            <span className="text-gray-400"> / </span>
            <span className="text-[#1A2B49]">Marketplace</span>
          </nav>
        </div>

        {/* Controls Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex gap-3 w-full sm:w-auto">
            <NavLink to={"/Addproduct"} className="w-full sm:w-auto">
              <button className="w-full border py-2 px-4 bg-[#1A2B49] text-white rounded hover:bg-white hover:text-[#1A2B49] hover:border-[#1A2B49] transition">
                Add Product
              </button>
            </NavLink>
            <NavLink to={"/YourProduct"} className="w-full sm:w-auto">
              <button className="w-full border py-2 px-4 bg-[#1A2B49] text-white rounded hover:bg-white hover:text-[#1A2B49] hover:border-[#1A2B49] transition">
                Your Product
              </button>
            </NavLink>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-80 lg:w-96">
            <input
              type="text"
              className="w-full py-2 px-4 border-[#1A2B49] pr-10 border-t-2 border-b-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#1A2B49] text-sm"
              placeholder="Search Item"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <IoSearch
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer"
              onClick={handleSearchSubmit}
            />
            {showResults && (
              <ul className="absolute left-0 right-0 bg-white border rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto z-10">
                {searchResults.length > 0 ? (
                  searchResults.map((product) => (
                    <li
                      key={product.id}
                      className="p-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2 text-sm"
                      onClick={() => handleSelectProduct(product.id)}
                    >
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-8 h-8 object-cover rounded"
                      />
                      {product.name}
                    </li>
                  ))
                ) : (
                  <li className="p-2 text-gray-500 text-sm">
                    No products found
                  </li>
                )}
              </ul>
            )}
          </div>
        </div>

        {/* Filter Sidebar Toggle (Mobile) */}
        <div className="mb-4">
          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 border py-2 px-4 rounded-lg text-[#1A2B49] hover:bg-gray-100"
          >
            <FiFilter /> Filters
          </button>
        </div>

        <FilterSidebar
          ref={filterSidebarRef}
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          products={products}
          setFilteredProducts={setFilteredProducts}
        />

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="shadow-md hover:shadow-lg rounded-lg p-4 transition bg-white"
            >
              <Link to={`/product/${product.id}`}>
                <div className="relative overflow-hidden rounded-lg">
                  <img
                    src={product.images[0] || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-40 sm:h-48 object-cover rounded-lg transition group-hover:scale-105"
                  />
                </div>
                <h3 className="mt-3 text-base sm:text-lg font-semibold line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-gray-700 text-sm sm:text-base">
                  ₹{product.price.toFixed(2)}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 line-clamp-1">
                  Seller: {product.sellerName}
                </p>
              </Link>
            </div>
          ))}
        </div>

        {filteredProducts.length == 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500 text-sm sm:text-base">
              No products match your filters.
            </p>
            <button
              onClick={clearAllFilters}
              className="mt-2 text-[#1A2B49] underline hover:text-[#0f1a30]"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
