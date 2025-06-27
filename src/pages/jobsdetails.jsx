"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { FaMapMarkerAlt, FaFileAlt, FaCheckCircle, FaArrowLeft, FaExternalLinkAlt } from "react-icons/fa"
import logoImage from "../../src/img/parivarlogo1.png"

const CustomLogoLoader = () => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 flex justify-center items-center z-50 pt-16">
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <img
        src={logoImage || "/placeholder.svg"}
        alt="Loading"
        className="w-12 h-12 animate-spin drop-shadow-md"
      />
    </div>
  )
}

function JobsDetails() {
  const { id } = useParams()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showApplyForm, setShowApplyForm] = useState(false)
  const [formData, setFormData] = useState({
    Name: "",
    Mobile: "",
    Resume: null,
    Description: "",
  })
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true)
        const response = await fetch("https://parivaar.app/public/api/jobs")
        const data = await response.json()

        if (data.status === "success" || data.status === true) {
          const jobData = data.data.find((job) => job.id == id)
          if (jobData) {
            setJob(jobData)
          } else {
            throw new Error("Job not found")
          }
        } else {
          throw new Error("Failed to fetch job details")
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchJobDetails()
    }
  }, [id])

  const handleApplyClick = () => {
    setShowApplyForm(true)
    setError(null)
    setSuccessMessage("")
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
      formDataToSend.append("Job_Id", job.id)
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
        setFormData({ Name: "", Mobile: "", Resume: null, Description: "" })
      } else {
        throw new Error(result.message || "Failed to submit application")
      }
    } catch (err) {
      setError("Error submitting application: " + err.message)
    } finally {
      setFormSubmitting(false)
    }
  }

  if (loading) {
    return <CustomLogoLoader />
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-red-800">Error loading job details</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <Link 
                    to="/job" 
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <FaArrowLeft className="mr-2" /> Back to Jobs
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-yellow-50 to-yellow-100 border-l-4 border-yellow-500">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-yellow-800">Job Not Found</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>The job you're looking for doesn't exist or has been removed.</p>
                </div>
                <div className="mt-4">
                  <Link 
                    to="/job" 
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                  >
                    <FaArrowLeft className="mr-2" /> Back to Jobs
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center text-sm text-gray-600 mb-8">
        <Link to="/home" className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
          Home
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <Link to="/job" className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
          Jobs
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-500 font-medium">{job.Job_Title}</span>
      </nav>

      {/* Main Job Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        {/* Job Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{job.Job_Title}</h1>
              <p className="text-lg text-gray-600 mt-1">{job.Company_Name}</p>
            </div>
            {!showApplyForm && (
              <button
                onClick={handleApplyClick}
                className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
              >
                <FaFileAlt className="mr-2" /> Apply Now
              </button>
            )}
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800">
              <FaMapMarkerAlt className="mr-1" /> {job.Location}, {job.City}, {job.State}
            </span>
          </div>
        </div>

        {/* Job Content */}
        <div className="flex flex-col lg:flex-row">
          {/* Job Details */}
          {(!showApplyForm || !isMobile) && (
            <div className={`${isMobile ? "w-full" : "lg:w-2/3"} p-6`}>
              <div className="prose max-w-none">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h3>
                <div className="text-gray-700 whitespace-pre-line">{job.Job_Description}</div>
                
                {job.website && (
                  <>
                    <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Company Website</h3>
                    <a
                      href={job.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-red-600 hover:text-red-800 hover:underline"
                    >
                      {job.website} <FaExternalLinkAlt className="ml-1 text-sm" />
                    </a>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Application Form */}
          {showApplyForm && (
            <div className={`${isMobile ? "w-full" : "lg:w-1/3"} p-6 bg-gray-50 border-t lg:border-t-0 lg:border-l border-gray-200`}>
              <div className="sticky top-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">Apply for this Position</h3>
                
                {successMessage && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
                    <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                    <p className="text-green-800">{successMessage}</p>
                  </div>
                )}
                
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800">{error}</p>
                  </div>
                )}
                
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="Name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="Name"
                      name="Name"
                      value={formData.Name}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                      required
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="Mobile" className="block text-sm font-medium text-gray-700 mb-1">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="Mobile"
                      name="Mobile"
                      value={formData.Mobile}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                      required
                      placeholder="9876543210"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="Resume" className="block text-sm font-medium text-gray-700 mb-1">
                      Resume (PDF) <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                      <div className="space-y-1 text-center">
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="Resume"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-red-600 hover:text-red-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-red-500"
                          >
                            <span>Upload a file</span>
                            <input
                              id="Resume"
                              name="Resume"
                              type="file"
                              accept="application/pdf"
                              onChange={handleFormChange}
                              className="sr-only"
                              required
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PDF up to 5MB
                        </p>
                        {formData.Resume && (
                          <p className="text-sm text-gray-900 mt-2">
                            <span className="font-medium">Selected:</span> {formData.Resume.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="Description" className="block text-sm font-medium text-gray-700 mb-1">
                      Cover Letter <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="Description"
                      name="Description"
                      rows={4}
                      value={formData.Description}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                      required
                      placeholder="Explain why you're a good fit for this position..."
                    />
                  </div>
                  
                  <div className="flex space-x-4 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowApplyForm(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={formSubmitting}
                      className="flex-1 px-4 py-2 border border-transparent rounded-lg shadow-sm text-white font-medium bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-70 disabled:cursor-not-allowed transition flex items-center justify-center"
                    >
                      {formSubmitting ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        "Submit Application"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default JobsDetails