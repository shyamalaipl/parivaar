import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { RiShoppingBagLine } from "react-icons/ri";
import { IoMdContact } from "react-icons/io";
import { IoSearch } from "react-icons/io5";
import { ChevronDown } from "lucide-react";
import { CiLogout } from "react-icons/ci";
import logo from "../img/parivarlogo1.png";
import { useCart } from "../contex/cartContext";

const navItems = [
  // { to: "/news", label: "Notice" },
  // { to: "/celebration", label: "Celebration" },
  // { to: "/condolences", label: "Condolences" },
  // { to: "/event", label: "Event" },
  // { to: "/Gallery", label: "Gallery" },
  // { to: "/Job", label: "Job" },
  // { to: "/shop", label: "Marketplace" },
  // { to: "https://metrimonial.netlify.app/", label: "Matrimony" },
];

const navIcon = [{ to: "/profileuser", label: <IoMdContact /> }];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const { cartCount } = useCart();
  const dropdownRef = useRef(null);
  const [communityName, setCommunityName] = useState("");
  const [commId, setCommId] = useState("");
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData && userData.Comm_Id && userData.U_Id) {
      setCommId(userData.Comm_Id);
      fetchUserName(userData.U_Id);
    }
  }, []);

  const fetchUserName = async (uId) => {
    try {
      const response = await fetch("https://parivaar.app/public/api/users");
      const result = await response.json();
      if (result.status == "success" && result.data) {
        const user = result.data.find((user) => user.U_Id == uId);
        if (user && user.U_Name) {
          setUserName(user.U_Name);
        }
      }
    } catch (error) {
      console.error("Error fetching user name:", error);
    }
  };

  useEffect(() => {
    const fetchCommunityName = async () => {
      try {
        const response = await fetch("https://parivaar.app/public/api/users");
        const result = await response.json();
        if (result.status == "success" && result.data) {
          const community = result.data.find(
            (user) => user.Role_Id == 2 && user.Comm_Id == commId
          );
          if (community && community.Comm_Name) {
            setCommunityName(community.Comm_Name);
          }
        }
      } catch (error) {
        console.error("Error fetching community name:", error);
      }
    };

    if (commId) {
      fetchCommunityName();
    }
  }, [commId]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeSidebar = () => setIsMobileMenuOpen(false);
  const toggleUserDropdown = () => setIsUserDropdownOpen(!isUserDropdownOpen);

  const handleCommunityClick = () => {
    navigate(`/communitydetails`);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 w-full z-50 bg-[#1A2B49] text-white py-3">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center">
          <Logo />
          <DesktopNav
            communityName={communityName}
            handleCommunityClick={handleCommunityClick}
          />
          <DesktopIcons
            cartCount={cartCount}
            userName={userName}
            handleLogout={handleLogout}
            toggleUserDropdown={toggleUserDropdown}
            isUserDropdownOpen={isUserDropdownOpen}
            dropdownRef={dropdownRef}
          />
          <MobileMenuButton toggleMobileMenu={toggleMobileMenu} />
        </div>
      </div>
      <MobileSidebar
        isOpen={isMobileMenuOpen}
        onClose={closeSidebar}
        communityName={communityName}
        handleCommunityClick={handleCommunityClick}
        userName={userName}
        handleLogout={handleLogout}
      />
    </header>
  );
}

function Logo() {
  return (
    <Link to="/home" className="flex items-center space-x-2">
      <img
        className="w-10"
        src={logo || "/placeholder.svg"}
        alt="Parivaar Logo"
      />
      <span className="text-white font-bold text-lg">Parivaar</span>
    </Link>
  );
}

function DesktopNav({ communityName, handleCommunityClick }) {
  return (
    <nav className="hidden lg:flex items-center space-x-6">
      {communityName && (
        <button
          onClick={handleCommunityClick}
          className="transition-colors text-xl hover:text-[#448AFF]"
        >
          {communityName} Community
        </button>
      )}
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `transition-colors font-bold ${
              isActive ? "text-[#448AFF]" : "hover:text-[#448AFF]"
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

function DesktopIcons({
  cartCount,
  userName,
  handleLogout,
  toggleUserDropdown,
  isUserDropdownOpen,
  dropdownRef,
}) {
  return (
    <nav className="hidden lg:flex items-center space-x-6">
      {navIcon.map((item) => (
        <div
          key={item.to}
          className="relative"
          ref={item.to == "/profileuser" ? dropdownRef : null}
        >
          <button
            onClick={item.to == "/profileuser" ? toggleUserDropdown : null}
            className="transition-colors font-bold flex items-center space-x-2 hover:text-[#448AFF] text-3xl"
          >
            {item.label}
            {userName && item.to == "/profileuser" && (
              <span className="text-lg font-semibold">{userName}</span>
            )}
          </button>
          {item.to == "/profileuser" && isUserDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
              <Link
                to="/profileuser"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={toggleUserDropdown}
              >
                View Profile
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  toggleUserDropdown();
                }}
                className=" w-full flex items-center justify-between cursor-pointer text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Logout <CiLogout className="text-3xl" />
              </button>
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}

function MobileMenuButton({ toggleMobileMenu }) {
  return (
    <button
      aria-label="Toggle Mobile Menu"
      className="lg:hidden p-2"
      onClick={toggleMobileMenu}
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </button>
  );
}

function MobileSidebar({
  isOpen,
  onClose,
  communityName,
  handleCommunityClick,
  userName,
  handleLogout,
}) {
  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed top-0 font-semibold left-0 w-full h-full bg-[#1A2B49] text-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-300">
          <Logo />
          <button
            onClick={onClose}
            aria-label="Close Mobile Menu"
            className="text-white text-3xl cursor-pointer"
          >
            ×
          </button>
        </div>
        <nav className="flex flex-col px-5 py-4">
          {communityName && (
            <button
              onClick={() => {
                handleCommunityClick();
                onClose();
              }}
              className="py-2 hover:text-gray-400 block"
            >
              {communityName}
            </button>
          )}
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="py-2 hover:text-gray-400 block"
              onClick={onClose}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/profileuser"
            className="py-2 hover:text-gray-400 flex items-center space-x-2"
            onClick={onClose}
          >
            <IoMdContact className="text-3xl" />
            <span>{userName || "Profile"}</span>
          </Link>
          <button
            onClick={() => {
              handleLogout();
              onClose();
            }}
            className="py-2 hover:text-gray-400  flex items-center space-x-2"
          >
            <CiLogout className="text-3xl" />
            <span>Logout</span>
          </button>
        </nav>
      </div>
    </>
  );
}
