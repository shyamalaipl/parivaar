import React, { useState, useEffect } from "react";
import { Calendar, Plus, X, Check, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import logoImage from "../../src/img/parivarlogo1.png"; // Adjust path if needed

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
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "",
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
          width: "60px",
          height: "60px",
          animation: "spin 1s linear infinite",
          filter: "drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))",
        }}
      />
    </div>
  );
};

const Admineventlist = () => {
  const [activeTab, setActiveTab] = useState("events");
  const [events, setEvents] = useState([]);
  const [eventRequests, setEventRequests] = useState([]);
  const [rejectedEvents, setRejectedEvents] = useState([]);
  const [canceledEvents, setCanceledEvents] = useState([]);
  const [completedEvents, setCompletedEvents] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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
  });

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const commId = user.Comm_Id;
  const roleId = user.role_id;
  const userId = user.id;

  const fetchEvents = async () => {
    try {
      const response = await fetch(
        `https://parivaar.app/public/api/events?timestamp=${new Date().getTime()}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      const allEvents = data.events || [];

      console.log("Fetched Events:", allEvents);

      setEvents(
        allEvents.filter(
          (event) => event.Comm_Id == commId && event.E_Status == "A"
        )
      );
      setEventRequests(
        allEvents.filter(
          (event) =>
            event.Comm_Id == commId &&
            event.E_Status == "P" &&
            event.Role_Id == 3
        )
      );
      setRejectedEvents(
        allEvents.filter(
          (event) => event.Comm_Id == commId && event.E_Status == "R"
        )
      );
      setCanceledEvents(
        allEvents.filter(
          (event) => event.Comm_Id == commId && event.E_Status == "C"
        )
      );
      setCompletedEvents(
        allEvents.filter(
          (event) => event.Comm_Id == commId && event.E_Status == "D"
        )
      );

      setError(null);
    } catch (err) {
      setError(`Failed to fetch events: ${err.message}`);
      console.error("Fetch Error:", err);
      setEvents([]);
      setEventRequests([]);
      setRejectedEvents([]);
      setCanceledEvents([]);
      setCompletedEvents([]);
    }
  };

  const handleDeleteEvent = async (eventId, eventName) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete the event "${eventName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://parivaar.app/public/api/events/${eventId}`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!response.ok) throw new Error("Failed to delete event");

        await Swal.fire({
          title: "Deleted!",
          text: "The event has been deleted.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });

        fetchEvents();
        if (selectedItem?.E_Id == eventId) {
          setSelectedItem(null);
        }
      } catch (err) {
        setError(err.message || "Failed to delete event");
        console.error("Delete Error:", err);
        Swal.fire({
          title: "Error!",
          text: err.message || "Failed to delete event",
          icon: "error",
          confirmButtonColor: "#3085d6",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const formatTimeToHIS = (time) => {
    if (!time) return "";
    if (/^\d{2}:\d{2}:\d{2}$/.test(time)) return time;
    return `${time}:00`;
  };

  const handleCreateEvent = async () => {
    if (
      !newEvent.E_Name ||
      !newEvent.E_Creater_Name ||
      !newEvent.E_Creater_Mobile ||
      !newEvent.E_StartDate ||
      !newEvent.E_EndDate ||
      !newEvent.E_StartTime ||
      !newEvent.E_EndTime
    ) {
      setError(
        "Event Name, Creator Name, Creator Mobile, Start Date, End Date, Start Time, and End Time are required"
      );
      return;
    }

    const payload = {
      ...newEvent,
      E_StartTime: formatTimeToHIS(newEvent.E_StartTime),
      E_EndTime: formatTimeToHIS(newEvent.E_EndTime),
      Comm_Id: commId,
      Role_Id: roleId,
      U_Id: userId,
    };

    try {
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
      });
      setIsCreating(false);
      fetchEvents();
    } catch (err) {
      setError(err.message || "Failed to create event");
      console.error("Create Event Error:", err);
    }
  };

  const handleApproveRequest = async (request) => {
    const payload = {
      Comm_Id: commId,
      E_Name: request.E_Name,
      E_Status: "A",
    };

    try {
      const response = await fetch(
        `https://parivaar.app/public/api/events/${request.E_Id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) throw new Error("Failed to approve request");

      fetchEvents();
      setSelectedItem(null);
    } catch (err) {
      setError(err.message || "Failed to approve request");
      console.error("Approve Error:", err);
    }
  };

  const handleRejectRequest = async (request) => {
    const payload = {
      Comm_Id: commId,
      E_Name: request.E_Name,
      E_Status: "R",
    };

    try {
      const response = await fetch(
        `https://parivaar.app/public/api/events/${request.E_Id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) throw new Error("Failed to reject request");

      fetchEvents();
      setSelectedItem(null);
    } catch (err) {
      setError(err.message || "Failed to reject request");
      console.error("Reject Error:", err);
    }
  };

  const handleCancelEvent = async (event) => {
    if (roleId == 3 && event.Role_Id == 4) {
      setError("You cannot cancel this event.");
      return;
    }

    const payload = {
      Comm_Id: commId,
      E_Name: event.E_Name,
      E_Status: "C",
    };

    try {
      const response = await fetch(
        `https://parivaar.app/public/api/events/${event.E_Id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) throw new Error("Failed to cancel event");

      fetchEvents();
      setSelectedItem(null);
    } catch (err) {
      setError(err.message || "Failed to cancel event");
      console.error("Cancel Error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {isLoading && <CustomLogoLoader />}
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold" style={{ color: "#1A2B49" }}>
            Event Management Dashboard
          </h1>
        </div>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        <div className="flex gap-4 mb-6 border-b">
          {["Events", "Requests", "Rejected", "Canceled", "Completed"].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab.toLowerCase());
                  setSelectedItem(null);
                  setIsCreating(false);
                  setError(null);
                }}
                className={`pb-2 px-4 font-medium ${
                  activeTab == tab.toLowerCase()
                    ? "border-b-2"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                style={{
                  borderColor: activeTab == tab.toLowerCase() ? "#1A2B49" : "",
                  color: activeTab == tab.toLowerCase() ? "#1A2B49" : "",
                }}
              >
                {tab}
              </button>
            )
          )}
        </div>

        <div className="flex gap-6">
          <div className="w-1/3 bg-white rounded-lg shadow-md p-4">
            <h2
              className="text-xl font-semibold mb-4"
              style={{ color: "#1A2B49" }}
            >
              {activeTab == "events" && "Upcoming Events"}
              {activeTab == "requests" && "Event Requests"}
              {activeTab == "rejected" && "Rejected Events"}
              {activeTab == "canceled" && "Canceled Events"}
              {activeTab == "completed" && "Completed Events"}
            </h2>
            <div className="space-y-2">
              {activeTab == "events" &&
                events.map((event) => (
                  <EventCard
                    key={event.E_Id}
                    item={event}
                    onClick={setSelectedItem}
                    selected={selectedItem?.E_Id == event.E_Id}
                  />
                ))}
              {activeTab == "requests" &&
                eventRequests.map((request) => (
                  <EventCard
                    key={request.E_Id}
                    item={request}
                    onClick={setSelectedItem}
                    selected={selectedItem?.E_Id == request.E_Id}
                  />
                ))}
              {activeTab == "rejected" &&
                rejectedEvents.map((event) => (
                  <EventCard
                    key={event.E_Id}
                    item={event}
                    onClick={setSelectedItem}
                    selected={selectedItem?.E_Id == event.E_Id}
                  />
                ))}
              {activeTab == "canceled" &&
                canceledEvents.map((event) => (
                  <EventCard
                    key={event.E_Id}
                    item={event}
                    onClick={setSelectedItem}
                    selected={selectedItem?.E_Id == event.E_Id}
                  />
                ))}
              {activeTab == "completed" &&
                completedEvents.map((event) => (
                  <EventCard
                    key={event.E_Id}
                    item={event}
                    onClick={setSelectedItem}
                    selected={selectedItem?.E_Id == event.E_Id}
                    onDelete={() => handleDeleteEvent(event.E_Id, event.E_Name)}
                  />
                ))}
            </div>
          </div>

          <div className="w-2/3 bg-white rounded-lg shadow-md p-6">
            {isCreating ? (
              <CreateEventForm
                newEvent={newEvent}
                setNewEvent={setNewEvent}
                onSave={handleCreateEvent}
                onCancel={() => setIsCreating(false)}
              />
            ) : selectedItem ? (
              <DetailsPanel
                item={selectedItem}
                activeTab={activeTab}
                onApprove={
                  activeTab == "requests" ? handleApproveRequest : null
                }
                onReject={activeTab == "requests" ? handleRejectRequest : null}
                onCancel={activeTab == "events" ? handleCancelEvent : null}
              />
            ) : (
              <div className="text-center text-gray-500 mt-10">
                Select an item to view details{" "}
                {activeTab !== "completed" && "or create a new event request"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const EventCard = ({ item, onClick, selected, onDelete }) => (
  <div
    className={`p-3 rounded-md cursor-pointer hover:bg-gray-100 ${
      selected ? "bg-gray-200" : ""
    }`}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center" onClick={() => onClick(item)}>
        <Calendar size={18} className="mr-2" style={{ color: "#1A2B49" }} />
        <div>
          <h3 className="font-medium" style={{ color: "#1A2B49" }}>
            {item.E_Name}
          </h3>
          <p className="text-sm text-gray-600">{item.E_StartDate}</p>
        </div>
      </div>
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-red-500 hover:text-red-700"
        >
          <Trash2 size={18} />
        </button>
      )}
    </div>
  </div>
);

const CreateEventForm = ({ newEvent, setNewEvent, onSave, onCancel }) => (
  <div className="h-[70vh] overflow-y-auto pr-4">
    <h2 className="text-xl font-semibold mb-4 p-2 text-center sticky top-0 text-white bg-[#1A2B49]">
      Create New Event Request
    </h2>
    <div className="space-y-4">
      <div>
        <label
          className="block text-sm font-medium mb-1"
          style={{ color: "#1A2B49" }}
        >
          Event Name *
        </label>
        <input
          type="text"
          value={newEvent.E_Name}
          onChange={(e) => setNewEvent({ ...newEvent, E_Name: e.target.value })}
          className="w-full p-2 border rounded-md"
          style={{ borderColor: "#1A2B49" }}
          placeholder="e.g., Birthday Party"
        />
      </div>
      <div>
        <label
          className="block text-sm font-medium mb-1"
          style={{ color: "#1A2B49" }}
        >
          Creator Name *
        </label>
        <input
          type="text"
          value={newEvent.E_Creater_Name}
          onChange={(e) =>
            setNewEvent({ ...newEvent, E_Creater_Name: e.target.value })
          }
          className="w-full p-2 border rounded-md"
          style={{ borderColor: "#1A2B49" }}
          placeholder="e.g., Manoj"
        />
      </div>
      <div>
        <label
          className="block text-sm font-medium mb-1"
          style={{ color: "#1A2B49" }}
        >
          Creator Mobile *
        </label>
        <input
          type="tel"
          value={newEvent.E_Creater_Mobile}
          onChange={(e) =>
            setNewEvent({ ...newEvent, E_Creater_Mobile: e.target.value })
          }
          className="w-full p-2 border rounded-md"
          style={{ borderColor: "#1A2B49" }}
          placeholder="e.g., 1245786900"
        />
      </div>
      <div>
        <label
          className="block text-sm font-medium mb-1"
          style={{ color: "#1A2B49" }}
        >
          Event Start Date *
        </label>
        <input
          type="date"
          value={newEvent.E_StartDate}
          onChange={(e) =>
            setNewEvent({ ...newEvent, E_StartDate: e.target.value })
          }
          className="w-full p-2 border rounded-md"
          style={{ borderColor: "#1A2B49" }}
        />
      </div>
      <div>
        <label
          className="block text-sm font-medium mb-1"
          style={{ color: "#1A2B49" }}
        >
          Event End Date *
        </label>
        <input
          type="date"
          value={newEvent.E_EndDate}
          onChange={(e) =>
            setNewEvent({ ...newEvent, E_EndDate: e.target.value })
          }
          className="w-full p-2 border rounded-md"
          style={{ borderColor: "#1A2B49" }}
        />
      </div>
      <div>
        <label
          className="block text-sm font-medium mb-1"
          style={{ color: "#1A2B49" }}
        >
          Event Start Time *
        </label>
        <input
          type="time"
          value={newEvent.E_StartTime}
          onChange={(e) =>
            setNewEvent({ ...newEvent, E_StartTime: e.target.value })
          }
          className="w-full p-2 border rounded-md"
          style={{ borderColor: "#1A2B49" }}
        />
      </div>
      <div>
        <label
          className="block text-sm font-medium mb-1"
          style={{ color: "#1A2B49" }}
        >
          Event End Time *
        </label>
        <input
          type="time"
          value={newEvent.E_EndTime}
          onChange={(e) =>
            setNewEvent({ ...newEvent, E_EndTime: e.target.value })
          }
          className="w-full p-2 border rounded-md"
          style={{ borderColor: "#1A2B49" }}
        />
      </div>
      <div>
        <label
          className="block text-sm font-medium mb-1"
          style={{ color: "#1A2B49" }}
        >
          Event Place
        </label>
        <input
          type="text"
          value={newEvent.E_Place}
          onChange={(e) =>
            setNewEvent({ ...newEvent, E_Place: e.target.value })
          }
          className="w-full p-2 border rounded-md"
          style={{ borderColor: "#1A2B49" }}
          placeholder="e.g., Banquet Hall, NYC"
        />
      </div>
      <div>
        <label
          className="block text-sm font-medium mb-1"
          style={{ color: "#1A2B49" }}
        >
          City
        </label>
        <input
          type="text"
          value={newEvent.E_City}
          onChange={(e) => setNewEvent({ ...newEvent, E_City: e.target.value })}
          className="w-full p-2 border rounded-md"
          style={{ borderColor: "#1A2B49" }}
          placeholder="e.g., Los Angeles"
        />
      </div>
      <div>
        <label
          className="block text-sm font-medium mb-1"
          style={{ color: "#1A2B49" }}
        >
          State
        </label>
        <input
          type="text"
          value={newEvent.E_State}
          onChange={(e) =>
            setNewEvent({ ...newEvent, E_State: e.target.value })
          }
          className="w-full p-2 border rounded-md"
          style={{ borderColor: "#1A2B49" }}
          placeholder="e.g., California"
        />
      </div>
      <div>
        <label
          className="block text-sm font-medium mb-1"
          style={{ color: "#1A2B49" }}
        >
          Zipcode
        </label>
        <input
          type="text"
          value={newEvent.E_Zipcode}
          onChange={(e) =>
            setNewEvent({ ...newEvent, E_Zipcode: e.target.value })
          }
          className="w-full p-2 border rounded-md"
          style={{ borderColor: "#1A2B49" }}
          placeholder="e.g., 90001"
        />
      </div>
      <div>
        <label
          className="block text-sm font-medium mb-1"
          style={{ color: "#1A2B49" }}
        >
          Event Address
        </label>
        <input
          type="text"
          value={newEvent.E_Address}
          onChange={(e) =>
            setNewEvent({ ...newEvent, E_Address: e.target.value })
          }
          className="w-full p-2 border rounded-md"
          style={{ borderColor: "#1A2B49" }}
          placeholder="e.g., 123 Main St, NYC"
        />
      </div>
      <div>
        <label
          className="block text-sm font-medium mb-1"
          style={{ color: "#1A2B49" }}
        >
          Event Fees
        </label>
        <input
          type="number"
          value={newEvent.E_Fees}
          onChange={(e) => setNewEvent({ ...newEvent, E_Fees: e.target.value })}
          className="w-full p-2 border rounded-md"
          style={{ borderColor: "#1A2B49" }}
          placeholder="e.g., 50"
        />
      </div>
      <div>
        <label
          className="block text-sm font-medium mb-1"
          style={{ color: "#1A2B49" }}
        >
          Event Description
        </label>
        <textarea
          value={newEvent.E_Description}
          onChange={(e) =>
            setNewEvent({ ...newEvent, E_Description: e.target.value })
          }
          className="w-full p-2 border rounded-md"
          style={{ borderColor: "#1A2B49" }}
          rows="3"
          placeholder="Describe your event..."
        />
      </div>
      <div className="flex gap-4 sticky bottom-0 bg-white pt-4">
        <button
          onClick={onCancel}
          className="flex-1 p-2 border rounded-md"
          style={{ borderColor: "#1A2B49", color: "#1A2B49" }}
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          className="flex-1 p-2 rounded-md text-white"
          style={{ backgroundColor: "#1A2B49" }}
        >
          Submit Request
        </button>
      </div>
    </div>
  </div>
);

const DetailsPanel = ({ item, activeTab, onApprove, onReject, onCancel }) => (
  <div className="space-y-6">
    <h2
      className="text-2xl font-bold border-b-2 pb-2"
      style={{ color: "#1A2B49", borderColor: "#1A2B49" }}
    >
      Event Details
    </h2>
    <h3 className="text-xl font-semibold" style={{ color: "#1A2B49" }}>
      {item.E_Name}
    </h3>
    <div className="grid grid-cols-2 gap-4">
      <p className="text-gray-700">
        <span className="font-medium text-[#1A2B49]">Creater Name:</span>{" "}
        {item.E_Creater_Name || "N/A"}
      </p>
      <p className="text-gray-700">
        <span className="font-medium text-[#1A2B49]">Creater Mobile:</span>{" "}
        {item.E_Creater_Mobile || "N/A"}
      </p>
      <p className="text-gray-700">
        <span className="font-medium text-[#1A2B49]">Event Sender Name:</span>{" "}
        {item.user?.U_Name || "N/A"}
      </p>
      <p className="text-gray-700">
        <span className="font-medium text-[#1A2B49]">Event Sender Number:</span>{" "}
        {item.user?.U_Mobile || "N/A"}
      </p>
      <p className="text-gray-700">
        <span className="font-medium text-[#1A2B49]">Start Date:</span>{" "}
        {item.E_StartDate}
      </p>
      <p className="text-gray-700">
        <span className="font-medium text-[#1A2B49]">End Date:</span>{" "}
        {item.E_EndDate}
      </p>
      <p className="text-gray-700">
        <span className="font-medium text-[#1A2B49]">Start Time:</span>{" "}
        {item.E_StartTime}
      </p>
      <p className="text-gray-700">
        <span className="font-medium text-[#1A2B49]">End Time:</span>{" "}
        {item.E_EndTime}
      </p>
      <p className="text-gray-700">
        <span className="font-medium text-[#1A2B49]">Place:</span>{" "}
        {item.E_Place}
      </p>
      <p className="text-gray-700">
        <span className="font-medium text-[#1A2B49]">City:</span> {item.E_City}
      </p>
      <p className="text-gray-700">
        <span className="font-medium text-[#1A2B49]">State:</span>{" "}
        {item.E_State}
      </p>
      <p className="text-gray-700">
        <span className="font-medium text-[#1A2B49]">Zipcode:</span>{" "}
        {item.E_Zipcode}
      </p>
      <p className="text-gray-700 col-span-2">
        <span className="font-medium text-[#1A2B49]">Address:</span>{" "}
        {item.E_Address}
      </p>
      <p className="text-gray-700">
        <span className="font-medium text-[#1A2B49]">Fees:</span> $
        {item.E_Fees || "N/A"}
      </p>
      <p className="text-gray-700">
        <span className="font-medium text-[#1A2B49]">Status:</span>{" "}
        {item.E_Status}
      </p>
    </div>
    <div className="border-t pt-4">
      <h4 className="font-semibold text-lg" style={{ color: "#1A2B49" }}>
        Description
      </h4>
      <p className="text-gray-700 mt-2">{item.E_Description}</p>
    </div>
    {activeTab == "requests" && (
      <div className="flex gap-4 mt-6">
        <button
          onClick={() => onApprove(item)}
          className="flex-1 p-3 bg-gradient-to-r from-[#1A2B49] to-[#2A3B59] text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center"
        >
          <Check size={18} className="mr-2" />
          Approve
        </button>
        <button
          onClick={() => onReject(item)}
          className="flex-1 p-3 border-2 rounded-lg text-[#1A2B49] font-semibold hover:bg-gray-100 transition-all duration-300 flex items-center justify-center"
          style={{ borderColor: "#1A2B49" }}
        >
          <X size={18} className="mr-2" />
          Reject
        </button>
      </div>
    )}
    {activeTab == "events" && (
      <button
        onClick={() => onCancel(item)}
        className="mt-6 p-3 w-full border-2 rounded-lg text-[#1A2B49] font-semibold hover:bg-gray-100 transition-all duration-300"
        style={{ borderColor: "#1A2B49" }}
      >
        Cancel Event
      </button>
    )}
  </div>
);

export default Admineventlist;
