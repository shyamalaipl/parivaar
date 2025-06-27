import React, { useState, useRef, useEffect } from "react";
import { Phone, Lock, Eye, EyeOff, Mail, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import TypeIt from "typeit-react";
import "./Loginhome.css";
import "./MobileMenuAnimation.css";

import Fetureparivaar from "./Fetureparivaar";
import { Link } from "react-router-dom";
import logoImage from "./img/parivarlogo1.png";
import backlogin from "./img/backlogin.jpg";

const CustomLogoLoader = () => {
  const keyframes = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      25% {transform: rotate(90deg); }
      50% {transform: rotate(180deg); }
      75% {transform: rotate(90deg); }
      100% {transform: rotate(0deg); }
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
        }}
      />
    </div>
  );
};

function Loginn() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isOtpLogin, setIsOtpLogin] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [resetPasswordStep, setResetPasswordStep] = useState(1);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showRegisterOptions, setShowRegisterOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuClosing, setIsMenuClosing] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loginError, setLoginError] = useState("");
  const otpInputRefs = useRef([]);
  const mobileMenuRef = useRef(null);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setPhoneError("");
    setPasswordError("");
    setLoginError("");

    // Validate phone number (10 digits)
    if (!/^\d{10}$/.test(phone)) {
      setPhoneError("Number must be exactly 10 digits");
      setIsLoading(false);
      return;
    }

    // Validate password (minimum 8 characters)
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      setIsLoading(false);
      return;
    }

    try {
      // Send POST request to login API
      const loginResponse = await fetch(
        "https://parivaar.app/public/api/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            U_Mobile: phone,
            U_Password: password,
          }),
        }
      );

      const loginResult = await loginResponse.json();

      // Check if login was successful
      if (
        loginResult.status == "success" &&
        loginResult.message == "Login successful."
      ) {
        // Store user data in localStorage
        localStorage.setItem("user", JSON.stringify(loginResult.data.user));

        // Navigate based on Role_Id
        const roleId = loginResult.data.user.Role_Id;
        switch (roleId) {
          case 1:
            navigate("/superadmin");
            break;
          case 2:
            navigate("/member");
            break;
          case 3:
            navigate("/home");
            break;
          default:
            setLoginError("Invalid role");
            setIsLoading(false);
            return;
        }
      } else {
        // Handle invalid credentials
        setLoginError(loginResult.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Swal.fire({
        title: "Invalid Email",
        text: "Please enter a valid email address",
        icon: "error",
        confirmButtonColor: "#1A2B49",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("https://parivaar.app/public/api/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
        }),
      });

      const result = await response.json();

      if (response.ok && result.message == "OTP sent successfully") {
        setResetPasswordStep(2);
        Swal.fire({
          title: "OTP Sent",
          text: "A verification code has been sent to your email",
          icon: "success",
          confirmButtonColor: "#1A2B49",
        });
      } else {
        throw new Error(result.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("Send OTP error:", error);
      Swal.fire({
        title: "Error",
        text: error.message || "Failed to send OTP",
        icon: "error",
        confirmButtonColor: "#1A2B49",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpInputRefs.current[index + 1].focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key == "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1].focus();
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      Swal.fire({
        title: "Invalid OTP",
        text: "Please enter all 6 digits of the OTP",
        icon: "error",
        confirmButtonColor: "#1A2B49",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        "https://parivaar.app/public/api/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            OTP_Char: otpValue,
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.message == "OTP verified successfully") {
        setResetPasswordStep(3);
        Swal.fire({
          title: "OTP Verified",
          text: "Please set your new password",
          icon: "success",
          confirmButtonColor: "#1A2B49",
        });
      } else {
        throw new Error(result.message || "Invalid OTP");
      }
    } catch (error) {
      console.error("Verify OTP error:", error);
      Swal.fire({
        title: "Error",
        text: error.message || "Invalid OTP",
        icon: "error",
        confirmButtonColor: "#1A2B49",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      Swal.fire({
        title: "Invalid Password",
        text: "Password must be at least 8 characters",
        icon: "error",
        confirmButtonColor: "#1A2B49",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Swal.fire({
        title: "Passwords Don't Match",
        text: "Please make sure your passwords match",
        icon: "error",
        confirmButtonColor: "#1A2B49",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        "https://parivaar.app/public/api/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            new_password: newPassword,
            confirm_password: confirmPassword,
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.message == "Password reset successfully") {
        setIsOtpLogin(false);
        setResetPasswordStep(1);
        setNewPassword("");
        setConfirmPassword("");
        setEmail("");
        setOtp(["", "", "", "", "", ""]);
        Swal.fire({
          title: "Password Reset Successful",
          text: "You can now login with your new password",
          icon: "success",
          confirmButtonColor: "#1A2B49",
        });
      } else {
        throw new Error(result.message || "Failed to reset password");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      Swal.fire({
        title: "Error",
        text: error.message || "Failed to reset password",
        icon: "error",
        confirmButtonColor: "#1A2B49",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterAsUser = () => {
    navigate("/registration-user");
  };

  const handleRegisterAsCommittee = () => {
    navigate("/registration-committee");
  };

  const toggleMobileMenu = () => {
    if (isMenuOpen) {
      // Start closing animation
      setIsMenuClosing(true);
      // Wait for animation to complete before hiding menu
      setTimeout(() => {
        setIsMenuOpen(false);
        setIsMenuClosing(false);
      }, 300);
    } else {
      setIsMenuOpen(true);
    }
  };

  // Handle click outside mobile menu
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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  // Close mobile menu when window is resized to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMenuOpen(false);
        setIsMenuClosing(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {isLoading && <CustomLogoLoader />}
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

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              <Link
                to="/"
                className="px-4 py-2 font-semibold hover:bg-white/10 rounded-lg transition-colors"
              >
                Home
              </Link>
              {/* <Link
                to="/planssparivaar"
                className="px-4 py-2 font-semibold hover:bg-white/10 rounded-lg transition-colors"
              >
                Plans
              </Link> */}
              <Link
                to="/login"
                className="px-4 py-2 font-semibold bg-white text-[#1A2B49] rounded-lg hover:bg-gray-100 transition-colors"
              >
                Login
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white p-2 transition-transform duration-300"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation Menu */}
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
                  to="/planssparivaar"
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
            backgroundImage: `url(https://images.unsplash.com/photo-1641849460719-b36172b45b35?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZmFtaWx5JTIwc3Vuc2V0fGVufDB8fDB8fHww)`,
          }}
        >
          <div className="absolute inset-0 bg-black/8 backdrop-blur-[2px]"></div>
          <div className="relative h-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full py-8 md:py-0">
              <div className="flex flex-col md:flex-row md:items-center min-h-[90vh] gap-8">
                <div className="hidden md:block text-white w-full md:w-1/2 pt-4 md:pt-0">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight">
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
                  <p className="text-lg sm:text-xl text-gray-200 mb-8 max-w-xl">
                    When it comes to your family tree, every branch matters.
                    Discover your roots and bring your family history to life.
                  </p>
                </div>
                <div className="flex justify-center mt-20 md:mt-5 md:justify-end w-full md:w-1/2 pb-8 md:pb-0">
                  <div className="w-full max-w-md backdrop-blur-md bg-white/10 p-6 sm:p-8 rounded-xl shadow-2xl border-l-[#29A55B] border-r-[#1A2B49] border-b-[#E7AF48] border-t-[#D7222F]">
                    {isOtpLogin ? (
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 text-center">
                          Reset Password
                        </h3>
                        {resetPasswordStep == 1 && (
                          <div className="space-y-4">
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                              <input
                                type="email"
                                placeholder="Enter your email address"
                                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1A2B49]/50"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={handleSendOtp}
                              className="w-full bg-[#1A2B49] cursor-pointer text-white py-3 rounded-lg font-semibold hover:text-[#1A2B49] hover:bg-[white] transition-colors"
                              disabled={isLoading}
                            >
                              {isLoading ? "Sending..." : "Send OTP"}
                            </button>
                          </div>
                        )}
                        {resetPasswordStep == 2 && (
                          <form
                            onSubmit={handleOtpSubmit}
                            className="space-y-4"
                          >
                            <div className="flex justify-center gap-1 sm:gap-2">
                              {otp.map((digit, index) => (
                                <input
                                  key={index}
                                  ref={(el) =>
                                    (otpInputRefs.current[index] = el)
                                  }
                                  type="text"
                                  className="w-9 sm:w-12 h-9 sm:h-12 text-center text-lg sm:text-xl bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#1A2B49]/50"
                                  maxLength={1}
                                  value={digit}
                                  onChange={(e) =>
                                    handleOtpChange(index, e.target.value)
                                  }
                                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                />
                              ))}
                            </div>
                            <button
                              type="submit"
                              className="w-full bg-[#1A2B49] text-white py-3 rounded-lg font-semibold hover:bg-[#1A2B49] transition-colors"
                              disabled={isLoading}
                            >
                              {isLoading ? "Verifying..." : "Verify OTP"}
                            </button>
                          </form>
                        )}
                        {resetPasswordStep == 3 && (
                          <form
                            onSubmit={handlePasswordReset}
                            className="space-y-4"
                          >
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                              <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter New Password"
                                className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1A2B49]/50"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
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
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                              <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Re-enter New Password"
                                className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1A2B49]/50"
                                value={confirmPassword}
                                onChange={(e) =>
                                  setConfirmPassword(e.target.value)
                                }
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
                              className="w-full bg-[#1A2B49] text-white py-3 rounded-lg font-semibold hover:bg-[#1A2B49] transitions transition-colors"
                              disabled={isLoading}
                            >
                              {isLoading ? "Resetting..." : "Reset Password"}
                            </button>
                          </form>
                        )}
                        <button
                          onClick={() => {
                            setIsOtpLogin(false);
                            setResetPasswordStep(1);
                            setEmail("");
                            setOtp(["", "", "", "", "", ""]);
                          }}
                          className="text-white mt-4 block text-center cursor-pointer"
                        >
                          Back to Login
                        </button>
                      </div>
                    ) : (
                      <div>
                        {showRegisterOptions ? (
                          <div className="space-y-4">
                            <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 text-center">
                              Register as
                            </h3>
                            <button
                              type="button"
                              onClick={handleRegisterAsUser}
                              className="w-full bg-[#1A2B49] cursor-pointer text-white py-3 rounded-lg hover:text-[#1A2B49] font-semibold hover:bg-[#FFFFFF] transition-colors"
                            >
                              Register as User
                            </button>
                            <button
                              type="button"
                              onClick={handleRegisterAsCommittee}
                              className="w-full bg-[#1A2B49] cursor-pointer text-white py-3 rounded-lg hover:text-[#1A2B49] font-semibold hover:bg-[#FFFFFF] transition-colors"
                            >
                              Register Your Community
                            </button>
                            <button
                              onClick={() => setShowRegisterOptions(false)}
                              className="text-white mt-2 block text-center w-full"
                            >
                              Back to Login
                            </button>
                          </div>
                        ) : (
                          <>
                            <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 text-center">
                              Welcome Back
                            </h3>
                            <form
                              onSubmit={handleLoginSubmit}
                              className="space-y-4"
                            >
                              <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                                <input
                                  type="text"
                                  placeholder="Phone Number"
                                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1A2B49]/50"
                                  value={phone}
                                  onChange={(e) =>
                                    setPhone(e.target.value.replace(/\D/g, ""))
                                  }
                                  maxLength={10}
                                />
                                {phoneError && (
                                  <p className="text-gray-200 text-sm mt-1">
                                    {phoneError}
                                  </p>
                                )}
                              </div>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                                <input
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Password"
                                  className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1A2B49]/50"
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
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
                                {passwordError && (
                                  <p className="text-gray-200 text-sm mt-1">
                                    {passwordError}
                                  </p>
                                )}
                              </div>
                              {loginError && (
                                <p className="text-gray-200 text-sm mt-1">
                                  {loginError}
                                </p>
                              )}
                              <button
                                type="submit"
                                className="w-full bg-[#1A2B49] cursor-pointer text-white py-3 rounded-lg font-semibold hover:bg-[white] hover:text-[#1A2B49] transition-colors"
                                disabled={isLoading}
                              >
                                {isLoading ? "Signing In..." : "Sign In"}
                              </button>
                            </form>
                            <div className="mt-2 flex flex-col sm:flex-row sm:justify-between sm:items-center">
                              <button
                                type="button"
                                onClick={() => setIsOtpLogin(true)}
                                className="text-white text-sm cursor-pointer mb-2 sm:mb-0"
                              >
                                Forgot Password?
                              </button>
                              <div className="text-white text-xs">
                                Don't have an account?{" "}
                                <button
                                  type="button"
                                  onClick={() => setShowRegisterOptions(true)}
                                  className="text-white font-bold cursor-pointer"
                                >
                                  Registration
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}
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

export default Loginn;