import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Heart,
  Calendar,
  Users,
  Gift,
  X,
  ChevronRight,
} from "lucide-react";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import logoImage from "../../src/img/parivarlogo1.png";
import { Link, useNavigate } from "react-router-dom";

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
        top: "64px",
        left: 0,
        right: "5px",
        bottom: 0,
        background: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        backdropFilter: "blur(10px)",
      }}
    >
      <img
        src={logoImage}
        alt="Rotating Logo"
        style={{
          width: "50px",
          height: "50px",
          animation: "spin 1s linear infinite",
          filter: "drop-shadow(0 0 5px rgba(0, 0, 0, 0.3))",
        }}
      />
    </div>
  );
};

const Donationuser = () => {
  // State definitions
  const [user, setUser] = useState(null);
  const [allDonations, setAllDonations] = useState([]);
  const [donations, setDonations] = useState([]);
  const [donates, setDonates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [donationAmount, setDonationAmount] = useState(10);
  const [activeDonation, setActiveDonation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredSearchResults, setFilteredSearchResults] = useState([]);

  const navigate = useNavigate();

  // Fetch user from local storage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Fetch categories, donations, and donates data
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const comm_id = user.Comm_Id;

        // Fetch categories
        const categoriesResponse = await fetch(
          "https://parivaar.app/public/api/category"
        );
        const categoriesData = await categoriesResponse.json();
        const filteredCategories = categoriesData.filter(
          (category) => category.user.Comm_Id == comm_id
        );
        setCategories(filteredCategories);

        // Fetch donations
        const donationsResponse = await fetch(
          "https://parivaar.app/public/api/donations"
        );
        const donationsData = await donationsResponse.json();
        const filteredDonations = donationsData.data.filter(
          (donation) =>
            donation.user.Comm_Id == comm_id && donation.status == "1"
        );

        // Fetch donates
        const donatesResponse = await fetch(
          "https://parivaar.app/public/api/donates"
        );
        const donatesData = await donatesResponse.json();
        setDonates(donatesData.data);

        // Process donations with category and donor data
        const processedDonations = filteredDonations.map((donation) => {
          const donationDonates = donatesData.data.filter(
            (d) => d.D_id == donation.D_id
          );
          const total_amount_raised = donationDonates.reduce(
            (sum, d) => sum + parseFloat(d.D_amount),
            0
          );
          const uniqueDonors = new Set(donationDonates.map((d) => d.U_ID));
          const number_of_donors = uniqueDonors.size;
          const remaining_amount =
            parseFloat(donation.goal_amount) - total_amount_raised;

          const category = donation.Cat_id
            ? filteredCategories.find((cat) => cat.Cat_id == donation.Cat_id)
                ?.Cat_Name || "Uncategorized"
            : "Uncategorized";

          return {
            id: donation.D_id,
            title: donation.D_name,
            description: donation.D_des,
            category,
            goal: parseFloat(donation.goal_amount),
            mini_amount: parseFloat(donation.mini_amount),
            amountRaised: total_amount_raised,
            donors: number_of_donors,
            remaining: remaining_amount,
            endDate: donation.End_date,
          };
        });

        setAllDonations(processedDonations);
        setDonations(processedDonations); // Set initial donations to all
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Handle search input and filter for dropdown
  useEffect(() => {
    if (searchTerm) {
      const filtered = allDonations.filter(
        (donation) =>
          donation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          donation.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSearchResults(filtered);
    } else {
      setFilteredSearchResults([]);
    }
  }, [searchTerm, allDonations]);

  // Handle category selection
  const toggleCategory = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategories([]);
    setShowFilters(false);
  };

  // Filter donations based on selected categories
  useEffect(() => {
    let filtered = allDonations;

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((donation) =>
        selectedCategories.includes(donation.category)
      );
    }

    setDonations(filtered);
  }, [selectedCategories, allDonations]);

  // Handle donation submission
  const handleDonate = async (id) => {
    const donation = allDonations.find((d) => d.id == id);
    if (!donation) return;

    if (donationAmount < donation.mini_amount) {
      Swal.fire({
        title: "Invalid Amount",
        text: `Minimum donation amount is $${donation.mini_amount}`,
        icon: "error",
        confirmButtonColor: "#1C2D4B",
      });
      return;
    }

    try {
      const postData = {
        D_amount: donationAmount.toFixed(2),
        U_ID: user.U_Id.toString(),
        D_id: id.toString(),
        Date: new Date().toISOString().split("T")[0],
      };

      const response = await fetch("https://parivaar.app/public/api/donates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit donation");
      }

      const newDonate = await response.json();
      setDonates((prevDonates) => {
        const updatedDonates = [...prevDonates, newDonate.data];
        setAllDonations((prevAllDonations) =>
          prevAllDonations.map((d) => {
            if (d.id == id) {
              const donationDonates = updatedDonates.filter(
                (dd) => dd.D_id == d.id
              );
              const total_amount_raised = donationDonates.reduce(
                (sum, dd) => sum + parseFloat(dd.D_amount),
                0
              );
              const uniqueDonors = new Set(
                donationDonates.map((dd) => dd.U_ID)
              );
              const number_of_donors = uniqueDonors.size;
              const remaining_amount = d.goal - total_amount_raised;
              return {
                ...d,
                amountRaised: total_amount_raised,
                donors: number_of_donors,
                remaining: remaining_amount,
              };
            }
            return d;
          })
        );
        return updatedDonates;
      });

      Swal.fire({
        title: "Thank You for Your Generosity!",
        html: `
          <div class="flex flex-col items-center">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <p class="text-lg font-medium">Your donation of $${donationAmount} has been received.</p>
            <p class="text-sm text-gray-600 mt-2">Together we can make a difference!</p>
          </div>
        `,
        confirmButtonText: "Continue Making a Difference",
        confirmButtonColor: "#1C2D4B",
      });

      setDonationAmount(10);
      setActiveDonation(null);
    } catch (error) {
      console.error("Error submitting donation:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to submit donation. Please try again.",
        icon: "error",
        confirmButtonColor: "#1C2D4B",
      });
    }
  };

  // Calculate suggested amounts based on mini_amount
  const getSuggestedAmounts = (mini_amount) => {
    return [
      mini_amount,
      mini_amount + 500,
      mini_amount + 1000,
      mini_amount + 1500,
    ].map((amount) => Math.round(amount));
  };

  // Calculate community stats
  const communityDonates = donates.filter((d) =>
    allDonations.some((donation) => donation.id == d.D_id)
  );
  const totalRaised = communityDonates.reduce(
    (sum, d) => sum + parseFloat(d.D_amount),
    0
  );
  const totalDonors = new Set(communityDonates.map((d) => d.U_ID)).size;
  const numberOfProjects = allDonations.length;

  // Handle dropdown item click
