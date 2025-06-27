import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Users,
  UserPlus,
  GitBranch,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Mail,
} from "lucide-react";
import TypeIt from "typeit-react";
import Swal from "sweetalert2";
import "./Loginhome.css";

function Loginhome() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isOtpLogin, setIsOtpLogin] = useState(false);
  const [registrationType, setRegistrationType] = useState(null);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [usermail, setUsermail] = useState("");
  const [email, setEmail] = useState("");
  const [resetPasswordStep, setResetPasswordStep] = useState(1);
  const [committeeName, setCommitteeName] = useState("");
  const [committeeCast, setCommitteeCast] = useState("");
  const [committeeSuggestions, setCommitteeSuggestions] = useState([]);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const otpInputRefs = useRef([]);

  const fetchCommitteeSuggestions = async (query) => {
    if (query.length > 2) {
      try {
        const response = await fetch(
          `https://api.example.com/committees?search=${query}`
        );
        const data = await response.json();
        setCommitteeSuggestions(data);
      } catch (error) {
        console.error("Error fetching committee suggestions:", error);
      }
    } else {
      setCommitteeSuggestions([]);
    }
  };

  const handleSendOtp = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Swal.fire({
        title: "Invalid Email",
        text: "Please enter a valid email address",
        icon: "error",
        confirmButtonColor: "#1A2B49",
      });
      return;
    }
    setResetPasswordStep(2);
    setIsOtpSent(true);
    Swal.fire({
      title: "OTP Sent",
      text: "A verification code has been sent to your email",
      icon: "success",
      confirmButtonColor: "#1A2B49",
    });
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      otpInputRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key == "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1].focus();
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(phone)) {
      Swal.fire({
        title: "Invalid Phone Number",
        text: "Number must be exactly 10 digits",
        icon: "error",
        confirmButtonColor: "#1A2B49",
      });
      return;
    }
    if (password.length < 8) {
      Swal.fire({
        title: "Invalid Password",
        text: "Password must be at least 8 characters",
        icon: "error",
        confirmButtonColor: "#1A2B49",
      });
      return;
    }
    Swal.fire({
      title: "Success!",
      text: "Login successful!",
      icon: "success",
      confirmButtonColor: "#1A2B49",
    });
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    // Common validation
    if (!username.trim()) {
      Swal.fire({
        title: "Missing Information",
        text: "Username is required",
        icon: "error",
        confirmButtonColor: "#1A2B49",
      });
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      Swal.fire({
        title: "Invalid Phone Number",
        text: "Phone number must be exactly 10 digits",
        icon: "error",
        confirmButtonColor: "#1A2B49",
      });
      return;
    }
    if (password.length < 8) {
      Swal.fire({
        title: "Invalid Password",
        text: "Password must be at least 8 characters",
        icon: "error",
        confirmButtonColor: "#1A2B49",
      });
      return;
    }

    if (
      registrationType == "user" &&
      (!committeeName.trim() || !committeeCast.trim())
    ) {
      Swal.fire({
        title: "Missing Information",
        text: "Committee name and cast are required",
        icon: "error",
        confirmButtonColor: "#1A2B49",
      });
      return;
    }

    if (registrationType == "user") {
      // Committee registration with API call
      const committeeData = {
        Comm_Username: username,
        Comm_Email: usermail,
        Comm_Mobile: phone,
        Comm_Name: committeeName,
        Comm_Cast: committeeCast,
        Comm_Password: password,
      };

      try {
        const response = await fetch("http://127.0.0.1:8000/api/committee", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(committeeData),
        });

        if (!response.ok) {
          throw new Error("Failed to register committee");
        }

        const result = await response.json();
        Swal.fire({
          title: "Success!",
          text: "Committee registration successful!",
          icon: "success",
          confirmButtonColor: "#1A2B49",
        });

        // Reset form
        setUsername("");
        setUsermail("");
        setPhone("");
        setPassword("");
        setCommitteeName("");
        setCommitteeCast("");
        setRegistrationType(null);
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: "Failed to register committee. Please try again.",
          icon: "error",
          confirmButtonColor: "#1A2B49",
        });
        console.error("Error during committee registration:", error);
      }
    } else if (registrationType == "committee") {
      // User registration without API call
      Swal.fire({
        title: "Success!",
        text: "User registration successful!",
        icon: "success",
        confirmButtonColor: "#1A2B49",
      });

      // Reset form
      setUsername("");
      setUsermail("");
      setPhone("");
      setPassword("");
      setCommitteeName("");
      setCommitteeCast("");
      setRegistrationType(null);
    }
  };

  const handleOtpSubmit = (e) => {
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
    setResetPasswordStep(3);
    Swal.fire({
      title: "OTP Verified",
      text: "Please set your new password",
      icon: "success",
      confirmButtonColor: "#1A2B49",
    });
  };

  const handlePasswordReset = (e) => {
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
  };

  return (
    <div className="min-h-screen bg-white">
      <div
        className="relative bg-cover bg-center min-h-screen"
        style={{
          backgroundImage:
            "url('https://demo.harutheme.com/famipress/wp-content/uploads/2024/08/banner-1-slide-top-1.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-black/8 backdrop-blur-[1px]"></div>
        <div className="relative h-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full py-8 md:py-0">
            <div className="flex flex-col md:flex-row md:items-center min-h-[90vh] gap-8">
              <div className="text-white w-full md:w-1/2 pt-4 md:pt-0">
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
              <div className="flex justify-center mt-5 md:justify-end w-full md:w-1/2 pb-8 md:pb-0">
                <div className="w-full max-w-md backdrop-blur-md bg-white/10 p-6 sm:p-8 rounded-xl shadow-2xl border-l-[#29A55B] border-r-[#1A2B49] border-b-[#E7AF48] border-t-[#D7222F]">
                  {isLogin ? (
                    isOtpLogin ? (
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
                              className="w-full bg-[#1A2B49] text-white py-3 rounded-lg font-semibold hover:bg-[#1A2B49] transition-colors"
                            >
                              Send OTP
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
                            >
                              Verify OTP
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
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Re-enter New Password"
                                className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1A2B49]/50"
                                value={confirmPassword}
                                onChange={(e) =>
                                  setConfirmPassword(e.target.value)
                                }
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white"
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="w-5 h-5" />
                                ) : (
                                  <Eye className="w-5 h-5" />
                                )}
                              </button>
                            </div>
                            <button
                              type="submit"
                              className="w-full bg-[#1A2B49] text-white py-3 rounded-lg font-semibold hover:bg-[#1A2B49] transition-colors"
                            >
                              Reset Password
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
                          className="text-white mt-4 block text-center"
                        >
                          Back to Login
                        </button>
                      </div>
                    ) : (
                      <div>
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
                          </div>
                          <button
                            type="submit"
                            className="w-full bg-[#1A2B49] text-white py-3 rounded-lg font-semibold hover:bg-[#1A2B49] transition-colors"
                          >
                            Sign In
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsOtpLogin(true);
                              setResetPasswordStep(1);
                            }}
                            className="text-[white] text-sm text-right block w-full"
                          >
                            Forgot Password?
                          </button>
                        </form>
                        <p className="mt-6 text-center text-sm text-gray-100">
                          Don't have an account?{" "}
                          <button
                            onClick={() => setIsLogin(false)}
                            className="text-[white] cursor-pointer font-semibold"
                          >
                            Register
                          </button>
                        </p>
                      </div>
                    )
                  ) : registrationType ? (
                    <div className="">
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 text-center">
                        Register{" "}
                        {registrationType == "committee" ? "User" : "Committee"}
                      </h3>
                      <button
                        onClick={() => setRegistrationType(null)}
                        className="text-white cursor-pointer mb-4 block"
                      >
                        ← Back to registration options
                      </button>
                      <form
                        onSubmit={handleRegisterSubmit}
                        className="space-y-4"
                      >
                        <input
                          type="text"
                          placeholder="Username"
                          className="w-full pl-4 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1A2B49]/50"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                        />
                        <input
                          type="email"
                          placeholder="Enter Your Email"
                          className="w-full pl-4 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1A2B49]/50"
                          value={usermail}
                          onChange={(e) => setUsermail(e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="Phone Number"
                          className="w-full pl-4 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1A2B49]/50"
                          value={phone}
                          onChange={(e) =>
                            setPhone(e.target.value.replace(/\D/g, ""))
                          }
                          maxLength={10}
                        />
                        {registrationType == "committee" && (
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Enter Committee"
                              className="w-full pl-4 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1A2B49]/50"
                              value={committeeName}
                              onChange={(e) => setCommitteeName(e.target.value)}
                            />
                          </div>
                        )}
                        {registrationType == "user" && (
                          <div className="div">
                            <input
                              type="text"
                              placeholder="Enter Committee Name"
                              className="w-full pl-4 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1A2B49]/50"
                              value={committeeName}
                              onChange={(e) => setCommitteeName(e.target.value)}
                            />
                            <input
                              type="text"
                              placeholder="Cast Name"
                              className="w-full pl-4 mt-3 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1A2B49]/50"
                              value={committeeCast}
                              onChange={(e) => setCommitteeCast(e.target.value)}
                            />
                          </div>
                        )}
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
                        </div>
                        <button
                          type="submit"
                          className="w-full bg-[#1A2B49] text-white py-3 rounded-lg font-semibold hover:bg-[#1A2B49] transition-colors"
                        >
                          Register{" "}
                          {registrationType == "committee"
                            ? "User"
                            : "Committee"}
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 text-center">
                        Registration Options
                      </h3>
                      <button
                        onClick={() => setRegistrationType("committee")}
                        className="w-full bg-[#1A2B49] text-white py-3 rounded-lg font-semibold hover:bg-[#1A2B49] transition-colors mb-2"
                      >
                        Register As User
                      </button>
                      <button
                        onClick={() => setRegistrationType("user")}
                        className="w-full bg-[#1A2B49] text-white py-3 rounded-lg font-semibold hover:bg-[#1A2B49] transition-colors"
                      >
                        Registration Committee
                      </button>
                      <p className="mt-6 text-center text-sm text-gray-100">
                        Already have an account?{" "}
                        <button
                          onClick={() => setIsLogin(true)}
                          className="text-white cursor-pointer font-semibold"
                        >
                          Login
                        </button>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="bg-white rounded-xl border-l-[#29A55B] border-r-[#1A2B49] border-b-[#E7AF48] border-t-[#D7222F] p-5 sm:p-6 shadow-sm">
              <div className="w-12 h-12 bg-[#448AFF] rounded-lg flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-[#1A2B49]" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-[#1A2B49]">
                Galleries
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Create and share beautiful family photo albums.
              </p>
              <button className="mt-4 text-[#1A2B49] font-medium text-sm sm:text-base">
                View Gallery →
              </button>
            </div>
            <div className="bg-white p-5 sm:p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-[#448AFF] rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-[#1A2B49]" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-[#1A2B49]">
                Members Directory
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Connect with family members and build your family network.
              </p>
              <button className="mt-4 text-[#1A2B49] font-medium text-sm sm:text-base">
                View Members →
              </button>
            </div>
            <div className="bg-white p-5 sm:p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-[#448AFF] rounded-lg flex items-center justify-center mb-4">
                <UserPlus className="w-6 h-6 text-[#1A2B49]" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-[#1A2B49]">
                Find New Relatives
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Discover and connect with long-lost family members.
              </p>
              <button className="mt-4 text-[#1A2B49] font-medium text-sm sm:text-base">
                Start Search →
              </button>
            </div>
            <div className="bg-white p-5 sm:p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-[#448AFF] rounded-lg flex items-center justify-center mb-4">
                <GitBranch className="w-6 h-6 text-[#1A2B49]" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-[#1A2B49]">
                Family Timeline
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Create and explore your family's historical timeline.
              </p>
              <button className="mt-4 text-[#1A2B49] font-medium text-sm sm:text-base">
                View Timeline →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Loginhome;
