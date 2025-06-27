"use client"

import { useState, useEffect } from "react"
import toast, { Toaster } from "react-hot-toast"
import logoImage from "../../src/img/parivarlogo1.png" // Adjust path
import { Trash2, Calendar, Clock, User, Mail, Phone, MapPin, FileText, CheckCircle, XCircle, Edit } from "lucide-react"
import { LiaEdit } from "react-icons/lia"

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
      }}
    >
      <img
        className="ml-50"
        src={logoImage || "/placeholder.svg"}
        alt="Rotating Logo"
        style={{
          width: "70px",
          height: "70px",
          animation: "spin 1s linear infinite",
          filter: "drop-shadow(0 0 5px rgba(0, 0, 0, 0.3))",
        }}
      />
    </div>
  )
}

function DemoManagement() {
  const [activeTab, setActiveTab] = useState("pending")
  const [demos, setDemos] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [dateFilter, setDateFilter] = useState("all")
  const [customDate, setCustomDate] = useState("")
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedDemo, setSelectedDemo] = useState(null)
  const [editDate, setEditDate] = useState("")
  const [editFromTime, setEditFromTime] = useState("")
  const [editToTime, setEditToTime] = useState("")
  const [timeOptions, setTimeOptions] = useState([])

  // Generate time options in 24-hour format
  useEffect(() => {
    const options = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const formattedHour = hour.toString().padStart(2, "0")
        const formattedMinute = minute.toString().padStart(2, "0")
        options.push(`${formattedHour}:${formattedMinute}`)
      }
    }
    setTimeOptions(options)
  }, [])

  // Fetch data from API on component mount or when searchQuery changes
  useEffect(() => {
    setLoading(true)
    const queryParams = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ""
    fetch(`https://parivaar.app/public/api/schedule-demo${queryParams}`)
      .then((response) => response.json())
      .then((data) => {
        const formattedDemos = data.map((item) => ({
          id: item.sche_id,
          name: item.sche_name,
          email: item.sche_email,
          contactNumber: item.sche_phone,
          city: "Unknown", // City not provided in API response
          date: item.sche_date,
          fromTime: item.sche_time_slots.split(" - ")[0],
          toTime: item.sche_time_slots.split(" - ")[1],
          additionalNotes: item.additional_note,
          status: item.sche_status == 0 ? "pending" : item.sche_status == 1 ? "accepted" : "rejected",
        }))
        setDemos(formattedDemos)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching demos:", error)
        toast.error("Failed to fetch demo requests", {
          duration: 3000,
          position: "top-right",
        })
        setLoading(false)
      })
  }, [searchQuery])

  const handleStatusChange = (id, status) => {
    setLoading(true)
    const newStatusValue = status == "accepted" ? 1 : 2

    // Update status in backend using PUT request
    fetch(`https://parivaar.app/public/api/schedule-demo/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sche_status: newStatusValue,
      }),
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.status == false) {
          throw new Error(responseData.message || "Failed to update status")
        }

        // Update local state
        setDemos((prev) => prev.map((demo) => (demo.id == id ? { ...demo, status } : demo)))

        // Show toast
        if (status == "accepted") {
          toast.success(`Demo accepted successfully!`, {
            duration: 3000,
            position: "top-right",
          })
        } else {
          toast.error(
            (t) => (
              <span>
                Demo rejected successfully! <span style={{ color: "red" }}>✖</span>
              </span>
            ),
            {
              duration: 3000,
              position: "top-right",
              style: {
                background: "#fee2e2",
                color: "#b91c1c",
              },
            },
          )
        }
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error updating status:", error)
        let errorMessage = error.message || "Failed to update status"

        // Handle SMTP-specific error
        if (error.message.includes("534-5.7.9")) {
          errorMessage = "Email authentication failed. Please check your SMTP settings or use a Gmail App Password."
        }

        toast.error(`Failed to ${status} demo: ${errorMessage}`, {
          duration: 5000,
          position: "top-right",
        })
        setLoading(false)
      })
  }

  const handleDelete = (id) => {
    setLoading(true)

    fetch(`https://parivaar.app/public/api/schedule-demo/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.status == false) {
          throw new Error(responseData.message || "Failed to delete demo")
        }

        // Update local state to remove the deleted demo
        setDemos((prev) => prev.filter((demo) => demo.id !== id))

        toast.success(`Demo deleted successfully!`, {
          duration: 3000,
          position: "top-right",
        })
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error deleting demo:", error)
        toast.error(`Failed to delete demo: ${error.message}`, {
          duration: 3000,
          position: "top-right",
        })
        setLoading(false)
      })
  }

  // Convert 12-hour format to 24-hour format
  const convertTo24Hour = (time12h) => {
    const [time, modifier] = time12h.split(" ")
    let [hours, minutes] = time.split(":")

    if (hours === "12") {
      hours = "00"
    }

    if (modifier === "PM") {
      hours = Number.parseInt(hours, 10) + 12
    }

    return `${hours.toString().padStart(2, "0")}:${minutes}`
  }

  const handleEditClick = (demo) => {
    setSelectedDemo(demo)
    setEditDate(demo.date)

    // Convert times to 24-hour format if they're in 12-hour format
    const fromTime =
      demo.fromTime.includes("AM") || demo.fromTime.includes("PM") ? convertTo24Hour(demo.fromTime) : demo.fromTime

    const toTime = demo.toTime.includes("AM") || demo.toTime.includes("PM") ? convertTo24Hour(demo.toTime) : demo.toTime

    setEditFromTime(fromTime)
    setEditToTime(toTime)
    setIsEditModalOpen(true)
  }

  const handleEditSubmit = () => {
    if (!editDate || !editFromTime || !editToTime) {
      toast.error("Please fill in both date and time", {
        duration: 3000,
        position: "top-right",
      })
      return
    }

    setLoading(true)
    const timeSlot = `${editFromTime} - ${editToTime}`

    fetch(`https://parivaar.app/public/api/schedule-demo/${selectedDemo.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sche_date: editDate,
        sche_time_slots: timeSlot,
      }),
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.status === false) {
          throw new Error(responseData.message || "Failed to update schedule")
        }

        // Update local state
        setDemos((prev) =>
          prev.map((demo) =>
            demo.id === selectedDemo.id
              ? { ...demo, date: editDate, fromTime: editFromTime, toTime: editToTime }
              : demo,
          ),
        )

        toast.success("Schedule updated successfully!", {
          duration: 3000,
          position: "top-right",
        })
        setIsEditModalOpen(false)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error updating schedule:", error)
        toast.error(`Failed to update schedule: ${error.message}`, {
          duration: 3000,
          position: "top-right",
        })
        setLoading(false)
      })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "accepted":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getFilteredDemos = () => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    const formatDate = (date) => date.toISOString().split("T")[0]

    return demos
      .filter((demo) => demo.status == activeTab)
      .filter((demo) => {
        if (dateFilter == "all") return true
        if (dateFilter == "today") return demo.date == formatDate(today)
        if (dateFilter == "yesterday") return demo.date == formatDate(yesterday)
        if (dateFilter == "tomorrow") return demo.date == formatDate(tomorrow)
        if (dateFilter == "custom" && customDate) return demo.date == customDate
        return true
      })
      .filter(
        (demo) =>
          demo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          demo.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          demo.city.toLowerCase().includes(searchQuery.toLowerCase()),
      )
  }

  const tabCounts = {
    pending: demos.filter((demo) => demo.status == "pending").length,
    accepted: demos.filter((demo) => demo.status == "accepted").length,
    rejected: demos.filter((demo) => demo.status == "rejected").length,
  }

  const filteredDemos = getFilteredDemos()

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-gray-50">
      <Toaster />
      {loading && <CustomLogoLoader />}
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-[#1A2B49] mb-8 text-left flex items-center">
          <Calendar className="mr-3 h-8 w-8" /> Manage Demo
        </h1>

        {/* Search Bar and Date Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative w-full sm:w-2/3">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, email, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2B49] transition-all"
            />
          </div>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full sm:w-1/4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2B49] transition-all"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="custom">Custom Date</option>
          </select>
          {dateFilter == "custom" && (
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="w-full sm:w-1/4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2B49] transition-all"
            />
          )}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-4 mb-8 border-b border-gray-200">
          {["pending", "accepted", "rejected"].map((tab) => (
            <button
              key={tab}
              className={`relative px-6 py-3 rounded-t-lg font-medium text-sm transition-all duration-300 flex items-center ${
                activeTab == tab ? "bg-[#1A2B49] text-white" : "bg-gray-100 text-[#1A2B49] hover:bg-gray-200"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "pending" && <Clock className="mr-2 h-4 w-4" />}
              {tab === "accepted" && <CheckCircle className="mr-2 h-4 w-4" />}
              {tab === "rejected" && <XCircle className="mr-2 h-4 w-4" />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)} Requests
              <span
                className={`ml-2 px-2 py-1 text-xs rounded-full ${
                  activeTab == tab ? "bg-white text-[#1A2B49]" : "bg-[#1A2B49] text-white"
                }`}
              >
                {tabCounts[tab]}
              </span>
            </button>
          ))}
        </div>

        {/* Edit Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-[#00000085] bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-[#1A2B49] mb-4 flex items-center">
                <Edit className="mr-2 h-5 w-5" /> Edit Schedule
              </h2>
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-1 flex items-center">
                  <Calendar className="mr-2 h-4 w-4" /> Date
                </label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2B49]"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-1 flex items-center">
                  <Clock className="mr-2 h-4 w-4" /> From Time (24-hour format)
                </label>
                <select
                  value={editFromTime}
                  onChange={(e) => setEditFromTime(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2B49]"
                >
                  <option value="">Select start time</option>
                  {timeOptions.map((time) => (
                    <option key={`from-${time}`} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-1 flex items-center">
                  <Clock className="mr-2 h-4 w-4" /> To Time (24-hour format)
                </label>
                <select
                  value={editToTime}
                  onChange={(e) => setEditToTime(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2B49]"
                >
                  <option value="">Select end time</option>
                  {timeOptions.map((time) => (
                    <option key={`to-${time}`} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-[#1A2B49] rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSubmit}
                  className="px-4 py-2 bg-[#1A2B49] text-white rounded-lg hover:bg-[#2a3b59] transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Demo Requests List */}
        <div className="space-y-6">
          {filteredDemos.length == 0 ? (
            <div className="text-center text-gray-500 py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <p className="text-lg font-medium">No {activeTab} demo requests found</p>
              <p className="text-sm mt-1">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            filteredDemos.map((demo) => (
              <div
                key={demo.id}
                className="border border-gray-200 rounded-lg p-6 bg-gray-50 hover:bg-white transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-start">
                    <User className="h-5 w-5 text-[#1A2B49] mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium text-[#1A2B49]">{demo.name}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-[#1A2B49] mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-[#1A2B49]">{demo.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-[#1A2B49] mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Contact</p>
                      <p className="font-medium text-[#1A2B49]">{demo.contactNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-[#1A2B49] mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">City</p>
                      <p className="font-medium text-[#1A2B49]">{demo.city}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-[#1A2B49] mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-[#1A2B49]">{demo.date}</p>
                        {demo.status === "pending" && (
                          <button
                            onClick={() => handleEditClick(demo)}
                            className="p-1 cursor-pointer text-[#1A2B49] hover:text-[#2a3b59]"
                            title="Edit Schedule"
                          >
                            <LiaEdit size={17} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-[#1A2B49] mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Time</p>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-[#1A2B49]">
                          {demo.fromTime} - {demo.toTime}
                        </p>
                        {demo.status === "pending" && (
                          <button
                            onClick={() => handleEditClick(demo)}
                            className="p-1 cursor-pointer text-[#1A2B49] hover:text-[#2a3b59]"
                            title="Edit Schedule"
                          >
                            <LiaEdit size={17} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-start">
                  <FileText className="h-5 w-5 text-[#1A2B49] mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Additional Notes</p>
                    <p className="font-medium text-[#1A2B49]">{demo.additionalNotes || "No additional notes"}</p>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-end gap-4">
                  {demo.status == "pending" ? (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleStatusChange(demo.id, "accepted")}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-300 flex items-center"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" /> Accept
                      </button>
                      <button
                        onClick={() => handleStatusChange(demo.id, "rejected")}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300 flex items-center"
                      >
                        <XCircle className="mr-2 h-4 w-4" /> Reject
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleDelete(demo.id)}
                      className="p-2 bg-red-600 cursor-pointer text-white rounded-full hover:bg-red-700 transition-colors duration-300 flex items-center justify-center"
                      title="Delete Demo"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default DemoManagement
