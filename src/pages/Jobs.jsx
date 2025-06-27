"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import "./jobs.css"
import { FaSearch, FaBriefcase, FaFileAlt, FaPlus, FaExclamationTriangle } from "react-icons/fa"

import logoImage from "../../src/img/parivarlogo1.png"
import job11 from "../../src/img/job11.jpg"
import JobsList from "./JobList"
import JobPostForm from "./JobPostForm"

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
        top: "64px",
        left: 0,
        right: "5px",
        bottom: 0,
        background: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        backdropFilter: "blur(10px)",
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

const Jobs = () => {
  const [jobs, setJobs] = useState([])
  const [postedJobs, setPostedJobs] = useState([])
  const [applications, setApplications] = useState([])
  const [jobDetails, setJobDetails] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [showPostJobForm, setShowPostJobForm] = useState(false)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const fetchJobsAndApplications = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user"))
        if (!userData || !userData.Comm_Id || !userData.U_Id) {
          throw new Error("User data not found in localStorage")
        }
        const commId = userData.Comm_Id
        const userId = userData.U_Id

        const jobsResponse = await fetch("https://parivaar.app/public/api/jobs")
        const jobsData = await jobsResponse.json()
        if (jobsData.status == "success" || jobsData.status == true) {
          const filteredJobs = jobsData.data.filter((job) => job.user.Comm_Id == commId && job.Status == "open")
          setJobs(filteredJobs)

          const userPostedJobs = jobsData.data.filter((job) => job.U_Id == userId)
          setPostedJobs(userPostedJobs)

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
          throw new Error("Failed to fetch jobs")
        }

        const appsResponse = await fetch("https://parivaar.app/public/api/job-applications")
        const appsData = await appsResponse.json()
        if (appsData.status == true) {
          const userApplications = appsData.data.filter((app) => app.U_Id == userId)
          setApplications(userApplications)
        } else {
          throw new Error("Failed to fetch applications")
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchJobsAndApplications()
  }, [])

  const handleJobClick = (job) => {
    navigate(`/job/${job.id}`)
  }

  const handlePostJobClick = () => {
    setShowPostJobForm(true)
    setError(null)
    setSuccessMessage("")
  }

  const handlePostJobSubmit = async (postJobFormData) => {
    setFormSubmitting(true)
    setError(null)
    setSuccessMessage("")

    try {
      const userData = JSON.parse(localStorage.getItem("user"))
      const payload = {
        Company_Name: postJobFormData.Company_Name,
        Job_Title: postJobFormData.Job_Title,
        Job_Description: postJobFormData.Job_Description,
        website: postJobFormData.website,
        U_Id: userData.U_Id,
        Status: "open",
        Location: postJobFormData.Location,
        City: postJobFormData.City,
        State: postJobFormData.State,
      }

      const response = await fetch("https://parivaar.app/public/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${result.message || "Unknown error"}`)
      }

      if (result.id) {
        setSuccessMessage("Job posted successfully!")
        setPostedJobs((prev) => [...prev, result])
        setShowPostJobForm(false)
      } else {
        throw new Error(result.message || "Failed to post job")
      }
    } catch (err) {
      setError("Error posting job: " + err.message)
    } finally {
      setFormSubmitting(false)
    }
  }

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      searchTerm == "" ||
      job.Job_Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.Company_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.Job_Description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = !selectedCategory || job.Category == selectedCategory

    return matchesSearch && matchesCategory
  })

  if (loading) {
    return <CustomLogoLoader />
  }

  if (error && !showPostJobForm) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white shadow-lg rounded-lg p-6 max-w-md text-center">
          <FaExclamationTriangle className="text-yellow-500 text-5xl mb-4 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Something Went Wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-500 text-white py-2 px-6 rounded-full hover:bg-red-600 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="job min-h-screen">
      {/* Hero Section */}
      <section
        className="relative text-white flex items-center justify-center py-20 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${job11})`,
          minHeight: "500px",
        }}
      >
        <div className="container mx-auto px-4 text-center z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Find Your Dream Job <span className="text-[#96b1e1]">Today</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Drop your resume and connect with the best opportunities in your community
          </p>
          <div className="flex justify-center">
            <div className="w-full max-w-3xl flex shadow-lg rounded-full bg-white overflow-hidden">
              <input
                type="text"
                placeholder="Search for jobs, companies, or keywords..."
                className="w-full py-4 px-8 text-gray-700 focus:outline-none rounded-l-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="bg-[#1A2B49] text-white py-4 px-10 hover:bg-[#1413136a] hover:text-[#1A2B49] transition rounded-r-full font-semibold flex items-center">
                <FaSearch className="mr-2" />
                Search
              </button>
            </div>
          </div>
        </div>
      </section>
      <div className="container mx-auto px-2">
        <nav
          className="flex items-center gap-3 mt-8 text-sm font-medium bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-200"
          aria-label="breadcrumb"
        >
          <Link to="/home" className="text-[#1A2B49] font-bold hover:underline">
            Home
          </Link>
          <span className="text-gray-400"> / </span>
          <span className="text-[#1A2B49]">Job</span>
        </nav>
      </div>
      {/* Jobs and Applications Section */}
      <section className="py-16 pt-10 ">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Jobs Section */}
            <div className="lg:w-2/3">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Available Opportunities</h2>
                <span className="text-[#1A2B49] py-1 px-3 rounded-full text-sm font-medium">
                  {filteredJobs.length} Jobs Found
                </span>
              </div>

              <JobsList jobs={filteredJobs} onJobClick={handleJobClick} />
            </div>

            {/* Sidebar for Applications and Posted Jobs */}
            <div className="lg:w-1/3 space-y-8">
              {/* Your Applications Section */}
              <div className="bg-white shadow-md rounded-xl overflow-hidden">
                <div className="bg-gray-800 text-white p-4">
                  <h2 className="text-xl font-bold">Your Applications</h2>
                  <p className="text-gray-300 text-sm">Track your job application status</p>
                </div>
                <div className="divide-y max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {applications.length == 0 ? (
                    <div className="p-8 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaFileAlt className="text-gray-400 text-xl" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No applications yet</h3>
                      <p className="text-gray-500 text-sm">Start applying to jobs to see your applications here</p>
                    </div>
                  ) : (
                    <div className="p-4 text-center">
                      <Link to="/job/apply" className="text-blue-600 hover:underline font-medium">
                        View all your applications
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Your Posted Jobs Section */}
              <div className="bg-white shadow-md rounded-xl overflow-hidden">
                <div className="bg-blue-800 text-white p-4">
                  <h2 className="text-xl font-bold">Your Posted Jobs</h2>
                  <p className="text-gray-200 text-sm">Manage your job postings</p>
                </div>
                <div className="p-4">
                  <button
                    onClick={handlePostJobClick}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition flex items-center justify-center mb-4"
                  >
                    <FaPlus className="mr-2" /> Post a New Job
                  </button>
                  {postedJobs.length == 0 ? (
                    <div className="p-8 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaBriefcase className="text-gray-400 text-xl" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No jobs posted</h3>
                      <p className="text-gray-500 text-sm">Post a job to see it listed here</p>
                    </div>
                  ) : (
                    <div className="p-4 text-center">
                      <Link to="/job/posted" className="text-blue-600 hover:underline font-medium">
                        View all your posted jobs
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Post Job Form Modal */}
      {showPostJobForm && (
        <JobPostForm
          onClose={() => setShowPostJobForm(false)}
          onSubmit={handlePostJobSubmit}
          formSubmitting={formSubmitting}
          error={error}
          successMessage={successMessage}
        />
      )}

      {formSubmitting && <CustomLogoLoader />}
    </div>
  )
}

export default Jobs
