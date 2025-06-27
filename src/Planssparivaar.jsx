import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  Shield,
  Star,
  Check,
  ArrowRight,
  Users,
  Globe,
  Gift,
  Menu,
  X,
} from "lucide-react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import logoImage from "./img/parivarlogo1.png";

function Planssparivaar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const headerRef = useRef(null);
  const titleRef = useRef(null);
  const cardsRef = useRef([]);
  const featuresRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const sliderRef = useRef(null);

  useEffect(() => {
    const fetchPlans = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          "https://parivaar.app/public/api/packages"
        );
        const result = await response.json();
        if (result.status) {
          const activePlans = result.data.filter((plan) => plan.Status == "A");
          setPlans(activePlans);
          setError(null);
        } else {
          throw new Error(
            "Failed to fetch plans: " + (result.message || "Unknown error")
          );
        }
      } catch (err) {
        console.error("API Error:", err);
        setError("Failed to load plans. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, []);

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
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: Math.min(plans.length, 3),
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    beforeChange: (current, next) => setActiveSlide(next),
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(plans.length, 2),
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false,
        },
      },
    ],
  };

  const features = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Family Management",
      description: "Manage your entire family's profiles and connections",
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Community Access",
      description: "Connect with your community members worldwide",
    },
    {
      icon: <Gift className="w-8 h-8" />,
      title: "Premium Features",
      description: "Access to exclusive premium features and content",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Data Security",
      description: "Enterprise-grade security for your family's data",
    },
  ];

  const toggleMobileMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const togglePlanFeatures = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-[#1A2B49]">
      {/* Header */}
      <header
        ref={headerRef}
        className={`fixed w-full z-50 text-white py-3 transition-all duration-300 ${
          isScrolled ? "bg-[#1A2B49] shadow-lg py-2" : "bg-[#1A2B49] py-3"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2">
              <img className="w-10" src={logoImage} alt="Parivaar Logo" />
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
              <Link
                to="/planssparivaar"
                className="px-4 py-2 font-semibold bg-white text-[#1A2B49] rounded-lg hover:bg-gray-100 transition-colors"
              >
                Plans
              </Link>
              <Link
                to="/login"
                className="px-4 py-2 font-semibold hover:bg-white/10 rounded-lg transition-colors"
              >
                Login
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white p-2"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation Menu */}
          {isMenuOpen && (
            <div
              ref={mobileMenuRef}
              className="md:hidden absolute top-full left-0 right-0 bg-[#1A2B49] mt-1 p-4 shadow-lg rounded-b-lg z-50 border-t border-white/10"
            >
              <nav className="flex flex-col space-y-3">
                <Link
                  to="/"
                  className="px-4 py-2 font-semibold rounded-lg transition-colors hover:bg-white/10"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/planssparivaar"
                  className="px-4 py-2 font-semibold rounded-lg transition-colors hover:bg-white/10"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Plans
                </Link>
                <Link
                  to="/login"
                  className="px-4 py-2 font-semibold bg-white text-[#1A2B49] rounded-lg hover:bg-gray-100 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-16">
          <h1
            ref={titleRef}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight"
          >
            Choose Your Perfect Plan
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            Simple pricing for every family. Start protecting your loved ones
            today.
          </p>
        </div>

        {error && (
          <div className="max-w-md mx-auto bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-8 text-center text-white">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center space-x-2 my-20">
            <div
              className="w-4 h-4 bg-white rounded-full animate-bounce"
              style={{ animationDelay: "0s" }}
            ></div>
            <div
              className="w-4 h-4 bg-white rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="w-4 h-4 bg-white rounded-full animate-bounce"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center text-white">
            No active plans available.
          </div>
        ) : (
          <>
            <div className="max-w-7xl mx-auto mb-12 md:mb-20 pricing-container">
              <Slider
                {...sliderSettings}
                className="pricing-slider"
                ref={sliderRef}
              >
                {plans.map((plan, index) => (
                  <div key={plan.PackageId} className="px-2 sm:px-3 lg:px-4">
                    <div
                      ref={(el) => (cardsRef.current[index] = el)}
                      className={`relative rounded-2xl p-4 sm:p-6 md:p-8 h-full min-h-[500px] sm:min-h-[550px] flex flex-col ${
                        index === activeSlide
                          ? "bg-white shadow-2xl transform -translate-y-2 hover:shadow-[0_20px_60px_-15px_rgba(255,255,255,0.3)]"
                          : "bg-white/10 backdrop-blur-lg hover:bg-white/20 border border-white/20"
                      } transition-all duration-300`}
                    >
                      <div className="absolute top-0 right-0">
                        {index === 1 && (
                          <div className="bg-[#1A2B49] text-white px-3 py-1 sm:px-4 sm:py-1 rounded-tr-2xl rounded-bl-2xl text-xs sm:text-sm font-semibold">
                            Popular
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-center text-center flex-grow">
                        <div
                          className={`p-3 sm:p-4 rounded-full ${
                            index === activeSlide
                              ? "bg-[#1A2B49]/10"
                              : "bg-white/20"
                          }`}
                        >
                          {index === 0 && (
                            <Heart
                              className={`w-6 h-6 sm:w-8 sm:h-8 ${
                                index === activeSlide
                                  ? "text-[#1A2B49]"
                                  : "text-white"
                              }`}
                            />
                          )}
                          {index === 1 && (
                            <Star className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
                          )}
                          {index === 2 && (
                            <Shield
                              className={`w-6 h-6 sm:w-8 sm:h-8 ${
                                index === activeSlide
                                  ? "text-[#1A2B49]"
                                  : "text-white"
                              }`}
                            />
                          )}
                        </div>

                        <h3
                          className={`text-lg sm:text-xl md:text-2xl font-bold mt-3 sm:mt-4 ${
                            index === activeSlide
                              ? "text-[#1A2B49]"
                              : "text-white"
                          }`}
                        >
                          {plan.PackageName}
                        </h3>

                        <div className="mt-3 sm:mt-4 mb-4 sm:mb-6">
                          <span
                            className={`text-3xl sm:text-4xl md:text-5xl font-bold ${
                              index === activeSlide
                                ? "text-[#1A2B49]"
                                : "text-white"
                            }`}
                          >
                            ₹{parseFloat(plan.Final_Price).toLocaleString()}
                          </span>
                          <span
                            className={`text-xs sm:text-sm ml-1 sm:ml-2 ${
                              index === activeSlide
                                ? "text-[#1A2B49]/70"
                                : "text-white/70"
                            }`}
                          >
                            /
                            {plan.duration_type?.Dur_Type.toLowerCase() ||
                              "month"}
                          </span>
                        </div>

                        <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 flex-grow w-full px-2">
                          {(isExpanded
                            ? plan.features
                            : plan.features?.slice(0, 3)
                          )?.map((feature, i) => (
                            <li
                              key={i}
                              className={`flex items-start text-left ${
                                index === activeSlide
                                  ? "text-[#1A2B49]/80"
                                  : "text-white/80"
                              }`}
                            >
                              <Check
                                className={`w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0 mt-0.5 ${
                                  index === activeSlide
                                    ? "text-[#1A2B49]"
                                    : "text-white"
                                }`}
                              />
                              <span className="text-sm sm:text-base">
                                {feature.Package_Fea_Name}
                              </span>
                            </li>
                          ))}
                          <li
                            className={`flex items-start text-left ${
                              index === activeSlide
                                ? "text-[#1A2B49]/80"
                                : "text-white/80"
                            }`}
                          >
                            <Check
                              className={`w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0 mt-0.5 ${
                                index === activeSlide
                                  ? "text-[#1A2B49]"
                                  : "text-white"
                              }`}
                            />
                            <span className="text-sm sm:text-base">
                              Up to {plan.MaxUsers || "unlimited"} Users
                            </span>
                          </li>
                        </ul>

                        {plan.features?.length > 3 && (
                          <button
                            onClick={togglePlanFeatures}
                            className={`mt-1 sm:mt-2 text-xs sm:text-sm font-semibold ${
                              index === activeSlide
                                ? "text-[#1A2B49] hover:underline"
                                : "text-white/80 hover:text-white hover:underline"
                            }`}
                          >
                            {isExpanded ? "See Less" : "See More"}
                          </button>
                        )}

                        <Link
                          to="/registration-committee"
                          className={`w-full py-2 sm:py-3 rounded-full font-semibold transition-all duration-300 flex items-center justify-center space-x-1 sm:space-x-2 mt-auto text-sm sm:text-base ${
                            index === activeSlide
                              ? "bg-[#1A2B49] text-white hover:shadow-lg hover:-translate-y-0.5"
                              : "bg-white text-[#1A2B49] hover:bg-white/90"
                          }`}
                        >
                          <span>Get Started</span>
                          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </Slider>
            </div>

            <div
              ref={featuresRef}
              className="max-w-6xl mx-auto mt-12 sm:mt-16 md:mt-20 lg:mt-24 px-4 sm:px-6"
            >
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white text-center mb-8 sm:mb-10 md:mb-12">
                Everything You Need
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-1 border border-white/20 group"
                  >
                    <div className="bg-white/10 p-2 sm:p-3 rounded-lg inline-block mb-3 sm:mb-4 group-hover:bg-white/20 transition-all">
                      {React.cloneElement(feature.icon, {
                        className: "w-5 h-5 sm:w-6 sm:h-6 text-white",
                      })}
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white mb-2 sm:mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-white/70 text-xs sm:text-sm md:text-base">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12 sm:mt-16 md:mt-20 px-4 sm:px-6 text-center">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-4xl mx-auto border border-white/20">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4">
                  Ready to Get Started?
                </h2>
                <p className="text-white/80 mb-4 sm:mb-6 max-w-2xl mx-auto text-sm sm:text-base">
                  Join thousands of families who trust Parivaar for connecting
                  and managing their family networks.
                </p>
                <Link
                  to="/registration-committee"
                  className="inline-block bg-white text-[#1A2B49] px-6 sm:px-8 py-2 sm:py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 text-sm sm:text-base"
                >
                  Sign Up Now
                </Link>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Planssparivaar;