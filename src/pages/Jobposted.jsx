"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from "react-icons/fa"
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

const Jobposted = () => {
  const [postedJobs, setPostedJobs] = useState([])
  const [selectedPostedJob, setSelectedPostedJob] = useState(null)
  const [jobApplications, setJobApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    const fetchPostedJobs = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user"))
        if (!userData || !userData.U_Id) {
          throw new Error("User data not found in localStorage")
        }
        const userId = userData.U_Id

        const jobsResponse = await fetch("https://parivaar.app/public/api/jobs")
        const jobsData = await jobsResponse.json()
        if (jobsData.status === "success" || jobsData.status === true) {
          const userPostedJobs = jobsData.data.filter((job) => job.U_Id == userId)
          setPostedJobs(userPostedJobs)
        } else {
          throw new Error("Failed to fetch jobs")
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchPostedJobs()
  }, [])

  const fetchJobApplications = async (jobId) => {
    try {
      const appsResponse = await fetch("https://parivaar.app/public/api/job-applications")
      const appsData = await appsResponse.json()
      if (appsData.status === true) {
        const jobApps = appsData.data.filter((app) => app.Job_Id == jobId)
        setJobApplications(jobApps)
      } else {
        throw new Error("Failed to fetch job applications")
      }
    } catch (err) {
      setError(err.message)
    }
  }

  const handlePostedJobClick = async (job) => {
    setSelectedPostedJob(job)
    await fetchJobApplications(job.id)
    setError(null)
    setSuccessMessage("")
  }

  const handleApplicationStatusUpdate = async (applicationId, status) => {
    setFormSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`https://parivaar.app/public/api/job-applications/${applicationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Server responded with ${response.status}: ${errorText}`)
      }

      const result = await response.json()

      if (result.status === true) {
        setSuccessMessage(`Application ${status} successfully!`)
        setJobApplications((prev) => prev.map((app) => (app.id === applicationId ? { ...app, status } : app)))
      } else {
        throw new Error(result.message || `Failed to ${status} application`)
      }
    } catch (err) {
      setError(`Error updating application: ${err.message}`)
    } finally {
      setFormSubmitting(false)
    }
  }

  const handleFulfillJob = async (jobId) => {
    setFormSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`https://parivaar.app/public/api/jobs/${jobId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Status: "close" }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Server responded with ${response.status}: ${errorText}`)
      }

      const result = await response.json()

      if (result.status === "success" || result.status === true) {
        setSuccessMessage("Job fulfilled successfully!")
        setPostedJobs((prev) => prev.map((job) => (job.id === jobId ? { ...job, Status: "close" } : job)))
        if (selectedPostedJob && selectedPostedJob.id === jobId) {
          setSelectedPostedJob({ ...selectedPostedJob, Status: "close" })
        }
      } else {
        throw new Error(result.message || "Failed to fulfill job")
      }
    } catch (err) {
      setError(`Error fulfilling job: ${err.message}`)
    } finally {
      setFormSubmitting(false)
    }
  }

  if (loading) {
    return <CustomLogoLoader />
  }

  if (error && !selectedPostedJob) {
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
    <div className="container mx-auto px-4 py-8">
      <nav className="flex items-center gap-3 mb-8 text-sm font-medium bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-200">
        <Link to="/home" className="text-[#1A2B49] font-bold hover:underline">
          Home
        </Link>
        <span className="text-gray-400"> / </span>
        <Link to="/job" className="text-[#1A2B49] font-bold hover:underline">
          Jobs
        </Link>
        <span className="text-gray-400"> / </span>
        <span className="text-[#1A2B49]">Your Posted Jobs</span>
      </nav>

      <div className="bg-white shadow-md rounded-xl overflow-hidden">
        <div className="bg-blue-800 text-white p-6">
          <h1 className="text-2xl font-bold">Your Posted Jobs</h1>
          <p className="text-gray-200 text-sm mt-1">Manage your job postings and applications</p>
        </div>

        {successMessage && (
          <div className="m-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
            <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
            <p className="text-green-800">{successMessage}</p>
          </div>
        )}

        {error && selectedPostedJob && (
          <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="p-6">
          <Link to="/job" className="inline-block mb-6 text-blue-600 hover:underline flex items-center">
            ← Back to Jobs
          </Link>

          {postedJobs.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaExclamationTriangle className="text-gray-400 text-xl" />
              </div>
              <h3 className="text-lg font-medium mb-2">No jobs posted</h3>
              <p className="text-gray-500 text-sm mb-4">You haven't posted any jobs yet</p>
              <Link
                to="/job"
                className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition inline-block"
              >
                Post a Job
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {postedJobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => handlePostedJobClick(job)}
                  className={`bg-white border rounded-xl p-6 hover:shadow-md transition cursor-pointer ${
                    job.Status === "open" ? "border-l-4 border-green-500" : "border-l-4 border-gray-300"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-gray-800">{job.Job_Title}</h3>
                      <p className="text-gray-600 mb-2">{job.Company_Name}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="inline-flex items-center text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                          {job.Location}, {job.City}
                        </span>
                        <span
                          className={`inline-flex items-center text-sm px-3 py-1 rounded-full ${
                            job.Status === "open" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {job.Status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    {job.Status === "open" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleFulfillJob(job.id)
                        }}
                        className="bg-green-500 text-white py-1 px-3 rounded-full hover:bg-green-600 text-sm"
                      >
                        Fulfill
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Posted Job Details Modal */}
      {selectedPostedJob && (
        <div className="fixed inset-0 pt-15 bg-[#00000062] bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b relative">
              <button
                onClick={() => setSelectedPostedJob(null)}
                className="absolute right-6 top-6 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 className="text-2xl font-bold text-gray-800">{selectedPostedJob.Job_Title}</h2>
              <p className="text-gray-600">{selectedPostedJob.Company_Name}</p>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="inline-flex items-center text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  {selectedPostedJob.Location}, {selectedPostedJob.City}, {selectedPostedJob.State}
                </span>
                <span
                  className={`inline-flex items-center text-sm px-3 py-1 rounded-full ${
                    selectedPostedJob.Status === "open" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {selectedPostedJob.Status.toUpperCase()}
                </span>
              </div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Job Description</h3>
                <div className="text-gray-700 whitespace-pre-line">{selectedPostedJob.Job_Description}</div>
              </div>
              {selectedPostedJob.website && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Company Website</h3>
                  <a
                    href={selectedPostedJob.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-500 hover:underline"
                  >
                    {selectedPostedJob.website}
                  </a>
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Accepted Applications</h3>
                {jobApplications.filter((app) => app.status === "accepted").length === 0 ? (
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-gray-600">No accepted applications for this job.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {jobApplications
                      .filter((app) => app.status === "accepted")
                      .map((app) => (
                        <div key={app.id} className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="text-md font-semibold">{app.Name}</h4>
                          <p className="text-sm text-gray-600">{app.Mobile}</p>
                          <p className="text-sm text-gray-600">{app.Description}</p>
                        </div>
                      ))}
                  </div>
                )}
              </div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Rejected Applications</h3>
                {jobApplications.filter((app) => app.status === "rejected").length === 0 ? (
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-gray-600">No rejected applications for this job.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {jobApplications
                      .filter((app) => app.status === "rejected")
                      .map((app) => (
                        <div key={app.id} className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="text-md font-semibold">{app.Name}</h4>
                          <p className="text-sm text-gray-600">{app.Mobile}</p>
                          <p className="text-sm text-gray-600">{app.Description}</p>
                        </div>
                      ))}
                  </div>
                )}
              </div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Pending Applications</h3>
                {jobApplications.filter((app) => app.status === "pending").length === 0 ? (
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-gray-600">No pending applications for this job.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {jobApplications
                      .filter((app) => app.status === "pending")
                      .map((app) => (
                        <div key={app.id} className="p-4 bg-gray-50 rounded-lg flex justify-between items-center">
                          <div>
                            <h4 className="text-md font-semibold">{app.Name}</h4>
                            <p className="text-sm text-gray-600">{app.Mobile}</p>
                            <p className="text-sm text-gray-600">{app.Description}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApplicationStatusUpdate(app.id, "accepted")}
                              className="text-green-500 hover:text-green-600"
                              title="Accept"
                            >
                              <FaCheckCircle size={20} />
                            </button>
                            <button
                              onClick={() => handleApplicationStatusUpdate(app.id, "rejected")}
                              className="text-red-500 hover:text-red-600"
                              title="Reject"
                            >
                              <FaTimesCircle size={20} />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
              {selectedPostedJob.Status === "open" && (
                <button
                  onClick={() => handleFulfillJob(selectedPostedJob.id)}
                  className="bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 transition w-full"
                >
                  Fulfill Job
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {formSubmitting && <CustomLogoLoader />}
    </div>
  )
}

export default Jobposted
