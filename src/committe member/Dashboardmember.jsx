import { useState, useEffect, useRef } from "react";
import {
  Users,
  Newspaper,
  BadgeCheck,
  ShoppingBag,
  PartyPopper,
  TrendingUp,
  Bell,
  Calendar,
  ChevronRight,
  Crown,
  Shield,
  Settings,
  UserCheck,
  CheckCircle,
  MoreHorizontal,
  HelpCircle,
  Zap,
  ImageIcon,
  Menu,
  X,
  CircleChevronLeft,
  CircleChevronRight,
  Home,
  Plus,
  HandCoins,
  Check,
} from "lucide-react";
import logoImage from "../../src/img/parivarlogo1.png";
import { ImSad } from "react-icons/im";
import Swal from "sweetalert2";

// Custom Loader Component
const CustomLoader = () => {
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
          width: "50px",
          height: "50px",
          animation: "spin 1s linear infinite",
          filter: "drop-shadow(0 0 5px rgba(0, 0, 0, 0.3))",
        }}
      />
    </div>
  );
};

// Subscription Plan Card Component
const SubscriptionPlanCard = ({ plan, isActive, onUpgrade, onClick }) => {
  return (
    <div
      className={`rounded-xl border p-6 transition-all duration-300 cursor-pointer ${
        isActive
          ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-md"
          : "bg-white border-gray-200 hover:border-blue-200 hover:shadow-md"
      }`}
      onClick={() => onClick(plan)}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800">
            {plan.PackageName}
          </h3>
          <p className="text-sm text-gray-600">
            {plan.Description || "No description available"}
          </p>
        </div>
        <div
          className={`p-2 rounded-full ${
            isActive ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
          }`}
        >
          {isActive ? <CheckCircle size={20} /> : <Crown size={20} />}
        </div>
      </div>

      <div className="mb-4">
        <span className="text-3xl font-bold text-gray-800">
          ₹{plan.Final_Price}
        </span>
        <span className="text-gray-500 text-sm ml-1">
          / {plan.duration_type?.Dur_Type || "month"}
        </span>
      </div>

      <ul className="space-y-2 mb-6">
        {plan.features?.slice(0, 3).map((feature, index) => (
          <li key={index} className="flex items-start text-sm">
            <CheckCircle
              size={16}
              className="text-green-500 mr-2 mt-0.5 flex-shrink-0"
            />
            <span className="text-gray-700">{feature.Package_Fea_Name}</span>
          </li>
        ))}
        {plan.features?.length > 3 && (
          <li className="text-sm text-blue-600 font-medium">
            + {plan.features.length - 3} more features
          </li>
        )}
      </ul>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onUpgrade(plan);
        }}
        className={`w-full py-2 rounded-lg font-medium transition-colors ${
          isActive
            ? "bg-gray-200 text-gray-800 cursor-default"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
        disabled={isActive}
      >
        {isActive ? "Current Plan" : "Upgrade"}
      </button>
    </div>
  );
};

// Plan Details Component
const PlanDetails = ({ plan, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Crown size={24} className="text-blue-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-800">
                {plan.PackageName}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            All Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {plan.features?.map((feature, index) => (
              <div key={index} className="flex items-start">
                <CheckCircle
                  size={18}
                  className="text-green-500 mr-2 mt-0.5 flex-shrink-0"
                />
                <span className="text-gray-700">
                  {feature.Package_Fea_Name}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => onClose()}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Choose {plan.PackageName} Plan
          </button>
        </div>
      </div>
    </div>
  );
};

// Chart Component
const Chart = ({ type, data, title, height = 200 }) => {
  const maxValue = Math.max(...data.map((item) => item.value));
  const chartHeight = height;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <div className="flex items-center gap-2">
          <button className="text-gray-400 hover:text-gray-600">
            <HelpCircle size={16} />
          </button>
          <button className="text-gray-400 hover:text-gray-600">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      {type == "bar" && (
        <div className="relative" style={{ height: `${chartHeight}px` }}>
          <div className="flex items-end justify-between h-full gap-2">
            {data.map((item, index) => {
              const percentage = (item.value / maxValue) * 100;
              return (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className="w-full relative">
                    <div
                      className="w-full bg-blue-100 rounded-t-md transition-all duration-500 ease-in-out"
                      style={{ height: `${percentage}%` }}
                    ></div>
                    <div
                      className="absolute bottom-0 left-0 w-full bg-blue-500 rounded-t-md transition-all duration-700 ease-in-out"
                      style={{ height: `${percentage * 0.8}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-600 mt-2 whitespace-nowrap">
                    {item.name}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400 -mt-1">
            <span>{maxValue}</span>
            <span>{Math.floor(maxValue / 2)}</span>
            <span>0</span>
          </div>
        </div>
      )}

      {type == "pie" && (
        <div
          className="flex items-center justify-center"
          style={{ height: `${chartHeight}px` }}
        >
          <div className="relative w-32 h-32">
            <svg viewBox="0 0 36 36" className="w-full h-full">
              {data.map((item, index) => {
                const total = data.reduce((sum, item) => sum + item.value, 0);
                let startAngle = 0;
                for (let i = 0; i < index; i++) {
                  startAngle += (data[i].value / total) * 360;
                }
                const endAngle = startAngle + (item.value / total) * 360;
                const startRad = (startAngle - 90) * (Math.PI / 180);
                const endRad = (endAngle - 90) * (Math.PI / 180);
                const x1 = 18 + 16 * Math.cos(startRad);
                const y1 = 18 + 16 * Math.sin(startRad);
                const x2 = 18 + 16 * Math.cos(endRad);
                const y2 = 18 + 16 * Math.sin(endRad);
                const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
                const colors = [
                  "#3b82f6",
                  "#8b5cf6",
                  "#ec4899",
                  "#f97316",
                  "#10b981",
                  "#6366f1",
                ];
                return (
                  <path
                    key={index}
                    d={`M 18 18 L ${x1} ${y1} A 16 16 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                    fill={colors[index % colors.length]}
                    stroke="white"
                    strokeWidth="0.5"
                  />
                );
              })}
              <circle cx="18" cy="18" r="10" fill="white" />
            </svg>
          </div>
          <div className="ml-6 space-y-2">
            {data.map((item, index) => {
              const colors = [
                "bg-blue-500",
                "bg-purple-500",
                "bg-pink-500",
                "bg-orange-500",
                "bg-emerald-500",
                "bg-indigo-500",
              ];
              return (
                <div key={index} className="flex items-center">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      colors[index % colors.length]
                    } mr-2`}
                  ></div>
                  <span className="text-xs text-gray-700">
                    {item.name}: {item.value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// Activity Card Component
const ActivityCard = ({
  title,
  count,
  icon,
  color,
  bgColor,
  borderColor,
  onClick,
  description,
}) => {
  const shapePosition = {
    right: Math.floor(Math.random() * 20) - 10 + "%",
    bottom: Math.floor(Math.random() * 20) - 10 + "%",
  };

  return (
    <div
      onClick={onClick}
      className={`relative rounded-xl ${bgColor} border ${borderColor} p-6 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 group`}
    >
      <div
        className={`absolute ${color
          .replace("text-", "text-opacity-10 ")
          .replace("bg-", "bg-opacity-20 ")} w-40 h-40 rounded-full blur-xl`}
        style={{
          right: shapePosition.right,
          bottom: shapePosition.bottom,
          opacity: 0.3,
          transition: "all 0.5s ease",
        }}
      ></div>

      <div className="relative z-10">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-4">{description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div
              className={`p-2 rounded-full ${color
                .replace("text-", "bg-")
                .replace("bg-", "bg-")} shadow-sm mr-3`}
            >
              {icon}
            </div>
            <span className="text-2xl font-bold text-gray-800">{count}</span>
          </div>

          <span className="text-sm text-gray-700 flex items-center group-hover:text-[#1A2B49] transition-colors">
            View Details
            <ChevronRight
              size={16}
              className="ml-1 group-hover:ml-2 transition-all"
            />
          </span>
        </div>
      </div>
    </div>
  );
};

// User Details Modal
const UserDetailsModal = ({ user, onClose }) => {
  return (
    <div className="fixed inset-0 bg-[#00000062] bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">User Details</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>
        <div className="space-y-3">
          <p>
            <strong>Name:</strong> {user.U_Name}
          </p>
          <p>
            <strong>Email:</strong> {user.U_Email}
          </p>
          <p>
            <strong>Mobile:</strong> {user.U_Mobile}
          </p>
          <p>
            <strong>Created At:</strong>{" "}
            {new Date(user.created_at).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full py-2 bg-[#101A2D] hover:text-[#101A2D] text-white rounded-lg hover:bg-[white] border cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
};

const CommunityDashboard = ({ setActivePage }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMembers: 0,
    newRequests: 0,
    rejectedUsers: 0,
    totalEvents: 0,
    totalNotices: 0,
    totalJobs: 0,
    totalMarketplace: 0,
    totalCelebrations: 0,
    totalCondolences: 0,
    totalGallery: 0,
    totalDonations: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState(null);
  const [commName, setCommName] = useState("");
  const [donations, setDonations] = useState([]);
  const sliderRef = useRef(null);
  const [sliderPosition, setSliderPosition] = useState(0);

  // Current subscription plan
  const [currentPlan, setCurrentPlan] = useState("1");

  // Dynamic Activity Analytics data
  const activityData = [
    { name: "Events", value: stats.totalEvents },
    { name: "Notices", value: stats.totalNotices },
    { name: "Gallery", value: stats.totalGallery },
    { name: "Marketplace", value: stats.totalMarketplace },
  ];

  // Activity cards data with dynamic counts
  const activityCards = [
    {
      id: "news",
      title: "Notices",
      count: stats.totalNotices,
      icon: <Newspaper size={24} className="text-white" />,
      color: "bg-[#1A2B49]",
      bgColor: "bg-gradient-to-br from-purple-50 to-violet-50",
      borderColor: "border-purple-100",
      description:
        "Share important announcements and keep your community informed.",
      onClick: () => setActivePage("news"),
    },
    {
      id: "celebration",
      title: "Celebrations",
      count: stats.totalCelebrations,
      icon: <PartyPopper size={24} className="text-white" />,
      color: "bg-[#1A2B49]",
      bgColor: "bg-gradient-to-br from-amber-50 to-yellow-50",
      borderColor: "border-amber-100",
      description:
        "Celebrate birthdays, anniversaries, and special achievements.",
      onClick: () => setActivePage("celebration"),
    },
    {
      id: "condolence",
      title: "Condolences",
      count: stats.totalCondolences,
      icon: <ImSad size={24} className="text-white" />,
      color: "bg-[#1A2B49]",
      bgColor: "bg-gradient-to-br from-slate-50 to-gray-50",
      borderColor: "border-slate-100",
      description: "Express support during difficult times and share memories.",
      onClick: () => setActivePage("condolence"),
    },
    {
      id: "jobcreationmember",
      title: "Jobs",
      count: stats.totalJobs,
      icon: <BadgeCheck size={24} className="text-white" />,
      color: "bg-[#1A2B49]",
      bgColor: "bg-gradient-to-br from-green-50 to-emerald-50",
      borderColor: "border-green-100",
      description:
        "Post and find job opportunities within your community network.",
      onClick: () => setActivePage("jobcreationmember"),
    },
    {
      id: "eventslistmember",
      title: "Events",
      count: stats.totalEvents,
      icon: <Calendar size={24} className="text-white" />,
      color: "bg-[#1A2B49]",
      bgColor: "bg-gradient-to-br from-sky-50 to-indigo-50",
      borderColor: "border-sky-100",
      description: "Organize and manage community gatherings and activities.",
      onClick: () => setActivePage("eventslistmember"),
    },
    {
      id: "gallerymember",
      title: "Gallery",
      count: stats.totalGallery,
      icon: <ImageIcon size={24} className="text-white" />,
      color: "bg-[#1A2B49]",
      bgColor: "bg-gradient-to-br from-pink-50 to-rose-50",
      borderColor: "border-pink-100",
      description:
        "Share photos and memories from community events and activities.",
      onClick: () => setActivePage("gallerymember"),
    },
    {
      id: "marketmember",
      title: "Marketplace",
      count: stats.totalMarketplace,
      icon: <ShoppingBag size={24} className="text-white" />,
      color: "bg-[#1A2B49]",
      bgColor: "bg-gradient-to-br from-teal-50 to-cyan-50",
      borderColor: "border-teal-100",
      description:
        "Buy, sell, and exchange items within your trusted community.",
      onClick: () => setActivePage("marketmember"),
    },
    {
      id: "usersmember",
      title: "Members",
      count: stats.totalMembers,
      icon: <Users size={24} className="text-white" />,
      color: "bg-[#1A2B49]",
      bgColor: "bg-gradient-to-br from-blue-50 to-indigo-50",
      borderColor: "border-blue-100",
      description: "View and manage community members.",
      onClick: () => setActivePage("usersadmin"),
    },
    {
      id: "donation",
      title: "Donation",
      count: stats.totalDonations,
      icon: <HandCoins size={24} className="text-white" />,
      color: "bg-[#1A2B49]",
      bgColor: "bg-gradient-to-br from-amber-50 to-yellow-50",
      borderColor: "border-blue-100",
      description:
        "Support community growth by contributing to causes and initiatives that matter",
      onClick: () => setActivePage("donation"),
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const localUserData = JSON.parse(localStorage.getItem("user"));
        const commId = localUserData?.Comm_Id;
        const uId = localUserData?.U_Id;

        if (!commId) {
          throw new Error("Comm_Id not found in localStorage");
        }
        if (!uId) {
          throw new Error("U_Id not found in localStorage");
        }

        const userResponse = await fetch(
          "https://parivaar.app/public/api/users"
        );
        if (!userResponse.ok) throw new Error("Failed to fetch users");
        const userApiData = await userResponse.json();
        if (
          userApiData.status == "success" &&
          Array.isArray(userApiData.data)
        ) {
          const user = userApiData.data.find((user) => user.U_Id == uId);
          if (user) {
            setCommName(user.Comm_Name || "Community");
          } else {
            throw new Error("User not found");
          }

          const totalMembers = userApiData.data.filter(
            (user) =>
              user.Comm_Id == commId && user.Role_Id == 3 && user.U_Status == 1
          ).length;
          const newRequests = userApiData.data.filter(
            (user) =>
              user.Comm_Id == commId && user.Role_Id == 3 && user.U_Status == 0
          );
          setStats((prev) => ({
            ...prev,
            totalMembers,
            newRequests: newRequests.length,
          }));
          const sortedRequests = newRequests
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 5);
          setRecentRequests(sortedRequests);
        } else {
          throw new Error("Invalid API response format for users");
        }

        const packageResponse = await fetch(
          "https://parivaar.app/public/api/packages"
        );
        if (!packageResponse.ok) throw new Error("Failed to fetch packages");
        const packageData = await packageResponse.json();
        if (packageData.status) {
          setSubscriptionPlans(packageData.data);
        }

        const fetchApiData = async (url) => {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Failed to fetch from ${url}`);
          }
          const data = await response.json();
          if (!Array.isArray(data.data)) {
            throw new Error(`Invalid response format from ${url}`);
          }
          return data.data;
        };

        const [
          noticesData,
          celebrationsData,
          condolencesData,
          jobsData,
          eventsData,
          galleryData,
          marketplaceData,
          donationsData,
        ] = await Promise.all([
          fetchApiData("https://parivaar.app/public/api/notice"),
          fetchApiData("https://parivaar.app/public/api/celebration"),
          fetchApiData("https://parivaar.app/public/api/condolences"),
          fetchApiData("https://parivaar.app/public/api/jobs"),
          fetchApiData("https://parivaar.app/public/api/events"),
          fetchApiData("https://parivaar.app/public/api/gallary"),
          fetchApiData("https://parivaar.app/public/api/marketplaces"),
          fetchApiData("https://parivaar.app/public/api/donations"),
        ]);

        const totalNotices = noticesData.filter(
          (item) => item.user?.Comm_Id == commId
        ).length;
        const totalCelebrations = celebrationsData.filter(
          (item) => item.user?.Comm_Id == commId && item.N_Status == "approved"
        ).length;
        const totalCondolences = condolencesData.filter(
          (item) => item.user?.Comm_Id == commId && item.N_Status == "approved"
        ).length;
        const totalJobs = jobsData.filter(
          (item) => item.user?.Comm_Id == commId && item.Status == "open"
        ).length;
        const totalEvents = eventsData.filter(
          (item) => item.user?.Comm_Id == commId && item.E_Status == "A"
        ).length;
        const totalGallery = galleryData.filter(
          (item) => item.user?.Comm_Id == commId
        ).length;
        const totalMarketplace = marketplaceData.filter(
          (item) => item.user?.Comm_Id == commId && item.M_Status == "Active"
        ).length;
        const totalDonations = donationsData.filter(
          (item) => item.user?.Comm_Id == commId && item.status == "1"
        ).length;

        // Filter donations by Comm_Id, sort by created_at, and take the latest 4
        const filteredDonations = donationsData
          .filter((item) => item.user?.Comm_Id == commId)
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 4)
          .map((donation) => ({
            id: donation.D_id,
            name: donation.user?.U_Name || "Unknown",
            amount: parseFloat(donation.goal_amount).toFixed(2),
            date: donation.created_at,
            campaign: donation.D_name || "Unknown Campaign",
          }));

        setDonations(filteredDonations);

        setStats((prev) => ({
          ...prev,
          totalNotices,
          totalCelebrations,
          totalCondolences,
          totalJobs,
          totalEvents,
          totalGallery,
          totalMarketplace,
          totalDonations,
        }));
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message,
          timer: 3000,
          showConfirmButton: false,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleUserAction = async (userId, status) => {
    try {
      const response = await fetch(
        `https://parivaar.app/public/api/users/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ U_Status: status }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to ${status == 1 ? "approve" : "reject"} user`);
      }

      setRecentRequests((prev) => prev.filter((user) => user.U_Id !== userId));

      setStats((prev) => ({
        ...prev,
        newRequests: prev.newRequests - 1,
        totalMembers: status == 1 ? prev.totalMembers + 1 : prev.totalMembers,
      }));

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: `User ${status == 1 ? "approved" : "rejected"} successfully`,
        timer: 3000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error updating user status:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
        timer: 3000,
        showConfirmButton: false,
      });
    }
  };

  const handleUpgrade = (plan) => {
    alert(
      `Upgrading to ${plan.PackageName} (₹${plan.Final_Price}/${
        plan.duration_type?.Dur_Type || "month"
      }). This would open a payment flow in a real app.`
    );
  };

  const handlePlanClick = (plan) => {
    setSelectedPlan(plan);
  };

  const handleSlide = (direction) => {
    if (sliderRef.current) {
      const { scrollLeft, clientWidth } = sliderRef.current;
      const scrollTo =
        direction == "left"
          ? scrollLeft - clientWidth / 2
          : scrollLeft + clientWidth / 2;

      sliderRef.current.scrollTo({
        left: scrollTo,
        behavior: "smooth",
      });

      setSliderPosition(scrollTo);
    }
  };

  const logoImageSrc = "/placeholder.svg?height=60&width=60";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdf9f7] to-[#f0f4ff]">
      {isLoading && <CustomLoader logoImage={logoImageSrc} />}

      {error && (
        <div className="p-8 text-center text-red-600">Error: {error}</div>
      )}

      {/* Mobile Menu Toggle */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-full bg-white shadow-md text-gray-700 hover:text-blue-600 transition-colors"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden">
          <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-lg p-6 overflow-y-auto">
            <div className="mb-8">
              <img
                src={logoImageSrc || "/placeholder.svg"}
                alt="Logo"
                className="h-10 mb-6"
              />
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setActiveTab("overview");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 rounded-lg ${
                    activeTab == "overview"
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => {
                    setActiveTab("subscription");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 rounded-lg ${
                    activeTab == "subscription"
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Subscription
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <button
                onClick={() => {
                  setActivePage("userrequist");
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                <Bell size={18} />
                <span>User Requests</span>
                {stats.newRequests > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {stats.newRequests}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  setActivePage("settings");
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                <Settings size={18} />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-1">
        {/* Header for Overview Tab */}
        {activeTab == "overview" && (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Welcome to {commName} Community
              </h1>
              <p className="text-gray-600">Manage your community</p>
            </div>
            <div>
              {/* <button
                onClick={() => setActiveTab("subscription")}
                className="mt-2 px-6 py-3 bg-[#1A2B49] cursor-pointer text-white rounded-lg font-medium hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2"
              >
                <Crown className="h-5 text-[#ff9100] w-5" />
                <span>Manage Subscription</span>
              </button> */}
            </div>
          </div>
        )}

        {/* Overview Tab Content */}
        {activeTab == "overview" && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                Key Metrics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                <div
                  onClick={() => setActivePage("usersadmin")}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6 shadow-sm cursor-pointer hover:shadow-md transition-all duration-300"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-700 text-sm font-medium">
                        Total Members
                      </p>
                      <h3 className="text-3xl font-bold mt-2 text-gray-800">
                        {stats.totalMembers}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Active community members
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-blue-100 text-blue-600 shadow-sm">
                      <Plus
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivePage("adduser");
                        }}
                        size={24}
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <TrendingUp size={14} className="text-green-500 mr-1" />
                    <span className="text-xs text-green-600 font-medium">
                      +12% from last month
                    </span>
                  </div>
                </div>

                <div
                  onClick={() => setActivePage("userrequist")}
                  className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-6 shadow-sm cursor-pointer hover:shadow-md transition-all duration-300"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-700 text-sm font-medium">
                        New Requests
                      </p>
                      <h3 className="text-3xl font-bold mt-2 text-gray-800">
                        {stats.newRequests}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Pending approval requests
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-emerald-100 text-emerald-600 shadow-sm">
                      <Bell size={24} />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <TrendingUp size={14} className="text-green-500 mr-1" />
                    <span className="text-xs text-green-600 font-medium">
                      +5% from last week
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Community Management and Recent Activity */}
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="lg:w-2/3">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  Manage Community
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activityCards.map((card) => (
                    <div key={card.id}>
                      <ActivityCard
                        count={card.count}
                        title={card.title}
                        icon={card.icon}
                        color={card.color}
                        bgColor={card.bgColor}
                        borderColor={card.borderColor}
                        description={card.description}
                        onClick={card.onClick}
                        titleClassName="text-[20px]"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:w-1/3">
                {/* Recent Requests Section */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 overflow-hidden mb-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">
                    Recent Requests
                  </h2>
                  <div className="space-y-4">
                    {recentRequests.length == 0 ? (
                      <p className="text-gray-600 text-center">
                        No recent requests
                      </p>
                    ) : (
                      recentRequests.map((request) => (
                        <div
                          key={request.U_Id}
                          className="flex items-center gap-3 pb-4 border-b border-gray-100 last:border-0"
                        >
                          <div className="p-2 rounded-full bg-blue-100">
                            <UserCheck size={16} className="text-blue-500" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">
                              {request.U_Name}
                            </p>
                            <p className="text-sm text-gray-600">
                              Requested on{" "}
                              {new Date(
                                request.created_at
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUserAction(request.U_Id, 1)}
                              className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                              title="Accept"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => handleUserAction(request.U_Id, 2)}
                              className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                              title="Reject"
                            >
                              <X size={16} />
                            </button>
                            <button
                              onClick={() => setSelectedUser(request)}
                              className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                              title="View Details"
                            >
                              <HelpCircle size={16} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                    {stats.newRequests > 5 && (
                      <button
                        onClick={() => setActivePage("userrequist")}
                        className="w-full mt-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        See More
                      </button>
                    )}
                  </div>
                </div>

                {/* Donation Karo Section */}
                {/* <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 overflow-hidden">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">
                    Donation
                  </h2>
                  <div className="space-y-4">
                    {donations.length == 0 ? (
                      <p className="text-gray-600 text-center">
                        No donations yet
                      </p>
                    ) : (
                      donations.map((donation) => (
                        <div
                          key={donation.id}
                          className="flex items-center gap-3 pb-4 border-b border-gray-100 last:border-0"
                        >
                          <div className="p-2 rounded-full bg-green-100">
                            <Zap size={16} className="text-green-500" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">
                              {donation.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              Donated ₹{donation.amount} to {donation.campaign} on{" "}
                              {new Date(donation.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                    <button
                      onClick={() => setActivePage("donation")}
                      className="w-full mt-4 cursor-pointer py-2 bg-[#1A2B49] text-white rounded-lg hover:bg-[white] border-2 hover:text-[#1A2B49] transition-colors"
                    >
                      See More
                    </button>
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        )}

        {/* Subscription Tab Content */}
        {activeTab == "subscription" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">
                Your Current Subscription
              </h2>
              <button
                onClick={() => setActiveTab("overview")}
                className="px-4 py-2 bg-[#1A2B49] text-white rounded-lg font-medium hover:bg-white hover:text-[#1A2B49] hover:shadow-xl transition-colors flex items-center gap-2"
              >
                <Home size={18} />
                Back to Dashboard
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Manage your subscription plan and explore upgrade options for more
              features
            </p>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-md mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center mb-2">
                    <Crown size={24} className="text-blue-600 mr-2" />
                    <h3 className="text-xl font-bold text-gray-800">
                      {subscriptionPlans.find(
                        (plan) => plan.PackageId == parseInt(currentPlan)
                      )?.PackageName || "Basic"}
                    </h3>
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                      Active
                    </span>
                  </div>
                  <p className="text-gray-700 mb-4">
                    Your plan renews on{" "}
                    <span className="font-medium">
                      {new Date(
                        new Date().setMonth(new Date().getMonth() + 1)
                      ).toLocaleDateString()}
                    </span>
                  </p>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle size={16} className="text-green-500 mr-2" />
                    <span>All features are active and working properly</span>
                  </div>
                </div>
                <div className="mt-4 md:mt-0">
                  <div className="text-2xl font-bold text-gray-800 mb-1">
                    ₹
                    {subscriptionPlans.find(
                      (plan) => plan.PackageId == parseInt(currentPlan)
                    )?.Final_Price || "400"}
                    <span className="text-sm font-normal text-gray-600">
                      /
                      {subscriptionPlans.find(
                        (plan) => plan.PackageId == parseInt(currentPlan)
                      )?.duration_type?.Dur_Type || "month"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Available Plans
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSlide("left")}
                  className="p-2 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                  disabled={sliderPosition <= 0}
                >
                  <CircleChevronLeft size={18} />
                </button>
                <button
                  onClick={() => handleSlide("right")}
                  className="p-2 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  <CircleChevronRight size={18} />
                </button>
                <button className="ml-2 px-3 py-1 text-sm bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">
                  View All
                </button>
              </div>
            </div>

            <div
              className="overflow-x-auto pb-4 hide-scrollbar"
              ref={sliderRef}
              style={{ scrollBehavior: "smooth" }}
            >
              <div className="flex gap-6" style={{ minWidth: "max-content" }}>
                {subscriptionPlans.map((plan) => (
                  <div key={plan.PackageId} className="min-w-[300px]">
                    <SubscriptionPlanCard
                      plan={plan}
                      isActive={plan.PackageId == parseInt(currentPlan)}
                      onUpgrade={handleUpgrade}
                      onClick={handlePlanClick}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Subscription Benefits
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start">
                  <div className="p-2 rounded-full bg-green-100 text-green-600 mr-3">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-1">
                      Enhanced Features
                    </h4>
                    <p className="text-sm text-gray-600">
                      Access to premium features like marketplace, job board,
                      and advanced analytics
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3">
                    <Users size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-1">
                      Increased Member Capacity
                    </h4>
                    <p className="text-sm text-gray-600">
                      Support for more community members with higher tier plans
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="p-2 rounded-full bg-purple-100 text-purple-600 mr-3">
                    <ImageIcon size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-1">
                      Expanded Storage
                    </h4>
                    <p className="text-sm text-gray-600">
                      More storage for photos, documents, and community content
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="p-2 rounded-full bg-amber-100 text-amber-600 mr-3">
                    <Shield size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-1">
                      Priority Support
                    </h4>
                    <p className="text-sm text-gray-600">
                      Get faster responses and dedicated support with premium
                      plans
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Plan Details Modal */}
      {selectedPlan && (
        <PlanDetails
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
        />
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};

export default CommunityDashboard;