import React, { useState, useEffect } from "react";
import {
  AlignLeft,
  Calendar,
  CalendarDays,
  CheckCircle2,
  Clock,
  Download,
  Home,
  IndianRupee,
  MapPin,
  Navigation,
  Phone,
  Plus,
  Search,
  Ticket,
  Trash2,
  User,
  UserCircle,
  Users,
  X,
} from "lucide-react";

import logoImage from "../../src/img/parivarlogo1.png";
import jsPDF from "jspdf";
import { QRCodeCanvas } from "qrcode.react";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";

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
        backdropFilter: "blur(5px)",
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

const Event = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [yourEvents, setYourEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCompleted, setShowCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const eventsPerPage = 5;

  const [formData, setFormData] = useState({
    E_Name: "",
    E_Creater_Name: "",
    E_Creater_Mobile: "",
    E_StartDate: "",
    E_EndDate: "",
    E_StartTime: "",
    E_EndTime: "",
    E_Place: "",
    E_Description: "",
    E_State: "",
    E_City: "",
    E_Zipcode: "",
    E_Address: "",
    E_Fees: "",
    E_Capacity: "",
  });

  const [bookingData, setBookingData] = useState({
    name:
      localStorage.getItem("bookingName") ||
      (localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user")).U_Name
        : ""),
    number:
      localStorage.getItem("bookingNumber") ||
      (localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user")).U_Mobile
        : ""),
    email:
      localStorage.getItem("bookingEmail") ||
      (localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user")).U_Email
        : ""),
  });

  const [additionalPeople, setAdditionalPeople] = useState([]);
  const [showAdditionalForm, setShowAdditionalForm] = useState(false);

  const user = JSON.parse(localStorage.getItem("user")) || {
    Comm_Id: "169740",
    U_Id: 3,
    Role_Id: 3,
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const eventsResponse = await fetch(
        "https://parivaar.app/public/api/events"
      );
      if (!eventsResponse.ok) {
        throw new Error("Failed to fetch events");
      }
      const eventsData = await eventsResponse.json();
      const allEvents = eventsData.data;

      const communityEvents = allEvents.filter(
        (event) => event.user.Comm_Id == user.Comm_Id
      );

      const yourEvents = allEvents
        .filter((event) => event.U_Id == user.U_Id)
        .map((event) => ({
          ...event,
          status:
            event.E_Status == "P"
              ? "Pending"
              : event.E_Status == "A"
              ? "Approved"
              : event.E_Status == "R"
              ? "Rejected"
              : event.E_Status == "D"
              ? "Completed"
              : "Unknown",
        }));

      const bookingsResponse = await fetch(
        "https://parivaar.app/public/api/book-events"
      );
      if (!bookingsResponse.ok) {
        throw new Error("Failed to fetch bookings");
      }
      const bookingsData = await bookingsResponse.json();
      const allBookings = bookingsData.data;

      setEvents(communityEvents);
      setYourEvents(yourEvents);
      setBookings(allBookings);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch events or bookings",
      });
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "E_Creater_Mobile") {
      const numericValue = value.replace(/\D/g, "");
      if (numericValue.length <= 10) {
        setFormData({ ...formData, [name]: numericValue });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.E_Creater_Mobile.length !== 10) {
      Swal.fire({
        icon: "error",
        title: "Invalid Mobile Number",
        text: "Creator Mobile number must be exactly 10 digits",
      });
      return;
    }

    if (
      formData.E_StartDate === formData.E_EndDate &&
      formData.E_StartTime &&
      formData.E_EndTime
    ) {
      const startTime = new Date(`1970-01-01T${formData.E_StartTime}:00`);
      const endTime = new Date(`1970-01-01T${formData.E_EndTime}:00`);
      if (endTime <= startTime) {
        Swal.fire({
          icon: "error",
          title: "Invalid Time Range",
          text: "End Time must be after Start Time on the same date",
        });
        return;
      }
    }

    setIsLoading(true);
    try {
      const payload = {
        Comm_Id: user.Comm_Id,
        U_Id: user.U_Id,
        Role_Id: user.Role_Id,
        ...formData,
        E_StartTime: formData.E_StartTime ? `${formData.E_StartTime}:00` : "",
        E_EndTime: formData.E_EndTime ? `${formData.E_EndTime}:00` : "",
        Mam_Id: null,
      };

      const response = await fetch("https://parivaar.app/public/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create event");
      }

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Event Request Sent successfully!",
        showConfirmButton: false,
        timer: 1500,
      });

      setFormData({
        E_Name: "",
        E_Creater_Name: "",
        E_Creater_Mobile: "",
        E_StartDate: "",
        E_EndDate: "",
        E_StartTime: "",
        E_EndTime: "",
        E_Place: "",
        E_Description: "",
        E_State: "",
        E_City: "",
        E_Zipcode: "",
        E_Address: "",
        E_Fees: "",
        E_Capacity: "",
      });
      setIsFormOpen(false);
      fetchEvents();
    } catch (error) {
      console.error("Error creating event:", error);
      Swal.fire({
        icon: "error",
        title: "Error Creating Event",
        text: error.message,
        confirmButtonColor: "#1A2B49",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingData((prev) => ({ ...prev, [name]: value }));
    localStorage.setItem(
      `booking${name.charAt(0).toUpperCase() + name.slice(1)}`,
      value
    );
  };

  const handleAdditionalPersonChange = (index, e) => {
    const { name, value } = e.target;
    setAdditionalPeople((prev) =>
      prev.map((person, i) =>
        i === index ? { ...person, [name]: value } : person
      )
    );
  };

  const addAdditionalPerson = () => {
    const remainingSeats =
      selectedEvent.E_Capacity - selectedEvent.E_Booked_Count;
    if (additionalPeople.length + 1 >= remainingSeats) {
      Swal.fire({
        icon: "error",
        title: "Cannot Add More",
        text: `Only ${remainingSeats - 1} additional seat(s) available`,
      });
      return;
    }
    setAdditionalPeople((prev) => [
      ...prev,
      { name: "", email: "", mobile: "" },
    ]);
  };

  const removeAdditionalPerson = (index) => {
    setAdditionalPeople((prev) => prev.filter((_, i) => i !== index));
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate primary booking data
    if (!bookingData.name || !bookingData.email || !bookingData.number) {
      Swal.fire({
        icon: "error",
        title: "Invalid Input",
        text: "Please fill in all primary booking fields",
      });
      setIsLoading(false);
      return;
    }

    // Validate primary mobile number
    if (!/^\d{10}$/.test(bookingData.number)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Mobile Number",
        text: "Primary mobile number must be exactly 10 digits",
      });
      setIsLoading(false);
      return;
    }

    // Validate primary email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookingData.email)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Email",
        text: "Please enter a valid email for the primary booking",
      });
      setIsLoading(false);
      return;
    }

    // Validate additional people
    for (let person of additionalPeople) {
      if (!person.name || !person.email || !person.mobile) {
        Swal.fire({
          icon: "error",
          title: "Invalid Input",
          text: "Please fill in all fields for additional people",
        });
        setIsLoading(false);
        return;
      }
      if (!/^\d{10}$/.test(person.mobile)) {
        Swal.fire({
          icon: "error",
          title: "Invalid Mobile Number",
          text: "Additional person's mobile number must be exactly 10 digits",
        });
        setIsLoading(false);
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(person.email)) {
        Swal.fire({
          icon: "error",
          title: "Invalid Email",
          text: "Please enter a valid email for additional person",
        });
        setIsLoading(false);
        return;
      }
    }

    // Check available seats
    const remainingSeats =
      selectedEvent.E_Capacity - selectedEvent.E_Booked_Count;
    if (remainingSeats < 1 + additionalPeople.length) {
      Swal.fire({
        icon: "error",
        title: "Booking Error",
        text: "Not enough seats available for the selected number of people",
      });
      setIsLoading(false);
      return;
    }

    try {
      const bookingPayload = {
        BE_Name: bookingData.name,
        BE_Email: bookingData.email,
        BE_Mobile: bookingData.number,
        E_Id: selectedEvent.E_Id,
        U_Id: user.U_Id,
        Comm_Id: user.Comm_Id,
        additional_people: additionalPeople.map((person) => ({
          name: person.name,
          email: person.email,
          mobile: person.mobile,
        })),
      };

      const response = await fetch(
        "https://parivaar.app/public/api/book-events",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookingPayload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to book event");
      }

      setBookingSuccess(true);
      fetchEvents();
      localStorage.removeItem("bookingEmail");
      localStorage.removeItem("bookingName");
      localStorage.removeItem("bookingNumber");
      setAdditionalPeople([]);
      setShowAdditionalForm(false);

      Swal.fire({
        icon: "success",
        title: "Booking Confirmed",
        text: `Your booking for ${
          1 + additionalPeople.length
        } person(s) has been successfully completed!`,
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      console.error("Error booking event:", error);
      Swal.fire({
        icon: "error",
        title: "Error Booking Event",
        text: error.message,
        confirmButtonColor: "#1A2B49",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateQRCodeValue = (event) => {
    const additionalPeopleText = additionalPeople.length
      ? `\nAdditional People:\n${additionalPeople
          .map((p, i) => `Person ${i + 1}: ${p.name}, ${p.email}, ${p.mobile}`)
          .join("\n")}`
      : "";
    return `
Event Details:
Event Name: ${event.E_Name}
Date: ${new Date(event.E_StartDate).toLocaleDateString()}
Time: ${event.E_StartTime} - ${event.E_EndTime}
Address: ${event.E_Address}
Fees: ₹${event.E_Fees}
Booking ID: ${Math.random().toString(36).substr(2, 9)}
Organizer: ${event.E_Creater_Name}
Contact: ${event.E_Creater_Mobile}
User: ${bookingData.name}
Email: ${bookingData.email}
${additionalPeopleText}
    `.trim();
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const qrCodeValue = generateQRCodeValue(selectedEvent);

    doc.setFontSize(16);
    doc.text("Booking Confirmation", 20, 20);
    doc.setFontSize(12);
    doc.text(`Event: ${selectedEvent.E_Name}`, 20, 30);
    doc.text(`Address: ${selectedEvent.E_Address}`, 20, 40);
    doc.text(
      `Fees: ₹${selectedEvent.E_Fees * (1 + additionalPeople.length)}`,
      20,
      50
    );
    doc.text(
      `Date: ${new Date(selectedEvent.E_StartDate).toLocaleDateString()}`,
      20,
      60
    );
    const bookingId = Math.random().toString(36).substr(2, 9);
    doc.text(`Booking ID: ${bookingId}`, 20, 70);
    doc.text(`Organizer: ${selectedEvent.E_Creater_Name}`, 20, 80);
    doc.text(`Contact: ${selectedEvent.E_Creater_Mobile}`, 20, 90);
    doc.text(`User: ${bookingData.name}`, 20, 100);
    doc.text(`Email: ${bookingData.email}`, 20, 110);

    if (additionalPeople.length > 0) {
      doc.text("Additional People:", 20, 120);
      additionalPeople.forEach((person, index) => {
        doc.text(
          `Person ${index + 1}: ${person.name}, ${person.email}, ${
            person.mobile
          }`,
          20,
          130 + index * 10
        );
      });
    }

    const qrCanvas = document.getElementById("qrCode");
    if (qrCanvas) {
      const qrImage = qrCanvas.toDataURL("image/png");
      doc.addImage(
        qrImage,
        "PNG",
        20,
        additionalPeople.length > 0 ? 130 + additionalPeople.length * 10 : 120,
        50,
        50
      );
    }
    doc.save(`${selectedEvent.E_Name}_booking.pdf`);
  };

  const handleBookNow = (event) => {
    setSelectedEvent(event);
    setIsBookingOpen(true);
    setBookingSuccess(false);
    setAdditionalPeople([]);
    setShowAdditionalForm(false);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  const closeEventModal = () => {
    setSelectedEvent(null);
  };

  const activeEvents = events.filter((event) => event.E_Status === "A");
  const completedEvents = events.filter((event) => event.E_Status === "D");
  const displayedEvents = showCompleted ? completedEvents : activeEvents;
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = displayedEvents.slice(
    indexOfFirstEvent,
    indexOfLastEvent
  );
  const totalPages = Math.ceil(displayedEvents.length / eventsPerPage);
  const eventBookings = selectedEvent
    ? bookings.filter((booking) => booking.E_Id === selectedEvent.E_Id)
    : [];

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const DetailItem = ({ icon, label, value }) => (
    <div className="flex items-start">
      <span className="text-gray-500 mr-3 mt-0.5">{icon}</span>
      <div>
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-800">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {isLoading && <CustomLogoLoader />}

      <div
        className="h-[58vh] bg-cover bg-center relative"
        style={{
          backgroundImage: `url(https://i.pinimg.com/736x/bd/84/b2/bd84b2a6de8ff0e22690eeb3564c5b7b.jpg)`,
        }}
      >
        <div className="absolute inset-0 bg-[#1A2B49]/70 flex items-center justify-center">
          <h1 className="text-4xl font-extrabold text-white tracking-tight drop-shadow-lg">
            Discover Your Events
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-6">
        <nav
          className="flex items-center gap-3 mt-8 text-sm font-medium bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-200"
          aria-label="breadcrumb"
        >
          <Link to="/home" className="text-[#1A2B49] font-bold hover:underline">
            Home
          </Link>
          <span className="text-gray-400"> / </span>
          <span className="text-[#1A2B49]">Event</span>
        </nav>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12 pt-9">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
         <div className="flex justify-between items-center mb-4">
  <h2 className="text-2xl font-bold text-[#4C4B63]">
    {showCompleted ? "Completed Events" : "Active Events"}
  </h2>

  <div className="flex gap-4">
    <button
      onClick={() => setShowCompleted(!showCompleted)}
      className="px-4 py-2 bg-[#1A2B49] text-white rounded-full font-semibold hover:bg-[#1A2B49]/80 transition-all"
    >
      {showCompleted ? "Show Active" : "Show Completed"}
    </button>

    <Link
      to="/eventyourbook"
      className="px-4 py-2 bg-transparent border border-[#1A2B49] text-[#1A2B49] rounded-full font-bold hover:bg-[#1A2B49] hover:text-white transition-all"
    >
      Your Booking
    </Link>
  </div>
</div>

            {currentEvents.length === 0 ? (
              <p className="text-[#4C4B63] text-center">
                No {showCompleted ? "completed" : "active"} events found.
              </p>
            ) : (
              currentEvents.map((event) => {
                const remainingSeats = event.E_Capacity - event.E_Booked_Count;
                return (
                  <div
                    key={event.E_Id}
                    onClick={() => handleEventClick(event)}
                    className="group bg-white rounded-xl shadow-lg overflow-hidden transform transition-all hover:scale-[1.02] hover:shadow-xl border border-[#4C4B63]/20 cursor-pointer"
                  >
                    <div className="flex flex-col sm:flex-row">
                      <div className="w-full sm:w-32 flex-shrink-0 bg-[#1A2B49] p-4 flex items-center justify-center">
                        <div className="text-center text-white">
                          <p className="text-3xl font-bold">
                            {new Date(event.E_StartDate).getDate()}
                          </p>
                          <p className="text-sm uppercase font-medium">
                            {new Date(event.E_StartDate).toLocaleString(
                              "default",
                              { month: "short" }
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="p-6 flex-1">
                        <h3 className="text-xl font-semibold text-[#4C4B63] group-hover:text-[#4C4B63]/80 transition-colors">
                          {event.E_Name}
                        </h3>
                        <p className="text-sm text-[#4C4B63]/70 mt-1 flex items-center gap-1">
                          <MapPin size={14} /> {event.E_Address}
                        </p>
                        <div className="flex justify-between items-center mt-4">
                          <p className="text-lg font-medium text-[#4C4B63]">
                            ₹{event.E_Fees}
                          </p>
                          <div className="flex gap-2 items-center">
                            <span className="text-xs bg-[#4C4B63]/10 text-[#4C4B63] px-2 py-1 rounded-full">
                              {event.E_Status === "A" ? "Active" : "Completed"}
                            </span>
                            {event.E_Status === "A" && (
                              <>
                                {remainingSeats > 0 ? (
                                  <span
                                    className={`text-xs px-2 py-1 rounded-full ${
                                      remainingSeats <= 3
                                        ? "bg-red-500 text-white"
                                        : "bg-green-500 text-white"
                                    }`}
                                  >
                                    {remainingSeats} seats left
                                  </span>
                                ) : (
                                  <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                                    Event Full
                                  </span>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleBookNow(event);
                                  }}
                                  className="px-4 py-1 bg-[#1A2B49] text-white rounded-md hover:bg-[#1A2B49]/90"
                                  disabled={remainingSeats <= 0}
                                >
                                  {remainingSeats <= 0 ? "Filled" : "Book Now"}
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {displayedEvents.length > eventsPerPage && (
              <div className="flex justify-center gap-2 mt-4">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => paginate(i + 1)}
                    className={`px-4 py-2 rounded-full ${
                      currentPage === i + 1
                        ? "bg-[#1A2B49] text-white"
                        : "bg-white text-[#4C4B63] border border-[#4C4B63]/20 hover:bg-[#1A2B49]/10"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#1A2B49] text-white rounded-xl p-8 text-center shadow-xl transform transition-all hover:scale-[1.02]">
              <h3 className="text-2xl font-serif font-bold text-white mb-2 tracking-wide">
                Craft Your Moments
              </h3>
              <p className="text-sm text-white/80 mb-4">
                Bring your events to life!
              </p>
              <button
                onClick={() => setIsFormOpen(true)}
                className="bg-white text-[#4C4B63] px-6 py-2 rounded-full font-semibold hover:bg-white/90 transform transition-all hover:scale-105"
              >
                Create Event
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-[#4C4B63]/20">
              <h3 className="text-xl font-semibold text-[#4C4B63] mb-4 uppercase tracking-wider border-b pb-2 border-[#4C4B63]/20">
                Your Events
              </h3>
              <div
                className="max-h-96 overflow-y-auto space-y-4 pr-2"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "#4C4B63 #e5e7eb",
                }}
              >
                <style>
                  {`
                    .max-h-96::-webkit-scrollbar {
                      width: 8px;
                    }
                    .max-h-96::-webkit-scrollbar-track {
                      background: #e5e7eb;
                      border-radius: 4px;
                    }
                    .max-h-96::-webkit-scrollbar-thumb {
                      background: #4C4B63;
                      border-radius: 4px;
                    }
                    .max-h-96::-webkit-scrollbar-thumb:hover {
                      background: #1A2B49;
                    }
                  `}
                </style>
                {yourEvents.length === 0 ? (
                  <p className="text-[#4C4B63] text-center text-sm">
                    No events found for your account.
                  </p>
                ) : (
                  yourEvents.map((event) => (
                    <div
                      key={event.E_Id}
                      onClick={() => handleEventClick(event)}
                      className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-[#4C4B63]/5 transition-colors border border-[#4C4B63]/10 cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-[#1A2B49] flex items-center justify-center text-white font-semibold">
                          {event.E_Name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#1A2B49]">
                            {event.E_Name}
                          </p>
                          <p className="text-xs text-[#4C4B63]/70">
                            {new Date(event.E_StartDate).getDate()}{" "}
                            {new Date(event.E_StartDate).toLocaleString(
                              "default",
                              { month: "short" }
                            )}
                          </p>
                        </div>
                      </div>
                      {event.status && (
                        <span
                          className={`text-xs font-semibold text-white px-2 py-1 rounded-full 
                          ${
                            event.status === "Pending"
                              ? "bg-[#ffb300]"
                              : event.status === "Rejected"
                              ? "bg-[#ee0505dc]"
                              : event.status === "Completed"
                              ? "bg-gray-500"
                              : "bg-[#038e03c7]"
                          }`}
                        >
                          {event.status}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isFormOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300"
          onClick={() => setIsFormOpen(false)}
        >
          <div
            className="fixed right-0 top-0 h-full w-full md:w-[670px] bg-[#1A2B49] p-6 shadow-lg overflow-y-auto transition-transform duration-500 ease-in-out transform translate-x-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">
                Create New Event
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex justify-between mb-4">
                    <h4 className="text-lg font-semibold text-white">
                      Event Detail
                    </h4>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-white hover:bg-gray-100 hover:text-gray-800"
                      >
                        Create Event
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsFormOpen(false)}
                        className="px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-white hover:bg-gray-100 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Event Name
                    </label>
                    <input
                      type="text"
                      name="E_Name"
                      value={formData.E_Name}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-white text-sm text-gray-800 bg-white"
                      placeholder="e.g., Birthday Party"
                    />
                  </div>
                  <div className="flex gap-4 mt-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-white mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        name="E_StartDate"
                        value={formData.E_StartDate}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-white text-sm text-gray-800 bg-white"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-white mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        name="E_EndDate"
                        value={formData.E_EndDate}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-white text-sm text-gray-800 bg-white"
                      />
                    </div>
                  </div>
                  <div className="flex gap-4 mt-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-white mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        name="E_StartTime"
                        value={formData.E_StartTime}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-white text-sm text-gray-800 bg-white"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-white mb-1">
                        End Time
                      </label>
                      <input
                        type="time"
                        name="E_EndTime"
                        value={formData.E_EndTime}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-white text-sm text-gray-800 bg-white"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-white mb-1">
                      Event Place
                    </label>
                    <input
                      type="text"
                      name="E_Place"
                      value={formData.E_Place}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-white text-sm text-gray-800 bg-white"
                      placeholder="e.g., Banquet Hall, NYC"
                    />
                  </div>
                  <div className="flex gap-4 mt-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-white mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        name="E_City"
                        value={formData.E_City}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-white text-sm text-gray-800 bg-white"
                        placeholder="e.g., New York City"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-white mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        name="E_State"
                        value={formData.E_State}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-white text-sm text-gray-800 bg-white"
                        placeholder="e.g., New York"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-white mb-1">
                      Zipcode
                    </label>
                    <input
                      type="text"
                      name="E_Zipcode"
                      value={formData.E_Zipcode}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-white text-sm text-gray-800 bg-white"
                      placeholder="e.g., 10001"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-white mb-1">
                      Event Address
                    </label>
                    <textarea
                      name="E_Address"
                      value={formData.E_Address}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-white text-sm text-gray-800 bg-white"
                      placeholder="e.g., 123 Park Ave, New York, NY"
                      rows="2"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-white mb-1">
                      Event Fees
                    </label>
                    <input
                      type="number"
                      name="E_Fees"
                      value={formData.E_Fees}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-white text-sm text-gray-800 bg-white"
                      placeholder="e.g., 10"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-white mb-1">
                      Event Capacity
                    </label>
                    <input
                      type="number"
                      name="E_Capacity"
                      value={formData.E_Capacity}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-white text-sm text-gray-800 bg-white"
                      placeholder="e.g., 100"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-white mb-1">
                      Event Description
                    </label>
                    <textarea
                      name="E_Description"
                      value={formData.E_Description}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-white text-sm text-gray-800 bg-white"
                      placeholder="Describe your event..."
                      rows="3"
                    />
                  </div>
                </div>
                <div className="hidden md:block border-r border-gray-400"></div>
                <div className="flex-1 flex flex-col space-y-4">
                  <h4 className="text-lg font-semibold text-white">
                    Event Creator Detail
                  </h4>
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Creator Name
                    </label>
                    <input
                      type="text"
                      name="E_Creater_Name"
                      value={formData.E_Creater_Name}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-white text-sm text-gray-800 bg-white"
                      placeholder="e.g., Manoj"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Creator Mobile
                    </label>
                    <input
                      type="tel"
                      name="E_Creater_Mobile"
                      value={formData.E_Creater_Mobile}
                      onChange={handleChange}
                      required
                      maxLength={10}
                      pattern="[0-9]{10}"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-white text-sm text-gray-800 bg-white"
                      placeholder="e.g., 1234567890"
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedEvent && !isBookingOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-100">
            {/* Header */}
            <div className="sticky top-0 bg-white z-10 p-6 pb-0">
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold text-[#1A2B49]">
                  {selectedEvent.E_Name}
                </h2>
                <button
                  onClick={closeEventModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Status Badge */}
              <div className="mt-2">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    selectedEvent.E_Status === "A"
                      ? "bg-green-100 text-green-800"
                      : selectedEvent.E_Status === "D"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {selectedEvent.E_Status === "A" ? "Active" : "Completed"}
                </span>
              </div>
            </div>

            <div className="p-6 pt-4">
              {/* Main Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Event Details Card */}
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-[#1A2B49] mb-4 pb-2 border-b border-gray-200 flex items-center">
                    <CalendarDays className="h-5 w-5 mr-2 text-[#1A2B49]" />
                    Event Details
                  </h3>
                  <div className="space-y-3">
                    <DetailItem
                      icon={<Calendar className="h-4 w-4" />}
                      label="Date"
                      value={`${new Date(
                        selectedEvent.E_StartDate
                      ).toLocaleDateString()} ${
                        selectedEvent.E_StartDate !== selectedEvent.E_EndDate &&
                        `to ${new Date(
                          selectedEvent.E_EndDate
                        ).toLocaleDateString()}`
                      }`}
                    />
                    <DetailItem
                      icon={<Clock className="h-4 w-4" />}
                      label="Time"
                      value={`${selectedEvent.E_StartTime} - ${selectedEvent.E_EndTime}`}
                    />
                    <DetailItem
                      icon={<MapPin className="h-4 w-4" />}
                      label="Location"
                      value={selectedEvent.E_Place}
                    />
                    <DetailItem
                      icon={<Home className="h-4 w-4" />}
                      label="Address"
                      value={selectedEvent.E_Address}
                    />
                    <DetailItem
                      icon={<Navigation className="h-4 w-4" />}
                      label="City/State/Zip"
                      value={`${selectedEvent.E_City}, ${selectedEvent.E_State} ${selectedEvent.E_Zipcode}`}
                    />
                    <DetailItem
                      icon={<IndianRupee className="h-4 w-4" />}
                      label="Fees"
                      value={`₹${selectedEvent.E_Fees}`}
                    />
                    <DetailItem
                      icon={<Users className="h-4 w-4" />}
                      label="Capacity"
                      value={`${selectedEvent.E_Booked_Count} / ${selectedEvent.E_Capacity}`}
                    />
                  </div>
                </div>

                {/* Organizer Details Card */}
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-[#1A2B49] mb-4 pb-2 border-b border-gray-200 flex items-center">
                    <User className="h-5 w-5 mr-2 text-[#1A2B49]" />
                    Organizer Details
                  </h3>
                  <div className="space-y-3">
                    <DetailItem
                      icon={<UserCircle className="h-4 w-4" />}
                      label="Creator Name"
                      value={selectedEvent.E_Creater_Name}
                    />
                    <DetailItem
                      icon={<Phone className="h-4 w-4" />}
                      label="Creator Mobile"
                      value={selectedEvent.E_Creater_Mobile}
                    />
                  </div>
                </div>
              </div>

              {/* Description Card */}
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 mb-8">
                <h3 className="text-lg font-semibold text-[#1A2B49] mb-3 flex items-center">
                  <AlignLeft className="h-5 w-5 mr-2 text-[#1A2B49]" />
                  Description
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {selectedEvent.E_Description}
                </p>
              </div>

              {/* Footer */}
              <div className="flex justify-end">


                
                <button
                  onClick={closeEventModal}
                  className="px-6 py-2.5 bg-[#1A2B49] text-white rounded-lg hover:bg-[#1A2B49]/90 transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#1A2B49] focus:ring-opacity-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isBookingOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-100">
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex justify-between items-center border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {bookingSuccess
                    ? "🎉 Booking Confirmed!"
                    : `Book ${selectedEvent.E_Name}`}
                </h2>
                <button
                  onClick={() => setIsBookingOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {!bookingSuccess ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Event Summary */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                      Event Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <CalendarDays className="h-5 w-5 text-gray-800  mt-0.5 mr-2" />
                        <div>
                          <p className="font-medium text-gray-700">
                            {new Date(
                              selectedEvent.E_StartDate
                            ).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                          <p className="text-sm text-gray-500">
                            {selectedEvent.E_StartTime} -{" "}
                            {selectedEvent.E_EndTime}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 text-gray-800  mt-0.5 mr-2" />
                        <p className="text-gray-700">
                          {selectedEvent.E_Address}
                        </p>
                      </div>

                      <div className="flex items-center">
                        <Ticket className="h-5 w-5 text-gray-800  mr-2" />
                        <p className="text-gray-700">
                          ₹{selectedEvent.E_Fees} per person
                        </p>
                      </div>

                      <div className="flex items-center">
                        <Users className="h-5 w-5 text-gray-800  mr-2" />
                        <p className="text-gray-700">
                          {selectedEvent.E_Capacity -
                            selectedEvent.E_Booked_Count}{" "}
                          seats available
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Booking Form */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                      Attendee Information
                    </h3>

                    <form onSubmit={handleBookingSubmit} className="space-y-4">
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Primary Attendee
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={bookingData.name}
                            onChange={handleBookingChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Full Name"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <input
                              type="tel"
                              name="number"
                              value={bookingData.number}
                              onChange={handleBookingChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Phone Number"
                              required
                              maxLength={10}
                              pattern="[0-9]{10}"
                            />
                          </div>
                          <div>
                            <input
                              type="email"
                              name="email"
                              value={bookingData.email}
                              onChange={handleBookingChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Email Address"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Additional People */}
                      <div className="space-y-3">
                        <button
                          type="button"
                          onClick={() =>
                            setShowAdditionalForm(!showAdditionalForm)
                          }
                          disabled={
                            selectedEvent.E_Capacity -
                              selectedEvent.E_Booked_Count <=
                            1
                          }
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                            selectedEvent.E_Capacity -
                              selectedEvent.E_Booked_Count <=
                            1
                              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                              : "bg-blue-50 text-gray-600 hover:bg-blue-100"
                          }`}
                        >
                          <Plus
                           size={16} />
                          {showAdditionalForm
                            ? "Hide Additional Attendees"
                            : `Add Attendees (Max ${
                                selectedEvent.E_Capacity -
                                selectedEvent.E_Booked_Count -
                                1
                              })`}
                        </button>

                        {showAdditionalForm && (
                          <div className="space-y-3">
                            {additionalPeople.map((person, index) => (
                              <div
                                key={index}
                                className="border border-gray-200 p-3 rounded-lg bg-gray-50 relative"
                              >
                                <button
                                  type="button"
                                  onClick={() => removeAdditionalPerson(index)}
                                  className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500"
                                >
                                  <Trash2 size={14} />
                                </button>
                                <h4 className="text-sm font-medium text-gray-700 mb-2">
                                  Attendee #{index + 1}
                                </h4>
                                <div className="space-y-2">
                                  <input
                                    type="text"
                                    name="name"
                                    value={person.name}
                                    onChange={(e) =>
                                      handleAdditionalPersonChange(index, e)
                                    }
                                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                                    placeholder="Full Name"
                                    required
                                  />
                                  <div className="grid grid-cols-2 gap-2">
                                    <input
                                      type="tel"
                                      name="mobile"
                                      value={person.mobile}
                                      onChange={(e) =>
                                        handleAdditionalPersonChange(index, e)
                                      }
                                      className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                                      placeholder="Phone"
                                      required
                                      maxLength={10}
                                      pattern="[0-9]{10}"
                                    />
                                    <input
                                      type="email"
                                      name="email"
                                      value={person.email}
                                      onChange={(e) =>
                                        handleAdditionalPersonChange(index, e)
                                      }
                                      className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                                      placeholder="Email"
                                      required
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}

                            {additionalPeople.length <
                              selectedEvent.E_Capacity -
                                selectedEvent.E_Booked_Count -
                                1 && (
                              <button
                                type="button"
                                onClick={addAdditionalPerson}
                                className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-gray-800"
                              >
                                <Plus size={14} />
                                Add another attendee
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="pt-2">
                        <label className="flex items-start space-x-2">
                          <input
                            type="checkbox"
                            className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                            required
                          />
                          <span className="text-sm text-gray-600">
                            I agree to the terms and conditions and privacy
                            policy
                          </span>
                        </label>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-[#1A2B49] hover:bg-gray-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                      >
                        Confirm {1 + additionalPeople.length}{" "}
                        {additionalPeople.length ? "Attendees" : "Attendee"} - ₹
                        {selectedEvent.E_Fees * (1 + additionalPeople.length)}
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Booking Confirmation */}
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle2
                         className="h-5 w-5" />
                        <h3 className="font-medium">Booking Successful!</h3>
                      </div>
                      <p className="text-sm text-green-600 mt-1">
                        Your tickets have been reserved. Details have been sent
                        to your email.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                        Booking Summary
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Event:</span>
                          <span className="font-medium">
                            {selectedEvent.E_Name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Date:</span>
                          <span>
                            {new Date(
                              selectedEvent.E_StartDate
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Time:</span>
                          <span>
                            {selectedEvent.E_StartTime} -{" "}
                            {selectedEvent.E_EndTime}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Location:</span>
                          <span className="text-right">
                            {selectedEvent.E_Address}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Booking ID:</span>
                          <span className="font-mono">
                            {Math.random()
                              .toString(36)
                              .substr(2, 9)
                              .toUpperCase()}
                          </span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="text-gray-500">Total Paid:</span>
                          <span className="font-bold">
                            ₹
                            {selectedEvent.E_Fees *
                              (1 + additionalPeople.length)}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <h4 className="font-medium text-gray-700 mb-2">
                          Primary Attendee
                        </h4>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="font-medium">{bookingData.name}</p>
                          <p className="text-sm text-gray-600">
                            {bookingData.email}
                          </p>
                          <p className="text-sm text-gray-600">
                            {bookingData.number}
                          </p>
                        </div>
                      </div>

                      {additionalPeople.length > 0 && (
                        <div className="pt-2">
                          <h4 className="font-medium text-gray-700 mb-2">
                            Additional Attendees
                          </h4>
                          <div className="space-y-2">
                            {additionalPeople.map((person, index) => (
                              <div
                                key={index}
                                className="bg-gray-50 p-3 rounded-lg"
                              >
                                <p className="font-medium">{person.name}</p>
                                <p className="text-sm text-gray-600">
                                  {person.email}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {person.mobile}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <QRCodeCanvas
                        value={generateQRCodeValue(selectedEvent)}
                        size={180}
                        className="border border-gray-100"
                      />
                    </div>
                    <p className="text-sm text-gray-500 text-center max-w-xs">
                      Show this QR code at the event entrance for check-in
                    </p>
                    <button
                      onClick={generatePDF}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      Download Ticket
                    </button>

                    <div className="w-full pt-4 border-t mt-4">
                      <h4 className="font-medium text-gray-700 mb-2">
                        Event Organizer
                      </h4>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="font-medium">
                          {selectedEvent.E_Creater_Name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedEvent.E_Creater_Mobile}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Event;
