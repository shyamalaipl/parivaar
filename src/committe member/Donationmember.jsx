"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CircleChevronLeft, Plus, Calendar, Users, BookOpen, BadgeDollarSign, X, Trash2, ChevronDown } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import logoImage from "../../src/img/parivarlogo1.png"

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
        alt="Rot Великая Logo"
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

const DonationAdmin = ({ setActivePage }) => {
  const [selectedTab, setSelectedTab] = useState("overview")
  const [selectedDonation, setSelectedDonation] = useState(null)
  const [selectedDonor, setSelectedDonor] = useState(null)
  const [showFormModal, setShowFormModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [loading, setLoading] = useState(true)

  // Filter states for different tabs
  const [campaignFilters, setCampaignFilters] = useState({
    category: "All",
    timeRange: "month",
    status: "All",
    search: "",
  })

  const [donorFilters, setDonorFilters] = useState({
    category: "All",
    timeRange: "month",
    search: "",
  })

  const [categoryFilters, setCategoryFilters] = useState({
    search: "",
  })

  // API Data States
  const [donations, setDonations] = useState([])
  const [donates, setDonates] = useState([])
  const [categories, setCategories] = useState([])
  const [filteredDonations, setFilteredDonations] = useState([])
  const [filteredDonors, setFilteredDonors] = useState([])
  const [filteredCategories, setFilteredCategories] = useState([])
  const [donationStats, setDonationStats] = useState({
    total: 0,
    monthlyRecurring: 0,
    donorsCount: 0,
    campaignsCount: 0,
  })

  // Form States
  const [campaignForm, setCampaignForm] = useState({
    D_name: "",
    D_des: "",
    goal_amount: "",
    mini_amount: "",
    Start_date: "",
    End_date: "",
    Cat_id: "",
    status: "1",
  })

  const [categoryForm, setCategoryForm] = useState({
    Cat_Name: "",
    Cat_Des: "",
  })

  // Get user data from localStorage
  const getUserData = () => {
    try {
      const userData = localStorage.getItem("user")
      return userData ? JSON.parse(userData) : null
    } catch (error) {
      console.error("Error parsing user data:", error)
      return null
    }
  }

  // API Functions
  const fetchDonations = async () => {
    try {
      const response = await fetch("https://parivaar.app/public/api/donations")
      const data = await response.json()
      return data.data || []
    } catch (error) {
      console.error("Error fetching donations:", error)
      return []
    }
  }

  const fetchDonates = async () => {
    try {
      const response = await fetch("https://parivaar.app/public/api/donates")
      const data = await response.json()
      return data.data || []
    } catch (error) {
      console.error("Error fetching donates:", error)
      return []
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("https://parivaar.app/public/api/category")
      const data = await response.json()
      return data || []
    } catch (error) {
      console.error("Error fetching categories:", error)
      return []
    }
  }

  const postCategory = async (categoryData) => {
    try {
      const response = await fetch("https://parivaar.app/public/api/category", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoryData),
      })
      return await response.json()
    } catch (error) {
      console.error("Error posting category:", error)
      throw error
    }
  }

  const deleteCategory = async (catId) => {
    try {
      const response = await fetch(`https://parivaar.app/public/api/category/${catId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })
      return await response.json()
    } catch (error) {
      console.error("Error deleting category:", error)
      throw error
    }
  }

  const updateCampaignStatus = async (donationId, newStatus) => {
    try {
      const campaign = donations.find((d) => d.D_id === donationId)
      if (!campaign) {
        throw new Error("Campaign not found")
      }

      const campaignData = {
        D_name: campaign.D_name,
        D_des: campaign.D_des,
        goal_amount: campaign.goal_amount,
        mini_amount: campaign.mini_amount,
        Start_date: campaign.Start_date,
        End_date: campaign.End_date,
        U_ID: campaign.U_ID,
        Cat_id: campaign.Cat_id || null,
        status: newStatus,
      }

      const response = await fetch(`https://parivaar.app/public/api/donations/${donationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(campaignData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(JSON.stringify(errorData))
      }

      return await response.json()
    } catch (error) {
      console.error("Error updating campaign status:", error)
      throw error
    }
  }

  const postDonation = async (donationData) => {
    try {
      const response = await fetch("https://parivaar.app/public/api/donations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(donationData),
      })
      return await response.json()
    } catch (error) {
      console.error("Error posting donation:", error)
      throw error
    }
  }

  // Filter data by Comm_Id
  const filterByCommId = (data, commId) => {
    return data.filter((item) => {
      if (item.user && item.user.Comm_Id === commId) return true
      if (item.Comm_Id === commId) return true
      return false
    })
  }

  // Calculate statistics
  const calculateStats = (donatesData, donationsData, commId) => {
    const userDonates = filterByCommId(donatesData, commId)
    const userDonations = filterByCommId(donationsData, commId)

    const totalAmount = userDonates.reduce((sum, donate) => {
      return sum + Number.parseFloat(donate.D_amount || 0)
    }, 0)

    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const monthlyAmount = userDonates
      .filter((donate) => {
        const donateDate = new Date(donate.Date)
        return donateDate.getMonth() === currentMonth && donateDate.getFullYear() === currentYear
      })
      .reduce((sum, donate) => sum + Number.parseFloat(donate.D_amount || 0), 0)

    const uniqueDonors = new Set(userDonates.map((donate) => donate.U_ID))
    const activeCampaigns = userDonations.filter((donation) => donation.status === "1")

    return {
      total: totalAmount,
      monthlyRecurring: monthlyAmount,
      donorsCount: uniqueDonors.size,
      campaignsCount: activeCampaigns.length,
    }
  }

  // Filter donations by time range
  const filterByTimeRange = (data, range) => {
    const now = new Date()
    const filtered = data.filter((item) => {
      const itemDate = new Date(item.Date || item.created_at || item.Start_date)

      switch (range) {
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          return itemDate >= weekAgo
        case "month":
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
          return itemDate >= monthAgo
        case "quarter":
          const quarterAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
          return itemDate >= quarterAgo
        case "year":
          const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
          return itemDate >= yearAgo
        default:
          return true
      }
    })
    return filtered
  }

  // Search functionality
  const searchData = (data, term) => {
    if (!term) return data
    return data.filter((item) => {
      const searchFields = [
        item.D_name,
        item.user?.U_Name,
        item.donation?.D_name,
        item.category?.Cat_Name,
        item.Cat_Name,
        item.D_des,
        item.U_Email,
      ].filter(Boolean)
      return searchFields.some((field) => field.toLowerCase().includes(term.toLowerCase()))
    })
  }

  // Filter by status
  const filterByStatus = (data, status) => {
    if (status === "All") return data
    return data.filter((item) => item.status === status)
  }

  // Filter by category
  const filterByCategory = (data, categoryId) => {
    if (categoryId === "All") return data
    return data.filter((item) => item.Cat_id === categoryId)
  }

  // Get campaign progress
  const getCampaignProgress = (campaignId, donatesData) => {
    const campaignDonates = donatesData.filter((donate) => Number(donate.D_id) === campaignId)
    return campaignDonates.reduce((sum, donate) => sum + Number.parseFloat(donate.D_amount || 0), 0)
  }

  // Get campaign donors
  const getCampaignDonors = (campaignId) => {
    return donates
      .filter((donate) => Number(donate.D_id) === campaignId)
      .map((donate) => ({
        donorName: donate.user?.U_Name || "Unknown",
        email: donate.user?.U_Email || "N/A",
        amount: donate.D_amount,
        date: donate.Date,
      }))
  }

  // Apply filters for campaigns
  const applyCampaignFilters = () => {
    let filtered = [...donations]

    filtered = filterByStatus(filtered, campaignFilters.status)
    filtered = filterByCategory(filtered, campaignFilters.category)
    filtered = filterByTimeRange(filtered, campaignFilters.timeRange)
    filtered = searchData(filtered, campaignFilters.search)

    setFilteredDonations(filtered)
  }

  // Apply filters for donors
  const applyDonorFilters = () => {
    let donorData = Array.from(new Set(donates.map((d) => d.U_ID))).map((donorId) => {
      const donor = donates.find((d) => d.U_ID === donorId)
      const donorDonations = donates.filter((d) => d.U_ID === donorId)
      const totalAmount = donorDonations.reduce((sum, d) => sum + Number.parseFloat(d.D_amount || 0), 0)

      return {
        ...donor,
        donorId,
        donorDonations,
        totalAmount,
        donationCount: donorDonations.length,
      }
    })

    if (donorFilters.category !== "All") {
      donorData = donorData.filter((donor) =>
        donor.donorDonations.some((donation) =>
          donations.find((campaign) => campaign.D_id === donation.D_id && campaign.Cat_id === donorFilters.category),
        ),
      )
    }

    donorData = donorData.filter((donor) => {
      const filteredDonations = filterByTimeRange(donor.donorDonations, donorFilters.timeRange)
      return filteredDonations.length > 0
    })

    donorData = searchData(donorData, donorFilters.search)

    setFilteredDonors(donorData)
  }

  // Apply filters for categories
  const applyCategoryFilters = () => {
    let filtered = [...categories]
    filtered = searchData(filtered, categoryFilters.search)
    setFilteredCategories(filtered)
  }

  // Load all data
  const loadData = async () => {
    setLoading(true)
    try {
      const userData = getUserData()
      if (!userData || !userData.Comm_Id) {
        console.error("No user data or Comm_Id found")
        return
      }

      const [donationsData, donatesData, categoriesData] = await Promise.all([
        fetchDonations(),
        fetchDonates(),
        fetchCategories(),
      ])

      const userDonations = filterByCommId(donationsData, userData.Comm_Id)
      const userDonates = filterByCommId(donatesData, userData.Comm_Id)
      const userCategories = filterByCommId(categoriesData, userData.Comm_Id)

      setDonations(userDonations)
      setDonates(userDonates)
      setCategories(userCategories)

      const stats = calculateStats(userDonates, userDonations, userData.Comm_Id)
      setDonationStats(stats)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Handle campaign status toggle
  const handleToggleStatus = async (donationId, currentStatus) => {
    try {
      const newStatus = currentStatus === "1" ? "0" : "1"
      await updateCampaignStatus(donationId, newStatus)
      loadData()
    } catch (error) {
      console.error("Error toggling campaign status:", error)
      alert("Failed to update campaign status. Please try again.")
    }
  }

  // Handle category deletion
  const handleDeleteCategory = async (catId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteCategory(catId)
        loadData()
      } catch (error) {
        console.error("Error deleting category:", error)
        alert("Failed to delete category. Please try again.")
      }
    }
  }

  // Apply filters when data or filter states change
  useEffect(() => {
    applyCampaignFilters()
  }, [donations, campaignFilters])

  useEffect(() => {
    applyDonorFilters()
  }, [donates, donations, donorFilters])

  useEffect(() => {
    applyCategoryFilters()
  }, [categories, categoryFilters])

  // Load data on component mount
  useEffect(() => {
    loadData()
  }, [])

  // Handle form submissions
  const handleSubmitCampaign = async (e) => {
    e.preventDefault()
    try {
      const userData = getUserData()
      if (!userData) return

      const campaignData = {
        ...campaignForm,
        U_ID: userData.U_Id,
        status: "1",
      }

      await postDonation(campaignData)
      setCampaignForm({
        D_name: "",
        D_des: "",
        goal_amount: "",
        mini_amount: "",
        Start_date: "",
        End_date: "",
        Cat_id: "",
        status: "1",
      })
      setShowFormModal(false)
      loadData()
    } catch (error) {
      console.error("Error submitting campaign:", error)
      alert("Failed to create campaign. Please check the form data and try again.")
    }
  }

  const handleSubmitCategory = async (e) => {
    e.preventDefault()
    try {
      const userData = getUserData()
      if (!userData) return

      const categoryData = {
        ...categoryForm,
        U_ID: userData.U_Id,
      }

      await postCategory(categoryData)
      setCategoryForm({
        Cat_Name: "",
        Cat_Des: "",
      })
      setShowCategoryModal(false)
      loadData()
    } catch (error) {
      console.error("Error submitting category:", error)
      alert("Failed to create category. Please try again.")
    }
  }

  // Generate chart data for monthly donations
  const getMonthlyChartData = () => {
    const monthlyData = {}
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    donates.forEach((donate) => {
      const date = new Date(donate.Date)
      const monthKey = months[date.getMonth()]
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = 0
      }
      monthlyData[monthKey] += Number.parseFloat(donate.D_amount || 0)
    })

    return months.map((month) => ({
      name: month,
      amount: monthlyData[month] || 0,
    }))
  }

  // Get recent donations (last 3)
  const getRecentDonations = () => {
    return donates
      .sort((a, b) => new Date(b.Date) - new Date(a.Date))
      .slice(0, 3)
      .map((donate) => {
        const campaign = donations.find((d) => d.D_id === donate.D_id)
        const categoryName = campaign?.category?.Cat_Name || "No Category"
        return {
          id: donate.Do_id,
          donor: donate.user?.U_Name || "Unknown",
          type: "Monetary",
          amount: `$${donate.D_amount}`,
          status: "approved",
          date: donate.Date,
          category: campaign?.D_name || "General",
          categoryName: categoryName,
        }
      })
  }

  // Get campaign progress data (latest 3 active campaigns)
  const getCampaignProgressData = () => {
    return donations
      .filter((campaign) => campaign.status === "1")
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 3)
      .map((campaign) => {
        const raised = getCampaignProgress(campaign.D_id, donates)
        const goal = Number.parseFloat(campaign.goal_amount || 0)
        const percentage = goal > 0 ? (raised / goal) * 100 : 0
        const remaining = goal > raised ? goal - raised : 0
        return {
          name: campaign.D_name,
          raised,
          goal,
          percentage,
          remaining,
          categoryName: campaign.category?.Cat_Name || "No Category",
        }
      })
  }

  if (loading) {
    return <CustomLogoLoader />
  }

  // Donation Chart Component
  const DonationChart = ({ data }) => {
    return (
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 12 }} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280", fontSize: 12 }}
              tickFormatter={(value) => `₹${value}`}
            />
            <Tooltip
              formatter={(value) => [`₹${value}`, "Donations"]}
              contentStyle={{
                backgroundColor: "white",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                border: "none",
              }}
            />
            <Bar dataKey="amount" fill="#1A2B49" radius={[4, 4, 0, 0]} barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  // Donation Table Component
  const DonationTable = ({ donations, showActions, onApprove, onReject }) => {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            
              {showActions && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {donations.map((donation) => (
              <tr key={donation.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{donation.donor}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{donation.type}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{donation.amount}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{donation.category}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{donation.categoryName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{donation.date}</div>
                </td>
               
                {showActions && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onApprove(donation.id)}
                        className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-md transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => onReject(donation.id)}
                        className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {donations.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500">No donations to display</p>
          </div>
        )}
      </div>
    )
  }

  // Campaign Details Modal
  const CampaignDetailsModal = ({ campaign, onClose }) => {
    const raised = getCampaignProgress(campaign.D_id, donates)
    const goal = Number.parseFloat(campaign.goal_amount || 0)
    const percentage = goal > 0 ? (raised / goal) * 100 : 0
    const remaining = goal > raised ? goal - raised : 0
    const categoryName = campaign.category?.Cat_Name || "No Category"
    const donors = getCampaignDonors(campaign.D_id)

    return (
      <div className="fixed inset-0 bg-[#00000062] bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl w-[90vw] max-w-5xl h-[80vh] flex flex-row overflow-hidden">
          {/* Left Side - Campaign Details */}
          <div className="w-1/2 p-8 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#1A2B49]">{campaign.D_name}</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Description</h3>
                <p className="text-gray-600">{campaign.D_des}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Category</h3>
                <p className="text-[#1A2B49]">{categoryName}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Progress</h3>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-500">Raised / Goal</span>
                  <span className="text-sm font-medium">
                    ${raised.toLocaleString()} / ${goal.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#1A2B49] h-2 rounded-full"
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Total Credited: ${raised.toLocaleString()} ({percentage.toFixed(1)}% of goal)
                </div>
                <div className={`text-xs mt-1 ${remaining === 0 ? "text-green-600" : "text-gray-500"}`}>
                  {remaining === 0 ? "Goal Reached!" : `Amount Remaining: $${remaining.toLocaleString()}`}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Details</h3>
                <div className="text-sm text-gray-500">
                  <p>Start Date: {campaign.Start_date}</p>
                  <p>End Date: {campaign.End_date}</p>
                  <p>Minimum Amount: ${campaign.mini_amount}</p>
                  <p>Status: {campaign.status === "1" ? "Active" : "Inactive"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Donors List */}
          <div className="w-1/2 bg-gray-50 p-8 overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Donors ({donors.length})</h3>
            {donors.length > 0 ? (
              <div className="space-y-4">
                {donors.map((donor, index) => (
                  <div key={index} className="border-b pb-4">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-900">{donor.donorName}</span>
                      <span className="font-medium text-green-600">${donor.amount}</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      <p>Email: {donor.email}</p>
                      <p>Date: {donor.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No donors for this campaign yet.</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Donor Details Modal
  const DonorDetailsModal = ({ donor, onClose }) => {
    return (
      <div className="fixed inset-0 bg-[#00000062] bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl w-[90vw] max-w-5xl h-[80vh] flex flex-row overflow-hidden">
          {/* Left Side - Donor Info */}
          <div className="w-1/2 p-8 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#1A2B49]">{donor?.user?.U_Name}</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Donor Information</h3>
                <div className="text-sm text-gray-500">
                  <p>Email: {donor?.user?.U_Email}</p>
                  <p>Total Donated: ${donor.totalAmount.toLocaleString()}</p>
                  <p>Total Donations: {donor.donationCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - All Donations */}
          <div className="w-1/2 bg-gray-50 p-8 overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">All Donations ({donor.donationCount})</h3>
            <div className="space-y-4">
              {donor.donorDonations.map((donation) => {
                const campaign = donations.find((d) => d.D_id === donation.D_id)
                const categoryName = campaign?.category?.Cat_Name || "No Category"

                return (
                  <div key={donation.Do_id} className="border-b pb-4">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-900">
                        {donation.donation?.D_name || campaign?.D_name || "Unknown Campaign"}
                      </span>
                      <span className="font-medium text-green-600">${donation.D_amount}</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      <p>Date: {donation.Date}</p>
                      <p>Category: {categoryName}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render filters based on selected tab
  const renderFilters = () => {
    if (selectedTab === "overview") {
      return null
    }

    if (selectedTab === "campaigns") {
      return (
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={campaignFilters.category}
                onChange={(e) => setCampaignFilters({ ...campaignFilters, category: e.target.value })}
                className="block w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1A2B49] focus:border-[#1A2B49]"
              >
                <option value="All">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.Cat_id} value={cat.Cat_id}>
                    {cat.Cat_Name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
              <select
                value={campaignFilters.timeRange}
                onChange={(e) => setCampaignFilters({ ...campaignFilters, timeRange: e.target.value })}
                className="block w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1A2B49] focus:border-[#1A2B49]"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={campaignFilters.status}
                onChange={(e) => setCampaignFilters({ ...campaignFilters, status: e.target.value })}
                className="block w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1A2B49] focus:border-[#1A2B49]"
              >
                <option value="0">Inactive</option>
                <option value="1">Active</option>
                <option value="All">All</option>
              </select>
            </div>
          </div>

          <div className="w-full md:w-64">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search campaigns..."
              value={campaignFilters.search}
              onChange={(e) => setCampaignFilters({ ...campaignFilters, search: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1A2B49] focus:border-[#1A2B49]"
            />
          </div>
        </div>
      )
    }

    if (selectedTab === "donors") {
      return (
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={donorFilters.category}
                onChange={(e) => setDonorFilters({ ...donorFilters, category: e.target.value })}
                className="block w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1A2B49] focus:border-[#1A2B49]"
              >
                <option value="All">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.Cat_id} value={cat.Cat_id}>
                    {cat.Cat_Name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
              <select
                value={donorFilters.timeRange}
                onChange={(e) => setDonorFilters({ ...donorFilters, timeRange: e.target.value })}
                className="block w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1A2B49] focus:border-[#1A2B49]"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
              </select>
            </div>
          </div>

          <div className="w-full md:w-64">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search donors..."
              value={donorFilters.search}
              onChange={(e) => setDonorFilters({ ...donorFilters, search: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1A2B49] focus:border-[#1A2B49]"
            />
          </div>
        </div>
      )
    }

    if (selectedTab === "categories") {
      return (
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
          <div className="w-full md:w-64">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search categories..."
              value={categoryFilters.search}
              onChange={(e) => setCategoryFilters({ ...categoryFilters, search: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1A2B49] focus:border-[#1A2B49]"
            />
          </div>
          <button
            onClick={() => setShowCategoryModal(true)}
            className="flex items-center gap-2 bg-[#1A2B49] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#2a3b59] transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            Add Category
          </button>
        </div>
      )
    }

    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdf9f7] to-[#f0f4ff]">
      {/* Admin Header */}
      <header className="bg-gradient-to-r from-[#1A2B49] to-[#2a3b59] text-white py-4 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button className="flex cursor-pointer items-center text-white">
              <CircleChevronLeft size={30} className="mr-2" onClick={() => setActivePage("dashboardmember")} />
            </button>
          </div>
          <h1 className="text-2xl font-bold">Donation Management</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFormModal(true)}
              className="flex items-center gap-2 bg-white text-[#1A2B49] px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300"
            >
              <Plus className="w-5 h-5" />
              Add Campaign
            </button>
          </div>
        </div>
      </header>

      {/* Admin Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setSelectedTab("overview")}
              className={`py-4 px-1 font-medium text-sm border-b-2 ${
                selectedTab === "overview"
                  ? "border-[#1A2B49] text-[#1A2B49]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Overview
            </button>

            <button
              onClick={() => setSelectedTab("campaigns")}
              className={`py-4 px-1 font-medium text-sm border-b-2 ${
                selectedTab === "campaigns"
                  ? "border-[#1A2B49] text-[#1A2B49]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Campaigns
            </button>

            <button
              onClick={() => setSelectedTab("donors")}
              className={`py-4 px-1 font-medium text-sm border-b-2 ${
                selectedTab === "donors"
                  ? "border-[#1A2B49] text-[#1A2B49]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Donors
            </button>

            <button
              onClick={() => setSelectedTab("categories")}
              className={`py-4 px-1 font-medium text-sm border-b-2 ${
                selectedTab === "categories"
                  ? "border-[#1A2B49] text-[#1A2B49]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Categories
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Render Filters */}
        {renderFilters()}

        {selectedTab === "overview" && (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
            >
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <BadgeDollarSign size={24} className="text-blue-500" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Total Donations</h3>
                    <p className="text-2xl font-bold text-gray-900">₹{donationStats.total.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Calendar size={24} className="text-purple-500" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Monthly Recurring</h3>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{donationStats.monthlyRecurring.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center">
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <Users size={24} className="text-amber-500" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Total Donors</h3>
                    <p className="text-2xl font-bold text-gray-900">{donationStats.donorsCount}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <BookOpen size={24} className="text-green-500" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Active Campaigns</h3>
                    <p className="text-2xl font-bold text-gray-900">{donationStats.campaignsCount}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Donations</h3>
                <DonationChart data={getMonthlyChartData()} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Active Campaign Progress</h3>
                  <button
                    onClick={() => setSelectedTab("campaigns")}
                    className="text-[#1A2B49] cursor-pointer hover:text-blue-800 text-sm font-medium"
                  >
                    View More
                  </button>
                </div>
                <div className="space-y-5">
                  {getCampaignProgressData().map((campaign, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-700 font-medium">{campaign.name}</span>
                        <span className="text-[#1A2B49]">
                          ${campaign.raised.toLocaleString()} / ${campaign.goal.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-[#1A2B49] text-sm mb-2">Category: {campaign.categoryName}</div>
                      <div className="w-full bg-gray-100 rounded-full h-3">
                        <div
                          className="h-3 rounded-full bg-[#1A2B49]"
                          style={{ width: `${Math.min(campaign.percentage, 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Total Credited: ${campaign.raised.toLocaleString()} ({campaign.percentage.toFixed(1)}%)
                      </div>
                      <div className={`text-xs mt-1 ${campaign.remaining === 0 ? "text-green-600" : "text-gray-500"}`}>
                        {campaign.remaining === 0
                          ? "Goal Reached!"
                          : `Amount Remaining: $${campaign.remaining.toLocaleString()}`}
                      </div>
                    </div>
                  ))}
                  {getCampaignProgressData().length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-gray-500">No active campaigns available</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Donations</h3>
                <button
                  onClick={() => setSelectedTab("donors")}
                  className="text-[#1A2B49] hover:text-blue-800 cursor-pointer text-sm font-medium"
                >
                  View More
                </button>
              </div>
              <DonationTable donations={getRecentDonations()} showActions={false} />
              {getRecentDonations().length === 0 && (
                <div className="text-center py-4">
                  <p className="text-gray-500">No recent donations available</p>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {selectedTab === "campaigns" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaigns Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredDonations.map((campaign) => {
                const raised = getCampaignProgress(campaign.D_id, donates)
                const goal = Number.parseFloat(campaign.goal_amount || 0)
                const percentage = goal > 0 ? (raised / goal) * 100 : 0
                const remaining = goal > raised ? goal - raised : 0
                const categoryName = campaign.category?.Cat_Name || "No Category"

                return (
                  <div
                    key={campaign.D_id}
                    className="border rounded-lg p-6 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedDonation(campaign)}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-gray-900">{campaign.D_name}</h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleStatus(campaign.D_id, campaign.status)
                        }}
                        className={`px-3 py-1 rounded-md text-sm font-medium ${
                          campaign.status === "1"
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        }`}
                      >
                        {campaign.status === "1" ? "Set Inactive" : "Set Active"}
                      </button>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{campaign.D_des}</p>
                    <p className="text-[#1A2B49] text-sm mb-4">Category: {categoryName}</p>

                    <div className="mb-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-500">Progress</span>
                        <span className="text-sm font-medium">
                          ${raised.toLocaleString()} / ${goal.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#1A2B49] h-2 rounded-full"
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Total Credited: ${raised.toLocaleString()} ({percentage.toFixed(1)}% of goal)
                      </div>
                      <div className={`text-xs mt-1 ${remaining === 0 ? "text-green-600" : "text-gray-500"}`}>
                        {remaining === 0 ? "Goal Reached!" : `Amount Remaining: $${remaining.toLocaleString()}`}
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      <div>Start: {campaign.Start_date}</div>
                      <div>End: {campaign.End_date}</div>
                      <div>Min Amount: ${campaign.mini_amount}</div>
                      <div>Status: {campaign.status === "1" ? "Active" : "Inactive"}</div>
                    </div>
                  </div>
                )
              })}
            </div>
            {filteredDonations.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-500">No campaigns found matching your filters</p>
              </div>
            )}
          </motion.div>
        )}

        {selectedTab === "donors" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Donors Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDonors.map((donor) => (
                <div key={donor.donorId} className="border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900">{donor?.user?.U_Name}</h4>
                  <p className="text-gray-600 text-sm">{donor?.user?.U_Email}</p>
                  <div className="mt-2">
                    <span className="text-sm text-gray-500">Total Donated: </span>
                    <span className="font-semibold text-green-600">${donor.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{donor.donationCount} donation(s)</div>
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-700">Recent Donations:</h5>
                    <ul className="mt-2 space-y-2">
                      {donor.donorDonations
                        .sort((a, b) => new Date(b.Date) - new Date(a.Date))
                        .slice(0, 2)
                        .map((donation) => {
                          const campaign = donations.find((d) => d.D_id === donation.D_id)
                          const categoryName = campaign?.category?.Cat_Name || "No Category"

                          return (
                            <li key={donation.Do_id} className="text-sm">
                              <div className="flex justify-between">
                                <span>{donation.donation?.D_name || campaign?.D_name || "Unknown Campaign"}</span>
                                <span className="font-medium">${donation.D_amount}</span>
                              </div>
                              <div className="text-xs text-gray-500">
                                <div>Date: {donation.Date}</div>
                                <div>Category: {categoryName}</div>
                              </div>
                            </li>
                          )
                        })}
                    </ul>
                    {donor.donationCount > 2 && (
                      <button
                        onClick={() => setSelectedDonor(donor)}
                        className="mt-2 text-[#1A2B49] hover:text-blue-800 text-sm font-medium flex items-center"
                      >
                        View More <ChevronDown className="ml-1 w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {filteredDonors.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-500">No donors found matching your filters</p>
              </div>
            )}
          </motion.div>
        )}

        {selectedTab === "categories" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCategories.map((category) => (
                <div key={category.Cat_id} className="border rounded-lg p-4 relative">
                  <h4 className="font-semibold text-gray-900">{category.Cat_Name}</h4>
                  <p className="text-gray-600 text-sm mt-2">{category.Cat_Des}</p>
                  <div className="mt-3 text-xs text-gray-500">Created by: {category.user?.U_Name}</div>
                  <button
                    onClick={() => handleDeleteCategory(category.Cat_id)}
                    className="absolute top-4 right-4 text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
            {filteredCategories.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-500">No categories found matching your search</p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Campaign Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-[#00000062] bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#1A2B49]">Create New Campaign</h2>
              <button onClick={() => setShowFormModal(false)} className="text-gray-500 hover:text-gray-700 text-xl">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmitCampaign} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1A2B49] mb-2">Campaign Name</label>
                <input
                  type="text"
                  value={campaignForm.D_name}
                  onChange={(e) => setCampaignForm({ ...campaignForm, D_name: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#1A2B49] focus:border-[#1A2B49]"
                  placeholder="Enter campaign name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A2B49] mb-2">Category</label>
                <select
                  value={campaignForm.Cat_id}
                  onChange={(e) => setCampaignForm({ ...campaignForm, Cat_id: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#1A2B49] focus:border-[#1A2B49]"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.Cat_id} value={cat.Cat_id}>
                      {cat.Cat_Name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A2B49] mb-2">Goal Amount</label>
                <input
                  type="number"
                  value={campaignForm.goal_amount}
                  onChange={(e) => setCampaignForm({ ...campaignForm, goal_amount: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#1A2B49] focus:border-[#1A2B49]"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A2B49] mb-2">Minimum Amount</label>
                <input
                  type="number"
                  value={campaignForm.mini_amount}
                  onChange={(e) => setCampaignForm({ ...campaignForm, mini_amount: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#1A2B49] focus:border-[#1A2B49]"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A2B49] mb-2">Description</label>
                <textarea
                  value={campaignForm.D_des}
                  onChange={(e) => setCampaignForm({ ...campaignForm, D_des: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#1A2B49] focus:border-[#1A2B49]"
                  placeholder="Describe this campaign"
                  rows="3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A2B49] mb-2">Start Date</label>
                <input
                  type="date"
                  value={campaignForm.Start_date}
                  onChange={(e) => setCampaignForm({ ...campaignForm, Start_date: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#1A2B49] focus:border-[#1A2B49]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A2B49] mb-2">End Date</label>
                <input
                  type="date"
                  value={campaignForm.End_date}
                  onChange={(e) => setCampaignForm({ ...campaignForm, End_date: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#1A2B49] focus:border-[#1A2B49]"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-[#1A2B49] text-white rounded-md hover:bg-[#2a3b59] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1A2B49]"
              >
                Create Campaign
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-[#00000062] bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#1A2B49]">Create New Category</h2>
              <button onClick={() => setShowCategoryModal(false)} className="text-gray-500 hover:text-gray-700 text-xl">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmitCategory} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#1A2B49] mb-2">Category Name</label>
                <input
                  type="text"
                  value={categoryForm.Cat_Name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, Cat_Name: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#1A2B49] focus:border-[#1A2B49]"
                  placeholder="Enter category name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A2B49] mb-2">Description</label>
                <textarea
                  value={categoryForm.Cat_Des}
                  onChange={(e) => setCategoryForm({ ...categoryForm, Cat_Des: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#1A2B49] focus:border-[#1A2B49]"
                  placeholder="Describe this category"
                  rows="3"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-[#1A2B49] text-white rounded-md hover:bg-[#2a3b59] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1A2B49]"
              >
                Create Category
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Campaign Details Modal */}
      {selectedDonation && (
        <CampaignDetailsModal
          campaign={selectedDonation}
          onClose={() => setSelectedDonation(null)}
        />
      )}

      {/* Donor Details Modal */}
      {selectedDonor && (
        <DonorDetailsModal
          donor={selectedDonor}
          onClose={() => setSelectedDonor(null)}
        />
      )}
    </div>
  )
}

export default DonationAdmin