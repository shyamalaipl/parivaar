"use client";

import { useState, useEffect, useRef } from "react";
import { Lock, Eye, EyeOff, Menu, X } from "lucide-react";
import TypeIt from "typeit-react";
import "./Loginhome.css";
import "./MobileMenuAnimation.css";
import { Link, useNavigate } from "react-router-dom";
import logoImage from "./img/parivarlogo1.png";

const CustomLogoLoader = () => {
  const keyframes = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  if (!document.getElementById("spin-keysframes")) {
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

function RegistrationUser() {
  const [showPassword, setShowPassword] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuClosing, setIsMenuClosing] = useState(false);
  const [formData, setFormData] = useState({
    U_Name: "",
    U_Email: "",
    U_Mobile: "",
    U_Password: "",
    Comm_Id: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const navigate = useNavigate();
  const mobileMenuRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "U_Mobile" || name === "Comm_Id") {
      setFormData({ ...formData, [name]: value.replace(/\D/g, "") });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setMessage({ text: "", type: "" }); // Clear message on input change
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ text: "", type: "" });

    if (!formData.U_Name.trim()) {
      setMessage({ text: "Username is required", type: "error" });
      setIsSubmitting(false);
      return;
    }

    if (!formData.U_Email.trim() || !/^\S+@\S+\.\S+$/.test(formData.U_Email)) {
      setMessage({ text: "Please enter a valid email address", type: "error" });
      setIsSubmitting(false);
      return;
    }

    if (!/^\d{10}$/.test(formData.U_Mobile)) {
      setMessage({ text: "Phone number must be exactly 10 digits", type: "error" });
      setIsSubmitting(false);
      return;
    }

    if (!/^\d{6}$/.test(formData.Comm_Id)) {
      setMessage({ text: "Community Code must be exactly 6 digits", type: "error" });
      setIsSubmitting(false);
      return;
    }

    if (formData.U_Password.length < 8) {
      setMessage({ text: "Password must be at least 8 characters", type: "error" });
      setIsSubmitting(false);
      return;
    }

    try {
      const userResponse = await fetch(
        "https://parivaar.app/public/api/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            U_Name: formData.U_Name,
            U_Email: formData.U_Email,
            U_Mobile: formData.U_Mobile,
            U_Password: formData.U_Password,
            Comm_Id: formData.Comm_Id,
            Role_Id: 3,
            U_Status: 0,
          }),
        }
      );

      const result = await userResponse.json();
      console.log("POST Response:", result);

      if (userResponse.ok) {
        setMessage({ text: "User registration successful!", type: "success" });
        setFormData({
          U_Name: "",
          U_Email: "",
          U_Mobile: "",
          U_Password: "",
          Comm_Id: "",
        });
        setTimeout(() => navigate("/login"), 1500);
      } else {
        if (result.errors && result.errors.U_Email) {
          setMessage({
            text: "This email is already registered. Please use a different email.",
            type: "error",
          });
        } else if (result.errors && result.errors.U_Mobile) {
          setMessage({
            text: "This phone number is already registered. Please use a different number.",
            type: "error",
          });
        } else {
          throw new Error(result.message || "Registration failed");
        }
      }
    } catch (error) {
      console.error("POST Error:", error);
      setMessage({
        text: error.message || "Registration failed. Please try again.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMobileMenu = () => {
    if (isMenuOpen) {
      setIsMenuClosing(true);
      setTimeout(() => {
        setIsMenuOpen(false);
        setIsMenuClosing(false);
      }, 300);
    } else {
      setIsMenuOpen(true);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        isMenuOpen
      ) {
        toggleMobileMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMenuOpen(false);
        setIsMenuClosing(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {isSubmitting && <CustomLogoLoader />}
      <header
        className={`sticky top-0 w-full z-50 text-white py-3 transition-colors duration-300 ${
          isScrolled ? "bg-[#1A2B49]" : "bg-[#172841]"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2">
              <img
                className="w-10"
                src={logoImage || "/placeholder.svg"}
                alt="Parivaar Logo"
              />
              <span className="text-xl md:text-2xl font-bold">Parivaar</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-4">
              <Link
                to="/"
                className="px-4 py-2 font-semibold hover:bg-white/10 rounded-lg transition-colors"
              >
                Home
              </Link>
              <Link
                to="/login"
                className="px-4 py-2 font-semibold bg-white text-[#1A2B49] rounded-lg hover:bg-gray-100 transition-colors"
              >
                Login
              </Link>
            </nav>

            <button
              className="md:hidden text-white p-2 transition-transform duration-300"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {(isMenuOpen || isMenuClosing) && (
            <div
              ref={mobileMenuRef}
              className={`md:hidden absolute top-full left-0 right-0 bg-[#1A2B49] mt-1 p-4 shadow-lg rounded-b-lg z-50 ${
                isMenuClosing ? "animate-menu-close" : "animate-menu-open"
              }`}
            >
              <nav className="flex flex-col space-y-3">
                <Link
                  to="/"
                  className="px-4 py-2 font-semibold rounded-lg transition-colors hover:bg-white/10"
                  onClick={toggleMobileMenu}
                >
                  Home
                </Link>
                <Link
                  to="/Planssparivaar"
                  className="px-4 py-2 font-semibold rounded-lg transition-colors hover:bg-white/10"
                  onClick={toggleMobileMenu}
                >
                  Plans
                </Link>
                <Link
                  to="/login"
                  className="px-4 py-2 font-semibold bg-white text-[#1A2B49] rounded-lg hover:bg-gray-100 transition-colors"
                  onClick={toggleMobileMenu}
                >
                  Login
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      <div className="min-h-screen bg-white">
        <div
          className="relative bg-cover bg-center min-h-screen"
          style={{
            backgroundImage:
              "url('https://demo.harutheme.com/famipress/wp-content/uploads/2024/08/banner-1-slide-top-1.jpg')",
          }}
        >
          <div className="absolute inset-0 bg-black/8 backdrop-blur-[1.5px]"></div>
          <div className="relative h-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
              <div className="flex flex-col md:flex-row md:items-center min-h-[85vh] gap-6">
                <div className="hidden md:block text-white w-full md:w-1/2 pt-4">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 leading-tight">
                    Family is not an important thing.
                    <TypeIt
                      getBeforeInit={(instance) => {
                        instance
                          .type(" It's everyth")
                          .pause(750)
                          .delete(2)
                          .pause(500)
                          .type("thing...");
                        return instance;
                      }}
                    />
                  </h2>
                  <p className="text-base sm:text-lg text-gray-200 mb-6 max-w-lg">
                    When it comes to your family tree, every branch matters.
                    Discover your roots and bring your family history to life.
                  </p>
                </div>
                <div className="flex justify-center mt-12 sm:mt-16 md:mt-0 md:justify-end w-full md:w-1/2 pb-6">
                  <div className="w-full max-w-sm sm:max-w-md backdrop-blur-md bg-white/5 p-4 sm:p-6 rounded-xl shadow-2xl border-l-[#29A55B] border-r-[#1A2B49] border-b-[#E7AF48] border-t-[#D7222F]">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-4 text-center">
                      Register User
                    </h3>
                    <form onSubmit={handleRegisterSubmit} className="space-y-3">
                      {message.text && (
                        <div
                          className={`text-center text-sm sm:text-base p-2 rounded-lg ${
                            message.type === "success"
                              ? "bg-green-500/20 text-green-200"
                              : "bg-red-500/20 text-red-200"
                          }`}
                        >
                          {message.text}
                        </div>
                      )}
                      <input
                        type="text"
                        placeholder="Username"
                        name="U_Name"
                        className="w-full pl-4 pr-4 py-2 sm:py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1A2B49]/50"
                        value={formData.U_Name}
                        onChange={handleChange}
                      />
                      <input
                        type="email"
                        placeholder="Enter Your Email"
                        name="U_Email"
                        className="w-full pl-4 pr-4 py-2 sm:py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1A2B49]/50"
                        value={formData.U_Email}
                        onChange={handleChange}
                      />
                      <input
                        type="text"
                        placeholder="Phone Number"
                        name="U_Mobile"
                        className="w-full pl-4 pr-4 py-2 sm:py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1A2B49]/50"
                        value={formData.U_Mobile}
                        onChange={handleChange}
                        maxLength={10}
                      />
                      <input
                        type="text"
                        placeholder="Enter Community Code"
                        name="Comm_Id"
                        className="w-full pl-4 pr-4 py-2 sm:py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1A2B49]/50"
                        value={formData.Comm_Id}
                        onChange={handleChange}
                        maxLength={6}
                      />
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          name="U_Password"
                          className="w-full pl-10 pr-12 py-2 sm:py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1A2B49]/50"
                          value={formData.U_Password}
                          onChange={handleChange}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-[#1A2B49] cursor-pointer text-white py-2 sm:py-3 rounded-lg font-semibold hover:bg-[#1a2b497c] transition-colors"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Registering..." : "Register User"}
                      </button>
                    </form>
                    <button
                      onClick={() => navigate("/login")}
                      className="text-white mt-3 cursor-pointer block w-full text-center text-sm sm:text-base"
                    >
                      Back to Login
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default RegistrationUser;