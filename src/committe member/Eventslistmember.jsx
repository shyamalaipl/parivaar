import React, { useState, useEffect } from "react";
import {
  Calendar,
  Plus,
  X,
  Check,
  CircleChevronLeft,
  Eye,
  Clock,
  Trash2,
  ArchiveX,
  CalendarDays,
  Info,
  Bookmark,
  User,
  CalendarX,
} from "lucide-react";
import Swal from "sweetalert2";
import logoImage from "../../src/img/parivarlogo1.png";
import { ImSad } from "react-icons/im";

// CustomLogoLoader and EventCard components remain unchanged
const CustomLogoLoader = () => {
  useEffect(() => {
    const keyframes = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.id = "spin-keyframes";
    styleSheet.textContent = keyframes;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] backdrop-blur-sm">
      <img
        src={logoImage}
        alt="Rotating Logo"
        className="w-12 h-12 animate-spin drop-shadow-md"
      />
    </div>
  );
};

const EventCard = ({
  event,
  onClick,
  onApprove,
  onReject,
  isRequest,
  onCancel,
}) => (
  <div
    className="p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors cursor-pointer shadow-md hover:shadow-lg"
    onClick={onClick}
  >
    <div className="flex justify-between items-center">
      <div className="flex items-center">
        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-3 font-semibold">
          {event.E_Name?.substring(0, 2).toUpperCase() || "NA"}
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 text-lg">
            {event.E_Name || "Untitled Event"}
          </h3>
          <p className="text-sm text-gray-500 flex items-center">
            <Calendar size={14} className="mr-1" />
            {event.E_StartDate || "N/A"}
          </p>
        </div>
      </div>
      <div className="flex space-x-3">
        <button
          className="text-[#1A2B49] hover:text-blue-700 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          <Eye size={20} />
        </button>
        {isRequest && (
          <>
            <button
              className="text-green-500 hover:text-green-700 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onApprove();
              }}
            >
              <Check size={20} />
            </button>
            <button
              className="text-red-500 hover:text-red-700 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onReject();
              }}
            >
              <X size={20} />
            </button>
          </>
        )}
        {event.E_Status === "A" && (
          <button
            className="text-red-500 hover:text-red-700 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onCancel();
            }}
          >
            <Trash2 size={20} />
          </button>
        )}
      </div>
    </div>
  </div>
);

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-lg shadow-md p-5 transition-all hover:shadow-lg">
    <div className="flex justify-between items-center">
      <div>
        <p className="text-sm uppercase text-gray-600 font-semibold">{title}</p>
        <h3 className="text-3xl font-bold mt-2 text-gray-800">{value}</h3>
      </div>
      <div
        className={`w-12 h-12 ${color} rounded-full flex items-center justify-center text-white`}
      >
        {icon}
      </div>
    </div>
  </div>
);

