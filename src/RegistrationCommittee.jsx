"use client"

import { useEffect, useState, useRef } from "react"
import { Phone, Lock, Eye, EyeOff, Mail, User, Menu, X, IdCard } from "lucide-react"
import Swal from "sweetalert2"
import TypeIt from "typeit-react"
import "./Loginhome.css"
import "./MobileMenuAnimation.css" // Import the animation styles
import { Link, useNavigate } from "react-router-dom"
import logoImage from "./img/parivarlogo1.png"

const CustomLogoLoader = () => {
  const keyframes = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `
  if (!document.getElementById("spin-keyframes")) {
    const styleSheet = document.createElement("style")
    styleSheet.id = "spin-keyframes"
    styleSheet.textContent = keyframes
    document.head.appendChild(styleSheet)
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
  )
}

function RegistrationCommittee() {
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [mobile, setMobile] = useState("")
  const [shortCommName, setShortCommName] = useState("")
  const [commName, setCommName] = useState("")
  const [panNo, setPanNo] = useState("")
  const [password, setPassword] = useState("")
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMenuClosing, setIsMenuClosing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()
  const mobileMenuRef = useRef(null)

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    if (!name.trim()) {
      Swal.fire({
        title: "Missing Information",
        text: "Name is required",
        icon: "error",
        confirmButtonColor: "#1A2B49",
      })
      setIsLoading(false)
      return
    }
    if (!email.trim()) {
      Swal.fire({
        title: "Missing Information",
        text: "Email is required",
        icon: "error",
        confirmButtonColor: "#1A2B49",
      })
      setIsLoading(false)
      return
    }
    if (!/^\d{10}$/.test(mobile)) {
      Swal.fire({
        title: "Invalid Mobile Number",
        text: "Mobile number must be exactly 10 digits",
        icon: "error",
        confirmButtonColor: "#1A2B49",
      })
      setIsLoading(false)
      return
    }
    if (password.length < 8) {
      Swal.fire({
        title: "Invalid Password",
        text: "Password must be at least 8 characters",
        icon: "error",
        confirmButtonColor: "#1A2B49",
      })
      setIsLoading(false)
      return
    }
    if (!shortCommName.trim() || !commName.trim()) {
      Swal.fire({
        title: "Missing Information",
        text: "Community names are required",
        icon: "error",
        confirmButtonColor: "#1A2B49",
      })
      setIsLoading(false)
      return
    }
    if (!panNo.trim()) {
      Swal.fire({
        title: "Missing Information",
        text: "PAN Number is required",
        icon: "error",
        confirmButtonColor: "#1A2B49",
      })
      setIsLoading(false)
      return
    }

    const userData = {
      U_Name: name,
      U_Email: email,
      U_Password: password,
      U_Mobile: mobile,
      PackageId: "1",
      Short_CommName: shortCommName,
      Comm_Name: commName,
      PAN_No: panNo,
      Role_Id: "2",
    }

    try {
      const response = await fetch("https://parivaar.app/public/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      const result = await response.json()

      if (response.ok) {
        Swal.fire({
          title: "Success!",
          text: "User registration successful!",
          icon: "success",
          confirmButtonColor: "#1A2B49",
        })

        setName("")
        setEmail("")
        setMobile("")
        setShortCommName("")
        setCommName("")
        setPanNo("")
        setPassword("")
        navigate("/login")
      } else {
        if (result.errors) {
          if (result.errors.U_Email && result.errors.U_Mobile) {
            Swal.fire({
              title: "Email and Mobile Already Exist",
              text: "Both email and mobile number are already registered. Please use different ones.",
              icon: "error",
              confirmButtonColor: "#1A2B49",
            })
          } else if (result.errors.U_Email) {
            Swal.fire({
              title: "Email Already Exists",
              text: "This email is already registered. Please use a different email.",
              icon: "error",
              confirmButtonColor: "#1A2B49",
            })
          } else if (result.errors.U_Mobile) {
            Swal.fire({
              title: "Mobile Number Already Exists",
              text: "This mobile number is already registered. Please use a different number.",
              icon: "error",
              confirmButtonColor: "#1A2B49",
            })
          } else {
            throw new Error("Registration failed")
          }
        } else {
          throw new Error(result.message || "Registration failed")
        }
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error.message || "Failed to register user. Please try again.",
        icon: "error",
        confirmButtonColor: "#1A2B49",
      })
      console.error("Error during user registration:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleMobileMenu = () => {
    if (isMenuOpen) {
      // Start closing animation
      setIsMenuClosing(true)
      // Wait for animation to complete before hiding menu
      setTimeout(() => {
        setIsMenuOpen(false)
        setIsMenuClosing(false)
      }, 300)
    } else {
      setIsMenuOpen(true)
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && isMenuOpen) {
        toggleMobileMenu()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isMenuOpen])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMenuOpen(false)
        setIsMenuClosing(false)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <>
      {isLoading && <CustomLogoLoader />}
      <header
        className={`sticky top-0 w-full z-50 text-white py-3 transition-colors duration-300 ${isScrolled ? "bg-[#1A2B49]" : "bg-[#172841]"}`}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2">
              <img className="w-10" src={logoImage || "/placeholder.svg"} alt="Parivaar Logo" />
              <span className="text-xl md:text-2xl font-bold">Parivaar</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-4">
              <Link to="/" className="px-4 py-2 font-semibold hover:bg-white/10 rounded-lg transition-colors">
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
            backgroundImage:
              "url('https://demo.harutheme.com/famipress/wp-content/uploads/2024/08/banner-1-slide-top-1.jpg')",
          }}
        >
          <div className="absolute inset-0 bg-black/8 backdrop-blur-[1px]"></div>
          <div className="relative h-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
              <div className="flex flex-col md:flex-row md:items-center min-h-[85vh] gap-6">
                <div className="hidden md:block text-white w-full md:w-1/2 pt-4">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 leading-tight">
                    Family is not an important thing.
                    <TypeIt
                      getBeforeInit={(instance) => {
                        instance.type(" It's everyth").pause(750).delete(2).pause(500).type("thing...")
                        return instance
                      }}
                    />
                  </h2>
                  <p className="text-base sm:text-lg text-gray-200 mb-6 max-w-lg">
                    When it comes to your family tree, every branch matters. Discover your roots and bring your family
                    history to life.
                  </p>
                </div>
                <div className="flex justify-center mt-12 sm:mt-16 md:mt-0 md:justify-end w-full md:w-1/2 pb-6">
                  <div className="w-full max-w-sm sm:max-w-md backdrop-blur-md bg-white/7  p-4 sm:p-6 rounded-xl shadow-2xl border-l-[#29A55B] border-r-[#1A2B49] border-b-[#E7AF48] border-t-[#D7222F]">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-4 text-center">Register Community</h3>
                    <form onSubmit={handleRegisterSubmit} className="space-y-3">
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                        <input
                          type="text"
                          placeholder="Name"
                          className="w-full pl-10 pr-4 py-2 sm:py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1A2B49]/50"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                        <input
                          type="email"
                          placeholder="Enter Your Email"
                          className="w-full pl-10 pr-4 py-2 sm:py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1A2B49]/50"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                        <input
                          type="text"
                          placeholder="Phone Number"
                          className="w-full pl-10 pr-4 py-2 sm:py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1A2B49]/50"
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                          maxLength={10}
                        />
                      </div>
                      
                      <input
                        type="text"
                        placeholder="Short Community Name"
                        className="w-full pl-4 pr-4 py-2 sm:py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1A2B49]/50"
                        value={shortCommName}
                        onChange={(e) => setShortCommName(e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Community Name"
                        className="w-full pl-4 pr-4 py-2 sm:py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1A2B49]/50"
                        value={commName}
                        onChange={(e) => setCommName(e.target.value)}
                      />
                      <div className="div text-white relative">
                        <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />

                      <input
                        type="text"
                        placeholder="PAN Number"
                        className="w-full pl-10 pr-12 py-2 sm:py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1A2B49]/50"
                        value={panNo}
                        onChange={(e) => setPanNo(e.target.value)}
                      />

</div>

                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          className="w-full pl-10 pr-12 py-2 sm:py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1A2B49]/50"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-[#1A2B49] text-white py-2 sm:py-3 rounded-lg font-semibold hover:bg-[#1a2b497c] transition-colors"
                        disabled={isLoading}
                      >
                        {isLoading ? "Registering..." : "Register Community"}
                      </button>
                    </form>
                    <button
                      onClick={() => navigate("/login")}
                      className="text-white mt-3 block w-full text-center text-sm sm:text-base"
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
  )
}

export default RegistrationCommittee
