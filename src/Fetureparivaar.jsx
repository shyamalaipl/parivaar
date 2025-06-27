"use client";

import { useState, useEffect, useRef } from "react";
import TypeIt from "typeit-react";
import { Link } from "react-router-dom";
import bell from "./img/Bell.jpg";
import calender from "./img/Calender.jpg";
import heart from "./img/heart.jpg";
import job from "./img/job.jpg";
import shop from "./img/market.jpg";
import galley from "./img/Gallery.jpg";
import logo from "./img/parivarlogo1.png";
import app from "./img/appparivaar.png";
import slider1 from "./img/1.png";
import slider2 from "./img/2.png";
import slider3 from "./img/3.png";
import "./MobileMenuAnimation.css";
import {
  Bell,
  Calendar,
  ImageIcon,
  Heart,
  Briefcase,
  ShoppingBag,
  Star,
  Home,
  Users,
  Phone,
  Download,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  LucidePartyPopper,
  ChevronDown,
  CheckCircle2,
  Menu,
  X,
} from "lucide-react";
import { ImSad } from "react-icons/im";

const Fetureparivaar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuClosing, setIsMenuClosing] = useState(false);
  const [isQuickLinksOpen, setIsQuickLinksOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    city: "",
    date: "",
    fromTime: "",
    toTime: "",
    notes: "",
  });
  const [showForm, setShowForm] = useState(true);
  const [counts, setCounts] = useState({
    premiumFeatures: 0,
    communityEvents: 0,
    activeUsers: 0,
    appDownloads: 0,
  });

  const featuresRef = useRef(null);
  const contactRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayRef = useRef(null);
  const sliderRef = useRef(null);

  const slides = [{ image: slider3 }, { image: slider2 }, { image: slider1 }];

  const quickLinks = [
    { name: "Home", path: "/" },
    // { name: "Pricing", path: "/planssparivaar" },
    { name: "Login", path: "/login" },
    { name: "Features", path: "#features" },
    { name: "Contact", path: "#contact" },
  ];

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

  useEffect(() => {
    const animateCounts = () => {
      const targets = {
        premiumFeatures: 50,
        communityEvents: 1000,
        activeUsers: 100000,
        appDownloads: 500000,
      };

      const duration = 2000;
      const steps = 60;
      const increment = {
        premiumFeatures: targets.premiumFeatures / steps,
        communityEvents: targets.communityEvents / steps,
        activeUsers: targets.activeUsers / steps,
        appDownloads: targets.appDownloads / steps,
      };

      let currentStep = 0;

      const interval = setInterval(() => {
        if (currentStep >= steps) {
          clearInterval(interval);
          setCounts({
            premiumFeatures: targets.premiumFeatures,
            communityEvents: targets.communityEvents,
            activeUsers: targets.activeUsers,
            appDownloads: targets.appDownloads,
          });
          return;
        }

        setCounts((prev) => ({
          premiumFeatures: Math.min(
            prev.premiumFeatures + increment.premiumFeatures,
            targets.premiumFeatures
          ),
          communityEvents: Math.min(
            prev.communityEvents + increment.communityEvents,
            targets.communityEvents
          ),
          activeUsers: Math.min(
            prev.activeUsers + increment.activeUsers,
            targets.activeUsers
          ),
          appDownloads: Math.min(
            prev.appDownloads + increment.appDownloads,
            targets.appDownloads
          ),
        }));

        currentStep++;
      }, duration / steps);

      return () => clearInterval(interval);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animateCounts();
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    const statsSection = document.querySelector(".stats-section");
    if (statsSection) observer.observe(statsSection);

    return () => observer.disconnect();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDateChange = (e) => {
    const selectedDate = new Date(e.target.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      alert("Please select today's date or a future date.");
      return;
    }

    const day = selectedDate.getDay();
    if (day === 0 || day === 6) {
      alert("Weekends (Saturday and Sunday) are not allowed for scheduling.");
      return;
    }
    
    setFormData({
      ...formData,
      date: e.target.value,
    });
  };

  const handleTimeChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "fromTime" && formData.toTime && value >= formData.toTime) {
      alert("From Time must be earlier than To Time.");
      return;
    }
    
    if (name === "toTime" && formData.fromTime && value <= formData.fromTime) {
      alert("To Time must be later than From Time.");
      return;
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const sche_time_slots = `${formData.fromTime} - ${formData.toTime}`;

    const apiData = {
      sche_name: formData.name,
      sche_email: formData.email,
      sche_phone: formData.contact,
      sche_date: formData.date,
      sche_time_slots: sche_time_slots,
      additional_note: formData.notes,
      sche_status: 1,
    };

    try {
      const response = await fetch(
        "https://parivaar.app/public/api/schedule-demo",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(apiData),
        }
      );

      if (response.ok) {
        setShowForm(false);
        setFormData({
          name: "",
          email: "",
          contact: "",
          city: "",
          date: "",
          fromTime: "",
          toTime: "",
          notes: "",
        });
      } else {
        alert("Failed to schedule demo. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred. Please try again later.");
    }
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      if (window.scrollY > 300) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayRef.current = setInterval(() => {
        nextSlide();
      }, 2000);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [currentSlide, isAutoPlaying]);

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

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const handleSliderHover = (isHovering) => {
    setIsAutoPlaying(!isHovering);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth" });
    setIsMenuOpen(false);
  };

  const scrollToContact = () => {
    contactRef.current?.scrollIntoView({ behavior: "smooth" });
    setIsMenuOpen(false);
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

  const features = [
    {
      icon: <Bell className="w-8 h-8" />,
      title: "News",
      description:
        "Stay updated with the latest community news and announcements.",
      color: "from-red-500 to-red-600",
      delay: "0",
      image: bell,
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Event",
      description:
        "Plan and manage community events with reminders and schedules.",
      color: "from-green-500 to-green-600",
      delay: "100",
      image: calender,
    },
    {
      icon: <ImageIcon className="w-8 h-8" />,
      title: "Gallery",
      description:
        "Share and view photos from community events and gatherings.",
      color: "from-purple-500 to-purple-600",
      delay: "200",
      image: galley,
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Matrimony",
      description:
        "Find and connect with potential life partners within the community.",
      color: "from-pink-500 to-pink-600",
      delay: "300",
      image: heart,
    },
    {
      icon: <Briefcase className="w-8 h-8" />,
      title: "Job",
      description:
        "Explore job opportunities and career support within the community.",
      color: "from-blue-500 to-blue-600",
      delay: "400",
      image: job,
    },
    {
      icon: <ShoppingBag className="w-8 h-8" />,
      title: "Shop",
      description:
        "Buy and sell products or services within the community marketplace.",
      color: "from-amber-500 to-amber-600",
      delay: "500",
      image: shop,
    },
    {
      icon: <ImSad className="w-8 h-8" />,
      title: "Condolences",
      description:
        "Pay respects and share memories for those we've lost in the community.",
      color: "from-gray-600 to-gray-800",
      delay: "600",
    },
    {
      icon: <LucidePartyPopper className="w-8 h-8" />,
      title: "Celebration",
      description:
        "Celebrate birthdays, anniversaries, and joyful moments together.",
      color: "from-yellow-400 to-yellow-500",
      delay: "700",
    },
  ];

  const highlights = [
    {
      icon: <Star className="w-8 h-8" />,
      title: "Premium Features",
      count: counts.premiumFeatures,
      displayCount: `${Math.round(counts.premiumFeatures)}+`,
      color: "text-yellow-500",
    },
    {
      icon: <Home className="w-8 h-8" />,
      title: "Community Events",
      count: counts.communityEvents,
      displayCount: `${Math.round(counts.communityEvents / 1000)}K+`,
      color: "text-green-500",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Active Users",
      count: counts.activeUsers,
      displayCount: `${Math.round(counts.activeUsers / 1000)}K+`,
      color: "text-blue-500",
    },
    {
      icon: <Phone className="w-8 h-8" />,
      title: "App Downloads",
      count: counts.appDownloads,
      displayCount: `${Math.round(counts.appDownloads / 1000)}K+`,
      color: "text-purple-500",
    },
  ];

  // Format today's date for min attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <>
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
                src={logo || "/placeholder.svg"}
                alt="Parivaar Logo"
              />
              <span className="text-2xl font-bold">Parivaar</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-4">
              <Link
                to="/"
                className={`px-4 py-2 font-semibold rounded-lg transition-colors ${
                  isScrolled
                    ? "bg-white text-[#1A2B49] hover:bg-gray-100 hover:text-[#1A2B49]"
                    : "bg-white text-[#1A2B49] hover:bg-gray-100 hover:text-[#1A2B49]"
                }`}
              >
                Home
              </Link>
              {/* <Link
                to="/planssparivaar"
                className="px-4 py-2 font-semibold hover:bg-white hover:text-[#1A2B49] rounded-lg transition-colors"
              >
                Plans
              </Link> */}
              <Link
                to="/login"
                className={`px-4 py-2 font-semibold rounded-lg transition-colors ${
                  isScrolled
                    ? "text-white hover:bg-white hover:text-[#1A2B49]"
                    : "text-white hover:bg-white hover:text-[#1A2B49]"
                }`}
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
              className={`md:hidden absolute top-full left-0 right-0 bg-[#1A2B49] mt- p-4 shadow-lg rounded-b-lg z-50 ${
                isMenuClosing ? "animate-menu-close" : "animate-menu-open"
              }`}
            >
              <nav className="flex flex-col space-y-3">
                <Link
                  to="/"
                  className="px-4 py-2 font-semibold rounded-lg transition-colors bg-white text-[#1A2B49] hover:bg-gray-100"
                  onClick={toggleMobileMenu}
                >
                  Home
                </Link>
                {/* <Link
                  to="/planssparivaar"
                  className="px-4 py-2 font-semibold rounded-lg transition-colors hover:bg-white hover:text-[#1A2B49]"
                  onClick={toggleMobileMenu}
                >
                  Plans
                </Link> */}
                <Link
                  to="/login"
                  className="px-4 py-2 font-semibold rounded-lg transition-colors hover:bg-white hover:text-[#1A2B49]"
                  onClick={toggleMobileMenu}
                >
                  Login
                </Link>
                <button
                  onClick={scrollToFeatures}
                  className="text-left px-4 py-2 font-semibold rounded-lg transition-colors hover:bg-white hover:text-[#1A2B49]"
                >
                  Features
                </button>
                <button
                  onClick={scrollToContact}
                  className="text-left px-4 py-2 font-semibold rounded-lg transition-colors hover:bg-white hover:text-[#1A2B49]"
                >
                  Contact
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {showScrollButton && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 cursor-pointer right-8 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[#1A2B49] to-[#3A4B69] text-white shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center group"
          aria-label="Scroll to top"
        >
          <div className="relative">
            <ArrowUp className="w-6 h-6 transition-transform duration-300 group-hover:-translate-y-1" />
            <div className="absolute -bottom-1 left-0 right-0 h-1 bg-white/30 rounded-full overflow-hidden">
              <div className="h-full bg-white/80 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="absolute inset-0 rounded-full border-2 border-white/20 group-hover:border-white/40 transition-all duration-300"></div>
        </button>
      )}

      <section
        className="relative h-[60vh] md:h-[100vh] overflow-hidden"
        ref={sliderRef}
        onMouseEnter={() => handleSliderHover(true)}
        onMouseLeave={() => handleSliderHover(false)}
      >
        <style>
          {`
            @media (max-width: 640px) {
              .slider-section {
                height: 40vh !important;
              }
              .slider-image {
                object-fit: contain !important;
                object-position: center !important;
              }
              .slider-text-container {
                padding: 1rem !important;
              }
              .slider-heading {
                font-size: 1.5rem !important;
                line-height: 1.2 !important;
              }
              .slider-subheading {
                font-size: 1rem !important;
                line-height: 1.2 !important;
              }
              .slider-nav-button {
                width: 2.5rem !important;
                height: 2.5rem !important;
              }
              .slider-nav-icon {
                width: 1rem !important;
                height: 1rem !important;
              }
              .slider-dot {
                width: 0.5rem !important;
                height: 0.5rem !important;
              }
              .slider-dot-active {
                width: 1.5rem !important;
              }
            }
          `}
        </style>
        <div className="absolute inset-0">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                currentSlide === index ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={slide.image || "/placeholder.svg"}
                alt={`Slide ${index + 1}`}
                className="w-full h-full object-cover slider-image"
              />
            </div>
          ))}
        </div>

        <div className="absolute inset-0 flex items-center justify-center slider-section">
          <div className="text-center text-white max-w-4xl px-4 z-10 slider-text-container">
            <div className="animate-fade-in mb-6">
              {currentSlide === 0 && <></>}
              {currentSlide === 1 && <></>}
              {currentSlide === 2 && <></>}
            </div>
            <div className="mt-10"></div>
          </div>
        </div>

        <div className="absolute bottom-10 left-0 right-0 flex justify-center items-center gap-4 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 slider-dot ${
                currentSlide === index
                  ? "bg-white slider-dot-active"
                  : "bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <button
          onClick={prevSlide}
          className="absolute left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-all duration-300 slider-nav-button"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 slider-nav-icon" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-all duration-300 slider-nav-button"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6 slider-nav-icon" />
        </button>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
      </section>

      <div className="min-h-screen mt-10 bg-gradient-to-b from-gray-50 to-white">
        <div ref={featuresRef} className="bg-[#1A2B49] py-12 pb-5 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold text-white text-center">
                  Why Communities Choose Us
                </h2>
                <p className="text-xl text-center text-blue-200">
                  Discover the tools and features designed to keep your
                  community connected and thriving.
                </p>
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-lg hover:bg-white/10 transition-colors duration-300"
                    >
                      <div
                        className={`bg-gradient-to-r ${feature.color} p-3 rounded-lg text-white`}
                      >
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {feature.title}
                        </h3>
                        <p className="text-blue-200">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 mb--10 my-10 relative z-10 stats-section">
          <div className="bg-white rounded-2xl shadow-xl p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {highlights.map((item, index) => (
              <div key={index} className="text-center">
                <div className={`${item.color} flex justify-center mb-4`}>
                  {item.icon}
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {item.displayCount}
                </p>
                <p className="text-sm text-gray-600">{item.title}</p>
              </div>
            ))}
          </div>
        </div>

        <div
          className="relative bg-cover bg-center py-20 md:py-32 px-4"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1511895426328-dc8714191300?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80')",
            backgroundAttachment: "fixed",
          }}
        >
          <div className="absolute inset-0 bg-[#1A2B49]/80"></div>
          <div className="relative max-w-7xl mx-auto text-center">
            <h1 className="text-3xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
              Connect With Your Community
            </h1>
            <p className="text-lg md:text-2xl text-gray-200 max-w-3xl mx-auto animate-fade-in-up">
              Building stronger community bonds through technology
            </p>
            <div className="mt-12 flex justify-center gap-4">
              <button className="bg-white text-[#1A2B49] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all duration-300">
                <Link to="/login">Get Started</Link>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white py-10 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6 order-2 md:order-1">
                <h2 className="text-3xl md:text-4xl font-bold text-[#1A2B49]">
                  Download Our App
                </h2>
                <p className="text-xl text-gray-600">
                  Get the Parivaar app on your mobile device and stay connected
                  with your community on the go.
                </p>
                <a
                  href="https://play.google.com/store/apps/details?id=com.arth.aark.parivaar&pli=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#1A2B49] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#2A3B59] transform hover:scale-105 transition-all duration-300"
                >
                  <Download className="w-5 h-5" />
                  Download Now
                </a>
              </div>
              <div className="relative order-1 md:order-2">
                <img
                  src={app || "/placeholder.svg"}
                  alt="Parivaar App"
                  className="w-full max-w-md mx-auto rounded-2xl"
                />
              </div>
            </div>
          </div>
        </div>

        <div ref={contactRef} className="max-w-7xl mx-auto px-4 py-10">
          <div className="relative overflow-hidden rounded-3xl bg-[#1A2B49] p-8 md:p-12">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl text-center font-bold text-white mb-4">
                Ready to Connect?
              </h2>
              <p className="text-xl text-blue-100 text-center mb-8 max-w-2xl mx-auto">
                Join thousands of communities already using our platform to stay
                connected and engaged.
              </p>

              {showForm ? (
                <form
                  onSubmit={handleSubmit}
                  className="bg-white/95 backdrop-blur-md p-4 md:p-8 rounded-2xl shadow-2xl transform transition-all duration-300 hover:shadow-3xl"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div className="space-y-6">
                      <div className="group">
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-gray-700 group-hover:text-[#1A2B49] transition-colors"
                        >
                          Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="mt-2 block w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent transition-all duration-300 hover:border-[#1a2b49b9]"
                          required
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div className="group">
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-700 group-hover:text-[#1A2B49] transition-colors"
                        >
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="mt-2 block w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent transition-all duration-300 hover:border-[#1a2b49b9]"
                          required
                          placeholder="your@email.com"
                        />
                      </div>

                      <div className="group">
                        <label
                          htmlFor="contact"
                          className="block text-sm font-medium text-gray-700 group-hover:text-[#1A2B49] transition-colors"
                        >
                          Contact Number
                        </label>
                        <input
                          type="tel"
                          id="contact"
                          name="contact"
                          value={formData.contact}
                          onChange={handleInputChange}
                          className="mt-2 block w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent transition-all duration-300 hover:border-[#1a2b49b9]"
                          required
                          placeholder="Your contact number"
                        />
                      </div>

                      <div className="group">
                        <label
                          htmlFor="city"
                          className="block text-sm font-medium text-gray-700 group-hover:text-[#1A2B49] transition-colors"
                        >
                          City
                        </label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="mt-2 block w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent transition-all duration-300 hover:border-[#1a2b49b9]"
                          required
                          placeholder="Your city"
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="group">
                        <label
                          htmlFor="date"
                          className="block text-sm font-medium text-gray-700 group-hover:text-[#1A2B49] transition-colors"
                        >
                          Select Date
                        </label>
                        <input
                          type="date"
                          id="date"
                          name="date"
                          value={formData.date}
                          onChange={handleDateChange}
                          min={today}
                          className="mt-2 block w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent transition-all duration-300 hover:border-[#1a2b49b9]"
                          required
                        />
                      </div>

                      <div className="group">
                        <label
                          htmlFor="fromTime"
                          className="block text-sm font-medium text-gray-700 group-hover:text-[#1A2B49] transition-colors"
                        >
                          From Time
                        </label>
                        <input
                          type="time"
                          id="fromTime"
                          name="fromTime"
                          value={formData.fromTime}
                          onChange={handleTimeChange}
                          className="mt-2 block w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent transition-all duration-300 hover:border-[#1a2b49b9]"
                          required
                        />
                      </div>

                      <div className="group">
                        <label
                          htmlFor="toTime"
                          className="block text-sm font-medium text-gray-700 group-hover:text-[#1A2B49] transition-colors"
                        >
                          To Time
                        </label>
                        <input
                          type="time"
                          id="toTime"
                          name="toTime"
                          value={formData.toTime}
                          onChange={handleTimeChange}
                          min={formData.fromTime}
                          className="mt-2 block w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent transition-all duration-300 hover:border-[#1a2b49b9]"
                          required
                        />
                      </div>

                      <div className="group">
                        <label
                          htmlFor="notes"
                          className="block text-sm font-medium text-gray-700 group-hover:text-[#1A2B49] transition-colors"
                        >
                          Additional Notes
                        </label>
                        <textarea
                          id="notes"
                          name="notes"
                          value={formData.notes}
                          onChange={handleInputChange}
                          className="mt-2 block w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent transition-all duration-300 hover:border-[#1a2b49b9] resize-none"
                          rows="4"
                          placeholder="Any additional information..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-center">
                    <button
                      type="submit"
                      className="relative overflow-hidden w-full md:w-auto bg-[#1A2B49] text-white py-4 px-12 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1A2B49] transition-all duration-300 font-semibold text-lg transform hover:shadow-xl group"
                    >
                      <span className="relative z-10 transition-all duration-300 group-hover:text-[#1A2B49]">
                        Schedule Demo
                      </span>
                      <span className="absolute inset-0 bg-white scale-x-0 origin-center transition-transform duration-300 group-hover:scale-x-100"></span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 md:p-8 rounded-2xl shadow-xl text-center animate-fade-in">
                  <div className="flex justify-center mb-6">
                    <CheckCircle2 className="w-12 h-12 md:w-16 md:h-16 text-green-500" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-green-800 mb-4">
                    Success!
                  </h3>
                  <p className="text-base md:text-lg text-gray-700 mb-6">
                    Your demo request has been submitted successfully. Updates
                    will be sent to your email.
                  </p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 px-8 rounded-xl hover:from-blue-700 hover:to-blue-900 transition-all duration-300 font-semibold transform hover:scale-105"
                  >
                    Schedule Another Demo
                  </button>
                </div>
              )}
            </div>
            <div className="absolute inset-0 bg-blue-600 opacity-10 background-pattern"></div>
          </div>
        </div>

        <footer className="bg-[#1A2B49] text-white pt-12 pb-4 px-4">
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            <div className="space-y-6">
              <Link
                to="/"
                className="flex items-center space-x-3 hover:text-gray-300 transition"
              >
                <img
                  className="w-14"
                  src={logo || "/placeholder.svg"}
                  alt="Parivaar Logo"
                />
                <span className="text-2xl font-bold text-white group-hover:text-gray-300">
                  Parivaar
                </span>
              </Link>
              <p className="text-white hover:text-gray-300 transition text-[13px] max-w-xs">
                A community platform preserving cultural identity and fostering
                growth through free and premium services, digital engagement,
                and physical events — ensuring active participation across all
                age groups
              </p>
              <div className="flex space-x-4">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-gray-300 transition"
                >
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-gray-300 transition"
                >
                  <i className="fab fa-twitter"></i>
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-gray-300 transition"
                >
                  <i className="fab fa-instagram"></i>
                </a>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Quick Links</h3>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    {link.name === "Features" ? (
                      <button
                        onClick={scrollToFeatures}
                        className="text-white hover:text-gray-300 transition-colors duration-300"
                      >
                        {link.name}
                      </button>
                    ) : link.name === "Contact" ? (
                      <button
                        onClick={scrollToContact}
                        className="text-white hover:text-gray-300 transition-colors duration-300"
                      >
                        {link.name}
                      </button>
                    ) : (
                      <Link
                        to={link.path}
                        className="text-white hover:text-gray-300 transition-colors duration-300"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-white">
                Download Our App
              </h3>
              <p className="text-white hover:text-gray-300 transition">
                Stay connected on the go!
              </p>
              <a
                href="https://play.google.com/store/apps/details?id=com.arth.aark.parivaar&pli=1"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-[#1A2B49] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all duration-300"
              >
                <Download className="w-5 h-5" />
                Get it on Google Play
              </a>
            </div>
          </div>

          <div className="text-center pt-2 mt-5 text-white hover:text-gray-300 border-t border-white transition">
            © 2025 Parivaar. All rights reserved.
          </div>
        </footer>
      </div>
    </>
  );
};

export default Fetureparivaar;