const EventManagementDashboard = ({ setActivePage }) => {
  const [activeTab, setActiveTab] = useState("events");
  const [events, setEvents] = useState([]);
  const [eventRequests, setEventRequests] = useState([]);
  const [rejectedEvents, setRejectedEvents] = useState([]);
  const [canceledEvents, setCanceledEvents] = useState([]);
  const [completedEvents, setCompletedEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterTab, setFilterTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const [newEvent, setNewEvent] = useState({
    E_Name: "",
    E_Creater_Name: "",
    E_Creater_Mobile: "",
    E_StartDate: "",
    E_EndDate: "",
    E_StartTime: "",
    E_EndTime: "",
    E_Place: "",
    E_City: "",
    E_State: "",
    E_Zipcode: "",
    E_Address: "",
    E_Fees: "",
    E_Description: "",
    E_Capacity: "",
    E_Status: "A",
  });

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const commId = user.Comm_Id;
  const userId = user.U_Id;
  const roleId = user.Role_Id;

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventsResponse, bookingsResponse] = await Promise.all([
        fetch("https://parivaar.app/public/api/events", {
          headers: {
            "Content-Type": "application/json",
          },
        }),
        fetch("https://parivaar.app/public/api/book-events", {
          headers: {
            "Content-Type": "application/json",
          },
        }),
      ]);

      if (!eventsResponse.ok || !bookingsResponse.ok) {
        throw new Error("Failed to fetch data");
      }

      const eventsData = await eventsResponse.json();
      const bookingsData = await bookingsResponse.json();

      if (!eventsData.status || !Array.isArray(eventsData.data)) {
        throw new Error("Invalid events data format");
      }
      if (!bookingsData.status || !Array.isArray(bookingsData.data)) {
        throw new Error("Invalid bookings data format");
      }

      const allEvents = eventsData.data || [];
      const allBookings = bookingsData.data || [];

      const normalizedCommId = String(commId);
      setEvents(
        allEvents.filter(
          (event) =>
            String(event.user?.Comm_Id) === normalizedCommId &&
            event.E_Status === "A"
        )
      );
      setEventRequests(
        allEvents.filter(
          (event) =>
            String(event.user?.Comm_Id) === normalizedCommId &&
            event.E_Status === "P"
        )
      );
      setRejectedEvents(
        allEvents.filter(
          (event) =>
            String(event.user?.Comm_Id) === normalizedCommId &&
            event.E_Status === "R"
        )
      );
      setCanceledEvents(
        allEvents.filter(
          (event) =>
            String(event.user?.Comm_Id) === normalizedCommId &&
            event.E_Status === "C"
        )
      );
      setCompletedEvents(
        allEvents.filter(
          (event) =>
            String(event.user?.Comm_Id) === normalizedCommId &&
            event.E_Status === "D"
        )
      );
      setBookings(allBookings);
      setError(null);
    } catch (err) {
      console.error("Fetch Error:", err);
      Swal.fire({
        icon: "error",
        title: "Fetch Error",
        text: `Failed to fetch data: ${err.message}`,
        confirmButtonColor: "#1A2B49",
      });
      setError(`Failed to fetch data: ${err.message}`);
      setEvents([]);
      setEventRequests([]);
      setRejectedEvents([]);
      setCanceledEvents([]);
      setCompletedEvents([]);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (commId && userId) {
      fetchData();
    } else {
      Swal.fire({
        icon: "error",
        title: "Authentication Error",
        text: "User information is missing. Please log in again.",
        confirmButtonColor: "#1A2B49",
      });
      setError("User information is missing");
    }
  }, [commId, userId]);

  const formatTimeToHIS = (time) => {
    if (!time) return "";
    if (/^\d{2}:\d{2}:\d{2}$/.test(time)) return time;
    return `${time}:00`;
  };

  const handleCreateEvent = async () => {
    if (
      !newEvent.E_Name ||
      !newEvent.E_StartDate ||
      !newEvent.E_EndDate ||
      !newEvent.E_Capacity
    ) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Event Name, Start Date, End Date, and Capacity are required!",
        confirmButtonColor: "#1A2B49",
      });
      return;
    }

    const payload = {
      ...newEvent,
      E_StartTime: formatTimeToHIS(newEvent.E_StartTime),
      E_EndTime: formatTimeToHIS(newEvent.E_EndTime),
      Comm_Id: commId,
      U_Id: userId,
      Mam_Id: null,
      E_Capacity: parseInt(newEvent.E_Capacity),
    };

    try {
      setLoading(true);
      const response = await fetch("https://parivaar.app/public/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          JSON.stringify(errorData.errors) || "Failed to create event"
        );
      }
      Swal.fire({
        icon: "success",
        title: "Event Requested",
        text: `${newEvent.E_Name} has been requested successfully!`,
        confirmButtonColor: "#1A2B49",
      });
      setNewEvent({
        E_Name: "",
        E_Creater_Name: "",
        E_Creater_Mobile: "",
        E_StartDate: "",
        E_EndDate: "",
        E_StartTime: "",
        E_EndTime: "",
        E_Place: "",
        E_City: "",
        E_State: "",
        E_Zipcode: "",
        E_Address: "",
        E_Fees: "",
        E_Description: "",
        E_Capacity: "",
        E_Status: "A",
      });
      setIsCreating(false);
      fetchData();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Creation Error",
        text: err.message || "Failed to create event",
        confirmButtonColor: "#1A2B49",
      });
      setError(err.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (request) => {
    Swal.fire({
      title: "Confirm Approval",
      text: `Approve ${request.E_Name} event request?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#1A2B49",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, approve it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const payload = {
          Comm_Id: commId,
          E_Name: request.E_Name,
          E_Status: "A",
        };
        try {
          setLoading(true);
          const response = await fetch(
            `https://parivaar.app/public/api/events/${request.E_Id}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            }
          );
          if (!response.ok) throw new Error("Failed to approve request");
          Swal.fire({
            icon: "success",
            title: "Request Approved",
            text: `${request.E_Name} has been approved!`,
            confirmButtonColor: "#1A2B49",
          });
          fetchData();
          setSelectedItem(null);
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Approval Error",
            text: "Failed to approve request",
            confirmButtonColor: "#1A2B49",
          });
          setError("Failed to approve request");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleRejectRequest = async (request) => {
    Swal.fire({
      title: "Confirm Rejection",
      text: `Reject ${request.E_Name} event request?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1A2B49",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, reject it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const payload = {
          Comm_Id: commId,
          E_Name: request.E_Name,
          E_Status: "R",
        };
        try {
          setLoading(true);
          const response = await fetch(
            `https://parivaar.app/public/api/events/${request.E_Id}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            }
          );
          if (!response.ok) throw new Error("Failed to reject request");
          Swal.fire({
            icon: "success",
            title: "Request Rejected",
            text: `${request.E_Name} has been rejected!`,
            confirmButtonColor: "#1A2B49",
          });
          fetchData();
          setSelectedItem(null);
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Rejection Error",
            text: "Failed to reject request",
            confirmButtonColor: "#1A2B49",
          });
          setError("Failed to reject request");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleCancelEvent = async (event) => {
    if (roleId == 3) {
      Swal.fire({
        icon: "error",
        title: "Permission Denied",
        text: "You cannot cancel this event. Only an admin can cancel it.",
        confirmButtonColor: "#1A2B49",
      });
      return;
    }

    Swal.fire({
      title: "Confirm Cancellation",
      text: `Cancel ${event.E_Name} event?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1A2B49",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, cancel it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const payload = {
          E_Status: "C",
        };
        try {
          setLoading(true);
          const response = await fetch(
            `https://parivaar.app/public/api/events/${event.E_Id}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            }
          );
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              JSON.stringify(errorData.errors) || "Failed to cancel event"
            );
          }
          Swal.fire({
            icon: "success",
            title: "Event Cancelled",
            text: `${event.E_Name} has been canceled!`,
            confirmButtonColor: "#1A2B49",
          });
          fetchData();
          setSelectedItem(null);
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Cancellation Error",
            text: err.message || "Failed to cancel event",
            confirmButtonColor: "#1A2B49",
          });
          setError(err.message || "Failed to cancel event");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.E_Name.toLowerCase().includes(
      searchQuery.toLowerCase()
    );
    const matchesDate = dateFilter ? event.E_StartDate === dateFilter : true;
    const matchesFilter =
      filterTab === "all"
        ? true
        : filterTab === "upcoming"
        ? new Date(event.E_StartDate) >= new Date()
        : new Date(event.E_StartDate) < new Date();
    return matchesSearch && matchesDate && matchesFilter;
  });

  const todayEvents = filteredEvents.filter(
    (event) => event.E_StartDate === getTodayDate()
  );

  const sortedEventRequests = eventRequests
    .filter(
      (request) => new Date(request.E_StartDate) >= new Date(getTodayDate())
    )
    .sort((a, b) => new Date(a.E_StartDate) - new Date(b.E_StartDate));

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdf9f7] to-[#f0f4ff]">
      {loading && <CustomLogoLoader />}

      {/* Header */}
      <header className="bg-[#1A2B49] p-4 rounded-xl flex items-center justify-between shadow-xl sticky top-0 z-10">
        <button
          className="flex cursor-pointer items-center text-white"
          onClick={() => setActivePage("dashboardmember")}
        >
          <CircleChevronLeft size={30} className="mr-2" />
        </button>
        <h1 className="text-2xl font-bold text-white">Community Events</h1>
        <button
          className="bg-white text-[#1A2B49] py-2 px-6 rounded-lg text-sm font-semibold flex items-center hover:bg-gray-100 transition-colors shadow-md"
          onClick={() => setIsCreating(true)}
        >
          <Plus size={20} className="mr-2" />
          Add Event
        </button>
      </header>

      <main className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today’s Events */}
          <div className="lg:col-span-1">
            <div className="text-[#1A2B49] rounded-xl shadow-lg p-6 h-[500px] overflow-y-auto transition-all">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">
                Today's Events
              </h2>
              {todayEvents.length > 0 ? (
                <div className="space-y-4">
                  {todayEvents.map((event) => (
                    <EventCard
                      key={event.E_Id}
                      event={event}
                      onClick={() => {
                        setSelectedItem(event);
                        setActiveTab("events");
                      }}
                      onCancel={() => handleCancelEvent(event)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="flex justify-center mb-4">
                    <div
                      onClick={() => setIsCreating(true)}
                      className="w-16 h-16 cursor-pointer bg-gray-100 rounded-full flex items-center justify-center"
                    >
                      <svg
                        className="w-8 h-8 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </div>
                  </div>
                  <p className="text-[#1A2B49] text-lg">
                    No events scheduled for today.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Event Requests */}
          <div className="lg:col-span-1">
            <div className="text-[#1A2B49] rounded-xl shadow-lg p-6 h-[500px] overflow-y-auto transition-all">
              <h2 className="text-2xl font-bold mb-4 text-[#1A2B49]">
                Event Requests
              </h2>
              {sortedEventRequests.length > 0 ? (
                <div className="space-y-4">
                  {sortedEventRequests.map((request) => (
                    <EventCard
                      key={request.E_Id}
                      event={request}
                      isRequest
                      onClick={() => {
                        setSelectedItem(request);
                        setActiveTab("requests");
                      }}
                      onApprove={() => handleApproveRequest(request)}
                      onReject={() => handleRejectRequest(request)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <ImSad className="w-14 text-gray-500 h-16 bg-gray-100 rounded-full flex items-center justify-center" />
                    </div>
                  </div>
                  <p className="text-center text-[#1A2B49] py- text-lg">
                    No pending requests
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Canceled Events */}
          <div className="lg:col-span-1">
            <div className="text-[#1A2B49] rounded-xl shadow-lg p-6 h-[500px] overflow-y-auto transition-all">
              <h2 className="text-2xl font-bold mb-4 text-[#1A2B49]">
                Canceled Events
              </h2>
              {canceledEvents.length > 0 ? (
                <div className="space-y-4">
                  {canceledEvents.map((event) => (
                    <EventCard
                      key={event.E_Id}
                      event={event}
                      onClick={() => {
                        setSelectedItem(event);
                        setActiveTab("events");
                      }}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-center text-[#1A2B49] py-4 text-lg">
                  No canceled events
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Filter and Events List */}
        <div className="mt-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6 space-y-4 sm:space-y-0 sm:space-x-4">
            <input
              type="date"
              className="border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A2B49] w-full sm:w-auto shadow-sm"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
            <div className="flex bg-white rounded-lg shadow-sm overflow-hidden">
              {["all", "upcoming", "past"].map((tab) => (
                <button
                  key={tab}
                  className={`px-6 py-3 text-sm font-semibold capitalize ${
                    filterTab === tab
                      ? "bg-[#1A2B49] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  } ${
                    tab === "all"
                      ? "rounded-l-lg"
                      : tab === "past"
                      ? "rounded-r-lg"
                      : ""
                  }`}
                  onClick={() => setFilterTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div
                key={event.E_Id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-blue-100 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full">
                    Approved Event
                  </div>
                  <div className="flex space-x-3">
                    <button
                      className="text-[#1A2B49] hover:text-blue-700 transition-colors"
                      onClick={() => setSelectedItem(event)}
                    >
                      <Eye size={20} />
                    </button>
                    <button
                      className="text-red-500 hover:text-red-700 transition-colors"
                      onClick={() => handleCancelEvent(event)}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-800 text-lg mb-2">
                  {event.E_Name}
                </h3>
                <div className="flex items-center text-gray-600 text-sm mb-4">
                  <Calendar size={16} className="mr-2" />
                  <span>{event.E_StartDate || "N/A"}</span>
                </div>
                <button
                  className="text-[#1A2B49] text-sm font-bold hover:underline"
                  onClick={() => setSelectedItem(event)}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>


    
     {/* Event Details Modal */}
{selectedItem && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-r from-[#1A2B49] to-[#3A56A7] text-white p-5 rounded-t-xl flex justify-between items-center shadow-md">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <CalendarDays size={24} />
          {selectedItem.E_Name} Details
        </h2>
        <button
          onClick={() => setSelectedItem(null)}
          className="text-white hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-white/10"
        >
          <X size={28} />
        </button>
      </div>

      <div className="p-8">
        {/* Event Information */}
        <div className="bg-gradient-to-br from-[#fef7f3] to-[#f0f4ff] p-6 rounded-xl border border-gray-100 shadow-sm mb-8">
          <h3 className="text-xl font-semibold mb-5 text-[#1A2B49] flex items-center gap-2">
            <Info size={20} />
            Event Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-gray-700 mb-6">
            {/* Column 1 */}
            <div className="space-y-3">
              <div className="bg-white/70 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="font-semibold">{selectedItem.E_Name || "N/A"}</p>
              </div>
              <div className="bg-white/70 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Creator</p>
                <p className="font-semibold">{selectedItem.E_Creater_Name || "N/A"}</p>
              </div>
              <div className="bg-white/70 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Mobile</p>
                <p className="font-semibold">{selectedItem.E_Creater_Mobile || "N/A"}</p>
              </div>
            </div>
            
            {/* Column 2 */}
            <div className="space-y-3">
              <div className="bg-white/70 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Start Date</p>
                <p className="font-semibold">{selectedItem.E_StartDate || "N/A"}</p>
              </div>
              <div className="bg-white/70 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-500">End Date</p>
                <p className="font-semibold">{selectedItem.E_EndDate || "N/A"}</p>
              </div>
              <div className="bg-white/70 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Time</p>
                <p className="font-semibold">
                  {selectedItem.E_StartTime || "N/A"} - {selectedItem.E_EndTime || "N/A"}
                </p>
              </div>
            </div>
            
            {/* Column 3 */}
            <div className="space-y-3">
              <div className="bg-white/70 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Fees</p>
                <p className="font-semibold">${selectedItem.E_Fees || "0"}</p>
              </div>
              <div className="bg-white/70 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Place</p>
                <p className="font-semibold">{selectedItem.E_Place || "N/A"}</p>
              </div>
              <div className="bg-white/70 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Capacity</p>
                <p className="font-semibold">{selectedItem.E_Capacity || "N/A"}</p>
              </div>
            </div>
            
            {/* Column 4 */}
            <div className="space-y-3">
              <div className="bg-white/70 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Booked</p>
                <p className="font-semibold">{selectedItem.E_Booked_Count || "0"}</p>
              </div>
              <div className="bg-white/70 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Status</p>
                <p className="font-semibold">
                  {selectedItem.E_Status === "A" ? (
                    <span className="text-green-600">Approved</span>
                  ) : selectedItem.E_Status === "P" ? (
                    <span className="text-yellow-600">Pending</span>
                  ) : selectedItem.E_Status === "R" ? (
                    <span className="text-red-600">Rejected</span>
                  ) : selectedItem.E_Status === "C" ? (
                    <span className="text-red-400">Canceled</span>
                  ) : selectedItem.E_Status === "D" ? (
                    <span className="text-blue-600">Completed</span>
                  ) : (
                    "Unknown"
                  )}
                </p>
              </div>
            </div>
          </div>
          
          {/* Address and Description */}
          <div className="space-y-4 mt-4">
            <div className="bg-white/70 p-3 rounded-lg">
              <p className="text-sm font-medium text-gray-500">Address</p>
              <p className="font-semibold">
                {selectedItem.E_Address || "N/A"}, {selectedItem.E_City || "N/A"},{" "}
                {selectedItem.E_State || "N/A"} {selectedItem.E_Zipcode || "N/A"}
              </p>
            </div>
            <div className="bg-white/70 p-3 rounded-lg">
              <p className="text-sm font-medium text-gray-500">Description</p>
              <p className="font-semibold">{selectedItem.E_Description || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Booking Details */}
    <div className="bg-gradient-to-br from-[#f8f9ff] to-[#f0f2ff] p-4 sm:p-6 rounded-xl border border-gray-100 shadow-sm">
  <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-5 text-[#1A2B49] flex items-center gap-2">
    <Bookmark size={20} />
    Booking Details
  </h3>

  {selectedItem.E_Status === "A" ? (
    bookings.filter(
      (booking) => String(booking.E_Id) === String(selectedItem.E_Id)
    ).length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {bookings
          .filter(
            (booking) => String(booking.E_Id) === String(selectedItem.E_Id)
          )
          .map((booking, index) => (
            <div
              key={booking.BE_Id}
              className="p-4 sm:p-5 rounded-xl border border-gray-200 bg-white shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-bold text-base sm:text-lg text-[#1A2B49]">
                  Booking #{index + 1}
                </h4>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {new Date(booking.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium break-words">{booking.BE_Name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-sm break-words">{booking.BE_Email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Mobile</p>
                  <p className="font-medium">{booking.BE_Mobile || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Booking Code</p>
                  <p className="font-medium">{booking.BE_Code || "N/A"}</p>
                </div>
              </div>

              {booking.additional_people?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Additional People ({booking.additional_people.length})
                  </p>
                  <div className="space-y-2">
                    {booking.additional_people.map((person, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <User size={14} className="text-gray-400" />
                        <span className="break-words">
                          {person.name || "N/A"} • {person.email || "N/A"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
      </div>
    ) : (
      <div className="text-center py-8">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
          <CalendarX size={24} className="text-blue-600" />
        </div>
        <p className="text-gray-500 text-lg font-medium">
          No bookings for this event yet.
        </p>
        <p className="text-gray-400 text-sm mt-1">
          Share this event to get more bookings.
        </p>
      </div>
    )
  ) : (
    <div className="text-center py-8">
      <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-3">
        <Clock size={24} className="text-yellow-600" />
      </div>
      <p className="text-gray-500 text-lg font-medium">
        Booking details are not available for{" "}
        {selectedItem.E_Status === "P" ? "pending" : "non-approved"} events.
      </p>
    </div>
  )}


        
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap justify-end gap-3">
          {selectedItem.E_Status === "A" && (
            <button
              onClick={() => handleCancelEvent(selectedItem)}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-colors flex items-center shadow-md"
            >
              <ArchiveX size={20} className="mr-2" />
              Cancel Event
            </button>
          )}
          {selectedItem.E_Status === "P" && (
            <>
              <button
                onClick={() => handleApproveRequest(selectedItem)}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-colors flex items-center shadow-md"
              >
                <Check size={20} className="mr-2" />
                Approve
              </button>
              <button
                onClick={() => handleRejectRequest(selectedItem)}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-colors flex items-center shadow-md"
              >
                <X size={20} className="mr-2" />
                Reject
              </button>
            </>
          )}
          <button
            onClick={() => setSelectedItem(null)}
            className="px-4 py-2 border-2 border-[#1A2B49] text-[#1A2B49] font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
)}

     


      {/* Create Event Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#1A2B49] text-white p-5 rounded-t-xl flex justify-between items-center">
              <h2 className="text-2xl font-bold">Create New Event</h2>
              <button
                onClick={() => setIsCreating(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X size={28} />
              </button>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    label: "Event Name *",
                    key: "E_Name",
                    type: "text",
                    placeholder: "Enter event name",
                  },
                  {
                    label: "Event Creator Name *",
                    key: "E_Creater_Name",
                    type: "text",
                    placeholder: "Enter creator name",
                  },
                  {
                    label: "Mobile Number *",
                    key: "E_Creater_Mobile",
                    type: "tel",
                    placeholder: "Enter mobile number",
                    maxLength: 10,
                  },
                  {
                    label: "Event Start Date *",
                    key: "E_StartDate",
                    type: "date",
                  },
                  { label: "Event End Date *", key: "E_EndDate", type: "date" },
                  {
                    label: "Event Start Time",
                    key: "E_StartTime",
                    type: "time",
                  },
                  { label: "Event End Time", key: "E_EndTime", type: "time" },
                  {
                    label: "Event Place",
                    key: "E_Place",
                    type: "text",
                    placeholder: "Enter event place",
                  },
                  {
                    label: "City",
                    key: "E_City",
                    type: "text",
                    placeholder: "Enter city",
                  },
                  {
                    label: "State",
                    key: "E_State",
                    type: "text",
                    placeholder: "Enter state",
                  },
                  {
                    label: "Zipcode",
                    key: "E_Zipcode",
                    type: "text",
                    placeholder: "Enter zipcode",
                  },
                  {
                    label: "Event Address",
                    key: "E_Address",
                    type: "text",
                    placeholder: "Enter event address",
                    colSpan: true,
                  },
                  {
                    label: "Event Fees",
                    key: "E_Fees",
                    type: "number",
                    placeholder: "Enter event fees",
                  },
                  {
                    label: "Event Capacity *",
                    key: "E_Capacity",
                    type: "number",
                    placeholder: "Enter event capacity",
                  },
                  {
                    label: "Event Description",
                    key: "E_Description",
                    type: "textarea",
                    placeholder: "Enter event description",
                    colSpan: true,
                  },
                ].map((field) => (
                  <div
                    key={field.key}
                    className={field.colSpan ? "md:col-span-2" : ""}
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {field.label}
                    </label>
                    {field.type === "textarea" ? (
                      <textarea
                        value={newEvent[field.key] || ""}
                        onChange={(e) =>
                          setNewEvent({
                            ...newEvent,
                            [field.key]: e.target.value,
                          })
                        }
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2B49] shadow-sm"
                        rows="4"
                        placeholder={field.placeholder}
                      />
                    ) : (
                      <input
                        type={field.type}
                        value={newEvent[field.key] || ""}
                        onChange={(e) => {
                          const value =
                            field.key === "E_Creater_Mobile"
                              ? e.target.value.replace(/\D/g, "").slice(0, 10)
                              : e.target.value;
                          setNewEvent({ ...newEvent, [field.key]: value });
                        }}
                        maxLength={field.maxLength}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2B49] shadow-sm"
                        placeholder={field.placeholder}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setIsCreating(false)}
                  className="flex-1 p-3 border-2 border-[#1A2B49] text-[#1A2B49] font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateEvent}
                  className="flex-1 p-3 bg-[#1A2B49] text-white font-semibold rounded-lg hover:bg-[#1A2B49]/90 transition-colors"
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventManagementDashboard;
