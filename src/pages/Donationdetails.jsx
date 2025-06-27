import { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom"; // Added useLocation
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Calendar, Users, Gift, ChevronRight } from "lucide-react";
import Swal from "sweetalert2";

const Donationdetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // Added to track navigation history
  const [donation, setDonation] = useState(null);
  const [user, setUser] = useState(null);
  const [donates, setDonates] = useState([]);
  const [donationAmount, setDonationAmount] = useState(10);
  const [activeDonation, setActiveDonation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Determine the back navigation path
  const backPath = location.state?.from === "/yourdonation" ? "/yourdonation" : "/donation";

  // Fetch user from local storage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Fetch donation and donates data
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const comm_id = user.Comm_Id;

        // Fetch categories
        const categoriesResponse = await fetch("https://parivaar.app/public/api/category");
        const categoriesData = await categoriesResponse.json();
        const filteredCategories = categoriesData.filter(
          (category) => category.user.Comm_Id == comm_id
        );

        // Fetch donations
        const donationsResponse = await fetch("https://parivaar.app/public/api/donations");
        const donationsData = await donationsResponse.json();
        const filteredDonations = donationsData.data.filter(
          (donation) => donation.user.Comm_Id == comm_id && donation.status == "1"
        );

        // Fetch donates
        const donatesResponse = await fetch("https://parivaar.app/public/api/donates");
        const donatesData = await donatesResponse.json();
        setDonates(donatesData.data);

        // Process the specific donation
        const selectedDonation = filteredDonations.find(
          (d) => d.D_id == id
        );

        if (!selectedDonation) {
          throw new Error("Donation not found");
        }

        const donationDonates = donatesData.data.filter(
          (d) => d.D_id == selectedDonation.D_id
        );
        const total_amount_raised = donationDonates.reduce(
          (sum, d) => sum + parseFloat(d.D_amount),
          0
        );
        const uniqueDonors = new Set(donationDonates.map((d) => d.U_ID));
        const number_of_donors = uniqueDonors.size;
        const remaining_amount = parseFloat(selectedDonation.goal_amount) - total_amount_raised;

        const category = selectedDonation.Cat_id
          ? filteredCategories.find((cat) => cat.Cat_id == selectedDonation.Cat_id)?.Cat_Name || "Uncategorized"
          : "Uncategorized";

        const processedDonation = {
          id: selectedDonation.D_id,
          title: selectedDonation.D_name,
          description: selectedDonation.D_des,
          category,
          goal: parseFloat(selectedDonation.goal_amount),
          mini_amount: parseFloat(selectedDonation.mini_amount),
          amountRaised: total_amount_raised,
          donors: number_of_donors,
          remaining: remaining_amount,
          endDate: selectedDonation.End_date,
        };

        setDonation(processedDonation);
        setDonationAmount(processedDonation.mini_amount);
      } catch (error) {
        console.error("Error fetching donation details:", error);
        Swal.fire({
          title: "Error",
          text: "Failed to load donation details. Please try again.",
          icon: "error",
          confirmButtonColor: "#1C2D4B",
        });
        navigate("/donation"); // Redirect back to donations list on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, id, navigate]);

  // Handle donation submission
  const handleDonate = async (id) => {
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
        const donationDonates = updatedDonates.filter(
          (d) => d.D_id == donation.id
        );
        const total_amount_raised = donationDonates.reduce(
          (sum, d) => sum + parseFloat(d.D_amount),
          0
        );
        const uniqueDonors = new Set(donationDonates.map((d) => d.U_ID));
        const number_of_donors = uniqueDonors.size;
        const remaining_amount = donation.goal - total_amount_raised;

        setDonation({
          ...donation,
          amountRaised: total_amount_raised,
          donors: number_of_donors,
          remaining: remaining_amount,
        });

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

      setDonationAmount(donation.mini_amount);
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

  // Calculate suggested amounts
  const getSuggestedAmounts = (mini_amount) => {
    return [
      mini_amount,
      mini_amount + 500,
      mini_amount + 1000,
      mini_amount + 1500,
    ].map(amount => Math.round(amount));
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
          <p className="text-gray-600 text-sm mb-6">
            {donation.description}
          </p>

          <div className="grid grid-cols-3 gap-2 mb-6">
            <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
              <Calendar className="h-5 w-5 text-[#1C2D4B] mb-1" />
              <span className="text-xs text-gray-500">Days Left</span>
              <span className="font-bold text-[#1C2D4B]">{daysLeft}</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
              <Users className="h-5 w-5 text-[#1C2D4B] mb-1" />
              <span className="text-xs text-gray-500">Donors</span>
              <span className="font-bold text-[#1C2D4B]">{donation.donors}</span>
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
              {Math.round((donation.amountRaised / donation.goal) * 100)}%
              of ${donation.goal.toLocaleString()}
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
                        onChange={(e) => setDonationAmount(parseFloat(e.target.value))}
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
                onClick={() => {
                  setActiveDonation(donation.id);
                  setDonationAmount(donation.mini_amount);
                }}
                className="w-full flex justify-center items-center px-4 py-3 text-sm font-bold rounded-md text-white bg-[#1C2D4B] hover:bg-[#2a3d5d]"
              >
                <Heart className="h-5 w-5 mr-2" />
                Contribute Now
              </button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  };

  if (isLoading) {
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1C2D4B]"></div>
      </div>
    );
  }

  if (!donation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center py-16 bg-white rounded-xl shadow">
          <h3 className="text-xl font-bold text-[#1C2D4B] mb-2">
            Donation Not Found
          </h3>
          <p className="text-gray-500 mb-6">
            The requested donation could not be found.
          </p>
          <Link
            to={backPath} // Updated to use dynamic backPath
            className="px-6 py-3 text-sm font-bold rounded-full text-white bg-[#1C2D4B] hover:bg-[#2a3d5d]"
          >
            Back to Donations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-7xl mx-auto px-6 py-12">
        <nav
          className="flex items-center gap-3 mt-8 text-sm font-medium bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-200"
          aria-label="breadcrumb"
        >
          <Link to="/home" className="text-[#1A2B49] font-bold hover:underline transition-colors duration-200">
            Home
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <Link to={backPath} className="text-[#1A2B49] font-bold hover:underline transition-colors duration-200">
            Donation
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-[#1A2B49] font-semibold">{donation.title}</span>
        </nav>

        <div className="mt-8">
          <Link
            to={backPath} // Updated to use dynamic backPath
            className="inline-flex items-center px-4 py-2 mb-6 text-sm font-medium text-[#1C2D4B] bg-white border border-[#1C2D4B] rounded-full hover:bg-gray-50"
          >
            Back to Donations
          </Link>
          <div className="grid grid-cols-1 gap-8">
            {renderDonationCard(donation)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donationdetails;