"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FaFileAlt, FaExclamationTriangle, FaChevronRight, FaMapMarkerAlt, FaBuilding, FaClock } from "react-icons/fa"
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
    <div className="fixed inset-0 bg-white bg-opacity-90 flex justify-center items-center z-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
    </div>
  )
}

const JobsApply = () => {
  const [applications, setApplications] = useState([])
  const [jobDetails, setJobDetails] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user"))
        if (!userData || !userData.U_Id) {
          throw new Error("User data not found in localStorage")
        }
        const userId = userData.U_Id

        // Fetch job applications
        const appsResponse = await fetch("https://parivaar.app/public/api/job-applications")
        const appsData = await appsResponse.json()
        if (appsData.status === true) {
          const userApplications = appsData.data.filter((app) => app.U_Id == userId)
          setApplications(userApplications)
        } else {
          throw new Error("Failed to fetch applications")
        }

        // Fetch job details
        const jobsResponse = await fetch("https://parivaar.app/public/api/jobs")
        const jobsData = await jobsResponse.json()
        if (jobsData.status === "success" || jobsData.status === true) {
          const jobMap = {}
          jobsData.data.forEach((job) => {
            jobMap[job.id] = {
              Company_Name: job.Company_Name,
              Job_Title: job.Job_Title,
              Location: job.Location,
              City: job.City,
            }
          })
          setJobDetails(jobMap)
        } else {
          throw new Error("Failed to fetch job details")
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [])

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-50 text-yellow-800 border-yellow-200"
      case "rejected":
        return "bg-red-50 text-red-800 border-red-200"
      case "accepted":
        return "bg-green-50 text-green-800 border-green-200"
      default:
        return "bg-gray-50 text-gray-800 border-gray-200"
    }
  }

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  if (loading) {
    return <CustomLogoLoader />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-lg text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaExclamationTriangle className="text-red-500 text-3xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Your Job Applications</h1>
              <nav className="flex items-center mt-2 text-sm text-gray-600">
                <Link to="/home" className="hover:text-blue-600 transition">Home</Link>
                <FaChevronRight className="mx-2 text-xs" />
                <Link to="/job" className="hover:text-blue-600 transition">Jobs</Link>
                <FaChevronRight className="mx-2 text-xs" />
                <span className="text-blue-600">Applications</span>
              </nav>
            </div>
            <Link 
              to="/job" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition"
            >
              Browse Jobs
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {applications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaFileAlt className="text-blue-500 text-3xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No applications yet</h3>
            <p className="text-gray-500 mb-6">You haven't applied to any jobs yet. Start exploring opportunities now!</p>
            <div className="flex justify-center gap-4">
              <Link
                to="/job"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
              >
                Browse Jobs
              </Link>
              <Link
                to="/profile"
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-lg font-medium transition"
              >
                Complete Profile
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800">
                  My Applications <span className="text-gray-500">({applications.length})</span>
                </h2>
              </div>
              
              <div className="divide-y divide-gray-100">
                {applications.map((app) => (
                  <div key={app.id} className="p-6 hover:bg-gray-50 transition">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="bg-blue-50 text-blue-600 rounded-lg p-3 flex-shrink-0">
                          <FaBuilding className="text-xl" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {jobDetails[app.Job_Id]?.Job_Title || "Job Title"}
                          </h3>
                          <p className="text-gray-600 mb-2">{jobDetails[app.Job_Id]?.Company_Name || "Company"}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="flex items-center text-sm text-gray-600">
                              <FaMapMarkerAlt className="mr-1 text-xs" />
                              {jobDetails[app.Job_Id]?.Location}, {jobDetails[app.Job_Id]?.City}
                            </span>
                            <span className="flex items-center text-sm text-gray-600">
                              <FaClock className="mr-1 text-xs" />
                              Applied on {formatDate(app.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(app.status)}`}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                        <Link 
                          to={`/job/${app.Job_Id}`} 
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium transition"
                        >
                          View Job Details
                        </Link>
                      </div>
                    </div>
                    
                    {app.Description && (
                      <div className="mt-4 pl-16">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Your Cover Letter</h4>
                        <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                          {app.Description}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Application Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-blue-600 font-bold text-2xl mb-1">
                    {applications.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Applications</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-yellow-600 font-bold text-2xl mb-1">
                    {applications.filter(a => a.status.toLowerCase() === 'pending').length}
                  </div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-green-600 font-bold text-2xl mb-1">
                    {applications.filter(a => a.status.toLowerCase() === 'accepted').length}
                  </div>
                  <div className="text-sm text-gray-600">Accepted</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default JobsApply