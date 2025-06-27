import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Gift, ChevronRight } from "lucide-react";
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

const Donationyour = () => {
  const [user, setUser] = useState(null);
  const [donations, setDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();

  // Cache for categories to avoid refetching
  const categoryCache = useMemo(() => new Map(), []);

  // Fetch user from local storage
  const getUser = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        return JSON.parse(storedUser);
      }
      return null;
    } catch (e) {
      console.error("Error retrieving user:", e);
      return null;
    }
  };

  // Fetch donation history
  const fetchDonationHistory = async () => {
    try {
      setIsLoading(true);
      const userData = await getUser();
      if (!userData) {
        setErrorMessage("User not found. Please log in.");
        navigate("/login");
        return;
      }
      setUser(userData);

      const uId = userData.U_Id;
      const commId = userData.Comm_Id;

      // Fetch categories, donations, and donates in parallel
      const [categoriesResponse, donationsResponse, donatesResponse] =
        await Promise.all([
          fetch("https://parivaar.app/public/api/category"),
          fetch("https://parivaar.app/public/api/donations"),
          fetch("https://parivaar.app/public/api/donates"),
        ]);

      if (
        !categoriesResponse.ok ||
        !donationsResponse.ok ||
        !donatesResponse.ok
      ) {
        throw new Error(
          `API failed: Categories(${categoriesResponse.status}), Donations(${donationsResponse.status}), Donates(${donatesResponse.status})`
        );
      }

      const [categoriesData, donationsData, donatesData] = await Promise.all([
        categoriesResponse.json(),
        donationsResponse.json(),
        donatesResponse.json(),
      ]);

      // Process categories
      const filteredCategories = categoriesData.filter(
        (category) => category.user.Comm_Id == commId
      );
      const categoryMap = new Map(
        filteredCategories.map((cat) => [cat.Cat_id, cat.Cat_Name])
      );
      categoryCache.set(commId, categoryMap);

      // Process donates
      const donates = Array.isArray(donatesData.data) ? donatesData.data : [];
      const donations = Array.isArray(donationsData.data)
        ? donationsData.data
        : [];

      const donationTotals = donates.reduce((acc, item) => {
        const dId =
          typeof item.D_id === "number"
            ? item.D_id
            : parseInt(item.D_id, 10) || -1;
        const amount =
          typeof item.D_amount === "number"
            ? item.D_amount
            : parseFloat(item.D_amount) || 0;
        if (dId !== -1) {
          acc.set(dId, (acc.get(dId) || 0) + amount);
        }
        return acc;
      }, new Map());
      // Filter user-specific donations
      const filteredHistory = donates
        .filter((item) => item.U_ID?.toString() === uId.toString())
        .map((item) => {
          const dId =
            typeof item.D_id === "number"
              ? item.D_id
              : parseInt(item.D_id, 10) || -1;
          const donationDetails = donations.find((d) => {
            const id =
              typeof d.D_id === "number" ? d.D_id : parseInt(d.D_id, 10) || -1;
            return id === dId && d.user.Comm_Id == commId && d.status === "1";
          });

          if (!donationDetails) return null;

          const category = donationDetails.Cat_id
            ? categoryMap.get(donationDetails.Cat_id) || "Uncategorized"
            : "Uncategorized";

          const totalAmount = donationTotals.get(dId) || 0;

          return {
            id: dId,
            title: donationDetails.D_name,
            description: donationDetails.D_des,
            category,
            goal: parseFloat(donationDetails.goal_amount) || 0,
            amountDonated: parseFloat(item.D_amount) || 0,
            donationDate: item.Date,
            endDate: donationDetails.End_date,
            currentAmount: totalAmount,
            progressPercentage: Math.min(
              (totalAmount / (parseFloat(donationDetails.goal_amount) || 1)) *
                100,
              100
            ).toFixed(1),
          };
        })
        .filter((item) => item !== null);

      setDonations(filteredHistory);
      setIsLoading(false);
    } catch (e) {
      setErrorMessage(`Error: ${e.message}`);
      console.error("Error fetching donation history:", e);
      Swal.fire({
        title: "Error",
        text: "Failed to load your donations. Please try again.",
        icon: "error",
        confirmButtonColor: "#1C2D4B",
      });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDonationHistory();
  }, []);

  // Render donation card
  const renderDonationCard = (donation) => {
    const today = new Date();
    const endDate = new Date(donation.endDate);
    const daysLeft = Math.max(
      0,
      Math.ceil((endDate - today) / (1000 * 60 * 60 * 24))
    );

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

          <div className="grid grid-cols-2 gap-2 mb-6">
            <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
              <Calendar className="h-5 w-5 text-[#1C2D4B] mb-1" />
              <span className="text-xs text-gray-500">Days Left</span>
              <span className="font-bold text-[#1C2D4B]">{daysLeft}</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
              <Gift className="h-5 w-5 text-[#1C2D4B] mb-1" />
              <span className="text-xs text-gray-500">Your Donation</span>
              <span className="font-bold text-[#1C2D4B]">
                ₹{donation.amountDonated.toLocaleString()}
              </span>
            </div>
          </div>

          <Link
            to={`/donation/${donation.id}`}
            state={{ from: "/yourdonation" }} // Added state
            className="w-full flex justify-center items-center px-4 py-3 text-sm font-bold rounded-md text-white bg-[#1C2D4B] hover:bg-[#2a3d5d]"
          >
            View Donation Details
          </Link>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {isLoading && <CustomLogoLoader />}
      <div className="container max-w-7xl mx-auto px-6 py-12">
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
          <Link
            to="/donation"
            className="text-[#1A2B49] font-bold hover:underline transition-colors duration-200"
          >
            Donation
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-[#1A2B49] font-semibold">Your Donations</span>
        </nav>

        <div className="mt-8">
          <Link
            to="/donation"
            className="inline-flex items-center px-4 py-2 mb-6 text-sm font-medium text-[#1C2D4B] bg-white border border-[#1C2D4B] rounded-full hover:bg-gray-50"
          >
            Back to Donations
          </Link>
          {errorMessage ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center py-16 bg-white rounded-xl shadow"
            >
              <h3 className="text-xl font-bold text-[#1C2D4B] mb-2">Error</h3>
              <p className="text-gray-500 mb-6">{errorMessage}</p>
              <button
                onClick={() => {
                  setIsLoading(true);
                  setErrorMessage(null);
                  fetchDonationHistory();
                }}
                className="px-6 py-3 text-sm font-bold rounded-full text-white bg-[#1C2D4B] hover:bg-[#2a3d5d]"
              >
                Retry
              </button>
            </motion.div>
          ) : donations.length > 0 ? (
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
              <h3 className="text-xl font-bold text-[#1C2D4B] mb-2">
                No Donations Found
              </h3>
              <p className="text-gray-500 mb-6">
                You haven't made any donations yet.
              </p>
              <Link
                to="/donation"
                className="px-6 py-3 text-sm font-bold rounded-full text-white bg-[#1C2D4B] hover:bg-[#2a3d5d]"
              >
                Explore Donations
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Donationyour;
