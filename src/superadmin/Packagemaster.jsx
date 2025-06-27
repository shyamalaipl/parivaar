import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Plus,
  X,
  ChevronDown,
  Check,
  CheckCircle,
  Eye,
} from "lucide-react";
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
        background: "rgba(0, 0, 0, 0.5)",
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

const Packagemaster = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    packageName: "",
    description: "",
    status: "A",
    maxUsers: "",
    features: [],
    durationType: "",
    durationValue: "",
    selectedDiscount: "",
    discountMerge: false,
    priceType: "",
  });

  const [filters, setFilters] = useState({
    search: "",
    duration: "",
    priceRange: "",
  });

  const [packages, setPackages] = useState([]);
  const [featuresList, setFeaturesList] = useState([]);
  const [durationTypes, setDurationTypes] = useState([]);
  const [discountsList, setDiscountsList] = useState([]);
  const [priceTypes, setPriceTypes] = useState([]);

  // Fetch all necessary data
  const fetchPackages = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("https://parivaar.app/public/api/packages");
      const result = await response.json();
      if (result.status) {
        setPackages(result.data);
        setError(null);
      } else {
        throw new Error("Failed to fetch packages");
      }
    } catch (err) {
      setError("Failed to fetch packages");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFeatures = async () => {
    try {
      const response = await fetch(
        "https://parivaar.app/public/api/package-features"
      );
      const data = await response.json();
      setFeaturesList(data);
    } catch (err) {
      setError("Failed to fetch features");
    }
  };

  const fetchDurationTypes = async () => {
    try {
      const response = await fetch(
        "https://parivaar.app/public/api/duration-types"
      );
      const data = await response.json();
      setDurationTypes(data);
    } catch (err) {
      setError("Failed to fetch duration types");
    }
  };

  const fetchDiscounts = async () => {
    try {
      const response = await fetch(
        "https://parivaar.app/public/api/discount-masters"
      );
      const data = await response.json();
      setDiscountsList(data);
    } catch (err) {
      setError("Failed to fetch discounts");
    }
  };

  const fetchPriceTypes = async () => {
    try {
      const response = await fetch(
        "https://parivaar.app/public/api/price-type-values"
      );
      const data = await response.json();
      setPriceTypes(data);
    } catch (err) {
      setError("Failed to fetch price types");
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchPackages();
    fetchFeatures();
    fetchDurationTypes();
    fetchDiscounts();
    fetchPriceTypes();
  }, []);

  const toggleFeature = (featureId) => {
    setFormData((prev) => {
      if (prev.features.includes(featureId)) {
        return {
          ...prev,
          features: prev.features.filter((f) => f !== featureId),
        };
      } else {
        return { ...prev, features: [...prev.features, featureId] };
      }
    });
  };

  const selectAllFeatures = () => {
    if (formData.features.length == featuresList.length) {
      setFormData((prev) => ({ ...prev, features: [] }));
    } else {
      setFormData((prev) => ({
        ...prev,
        features: featuresList.map((f) => f.Package_Fea_Id),
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type == "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.packageName ||
      !formData.durationType ||
      !formData.durationValue ||
      !formData.priceType
    ) {
      setError("Please fill all required fields");
      return;
    }

    setIsLoading(true);
    try {
      const url = isEditMode
        ? `https://parivaar.app/public/api/packages/${currentId}`
        : "https://parivaar.app/public/api/packages";
      const method = isEditMode ? "PUT" : "POST";

      const payload = {
        PackageName: formData.packageName,
        Description: formData.description || null,
        Status: isEditMode && formData.status == "I" ? "D" : formData.status,
        MaxUsers: formData.maxUsers || null,
        DT_Id: formData.durationType,
        Duration_Value: formData.durationValue,
        D_Id: formData.selectedDiscount || null,
        Dis_Merge: formData.discountMerge ? 1 : 0,
        PVT_Id: formData.priceType,
        Fea_Id: formData.features,
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Operation failed");
      }

      await fetchPackages();
      setIsModalOpen(false);
      setFormData({
        packageName: "",
        description: "",
        status: "A",
        maxUsers: "",
        features: [],
        durationType: "",
        durationValue: "",
        selectedDiscount: "",
        discountMerge: false,
        priceType: "",
      });
      setIsEditMode(false);
      setCurrentId(null);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to save package");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (pkg) => {
    setFormData({
      packageName: pkg.PackageName,
      description: pkg.Description || "",
      status: pkg.Status,
      maxUsers: pkg.MaxUsers || "",
      features: pkg.features.map((f) => f.Package_Fea_Id),
      durationType: pkg.DT_Id.toString(),
      durationValue: pkg.Duration_Value.toString(),
      selectedDiscount: pkg.D_Id ? pkg.D_Id.toString() : "",
      discountMerge: pkg.Dis_Merge == 1,
      priceType: pkg.PVT_Id.toString(),
    });
    setIsEditMode(true);
    setCurrentId(pkg.PackageId);
    setIsModalOpen(true);
  };

  const handleViewDetails = (pkg) => {
    setSelectedPackage(pkg);
    setIsDetailModalOpen(true);
  };

  const handleDelete = async (id) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://parivaar.app/public/api/packages/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete");

      await fetchPackages();
      setError(null);
    } catch (err) {
      setError("Failed to delete package");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch = pkg.PackageName.toLowerCase().includes(
      filters.search.toLowerCase()
    );
    const matchesDuration =
      !filters.duration ||
      pkg.duration_type?.Dur_Type.toLowerCase().includes(
        filters.duration.toLowerCase()
      );
    const matchesPrice =
      !filters.priceRange ||
      (filters.priceRange == "0-1000"
        ? pkg.Final_Price <= 1000
        : filters.priceRange == "1001-2000"
        ? pkg.Final_Price > 1000 && pkg.Final_Price <= 2000
        : filters.priceRange == "2001+"
        ? pkg.Final_Price > 2000
        : true);
    return matchesSearch && matchesDuration && matchesPrice;
  });

  // Calculate pricing details for preview
  const calculatePricingDetails = () => {
    let price = 0;
    let discount = 0;
    let maintenance = 0;
    let finalAmount = 0;

    // Get price from priceType
    if (formData.priceType) {
      const priceType = priceTypes.find(
        (p) => p.PVT_Id.toString() == formData.priceType
      );
      price = priceType ? parseFloat(priceType.Price_Value) : 0;
    }

    // Get discount amount
    if (formData.selectedDiscount) {
      const discountObj = discountsList.find(
        (d) => d.D_Id.toString() == formData.selectedDiscount
      );
      discount = discountObj ? parseFloat(discountObj.Dic_Value) : 0;
    }

    // Calculate maintenance (assuming 10% of price after discount)
    const priceAfterDiscount = price - discount;
    // maintenance = priceAfterDiscount * 0.1;

    // Calculate final amount
    finalAmount = priceAfterDiscount - maintenance;

    return { price, discount, maintenance, finalAmount };
  };

  const pricingDetails = calculatePricingDetails();

  return (
    <div className="min-h-screen bg-white text-[#172030] p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#172030] to-[#364154] bg-clip-text text-transparent">
          Package Master
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#172030] hover:bg-[#2a3547] text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 transform hover:scale-105 shadow-lg"
          disabled={isLoading}
        >
          <Plus size={20} />
          Create Package
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="text-gray-400" size={20} />
            </div>
            <input
              type="text"
              placeholder="Search packages..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#172030] focus:border-transparent transition-all duration-300"
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />
          </div>
          <div className="relative">
            <select
              className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-[#172030] focus:border-transparent transition-all duration-300"
              value={filters.duration}
              onChange={(e) =>
                setFilters({ ...filters, duration: e.target.value })
              }
            >
              <option value="">All Durations</option>
              <option value="Day">Daily</option>
              <option value="Month">Monthly</option>
              <option value="Year">Yearly</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <ChevronDown className="text-gray-400" size={20} />
            </div>
          </div>
          <div className="relative">
            <select
              className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-[#172030] focus:border-transparent transition-all duration-300"
              value={filters.priceRange}
              onChange={(e) =>
                setFilters({ ...filters, priceRange: e.target.value })
              }
            >
              <option value="">All Prices</option>
              <option value="0-1000">₹0 - ₹1000</option>
              <option value="1001-2000">₹1001 - ₹2000</option>
              <option value="2001+">₹2001+</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <Filter className="text-gray-400" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      {isLoading ? (
        <CustomLogoLoader />
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <table className="w-full">
            <thead className="bg-[#172030]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                  Package ID
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                  Package Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPackages.map((pkg) => (
                <tr
                  key={pkg.PackageId}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {pkg.PackageId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {pkg.PackageName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {pkg.Duration_Value} {pkg.duration_type?.Dur_Type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    ₹{parseFloat(pkg.Final_Price).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        pkg.Status == "A"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {pkg.Status == "A" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleViewDetails(pkg)}
                      className="text-gray-600 hover:text-gray-800 font-medium mr-4 transition-colors"
                      disabled={isLoading}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleEdit(pkg)}
                      className="text-blue-600 hover:text-blue-800 font-medium mr-4 transition-colors"
                      disabled={isLoading}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(pkg.PackageId)}
                      className="text-red-600 hover:text-red-800 font-medium transition-colors"
                      disabled={isLoading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-18 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
              <div className="flex">
                {/* Left Side - Form */}
                <div className="w-1/2 p-5 flex flex-col h-[90vh]">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-[#172030]">
                      {isEditMode ? "Edit Package" : "Create New Package"}
                    </h3>
                    <button
                      onClick={() => {
                        setIsModalOpen(false);
                        setIsEditMode(false);
                        setFormData({
                          packageName: "",
                          description: "",
                          status: "A",
                          maxUsers: "",
                          features: [],
                          durationType: "",
                          durationValue: "",
                          selectedDiscount: "",
                          discountMerge: false,
                          priceType: "",
                        });
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X size={24} />
                    </button>
                  </div>
                  <form
                    onSubmit={handleSubmit}
                    className="flex-1 overflow-y-auto space-y-6 px-3"
                  >
                    {/* Package Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Package Name
                      </label>
                      <input
                        type="text"
                        name="packageName"
                        value={formData.packageName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#172030] focus:border-transparent transition-all duration-300"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#172030] focus:border-transparent transition-all duration-300"
                        disabled={isLoading}
                      />
                    </div>
                    {/* Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <div className="flex space-x-6">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="status"
                            value="A"
                            checked={formData.status == "A"}
                            onChange={handleInputChange}
                            className="text-[#172030] focus:ring-[#172030]"
                            disabled={isLoading}
                          />
                          <span className="ml-2">Active</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="status"
                            value="I"
                            checked={formData.status == "I"}
                            onChange={handleInputChange}
                            className="text-[#172030] focus:ring-[#172030]"
                            disabled={isLoading}
                          />
                          <span className="ml-2">Inactive</span>
                        </label>
                      </div>
                    </div>
                    {/* Max Users */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Users
                      </label>
                      <input
                        type="number"
                        name="maxUsers"
                        value={formData.maxUsers}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#172030] focus:border-transparent transition-all duration-300"
                        disabled={isLoading}
                      />
                    </div>
                    {/* Features */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Features Include
                      </label>
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                        <button
                          type="button"
                          onClick={selectAllFeatures}
                          className="text-[#172030] text-sm flex items-center mb-3 hover:text-gray-600 transition-colors"
                          disabled={isLoading}
                        >
                          <Check size={16} className="mr-2" />
                          Select All
                        </button>
                        <div className="grid grid-cols-2 gap-3">
                          {featuresList.map((feature) => (
                            <label
                              key={feature.Package_Fea_Id}
                              className="inline-flex items-center"
                            >
                              <input
                                type="checkbox"
                                checked={formData.features.includes(
                                  feature.Package_Fea_Id
                                )}
                                onChange={() =>
                                  toggleFeature(feature.Package_Fea_Id)
                                }
                                className="text-[#172030] rounded border-gray-300 focus:ring-[#172030]"
                                disabled={isLoading}
                              />
                              <span className="ml-2 text-sm">
                                {feature.Package_Fea_Name}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* Duration Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration Type
                      </label>
                      <select
                        name="durationType"
                        value={formData.durationType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#172030] focus:border-transparent transition-all duration-300"
                        required
                        disabled={isLoading}
                      >
                        <option value="">Select Duration Type</option>
                        {durationTypes.map((type) => (
                          <option key={type.DT_Id} value={type.DT_Id}>
                            {type.Dur_Type}
                          </option>
                        ))}
                      </select>
                    </div>
                    {/* Duration Value */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration Value
                      </label>
                      <input
                        type="number"
                        name="durationValue"
                        value={formData.durationValue}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#172030] focus:border-transparent transition-all duration-300"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    {/* Discounts */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Discount
                      </label>
                      <select
                        name="selectedDiscount"
                        value={formData.selectedDiscount}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#172030] focus:border-transparent transition-all duration-300"
                        disabled={isLoading}
                      >
                        <option value="">No Discount</option>
                        {discountsList.map((discount) => (
                          <option key={discount.D_Id} value={discount.D_Id}>
                            {discount.D_Name} (
                            {discount.discount_type.Type_Name} -{" "}
                            {discount.discount_value_type.VT_Name}: ₹
                            {discount.Dic_Value})
                          </option>
                        ))}
                      </select>
                    </div>
                    {/* Discount Merge */}
                    <div>
                      {/* <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          name="discountMerge"
                          checked={formData.discountMerge}
                          onChange={handleInputChange}
                          className="text-[#172030] rounded border-gray-300 focus:ring-[#172030]"
                          disabled={isLoading}
                        />
                        <span className="ml-2 text-sm font-medium">Discount Merge</span>
                      </label> */}
                    </div>
                    {/* Price Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price Type
                      </label>
                      <select
                        name="priceType"
                        value={formData.priceType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#172030] focus:border-transparent transition-all duration-300"
                        required
                        disabled={isLoading}
                      >
                        <option value="">Select Price Type</option>
                        {priceTypes.map((type) => (
                          <option key={type.PVT_Id} value={type.PVT_Id}>
                            ₹{type.Price_Value}
                          </option>
                        ))}
                      </select>
                    </div>
                  </form>
                  {/* Form Actions */}
                  <div className="flex justify-end space-x-4 pt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setIsEditMode(false);
                        setFormData({
                          packageName: "",
                          description: "",
                          status: "A",
                          maxUsers: "",
                          features: [],
                          durationType: "",
                          durationValue: "",
                          selectedDiscount: "",
                          discountMerge: false,
                          priceType: "",
                        });
                      }}
                      className="px-6 py-3 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all duration-300"
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-[#172030] text-white rounded-xl text-sm font-medium hover:bg-[#2a3547] transition-all duration-300"
                      onClick={handleSubmit}
                      disabled={isLoading}
                    >
                      {isLoading
                        ? "Saving..."
                        : isEditMode
                        ? "Update Package"
                        : "Save Package"}
                    </button>
                  </div>
                </div>
                {/* Right Side - Preview */}
                <div className="w-1/2 p-8 bg-gray-50 border-l border-gray-200">
                  <div className="h-full flex flex-col">
                    <h4 className="font-medium text-lg mb-4">
                      Package Preview
                    </h4>
                    <div className="bg-[#172030] p-6 rounded-xl text-white flex-1">
                      {formData.packageName ? (
                        <>
                          <div className="font-bold text-xl mb-3">
                            {formData.packageName}
                          </div>
                          {formData.description && (
                            <p className="text-gray-300 mb-4">
                              {formData.description}
                            </p>
                          )}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-300">Status</span>
                              <span
                                className={`${
                                  formData.status == "A"
                                    ? "text-green-400"
                                    : "text-red-400"
                                }`}
                              >
                                {formData.status == "A" ? "Active" : "Inactive"}
                              </span>
                            </div>
                            {formData.maxUsers && (
                              <div className="flex justify-between items-center">
                                <span className="text-gray-300">Max Users</span>
                                <span>{formData.maxUsers}</span>
                              </div>
                            )}
                            {formData.durationType &&
                              formData.durationValue && (
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-300">
                                    Duration
                                  </span>
                                  <span>
                                    {formData.durationValue}{" "}
                                    {
                                      durationTypes.find(
                                        (t) =>
                                          t.DT_Id.toString() ==
                                          formData.durationType
                                      )?.Dur_Type
                                    }
                                  </span>
                                </div>
                              )}
                            {formData.priceType && (
                              <>
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-300">Price</span>
                                  <span>
                                    ₹{pricingDetails.price.toLocaleString()}
                                  </span>
                                </div>
                                {formData.selectedDiscount && (
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-300">
                                      Discount
                                    </span>
                                    <span>
                                      -₹
                                      {pricingDetails.discount.toLocaleString()}
                                    </span>
                                  </div>
                                )}
                                {/* <div className="flex justify-between items-center">
                                  <span className="text-gray-300">Maintenance</span>
                                  <span>-₹{pricingDetails.maintenance.toLocaleString()}</span>
                                </div> */}
                                <div className="flex justify-between items-center font-bold">
                                  <span className="text-gray-300">
                                    Final Amount
                                  </span>
                                  <span>
                                    ₹
                                    {pricingDetails.finalAmount.toLocaleString()}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                          {formData.features.length > 0 && (
                            <div className="mt-4">
                              <div className="text-gray-300 mb-2">Features</div>
                              <div className="grid grid-cols-2 gap-2">
                                {formData.features.map((featureId) => {
                                  const feature = featuresList.find(
                                    (f) => f.Package_Fea_Id == featureId
                                  );
                                  return (
                                    <div
                                      key={featureId}
                                      className="flex items-center text-sm"
                                    >
                                      <Check
                                        className="text-green-400 mr-2"
                                        size={14}
                                      />
                                      <span>{feature?.Package_Fea_Name}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-gray-400 text-center py-8">
                          Package details will appear here
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {isDetailModalOpen && selectedPackage && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-18 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75 backdrop-blur-sm"
              onClick={() => setIsDetailModalOpen(false)}
            />
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-[#172030]">
                    {selectedPackage.PackageName} Details
                  </h3>
                  <button
                    onClick={() => setIsDetailModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="font-medium text-gray-700">
                      Package Name:{" "}
                    </span>
                    <span>{selectedPackage.PackageName}</span>
                  </div>
                  {selectedPackage.Description && (
                    <div>
                      <span className="font-medium text-gray-700">
                        Description:{" "}
                      </span>
                      <span>{selectedPackage.Description}</span>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-gray-700">Status: </span>
                    <span>
                      {selectedPackage.Status == "A" ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Max Users:{" "}
                    </span>
                    <span>{selectedPackage.MaxUsers || "N/A"}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Duration:{" "}
                    </span>
                    <span>
                      {selectedPackage.Duration_Value}{" "}
                      {selectedPackage.duration_type?.Dur_Type}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Total Duration:{" "}
                    </span>
                    <span>{selectedPackage.Total_Duration}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Final Price:{" "}
                    </span>
                    <span>₹{selectedPackage.Final_Price}</span>
                  </div>
                  {selectedPackage.discount_master && (
                    <div>
                      <span className="font-medium text-gray-700">
                        Discount:{" "}
                      </span>
                      <span>
                        {selectedPackage.discount_master.D_Name} (₹
                        {selectedPackage.discount_master.Dic_Value})
                      </span>
                    </div>
                  )}
                  {/* <div>
                    <span className="font-medium text-gray-700">Discount Merge: </span>
                    <span>{selectedPackage.Dis_Merge == 1 ? 'Yes' : 'No'}</span>
                  </div> */}
                  <div>
                    <span className="font-medium text-gray-700">
                      Price Type:{" "}
                    </span>
                    <span>₹{selectedPackage.price_type.Price_Value}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Features:{" "}
                    </span>
                    <ul className="list-disc pl-5">
                      {selectedPackage.features.map((feature) => (
                        <li key={feature.Package_Fea_Id}>
                          {feature.Package_Fea_Name}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Created At:{" "}
                    </span>
                    <span>
                      {new Date(selectedPackage.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Updated At:{" "}
                    </span>
                    <span>
                      {new Date(selectedPackage.updated_at).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setIsDetailModalOpen(false)}
                    className="px-6 py-3 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all duration-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Packagemaster;
