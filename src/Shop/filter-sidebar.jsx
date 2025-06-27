import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, ChevronUp } from "lucide-react";

const FilterSidebar = React.forwardRef(({ isOpen, onClose, products, setFilteredProducts }, ref) => {
  const [expandedSections, setExpandedSections] = React.useState({
    categories: true,
    price: true,
  });

  const [priceRange, setPriceRange] = React.useState([0, 100000]);
  const [selectedCategories, setSelectedCategories] = React.useState([]);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const categories = [
    "Electronics",
    "Furniture",
    "Clothes",
    "Footwear",
    "Books",
    "Vehicles",
    "Real Estate",
    "Toys",
    "Sports",
    "Fitness",
    "Handicrafts",
    "Others"
  ];

  const handleCategoryChange = (category) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const handlePriceChange = (e, index) => {
    const value = parseInt(e.target.value);
    const newPriceRange = [...priceRange];
    newPriceRange[index] = value;
    setPriceRange(newPriceRange);
  };

  const applyFilters = () => {
    let filtered = [...products];
    
    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product => 
        selectedCategories.includes(product.category)
      );
    }
    
    // Apply price filter
    filtered = filtered.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );
    
    setFilteredProducts(filtered);
    onClose();
  };

  const resetFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 100000]);
    setFilteredProducts(products);
  };

  // Expose resetFilters to parent via ref
  React.useImperativeHandle(ref, () => ({
    resetFilters
  }));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ type: "spring", damping: 20 }}
          className="fixed left-0 top-16 h-full w-80 bg-[white] shadow-xl z-50 overflow-y-auto"
        >
          <div className="p-4  ">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl text-[#1A2B49] font-semibold">Filters</h2>
              <button onClick={onClose} className="p-1">
                <X className="h-6 cursor-pointer w-5" />
              </button>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <button
                onClick={() => toggleSection("categories")}
                className="flex justify-between items-center w-full mb-2"
              >
                <h3 className="text-lg text-[#1A2B49] font-medium">Categories</h3>
                {expandedSections.categories ? <ChevronUp className="cursor-pointer" size={20} /> : <ChevronDown className="cursor-pointer" size={20} />}
              </button>
              {expandedSections.categories && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {categories.map((category) => (
                    <div key={category} className="flex justify-between items-center">
                      <label className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          className="rounded"
                          checked={selectedCategories.includes(category)}
                          onChange={() => handleCategoryChange(category)}
                        />
                        <span>{category}</span>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Price Filter */}
            <div className="mb-6">
              <button onClick={() => toggleSection("price")} className="flex justify-between items-center w-full mb-2">
                <h3 className="text-lg font-medium text-[#1A2B49]">Price Range</h3>
                {expandedSections.price ? <ChevronUp className="cursor-pointer" size={20} /> : <ChevronDown className="cursor-pointer" size={20} />}
              </button>
              {expandedSections.price && (
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => handlePriceChange(e, 0)}
                      className="w-24 p-1 border rounded"
                      placeholder="Min"
                    />
                    <span className="self-center">to</span>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => handlePriceChange(e, 1)}
                      className="w-24 p-1 border rounded"
                      placeholder="Max"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-8">
              <button 
                onClick={() => {
                  resetFilters();
                  onClose();
                }}
                className="flex-1 py-2 px-4 border border-[#1A2B49] text-[#1A2B49] rounded hover:bg-gray-100"
              >
                Reset
              </button>
              <button 
                onClick={applyFilters}
                className="flex-1 py-2 px-4 bg-[#1A2B49] text-white rounded hover:bg-[#0f1a30]"
              >
                Apply
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default FilterSidebar;