const handleSelectDonation = (donation) => {
  navigate(`/donation/${donation.id}`, { state: { from: "/donation" } });
};

  // Render donation card
  const renderDonationCard = (donation) => {
    const today = new Date();
    const endDate = new Date(donation.endDate);
    const daysLeft = Math.max(
      0,
      Math.ceil((endDate - today) / (1000 * 60 * 60 * 24))
    );

    const suggestedAmounts = getSuggestedAmounts(donation.mini_amount);

    return (
      <motion.div
        key={donation.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden hover:-translate-y-1 hover:shadow-xl"
      >
        <div className="p-6">
          <div className="mb-2">
            <span className="inline-block px-3 py-1 text-xs font-semibold bg-[#1C2D4B] text-white rounded-full">
              {donation.category}
            </span>
          </div>
          <h3 className="text-xl font-bold text-[#1C2D4B] mb-2">
            {donation.title}
          </h3>
          <p className="text-gray-600 text-sm mb-6">{donation.description}</p>

          <div className="grid grid-cols-3 gap-2 mb-6">
            <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
              <Calendar className="h-5 w-5 text-[#1C2D4B] mb-1" />
              <span className="text-xs text-gray-500">Days Left</span>
              <span className="font-bold text-[#1C2D4B]">{daysLeft}</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
              <Users className="h-5 w-5 text-[#1C2D4B] mb-1" />
              <span className="text-xs text-gray-500">Donors</span>
              <span className="font-bold text-[#1C2D4B]">
                {donation.donors}
              </span>
            </div>
            <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
              <Gift className="h-5 w-5 text-[#1C2D4B] mb-1" />
              <span className="text-xs text-gray-500">Goal</span>
              <span className="font-bold text-[#1C2D4B]">
                ${donation.goal.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(
                  100,
                  (donation.amountRaised / donation.goal) * 100
                )}%`,
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="flex justify-between text-sm mb-6">
            <span className="font-bold text-[#1C2D4B]">
              ${donation.amountRaised.toLocaleString()} raised
            </span>
            <span className="text-gray-600">
              {Math.round((donation.amountRaised / donation.goal) * 100)}% of $
              {donation.goal.toLocaleString()}
            </span>
          </div>

          <AnimatePresence>
            {activeDonation == donation.id ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mt-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Amount
                    </label>
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {suggestedAmounts.map((amount) => (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => setDonationAmount(amount)}
                          className={`py-2 px-3 text-sm font-medium rounded-md ${
                            donationAmount == amount
                              ? "bg-[#1C2D4B] text-white"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                          }`}
                        >
                          ${amount}
                        </button>
                      ))}
                    </div>
                    <div className="relative mt-2">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        min={donation.mini_amount}
                        value={donationAmount}
                        onChange={(e) =>
                          setDonationAmount(parseFloat(e.target.value))
                        }
                        className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#1C2D4B] focus:border-[#1C2D4B] sm:text-sm"
                        placeholder="Custom amount"
                      />
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Minimum donation amount is ${donation.mini_amount}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDonate(donation.id)}
                      className="w-full px-4 py-3 text-sm font-bold rounded-md text-white bg-[#1C2D4B] hover:bg-[#2a3d5d]"
                    >
                      Donate Now
                    </button>
                    <button
                      onClick={() => setActiveDonation(null)}
                      className="w-full px-4 py-3 text-sm font-bold rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <button
                onClick={() =>
                  navigate(`/donation/${donation.id}`, {
                    state: { from: "/donation" },
                  })
                }
                className="w-full flex justify-center items-center px-4 py-3 text-sm font-bold rounded-md text-white bg-[#1C2D4B] hover:bg-[#2a3d5d]"
              >
                <Heart className="h-5 w-5 mr-2" />
                View Details
              </button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Loader */}
      {isLoading && <CustomLogoLoader />}

      {/* Hero Section */}
      <div className="container max-w-7xl mx-auto px-6">
        <nav
          className="flex items-center gap-3 mt-8 text-sm font-medium bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-200"
          aria-label="breadcrumb"
        >
          <Link
            to="/home"
            className="text-[#1A2B49] font-bold hover:underline transition-colors duration-200"
          >
            Home
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-[#1A2B49] font-semibold">Donation</span>
        </nav>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-10">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-full bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1C2D4B] focus:border-[#1C2D4B] sm:text-sm"
                placeholder="Search donations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {/* Search Dropdown */}
              {searchTerm && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {filteredSearchResults.length > 0 ? (
                    filteredSearchResults.map((donation) => (
                      <div
                        key={donation.id}
                        onClick={() => handleSelectDonation(donation)}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        <p className="text-sm font-medium text-[#1C2D4B]">
                          {donation.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {donation.description}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500">
                      No match found
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-4 py-2 border border-[#1C2D4B] rounded-full text-sm font-medium text-[#1C2D4B] bg-white hover:bg-gray-50"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter by Category
              </button>
              <button
                onClick={() => navigate("/yourdonation")}
                className="inline-flex items-center px-4 py-2 border border-[#1C2D4B] rounded-full text-sm font-medium text-[#1C2D4B] bg-white hover:bg-gray-50"
              >
                <Gift className="h-4 w-4 mr-2" />
                Donate Your Own
              </button>
              {(searchTerm || selectedCategories.length > 0) && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Category Filters */}
          {showFilters && (
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <h3 className="text-lg font-medium text-[#1C2D4B] mb-3">
                Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.Cat_id}
                    onClick={() => toggleCategory(category.Cat_Name)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedCategories.includes(category.Cat_Name)
                        ? "bg-[#1C2D4B] text-white"
                        : "bg-white text-[#1C2D4B] border border-[#1C2D4B] hover:bg-[#1C2D4B]/10"
                    }`}
                  >
                    {category.Cat_Name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Donation Cards */}
        <AnimatePresence>
          {donations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {donations.map((donation) => renderDonationCard(donation))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center py-16 bg-white rounded-xl shadow"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 text-[#1C2D4B] mb-6">
                <Search className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold text-[#1C2D4B] mb-2">
                No donations found
              </h3>
              <p className="text-gray-500 mb-6">
                Try adjusting your search or filter criteria
              </p>
              <button
                onClick={clearFilters}
                className="px-6 py-3 text-sm font-bold rounded-full text-white bg-[#1C2D4B] hover:bg-[#2a3d5d]"
              >
                Clear Filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Donationuser;
