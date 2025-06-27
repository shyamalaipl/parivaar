"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  Bell,
  Calendar,
  Heart,
  Briefcase,
  ShoppingBag,
  ArrowRight,
  MapPin,
  X,
  User,
  Clock,
  ImageIcon,
  DollarSign,
  Users,
  Gift,
  Sparkles,
  TrendingUp,
  Star,
} from "lucide-react"
import Swal from "sweetalert2"
import { QRCodeCanvas } from "qrcode.react"
import jsPDF from "jspdf"
import { FaCheckCircle } from "react-icons/fa"

const CommunityHome = () => {
  const [celebrations, setCelebrations] = useState([])
  const [condolences, setCondolences] = useState([])
  const [jobs, setJobs] = useState([])
  const [events, setEvents] = useState([])
  const [gallery, setGallery] = useState([])
  const [marketplace, setMarketplace] = useState([])
  const [bookings, setBookings] = useState([])
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState("")
  const [notices, setNotices] = useState([])
  const [donations, setDonations] = useState([])
  const [donates, setDonates] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedNotice, setSelectedNotice] = useState(null)
  const [selectedDonation, setSelectedDonation] = useState(null)
  const [selectedCelebration, setSelectedCelebration] = useState(null)
  const [selectedCondolence, setSelectedCondolence] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [selectedGallery, setSelectedGallery] = useState(null)
  const [selectedJob, setSelectedJob] = useState(null)
  const [selectedMarketplace, setSelectedMarketplace] = useState(null)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showApplyForm, setShowApplyForm] = useState(false)
  const [donationAmount, setDonationAmount] = useState(10)
  const [activeDonation, setActiveDonation] = useState(null)
  const [suggestedAmounts] = useState([10, 25, 50, 100])
  const [formData, setFormData] = useState({
    Name: "",
    Mobile: "",
    Resume: null,
    Description: "",
  })
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [bookingData, setBookingData] = useState({
    name:
      localStorage.getItem("bookingName") ||
      (localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).U_Name : ""),
    number:
      localStorage.getItem("bookingNumber") ||
      (localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).U_Mobile : ""),
    email:
      localStorage.getItem("bookingEmail") ||
      (localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).U_Email : ""),
  })

  const user = JSON.parse(localStorage.getItem("user")) || {
    Comm_Id: "",
    U_Id: "",
    Role_Id: "",
  }

  // Function to check if a date is today
  const isToday = (date) => {
    const today = new Date()
    const noticeDate = new Date(date)
    return (
      noticeDate.getDate() === today.getDate() &&
      noticeDate.getMonth() === today.getMonth() &&
      noticeDate.getFullYear() === today.getFullYear()
    )
  }

  // Function to check if a date is within this week
  const isThisWeek = (byDate) => {
    const today = new Date()
    const noticeDate = new Date(byDate)
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    return noticeDate >= startOfWeek && noticeDate <= endOfWeek
  }

  // Function to format date to DD MMM YYYY
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const commId = user?.Comm_Id
        if (!commId) {
          console.error("No Comm_Id found in localStorage")
          setNotices([])
          setDonations([])
          setDonates([])
          setCategories([])
          setCelebrations([])
          setCondolences([])
          setJobs([])
          setEvents([])
          setGallery([])
          setMarketplace([])
          setBookings([])
          setLoading(false)
          return
        }

        // Batch 1: Notices, Categories, Donations, Donates
        const [noticeResponse, categoriesResponse, donationsResponse, donatesResponse] = await Promise.all([
          fetch("https://parivaar.app/public/api/notice"),
          fetch("https://parivaar.app/public/api/category"),
          fetch("https://parivaar.app/public/api/donations"),
          fetch("https://parivaar.app/public/api/donates"),
        ])

        const noticeResult = await noticeResponse.json()
        const allNotices = noticeResult.data || []
        const filteredNotices = allNotices.filter((notice) => notice.user?.Comm_Id === commId)
        const todayNotices = filteredNotices.filter((notice) => isToday(notice.N_Date))
        const thisWeekNotices = filteredNotices.filter((notice) => isThisWeek(notice.N_Date) && !isToday(notice.N_Date))
        setNotices([...todayNotices, ...thisWeekNotices].slice(0, 2))

        const categoriesData = await categoriesResponse.json()
        const filteredCategories = categoriesData.filter((category) => category.user.Comm_Id == commId)
        setCategories(filteredCategories)

        const donationsData = await donationsResponse.json()
        const filteredDonations = donationsData.data
          .filter((donation) => donation.user.Comm_Id == commId && donation.status == "1")
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 2)

        const donatesData = await donatesResponse.json()
        setDonates(donatesData.data)

        const processedDonations = filteredDonations.map((donation) => {
          const donationDonates = donatesData.data.filter((d) => d.D_id == donation.D_id)
          const total_amount_raised = donationDonates.reduce((sum, d) => sum + Number.parseFloat(d.D_amount), 0)
          const uniqueDonors = new Set(donationDonates.map((d) => d.U_ID))
          const number_of_donors = uniqueDonors.size
          const remaining_amount = Number.parseFloat(donation.goal_amount) - total_amount_raised
          const category = donation.Cat_id
            ? filteredCategories.find((cat) => cat.Cat_id == donation.Cat_id)?.Cat_Name || "Uncategorized"
            : "Uncategorized"

          return {
            id: donation.D_id,
            title: donation.D_name,
            description: donation.D_des,
            category,
            goal: Number.parseFloat(donation.goal_amount),
            mini_amount: Number.parseFloat(donation.mini_amount),
            amountRaised: total_amount_raised,
            donors: number_of_donors,
            remaining: remaining_amount,
            endDate: donation.End_date,
            created_at: donation.created_at,
            user: donation.user,
          }
        })
        setDonations(processedDonations)

        // 5-second delay
        await new Promise((resolve) => setTimeout(resolve, 5000))

        // Batch 2: Celebrations, Condolences, Jobs, Events
        const [celebrationResponse, condolenceResponse, jobsResponse, eventsResponse] = await Promise.all([
          fetch("https://parivaar.app/public/api/celebration"),
          fetch("https://parivaar.app/public/api/condolences"),
          fetch("https://parivaar.app/public/api/jobs"),
          fetch("https://parivaar.app/public/api/events"),
        ])

        const celebrationResult = await celebrationResponse.json()
        const allCelebrations = celebrationResult.data || []
        const filteredCelebrations = allCelebrations
          .filter((item) => item.user?.Comm_Id === commId && item.N_Status === "approved")
          .map((item) => ({
            ...item,
            N_Image: Array.isArray(item.N_Image) ? item.N_Image : [],
          }))
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 2)
        setCelebrations(filteredCelebrations)

        const condolenceResult = await condolenceResponse.json()
        const allCondolences = condolenceResult.data || []
        const filteredCondolences = allCondolences
          .filter((item) => item.user?.Comm_Id === commId && item.N_Status === "approved")
          .map((item) => ({
            ...item,
            N_Image: Array.isArray(item.N_Image) ? item.N_Image : [],
          }))
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 2)
        setCondolences(filteredCondolences)

        const jobsResult = await jobsResponse.json()
        const allJobs = jobsResult.data || []
        const filteredJobs = allJobs
          .filter((item) => item.user?.Comm_Id === commId && item.Status === "open")
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 2)
        setJobs(filteredJobs)

        const eventsResult = await eventsResponse.json()
        const allEvents = eventsResult.data || []
        const upcomingMonth = new Date()
        upcomingMonth.setMonth(upcomingMonth.getMonth() + 1)
        const filteredEvents = allEvents
          .filter(
            (item) =>
              item.user?.Comm_Id === commId && item.E_Status === "A" && new Date(item.E_StartDate) <= upcomingMonth,
          )
          .sort((a, b) => new Date(a.E_StartDate) - new Date(b.E_StartDate))
          .slice(0, 2)
        setEvents(filteredEvents)

        // 5-second delay
        await new Promise((resolve) => setTimeout(resolve, 5000))

        // Batch 3: Bookings, Gallery, Marketplace
        const [bookingsResponse, galleryResponse, marketplaceResponse] = await Promise.all([
          fetch("https://parivaar.app/public/api/book-events"),
          fetch("https://parivaar.app/public/api/gallary"),
          fetch("https://parivaar.app/public/api/marketplaces"),
        ])

        const bookingsResult = await bookingsResponse.json()
        setBookings(bookingsResult.data || [])

        const galleryResult = await galleryResponse.json()
        const allGallery = galleryResult.data || []
        const filteredGallery = allGallery
          .filter((item) => item.user?.Comm_Id === commId)
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 2)
        setGallery(filteredGallery)

        const marketplaceResult = await marketplaceResponse.json()
        const allMarketplace = marketplaceResult.data || []
        const filteredMarketplace = allMarketplace
          .filter((item) => item.user?.Comm_Id === commId && item.M_Status === "Active")
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 2)
        setMarketplace(filteredMarketplace)
      } catch (error) {
        console.error("Error fetching data:", error)
        setNotices([])
        setDonations([])
        setDonates([])
        setCategories([])
        setCelebrations([])
        setCondolences([])
        setJobs([])
        setEvents([])
        setGallery([])
        setMarketplace([])
        setBookings([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Handle donation submission
  const handleDonate = async (id) => {
    const donation = donations.find((d) => d.id == id)
    if (!donation) return

    if (donationAmount < donation.mini_amount) {
      Swal.fire({
        title: "Invalid Amount",
        text: `Minimum donation amount is ₹${donation.mini_amount}`,
        icon: "error",
        confirmButtonColor: "#1A2B49",
      })
      return
    }

    try {
      const postData = {
        D_amount: donationAmount.toFixed(2),
        U_ID: user.U_Id.toString(),
        D_id: id.toString(),
        Date: new Date().toISOString().split("T")[0],
      }

      const response = await fetch("https://parivaar.app/public/api/donates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      })

      if (!response.ok) {
        throw new Error("Failed to submit donation")
      }

      const newDonate = await response.json()
      setDonates((prevDonates) => {
        const updatedDonates = [...prevDonates, newDonate.data]
        setDonations((prevDonations) =>
          prevDonations.map((d) => {
            if (d.id == id) {
              const donationDonates = updatedDonates.filter((dd) => dd.D_id == d.id)
              const total_amount_raised = donationDonates.reduce((sum, dd) => sum + Number.parseFloat(dd.D_amount), 0)
              const uniqueDonors = new Set(donationDonates.map((dd) => dd.U_ID))
              const number_of_donors = uniqueDonors.size
              const remaining_amount = d.goal - total_amount_raised
              return {
                ...d,
                amountRaised: total_amount_raised,
                donors: number_of_donors,
                remaining: remaining_amount,
              }
            }
            return d
          }),
        )
        return updatedDonates
      })

      Swal.fire({
        title: "Thank You for Your Generosity!",
        html: `
          <div class="flex flex-col items-center">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <p class="text-lg font-medium">Your donation of ₹${donationAmount} has been received.</p>
            <p class="text-sm text-gray-600 mt-2">Together we can make a difference!</p>
          </div>
        `,
        confirmButtonText: "Continue Making a Difference",
        confirmButtonColor: "#1A2B49",
      })

      setDonationAmount(10)
      setActiveDonation(null)
      setSelectedDonation(null)
    } catch (error) {
      console.error("Error submitting donation:", error)
      Swal.fire({
        title: "Error",
        text: "Failed to submit donation. Please try again.",
        icon: "error",
        confirmButtonColor: "#1A2B49",
      })
    }
  }

  // Handle click functions for modals
  const handleNoticeClick = (notice) => setSelectedNotice(notice)
  const handleDonationClick = (donation) => setSelectedDonation(donation)
  const handleCelebrationClick = (celebration) => setSelectedCelebration(celebration)
  const handleCondolenceClick = (condolence) => setSelectedCondolence(condolence)
  const handleEventClick = (event) => setSelectedEvent(event)
  const handleGalleryClick = (gallery) => setSelectedGallery(gallery)
  const handleJobClick = (job) => setSelectedJob(job)
  const handleMarketplaceClick = (marketplace) => setSelectedMarketplace(marketplace)
  const handleBookNow = (event) => {
    setSelectedEvent(event)
    setIsBookingOpen(true)
    setBookingSuccess(false)
  }

  const handleApplyClick = (e) => {
    e.stopPropagation()
    setShowApplyForm(true)
    setError(null)
  }

  // Close modal functions
  const closeNoticeModal = () => setSelectedNotice(null)
  const closeDonationModal = () => setSelectedDonation(null)
  const closeCelebrationModal = () => setSelectedCelebration(null)
  const closeCondolenceModal = () => setSelectedCondolence(null)
  const closeEventModal = () => setSelectedEvent(null)
  const closeGalleryModal = () => setSelectedGallery(null)
  const closeJobModal = () => setSelectedJob(null)
  const closeMarketplaceModal = () => setSelectedMarketplace(null)
  const closeBookingModal = () => setIsBookingOpen(false)

  // Booking handlers
  const handleBookingChange = (e) => {
    const { name, value } = e.target
    setBookingData((prev) => ({ ...prev, [name]: value }))
    localStorage.setItem(`booking${name.charAt(0).toUpperCase() + name.slice(1)}`, value)
  }

  const handleFormChange = (e) => {
    const { name, value, files } = e.target
    if (name === "Resume") {
      if (files[0]) {
        if (files[0].type !== "application/pdf") {
          alert("Please upload a PDF file.")
          return
        }
        if (files[0].size > 5 * 1024 * 1024) {
          alert("File size should be less than 5MB.")
          return
        }
        setFormData((prev) => ({ ...prev, Resume: files[0] }))
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setFormSubmitting(true)
    setError(null)
    setSuccessMessage("")

    try {
      const userData = JSON.parse(localStorage.getItem("user"))
      const formDataToSend = new FormData()
      formDataToSend.append("Name", formData.Name)
      formDataToSend.append("Mobile", formData.Mobile)
      formDataToSend.append("U_Id", userData.U_Id)
      formDataToSend.append("Comm_Id", userData.Comm_Id)
      formDataToSend.append("Job_Id", selectedJob.id)
      formDataToSend.append("Description", formData.Description)
      formDataToSend.append("status", "pending")

      if (formData.Resume) {
        formDataToSend.append("Resume", formData.Resume)
      } else {
        throw new Error("No resume file selected")
      }

      const response = await fetch("https://parivaar.app/public/api/job-applications", {
        method: "POST",
        body: formDataToSend,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Server responded with ${response.status}: ${errorText}`)
      }

      const result = await response.json()

      if (result.status === true) {
        setSuccessMessage("Application submitted successfully!")
        setShowApplyForm(false)
        setSelectedJob(null)
        setFormData({ Name: "", Mobile: "", Resume: null, Description: "" })
        Swal.fire({
          icon: "success",
          title: "Application Submitted",
          text: "Your job application has been submitted successfully!",
          showConfirmButton: false,
          timer: 1500,
        })
      } else {
        throw new Error(result.message || "Failed to submit application")
      }
    } catch (err) {
      setError("Error submitting application: " + err.message)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error submitting application: " + err.message || "An error occurred while submitting the application.",
        confirmButtonColor: "#1A2B49",
      })
    } finally {
      setFormSubmitting(false)
    }
  }

  const handleBookingSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const bookingPayload = {
        BE_Name: bookingData.name,
        BE_Email: bookingData.email,
        BE_Mobile: bookingData.number,
        E_Id: selectedEvent.E_Id,
        U_Id: user.U_Id,
        Comm_Id: user.Comm_Id,
      }

      const response = await fetch("https://parivaar.app/public/api/book-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingPayload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to book event")
      }

      setBookingSuccess(true)
      const bookingsResponse = await fetch("https://parivaar.app/public/api/book-events")
      const bookingsResult = await bookingsResponse.json()
      setBookings(bookingsResult.data || [])
      localStorage.removeItem("bookingEmail")
      localStorage.removeItem("bookingName")
      localStorage.removeItem("bookingNumber")

      Swal.fire({
        icon: "success",
        title: "Booking Confirmed",
        text: "Your booking has been successfully completed!",
        showConfirmButton: false,
        timer: 1500,
      })
    } catch (error) {
      console.error("Error booking event:", error)
      Swal.fire({
        icon: "error",
        title: "Error Booking Event",
        text: error.message,
        confirmButtonColor: "#1A2B49",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generateQRCodeValue = (event) => {
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
    `.trim()
  }

  const generatePDF = () => {
    const doc = new jsPDF()
    const qrCodeValue = generateQRCodeValue(selectedEvent)

    doc.setFontSize(16)
    doc.text("Booking Confirmation", 20, 20)
    doc.setFontSize(12)
    doc.text(`Event: ${selectedEvent.E_Name}`, 20, 30)
    doc.text(`Address: ${selectedEvent.E_Address}`, 20, 40)
    doc.text(`Fees: ₹${selectedEvent.E_Fees}`, 20, 50)
    doc.text(`Date: ${new Date(selectedEvent.E_StartDate).toLocaleDateString()}`, 20, 60)
    const bookingId = Math.random().toString(36).substr(2, 9)
    doc.text(`Booking ID: ${bookingId}`, 20, 70)
    doc.text(`Organizer: ${selectedEvent.E_Creater_Name}`, 20, 80)
    doc.text(`Contact: ${selectedEvent.E_Creater_Mobile}`, 20, 90)
    doc.text(`User: ${bookingData.name}`, 20, 100)
    doc.text(`Email: ${bookingData.email}`, 20, 110)

    const qrCanvas = document.getElementById("qrCode")
    if (qrCanvas) {
      const qrImage = qrCanvas.toDataURL("image/png")
      doc.addImage(qrImage, "PNG", 20, 120, 50, 50)
    }
    doc.save(`${selectedEvent.E_Name}_booking.pdf`)
  }

  // Component for single notice card
  const SingleNoticeCard = ({ item }) => (
    <div
      className="group relative bg-white rounded-lg p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-200 hover:border-[#1A2B49]"
      onClick={() => handleNoticeClick(item)}
    >
      <div className="absolute top-3 right-3 bg-[#1A2B49] text-white rounded-lg px-2 py-1 text-xs font-semibold">
        <div className="text-sm font-bold">{new Date(item.N_Date).getDate()}</div>
        <div className="text-xs opacity-90">{new Date(item.N_Date).toLocaleString("default", { month: "short" })}</div>
      </div>

      <div className="pr-12">
        <h3 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-[#1A2B49] transition-colors">
          {item.N_Title}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.N_Description}</p>
        <div className="flex items-center text-gray-500 text-sm">
          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="truncate">{item.N_Address || "No address provided"}</span>
        </div>
      </div>

      <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <ArrowRight className="w-4 h-4 text-[#1A2B49]" />
      </div>
    </div>
  )

  // Component for single donation card
  const SingleDonationCard = ({ item }) => {
    const today = new Date()
    const endDate = new Date(item.endDate)
    const daysLeft = Math.max(0, Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)))

    return (
      <div
        className="group relative bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-200 overflow-hidden"
        onClick={() => handleDonationClick(item)}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-[#1A2B49]"></div>

        <div className="p-4">
          <div className="flex justify-between items-start mb-3">
            <span className="inline-block px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded-full">
              {item.category}
            </span>
            <div className="flex items-center text-[#1A2B49]">
              <Clock className="w-3 h-3 mr-1" />
              <span className="text-xs font-medium">{daysLeft}d left</span>
            </div>
          </div>

          <h3 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-[#1A2B49] transition-colors">
            {item.title}
          </h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <Users className="h-4 w-4 text-[#1A2B49] mx-auto mb-1" />
              <div className="text-xs text-gray-500">Donors</div>
              <div className="font-semibold text-gray-900 text-sm">{item.donors}</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <TrendingUp className="h-4 w-4 text-[#1A2B49] mx-auto mb-1" />
              <div className="text-xs text-gray-500">Raised</div>
              <div className="font-semibold text-gray-900 text-sm">₹{(item.amountRaised / 1000).toFixed(0)}k</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <Gift className="h-4 w-4 text-purple-600 mx-auto mb-1" />
              <div className="text-xs text-gray-500">Goal</div>
              <div className="font-semibold text-gray-900 text-sm">₹{(item.goal / 1000).toFixed(0)}k</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative w-full bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-[#1A2B49] rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${Math.min(100, (item.amountRaised / item.goal) * 100)}%`,
              }}
            />
          </div>

          <div className="flex justify-between text-sm mb-3">
            <span className="font-semibold text-gray-900">₹{item.amountRaised.toLocaleString()} raised</span>
            <span className="text-gray-600">{Math.round((item.amountRaised / item.goal) * 100)}% of goal</span>
          </div>

          {/* Donation Form */}
          {activeDonation === item.id ? (
            <div className="mt-3 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Enter Amount</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                    ₹
                  </span>
                  <input
                    type="number"
                    min={item.mini_amount}
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(Number.parseFloat(e.target.value))}
                    onClick={(e) => e.stopPropagation()}
                    className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent transition-all"
                    placeholder="Enter amount"
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">Minimum donation amount is ₹{item.mini_amount}</div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDonate(item.id)
                  }}
                  className="flex-1 px-3 py-2 text-sm font-semibold rounded-lg text-white bg-[#1A2B49] hover:bg-[#152238] transition-all duration-200 shadow-md"
                >
                  <Heart className="h-3 w-3 mr-1 inline" />
                  Donate Now
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveDonation(null)
                  }}
                  className="flex-1 px-3 py-2 text-sm font-semibold rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => handleDonationClick(item)}
              className="w-full flex justify-center items-center px-3 py-2 text-sm font-semibold rounded-lg text-white bg-[#1A2B49] hover:bg-[#152238] transition-all duration-200 shadow-md"
            >
              <Heart className="h-4 w-4 mr-2" />
              Contribute Now
            </button>
          )}
        </div>
      </div>
    )
  }

  // Component for single celebration card
  const SingleCelebrationCard = ({ item }) => (
    <div
      className="group relative bg-white rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-200"
      onClick={() => handleCelebrationClick(item)}
    >
      <div className="relative h-32 overflow-hidden">
        {Array.isArray(item.N_Image) && item.N_Image.length > 0 ? (
          <img
            src={item.N_Image[0] || "/placeholder.svg?height=128&width=400"}
            alt={item.N_Title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <Sparkles className="w-12 h-12 text-[#1A2B49]" />
          </div>
        )}
        <div className="absolute top-2 right-2 bg-[#1A2B49] text-white rounded-full p-1">
          <Sparkles className="w-3 h-3" />
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-[#1A2B49] transition-colors">
          {item.N_Title}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.N_Description || "No description available"}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-500 text-sm">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{formatDate(item.N_Date)}</span>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowRight className="w-4 h-4 text-[#1A2B49]" />
          </div>
        </div>
      </div>
    </div>
  )

  // Component for single condolence card
  const SingleCondolenceCard = ({ item }) => (
    <div
      className="group relative bg-white rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-200"
      onClick={() => handleCondolenceClick(item)}
    >
      <div className="relative h-32 overflow-hidden">
        {Array.isArray(item.N_Image) && item.N_Image.length > 0 ? (
          <img
            src={item.N_Image[0] || "/placeholder.svg?height=128&width=400"}
            alt={item.N_Title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 filter grayscale"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <Heart className="w-12 h-12 text-[#1A2B49]" />
          </div>
        )}
        <div className="absolute top-2 right-2 bg-[#1A2B49] text-white rounded-full p-1">
          <Heart className="w-3 h-3" />
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-gray-600 transition-colors">
          {item.N_Title}
        </h3>
        <p className="text-gray-600 text-sm mb-3">Age: {item.N_Age || "N/A"}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-500 text-sm">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{formatDate(item.N_Date)}</span>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowRight className="w-4 h-4 text-gray-500" />
          </div>
        </div>
      </div>
    </div>
  )

  // Component for single event card
  const SingleEventCard = ({ event }) => {
    const remainingSeats = event.E_Capacity - event.E_Booked_Count
    return (
      <div
        className="group relative bg-white rounded-lg p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-200"
        onClick={() => handleEventClick(event)}
      >
        <div className="absolute top-3 right-3">
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
              remainingSeats <= 3 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
            }`}
          >
            {remainingSeats > 0 ? `${remainingSeats} seats left` : "Event Full"}
          </span>
        </div>

        <div className="pr-16">
          <h3 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-[#1A2B49] transition-colors">
            {event.E_Name || "Untitled Event"}
          </h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{event.E_Description || "No description available"}</p>

          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar className="w-3 h-3 mr-2 text-[#1A2B49]" />
              <span>{formatDate(event.E_StartDate)}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-2 text-[#1A2B49]" />
              <span>{`${event.E_StartTime} - ${event.E_EndTime}`}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="w-3 h-3 mr-2 text-[#1A2B49]" />
              <span className="truncate">{event.E_Address}</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-3 right-3">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleBookNow(event)
            }}
            className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all duration-200 ${
              remainingSeats <= 0
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-[#1A2B49] text-white hover:bg-[#152238] shadow-md"
            }`}
            disabled={remainingSeats <= 0}
          >
            {remainingSeats <= 0 ? "Filled" : "Book Now"}
          </button>
        </div>
      </div>
    )
  }

  // Component for single gallery card
  const SingleGalleryCard = ({ item }) => (
    <div
      className="group relative bg-white rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-200"
      onClick={() => handleGalleryClick(item)}
    >
      <div className="relative h-32 overflow-hidden">
        <img
          src={item.CE_Photo?.[0] || "/placeholder.svg?height=128&width=400"}
          alt={item.CE_Name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute bottom-2 left-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <ImageIcon className="w-5 h-5" />
        </div>
      </div>

      <div className="p-3">
        <h3 className="text-base font-semibold text-gray-900 group-hover:text-[#1A2B49] transition-colors">
          {item.CE_Name}
        </h3>
      </div>
    </div>
  )

  // Component for single job card
  const SingleJobCard = ({ job }) => (
    <div
      className="group relative bg-white rounded-lg p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-200"
      onClick={() => handleJobClick(job)}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="text-base font-semibold text-gray-900 mb-1 group-hover:text-[#1A2B49] transition-colors">
            {job.Job_Title}
          </h4>
          <p className="text-gray-600 font-medium mb-2 text-sm">{job.Company_Name}</p>
          <div className="flex flex-wrap gap-1">
            <span className="inline-block px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
              {job.Location}
            </span>
            <span className="inline-block px-2 py-1 text-xs font-semibold bg-[#1A2B49] text-white rounded-full">
              {job.Status}
            </span>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            setSelectedJob(job)
            handleApplyClick(e)
          }}
          className="px-3 py-1 bg-[#1A2B49] text-white rounded-lg hover:bg-[white] hover:text-[#1A2B49] text-sm font-semibold transition-all duration-200 shadow-md"
        >
          Apply
        </button>
      </div>
    </div>
  )

  // Component for single marketplace card
  const SingleMarketplaceCard = ({ item }) => (
    <div
      className="group relative bg-white rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-200"
      onClick={() => handleMarketplaceClick(item)}
    >
      <div className="relative h-24 overflow-hidden">
        <img
          src={item.M_Image[0] || "/placeholder.svg?height=96&width=200"}
          alt={item.M_Title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-1 right-1 bg-[#1A2B49] text-white rounded-lg px-2 py-1 text-xs font-semibold">
          ₹{item.M_Price}
        </div>
      </div>

      <div className="p-3">
        <h4 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-[#1A2B49] transition-colors line-clamp-1">
          {item.M_Title}
        </h4>
        <p className="text-gray-600 text-xs mb-2">{item.M_Category}</p>
        <div className="flex items-center justify-between">
          <span className="text-[#1A2B49] font-semibold text-sm">₹{item.M_Price}</span>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowRight className="w-3 h-3 text-[#1A2B49]" />
          </div>
        </div>
      </div>
    </div>
  )

  // Loading placeholder with professional design
  const LoadingPlaceholder = () => (
    <div className="space-y-3">
      {[1, 2].map((i) => (
        <div key={i} className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="animate-pulse">
            <div className="flex justify-between items-start mb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 w-12 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
            <div className="mt-3 h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Notices and Donations Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          {/* Notice Board */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#1A2B49] rounded-lg">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Notice Board</h2>
              </div>
              <Link
                to="/news"
                className="flex items-center space-x-2 px-3 py-2 bg-[#1A2B49] text-white rounded-lg hover-bg-[#152238] transition-all duration-200 shadow-md"
              >
                <span className="text-sm font-semibold">View All</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {loading ? (
                <LoadingPlaceholder />
              ) : notices.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-base">No notices available at the moment</p>
                </div>
              ) : (
                notices.map((item) => <SingleNoticeCard key={item.N_Id} item={item} />)
              )}
            </div>
          </div>

          {/* Donations */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#1A2B49] rounded-lg">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Donations</h2>
              </div>
              <Link
                to="/donation"
                className="flex items-center space-x-2 px-3 py-2 bg-[#1A2B49] text-white rounded-lg hover:bg-[#152238] transition-all duration-200 shadow-md">
                <span className="text-sm font-semibold">View All</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-4">
              {loading ? (
                <LoadingPlaceholder />
              ) : donations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Heart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p class="text-base">No active donations at the moment</p>
                </div>
              ) : (
                donations.map((item) => <SingleDonationCard key={item.id} item={item} />)
              )}
            </div>
          </div>
        </div>

        {/* Celebrations and Condolences Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          {/* Celebrations */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#1A2B49] rounded-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Celebrations</h2>
              </div>
              <Link
                to="/celebration"
                className="flex items-center space-x-2 px-3 py-2 bg-[#1A2B49] text-white rounded-lg hover:bg-[#1A2B49] transition-all duration-200 shadow-md">
                <span className="text-sm font-semibold">View All</span>
                <ArrowRight className="w-4 h-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-1 gap-4">
              {loading ? (
                <LoadingPlaceholder />
              ) : celebrations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Sparkles className="w-12 h-12 mx-auto mb-3 mb-12 text-gray-300" />
                  <p className="text-base">No celebrations to show</p>
                </div>
              ) : (
                celebrations.map((item) => <SingleCelebrationCard key={item.N_Id} item={item} />)
              )}
            </div>
          </div>

          {/* Condolences */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#b1A2B49] rounded-lg">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Condolences</h2>
              </div>
              <Link
                to="/condolences"
                className="flex items-center space-x-2 px-3 py-2 bg-[#1A2B49] text-white rounded-lg hover:bg-gray-700 transition-all duration-200 shadow-md">
                <span className="text-sm font-semibold">View All</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {loading ? (
                <LoadingPlaceholder />
              ) : condolences.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Heart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-base">No condolences to show</p>
                </div>
              ) : (
                condolences.map((item) => <SingleCondolenceCard key={item.N_Id} item={item} />)
              )}
            </div>
          </div>
        </div>

        {/* Events and Gallery Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          {/* Events */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#1A2B49] rounded-lg">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Upcoming Events</h2>
              </div>
              <Link
                to="/event"
                className="flex items-center space-x-2 px-3 py-2 bg-[#1A2B49] text-white rounded-lg hover:bg-[#152238] transition-all duration-200 shadow-md"
              >
                <span className="text-sm font-semibold">View All</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {loading ? (
                <LoadingPlaceholder />
              ) : events.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-base">No upcoming events</p>
                </div>
              ) : (
                events.map((event) => <SingleEventCard key={event.E_Id} event={event} />)
              )}
            </div>
          </div>

          {/* Gallery */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#1A2B49] rounded-lg">
                  <ImageIcon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Gallery</h2>
              </div>
              <Link
                to="/gallery"
                className="flex items-center space-x-2 px-3 py-2 bg-[#1A2B49] text-white rounded-lg hover:bg-[#152238] transition-all duration-200 shadow-md"
              >
                <span className="text-sm font-semibold">View All</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {loading ? (
                <LoadingPlaceholder />
              ) : gallery.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-base">No gallery items available</p>
                </div>
              ) : (
                gallery.map((item) => <SingleGalleryCard key={item.CE_Id} item={item} />)
              )}
            </div>
          </div>
        </div>

        {/* Jobs and Marketplace Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          {/* Jobs */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#1A2B49] rounded-lg">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Jobs</h2>
              </div>
              <Link
                to="/job"
                className="flex items-center space-x-2 px-3 py-2 bg-[#1A2B49] text-white rounded-lg hover:bg-[white] hover:text-[#1A2B49] transition-all duration-200 shadow-md"
              >
                <span className="text-sm font-semibold">View All</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {loading ? (
                <LoadingPlaceholder />
              ) : jobs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-base">No job openings available</p>
                </div>
              ) : (
                jobs.map((job) => <SingleJobCard key={job.id} job={job} />)
              )}
            </div>
          </div>

          {/* Marketplace */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#1A2B49] rounded-lg">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Marketplace</h2>
              </div>
              <Link
                to="/shop"
                className="flex items-center space-x-2 px-3 py-2 bg-[#1A2B49] text-white rounded-lg hover:bg-[#1A2B49] transition-all duration-200 shadow-md"
              >
                <span className="text-sm font-semibold">View All</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {loading ? (
                <LoadingPlaceholder />
              ) : marketplace.length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-500">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-base">No marketplace items available</p>
                </div>
              ) : (
                marketplace.map((item) => <SingleMarketplaceCard key={item.M_Id} item={item} />)
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notice Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900">{selectedNotice.N_Title}</h2>
              <button onClick={closeNoticeModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center text-[#1A2B49]">
                  <Calendar className="w-5 h-5 mb-3 mr-3" />
                  <span className="font-medium">{formatDate(selectedNotice.N_Date)}</span>
                </div>
                <div className="flex items-start text-gray-600">
                  <MapPin className="w-5 h-5 mt-0.5 mr-3 mb-5 flex-shrink-0" />
                  <span>{selectedNotice.Nature || "No address provided"}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <User className="w-5 h-5 mr-3 mb-3 flex-shrink-0" />
                  <span>
                    Posted by: <span className="font-medium">{selectedNotice.user.U_Name}</span>
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed">{selectedNotice.N_description}</p>
                </div>
                {selectedNotice.N_Category && (
                  <div className="flex items-center">
                    <span className="text-sm text-gray- mr-2">Category:</span>
                    <span className="inline-block px-3 py-1 text-sm font-semibold bg-[#1a2B49] text-white rounded-full">
                      {selectedNotice.N_Category_Category}
                    </span>
                  </div>
                )}
                {selectedNotice.N_Mobile && (
                  <div className="flex items-center text-gray-600">
                    <span className="text-sm font-medium mr-2">Contact:</span>
                    <span>{selectedNotice.N_Mobile}</span>
                  </div>
                )}
                {selectedNotice.N_Email && (
                  <div className="flex items-center text-gray-600">
                    <span className="text-sm font-medium mr-2">Email:</span>
                    <span>{selectedNotice.N_Email}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-gray-200">
              <Link
                to="/news"
                className="flex items-center justify-center space-x-2 w-full py-3 bg-[#1A2B49] text-white rounded-lg hover:bg-[#152238] transition-all duration-200"
              >
                <span>See More Notices</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Donation Modal */}
      {selectedDonation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900">{selectedDonation.title}</h2>
              <button onClick={closeDonationModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div className="flex items-center text-[#1A2B49]">
                  <Calendar className="w-5 h-5 mr-3" />
                  <span className="font-medium">Ends on {formatDate(selectedDonation.endDate)}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <User className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span>
                    Posted by: <span className="font-medium">{selectedDonation.user.U_Name}</span>
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">Category:</span>
                  <span className="inline-block px-3 py-1 text-sm font-semibold bg-gray-100 text-gray-700 rounded-full">
                    {selectedDonation.category}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed">{selectedDonation.description}</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Calendar className="h-6 w-6 text-[#1A2B49] mx-auto mb-2" />
                    <div className="text-xs text-gray-500">Days Left</div>
                    <div className="font-semibold text-[#1A2B49] text-lg">
                      {Math.max(
                        0,
                        Math.ceil((new Date(selectedDonation.endDate) - new Date()) / (1000 * 60 * 60 * 24)),
                      )}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Users className="h-6 w-6 text-[#1A2B49] mx-auto mb-2" />
                    <div className="text-xs text-gray-500">Donors</div>
                    <div className="font-semibold text-[#1A2B49] text-lg">{selectedDonation.donors}</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Gift className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                    <div className="text-xs text-gray-500">Goal</div>
                    <div className="font-semibold text-purple-600 text-lg">
                      ₹{(selectedDonation.goal / 1000).toFixed(0)}k
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-[#1A2B49] rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(100, (selectedDonation.amountRaised / selectedDonation.goal) * 100)}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-gray-900">
                    ₹{selectedDonation.amountRaised.toLocaleString()} raised
                  </span>
                  <span className="text-gray-600">
                    {Math.round((selectedDonation.amountRaised / selectedDonation.goal) * 100)}% of ₹
                    {selectedDonation.goal.toLocaleString()}
                  </span>
                </div>

                {/* Donation Form */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Make a Donation</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Enter Amount</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-500 font-medium">
                          ₹
                        </span>
                        <input
                          type="number"
                          min={selectedDonation.mini_amount}
                          value={donationAmount}
                          onChange={(e) => setDonationAmount(Number.parseFloat(e.target.value))}
                          className="block w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent transition-all"
                          placeholder="Enter amount"
                        />
                      </div>
                      <div className="text-sm text-gray-500 mt-2">
                        Minimum donation amount is ₹{selectedDonation.mini_amount}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleDonate(selectedDonation.id)}
                        className="flex-1 px-6 py-3 text-sm font-semibold rounded-lg text-white bg-[#1A2B49] hover:bg-[#152238] transition-all duration-200 shadow-md"
                      >
                        <Heart className="h-4 w-4 mr-2 inline" />
                        Donate Now
                      </button>
                      <button
                        onClick={closeDonationModal}
                        className="flex-1 px-6 py-3 text-sm font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200">
              <Link
                to="/donationuser"
                className="flex items-center justify-center space-x-2 w-full py-3 bg-[#1A2B49] text-white rounded-lg hover:bg-[#152238] transition-all duration-200"
              >
                <span>See More Donations</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Celebration Modal */}
      {selectedCelebration && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900">{selectedCelebration.N_Title}</h2>
              <button onClick={closeCelebrationModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {Array.isArray(selectedCelebration.N_Image) && selectedCelebration.N_Image.length > 0 && (
                  <img
                    src={selectedCelebration.N_Image[0] || "/placeholder.svg?height=256&width=400"}
                    alt={selectedCelebration.N_Title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                )}
                <div className="flex items-center text-yellow-600">
                  <Calendar className="w-5 h-5 mr-3" />
                  <span className="font-medium">{formatDate(selectedCelebration.N_Date)}</span>
                </div>
                <div className="flex items-start text-gray-600">
                  <MapPin className="w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
                  <span>{selectedCelebration.N_Address || "No address provided"}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <User className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span>
                    Posted by: <span className="font-medium">{selectedCelebration.user.U_Name}</span>
                  </span>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed">
                    {selectedCelebration.N_description || "No description available"}
                  </p>
                </div>
                {selectedCelebration.N_Category && (
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 mr-2">Category:</span>
                    <span className="inline-block px-3 py-1 text-sm font-semibold bg-yellow-100 text-yellow-700 rounded-full">
                      {selectedCelebration.N_Category}
                    </span>
                  </div>
                )}
                {selectedCelebration.N_Mobile && (
                  <div className="flex items-center text-gray-600">
                    <span className="text-sm font-medium mr-2">Contact:</span>
                    <span>{selectedCelebration.N_Mobile}</span>
                  </div>
                )}
                {selectedCelebration.N_Email && (
                  <div className="flex items-center text-gray-600">
                    <span className="text-sm font-medium mr-2">Email:</span>
                    <span>{selectedCelebration.N_Email}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-gray-200">
              <Link
                to="/celebration"
                className="flex items-center justify-center space-x-2 w-full py-3 bg-[#1A2B49] text-white rounded-lg hover:bg-yellow-600 transition-all duration-200"
              >
                <span>See More Celebrations</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Condolence Modal */}
    

      {/* Condolence Modal */}
      {selectedCondolence && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900">{selectedCondolence.N_Title}</h2>
              <button onClick={closeCondolenceModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {Array.isArray(selectedCondolence.N_Image) && selectedCondolence.N_Image.length > 0 && (
                  <img
                    src={selectedCondolence.N_Image[0] || "/placeholder.svg?height=256&width=400"}
                    alt={selectedCondolence.N_Title}
                    className="w-full h-64 object-cover rounded-lg filter grayscale"
                  />
                )}
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-5 h-5 mr-3" />
                  <span className="font-medium">{formatDate(selectedCondolence.N_Date)}</span>
                </div>
                <div className="flex items-start text-gray-600">
                  <MapPin className="w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
                  <span>{selectedCondolence.N_Address || "No address provided"}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <User className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span>
                    Posted by: <span className="font-medium">{selectedCondolence.user.U_Name}</span>
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed">
                    {selectedCondolence.N_description || "No description available"}
                  </p>
                </div>
                {selectedCondolence.N_Age && (
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 mr-2">Age:</span>
                    <span className="inline-block px-3 py-1 text-sm font-semibold bg-gray-100 text-gray-700 rounded-full">
                      {selectedCondolence.N_Age}
                    </span>
                  </div>
                )}
                {selectedCondolence.N_Mobile && (
                  <div className="flex items-center text-gray-600">
                    <span className="text-sm font-medium mr-2">Contact:</span>
                    <span>{selectedCondolence.N_Mobile}</span>
                  </div>
                )}
                {selectedCondolence.N_Email && (
                  <div className="flex items-center text-gray-600">
                    <span className="text-sm font-medium mr-2">Email:</span>
                    <span>{selectedCondolence.N_Email}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-gray-200">
              <Link
                to="/condolences"
                className="flex items-center justify-center space-x-2 w-full py-3 bg-[#1A2B49] text-white rounded-lg hover:bg-gray-700 transition-all duration-200"
              >
                <span>See More Condolences</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Event Modal */}
      {selectedEvent && !isBookingOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900">{selectedEvent.E_Name}</h2>
              <button onClick={closeEventModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-[#1A2B49]">Event Details</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 mr-3 text-[#1A2B49]" />
                      <span>
                        <span className="font-medium">Date:</span> {formatDate(selectedEvent.E_StartDate)}
                        {selectedEvent.E_StartDate !== selectedEvent.E_EndDate &&
                          ` to ${formatDate(selectedEvent.E_EndDate)}`}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 mr-3 text-[#1A2B49]" />
                      <span>
                        <span className="font-medium">Time:</span> {selectedEvent.E_StartTime} -{" "}
                        {selectedEvent.E_EndTime}
                      </span>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="w-5 h-5 mr-3 mt-0.5 text-[#1A2B49] flex-shrink-0" />
                      <div>
                        <div>
                          <span className="font-medium">Location:</span> {selectedEvent.E_Place}
                        </div>
                        <div>
                          <span className="font-medium">Address:</span> {selectedEvent.E_Address}
                        </div>
                        <div>
                          <span className="font-medium">City:</span> {selectedEvent.E_City}, {selectedEvent.E_State}{" "}
                          {selectedEvent.E_Zipcode}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="w-5 h-5 mr-3 text-[#1A2B49]" />
                      <span>
                        <span className="font-medium">Fees:</span> ₹{selectedEvent.E_Fees}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-5 h-5 mr-3 text-[#1A2B49]" />
                      <span>
                        <span className="font-medium">Capacity:</span> {selectedEvent.E_Capacity}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-5 h-5 mr-3 text-[#1A2B49]" />
                      <span>
                        <span className="font-medium">Seats Left:</span>{" "}
                        {selectedEvent.E_Capacity - selectedEvent.E_Booked_Count}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          selectedEvent.E_Status === "A" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {selectedEvent.E_Status === "A" ? "Active" : "Completed"}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-[#1A2B49]">Organizer Details</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium">Creator Name:</span> {selectedEvent.E_Creater_Name}
                    </div>
                    <div>
                      <span className="font-medium">Creator Mobile:</span> {selectedEvent.E_Creater_Mobile}
                    </div>
                    <div>
                      <span className="font-medium">Posted by:</span> {selectedEvent.user.U_Name}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4 text-[#1A2B49]">Description</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed">{selectedEvent.E_Description}</p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <Link
                  to="/event"
                  className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
                >
                  <span>See More Events</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                {selectedEvent.E_Status === "A" && (
                  <button
                    onClick={() => handleBookNow(selectedEvent)}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                      selectedEvent.E_Capacity - selectedEvent.E_Booked_Count <= 0
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-[#1A2B49] text-white hover:bg-[#152238] shadow-md"
                    }`}
                    disabled={selectedEvent.E_Capacity - selectedEvent.E_Booked_Count <= 0}
                  >
                    {selectedEvent.E_Capacity - selectedEvent.E_Booked_Count <= 0 ? "Event Full" : "Book Now"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {isBookingOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900">
                {bookingSuccess ? "Booking Confirmation" : `Book ${selectedEvent.E_Name}`}
              </h2>
              <button onClick={closeBookingModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              {!bookingSuccess ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-[#1A2B49]">Event Summary</h3>
                    <div className="bg-gray-50 rounded-lg p-6 space-y-3 text-sm">
                      <div>
                        <span className="font-medium">Name:</span> {selectedEvent.E_Name}
                      </div>
                      <div>
                        <span className="font-medium">Date:</span> {formatDate(selectedEvent.E_StartDate)}
                      </div>
                      <div>
                        <span className="font-medium">Time:</span> {selectedEvent.E_StartTime} -{" "}
                        {selectedEvent.E_EndTime}
                      </div>
                      <div>
                        <span className="font-medium">Address:</span> {selectedEvent.E_Address}
                      </div>
                      <div>
                        <span className="font-medium">Fees:</span> ₹{selectedEvent.E_Fees}
                      </div>
                      <div>
                        <span className="font-medium">Seats Left:</span>{" "}
                        {selectedEvent.E_Capacity - selectedEvent.E_Booked_Count}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-[#1A2B49]">Booking Information</h3>
                    <form onSubmit={handleBookingSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                        <input
                          type="text"
                          name="name"
                          value={bookingData.name}
                          onChange={handleBookingChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent transition-all"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Number</label>
                        <input
                          type="tel"
                          name="number"
                          value={bookingData.number}
                          onChange={handleBookingChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent transition-all"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={bookingData.email}
                          onChange={handleBookingChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2B49] focus:border-transparent transition-all"
                          required
                        />
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" required className="mr-2" />
                        <label className="text-sm text-gray-600">I agree to the Terms and Conditions</label>
                      </div>
                      <button
                        type="submit"
                        className="w-full px-6 py-3 bg-[#1A2B49] text-white rounded-lg hover:bg-[#152238] transition-all duration-200 shadow-md font-semibold"
                        disabled={isLoading}
                      >
                        {isLoading ? "Booking..." : "Confirm Booking"}
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-[#1A2B49]">Event Confirmation</h3>
                    <div className="text-center mb-6">
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaCheckCircle className="w-12 h-12 text-green-500" />
                      </div>
                      <p className="text-lg text-gray-700 mb-2">
                        Your booking for <strong>{selectedEvent.E_Name}</strong> has been confirmed!
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-6 space-y-3 text-sm">
                      <div>
                        <span className="font-medium">Booking ID:</span> {Math.random().toString(36).substr(2, 9)}
                      </div>
                      <div>
                        <span className="font-medium">Event Date:</span> {formatDate(selectedEvent.E_StartDate)}
                      </div>
                      <div>
                        <span className="font-medium">Time:</span> {selectedEvent.E_StartTime} -{" "}
                        {selectedEvent.E_EndTime}
                      </div>
                      <div>
                        <span className="font-medium">Address:</span> {selectedEvent.E_Address}
                      </div>
                      <div>
                        <span className="font-medium">User:</span> {bookingData.name}
                      </div>
                      <div>
                        <span className="font-medium">Email:</span> {bookingData.email}
                      </div>
                      <div>
                        <span className="font-medium">Fees:</span> ₹{selectedEvent.E_Fees}
                      </div>
                    </div>
                    <div className="mt-6 text-center">
                      <h4 className="text-lg font-semibold mb-4 text-gray-900">QR Code for Entry</h4>
                      <div className="flex justify-center mb-6">
                        <div className="p-4 bg-white rounded-lg shadow-md">
                          <QRCodeCanvas id="qrCode" value={generateQRCodeValue(selectedEvent)} size={150} />
                        </div>
                      </div>
                      <div className="flex justify-center gap-4">
                        <button
                          onClick={generatePDF}
                          className="px-6 py-3 bg-[#1A2B49] text-white rounded-lg hover:bg-[#152238] transition-all duration-200 shadow-md font-semibold"
                        >
                          Download PDF
                        </button>
                        <button
                          onClick={closeBookingModal}
                          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-semibold"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-[#1A2B49]">Important Information</h3>
                    <div className="bg-gray-50 rounded-lg p-6">
                      <ul className="space-y-3 text-sm text-gray-700">
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-[#1A2B49] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span>Please arrive 15 minutes before the event starts.</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-[#1A2B49] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span>Present the QR code at the event entrance for verification.</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-[#1A2B49] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span>Contact the organizer for any changes or cancellations.</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-[#1A2B49] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span>Ensure your email is correct for receiving updates.</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Gallery Modal */}
      {selectedGallery && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900">{selectedGallery.CE_Name}</h2>
              <button onClick={closeGalleryModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedGallery.CE_Photo && selectedGallery.CE_Photo.length > 0 ? (
                    selectedGallery.CE_Photo.map((photo, index) => (
                      <img
                        key={index}
                        src={photo || "/placeholder.svg?height=256&width=400"}
                        alt={`${selectedGallery.CE_Name} ${index + 1}`}
                        className="w-full h-64 object-cover rounded-lg shadow-md"
                      />
                    ))
                  ) : (
                    <div className="col-span-full flex items-center justify-center bg-gray-100 h-64 rounded-lg">
                      <ImageIcon className="w-16 h-16 text-[#1A2B49]" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-[#1A2B49]">Description</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 leading-relaxed">
                      {selectedGallery.CE_Description || "No description available"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-gray-600">
                  <User className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span>
                    Posted by: <span className="font-medium">{selectedGallery.user.U_Name}</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200">
              <Link
                to="/gallery"
                className="flex items-center justify-center space-x-2 w-full py-3 bg-[#1A2B49] text-white rounded-lg hover:bg-[#152238] transition-all duration-200"
              >
                <span>See More Gallery Items</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Job Modal */}
      {selectedJob && !showApplyForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900">{selectedJob.Job_Title}</h2>
              <button onClick={closeJobModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-[#1A2B49]">Job Details</h3>
                  <div className="bg-green-50 rounded-lg p-6 space-y-3 text-sm">
                    <div>
                      <span className="font-medium">Company:</span> {selectedJob.Company_Name}
                    </div>
                    <div>
                      <span className="font-medium">Location:</span> {selectedJob.Location}
                    </div>
                    <div>
                      <span className="font-medium">Type:</span> {selectedJob.Job_Type}
                    </div>
                    <div>
                      <span className="font-medium">Salary:</span> {selectedJob.Salary || "Not disclosed"}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>
                      <span className="inline-block ml-2 px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                        {selectedJob.Status}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Posted on:</span> {formatDate(selectedJob.created_at)}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-[#1A2B49]">Contact Information</h3>
                  <div className="bg-green-50 rounded-lg p-6 space-y-3 text-sm">
                    <div>
                      <span className="font-medium">Contact Person:</span> {selectedJob.Contact_Person || "N/A"}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {selectedJob.Contact_Email || "N/A"}
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span> {selectedJob.Contact_Phone || "N/A"}
                    </div>
                    <div>
                      <span className="font-medium">Posted by:</span> {selectedJob.user.U_Name}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4 text-[#1A2B49]">Job Description</h3>
                <div className="bg-green-50 rounded-lg p-6">
                  <p className="text-gray-700 leading-relaxed">
                    {selectedJob.Description || "No description provided"}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <Link
                  to="/job"
                  className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
                >
                  <span>See More Jobs</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={handleApplyClick}
                  className="px-6 py-3 bg-[#1A2B49] text-white rounded-lg hover:bg-[white] hover:text-[#1A2B49] transition-all duration-200 shadow-md font-semibold"
                >
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Job Application Form Modal */}
      {showApplyForm && selectedJob && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900">Apply for {selectedJob.Job_Title}</h2>
              <button
                onClick={() => {
                  setShowApplyForm(false)
                  setSelectedJob(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="Name"
                    value={formData.Name}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                  <input
                    type="tel"
                    name="Mobile"
                    value={formData.Mobile}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Resume (PDF only, max 5MB)</label>
                  <input
                    type="file"
                    name="Resume"
                    accept="application/pdf"
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cover Letter</label>
                  <textarea
                    name="Description"
                    value={formData.Description}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    rows="4"
                    placeholder="Tell us why you're perfect for this role..."
                  ></textarea>
                </div>
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}
                {successMessage && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-[#1A2B49] text-sm">{successMessage}</p>
                  </div>
                )}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-[#1A2B49] text-white rounded-lg hover:bg-[white] hover:text-[#1A2B49] transition-all duration-200 shadow-md font-semibold"
                    disabled={formSubmitting}
                  >
                    {formSubmitting ? "Submitting..." : "Submit Application"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowApplyForm(false)
                      setSelectedJob(null)
                    }}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Marketplace Modal */}
      {selectedMarketplace && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900">{selectedMarketplace.M_Title}</h2>
              <button onClick={closeMarketplaceModal} className="p-2 hover:bg-[white] hover:text-[#1A2B49] rounded-full transition-colors">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {selectedMarketplace.M_Image && selectedMarketplace.M_Image.length > 0 && (
                  <img
                    src={selectedMarketplace.M_Image[0] || "/placeholder.svg?height=256&width=400"}
                    alt={selectedMarketplace.M_Title}
                    className="w-full h-64 object-cover rounded-lg shadow-md"
                  />
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-[#1A2B49]">Item Details</h3>
                    <div className="bg-orange-50 rounded-lg p-6 space-y-3 text-sm">
                      <div>
                        <span className="font-medium">Category:</span> {selectedMarketplace.M_Category}
                      </div>
                      <div>
                        <span className="font-medium">Price:</span>
                        <span className="text-[#1A2B49] font-semibold text-lg ml-2">
                          ₹{selectedMarketplace.M_Price}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Condition:</span> {selectedMarketplace.M_Condition || "N/A"}
                      </div>
                      <div>
                        <span className="font-medium">Status:</span>
                        <span className="inline-block ml-2 px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                          {selectedMarketplace.M_Status}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Posted on:</span> {formatDate(selectedMarketplace.created_at)}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-[#1A2B49]">Seller Information</h3>
                    <div className="bg-orange-50 rounded-lg p-6 space-y-3 text-sm">
                      <div>
                        <span className="font-medium">Seller:</span> {selectedMarketplace.user.U_Name}
                      </div>
                      <div>
                        <span className="font-medium">Contact:</span> {selectedMarketplace.M_Contact || "N/A"}
                      </div>
                      <div>
                        <span className="font-medium">Location:</span> {selectedMarketplace.M_Location || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-[#1A2B49]">Description</h3>
                  <div className="bg-orange-50 rounded-lg p-6">
                    <p className="text-gray-700 leading-relaxed">
                      {selectedMarketplace.M_Description || "No description provided"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200">
              <Link
                to="/shop"
                className="flex items-center justify-center space-x-2 w-full py-3 bg-[#1A2B49] text-white rounded-lg hover:bg-[white] hover:text-[#1A2B49] border transition-all duration-200"
              >
                <span>See More Marketplace Items</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CommunityHome
