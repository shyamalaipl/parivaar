"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Check,
  X,
  Plus,
  FileText,
  Globe,
  Briefcase,
  Trash2,
  CircleChevronLeft,
} from "lucide-react";
import Swal from "sweetalert2";
import logoImage from "../../src/img/parivarlogo1.png";

const CustomLoader = () => {
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

const CreateJobModal = ({
  isCreating,
  setIsCreating,
  newJob,
  setNewJob,
  handleCreateJob,
}) => {
  return (
    isCreating && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 w-full max-w-3xl max-h-[80vh] overflow-y-auto transform transition-all duration-300 animate-slide-up">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[#1A2B49]">
                Create New Position
              </h2>
              <button
                onClick={() => setIsCreating(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={newJob.Company_Name}
                  onChange={(e) =>
                    setNewJob({ ...newJob, Company_Name: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2B49]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  value={newJob.Job_Title}
                  onChange={(e) =>
                    setNewJob({ ...newJob, Job_Title: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2B49]"
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description
                </label>
                <textarea
                  value={newJob.Job_Description}
                  onChange={(e) =>
                    setNewJob({ ...newJob, Job_Description: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2B49]"
                  rows="4"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="text"
                  value={newJob.website}
                  onChange={(e) =>
                    setNewJob({ ...newJob, website: e.target.value })
                  }
                  className="w-full p-3 border border-gray300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2B49]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={newJob.Location}
                  onChange={(e) =>
                    setNewJob({ ...newJob, Location: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2B49]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={newJob.City}
                  onChange={(e) =>
                    setNewJob({ ...newJob, City: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2B49]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <input
                  type="text"
                  value={newJob.State}
                  onChange={(e) =>
                    setNewJob({ ...newJob, State: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2B49]"
                />
              </div>
            </div>
            <div className="flex gap-4 pt-6">
              <button
                onClick={() => setIsCreating(false)}
                className="flex-1 p-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateJob}
                className="flex-1 p-3 bg-[#1A2B49] text-white rounded-lg hover:bg-[#1A2B49]/90"
              >
                Create Job
              </button>
            </div>
          </div>
        </div>
        <style jsx>{`
          @keyframes slide-up {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-slide-up {
            animation: slide-up 0.3s ease-out;
          }
        `}</style>
      </div>
    )
  );
};

const JobDetailsModal = ({
  selectedJob,
  setSelectedJob,
  pendingApplications,
  acceptedApplications,
  rejectedApplications,
  handleApprove,
  handleReject,
  handleFulfillJob,
  handleDeleteJob,
}) => {
  return (
    selectedJob && (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
        <div className="bg-gradient-to-br from-[#fdf9f7] to-[#f0f4ff] rounded-2xl shadow-2xl w-[90vw] max-w-7xl h-[80vh] flex flex-row overflow-hidden transform transition-all duration-500 animate-slide-in">
          {/* Left Section: Job Details */}
          <div className="w-1/2 p-8 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-[#1A2B49]">
                {selectedJob.Job_Title}
              </h2>
              <button
                onClick={() => setSelectedJob(null)}
                className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center text-gray-700">
                <Briefcase className="w-6 h-6 mr-3 text-[#1A2B49]" />
                <span className="text-lg">{selectedJob.Company_Name}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Globe className="w-6 h-6 mr-3 text-[#1A2B49]" />
                <a
                  href={selectedJob.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#1A2B49] hover:underline text-lg"
                >
                  {selectedJob.website || "Not provided"}
                </a>
              </div>
              <div className="flex items-center text-gray-700">
                <Calendar className="w-6 h-6 mr-3 text-[#1A2B49]" />
                <span className="text-lg">
                  {new Date(selectedJob.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-[#1A2B49] mb-2">
                  Description
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {selectedJob.Job_Description}
                </p>
              </div>
            </div>
            {selectedJob.Status == "open" && (
              <div className="mt-8 flex gap-4">
                <button
                  onClick={handleFulfillJob}
                  className="flex-1 py-3 bg-[#1A2B49] text-white rounded-lg hover:bg-[#1A2B49]/90 transition-colors"
                >
                  Mark as Fulfilled
                </button>
                <button
                  onClick={() => handleDeleteJob(selectedJob)}
                  className="flex-1 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Delete Job
                </button>
              </div>
            )}
          </div>

          {/* Right Section: Applications */}
          <div className="w-1/2 bg-gradient-to-br from-[#fdf9f7] to-[#f0f4ff] p-8 overflow-y-auto">
            <h3 className="text-2xl font-semibold text-[#1A2B49] mb-6">
              Applications
            </h3>
            {/* Pending Applications */}
            <div className="mb-8">
              <h4 className="text-lg font-medium text-[#1A2B49] mb-4">
                Pending
              </h4>
              <div className="space-y-4">
                {pendingApplications.length > 0 ? (
                  pendingApplications.map((app) => (
                    <div
                      key={app.id}
                      className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-semibold text-[#1A2B49]">
                            {app.Name}
                          </h5>
                          <p className="text-gray-600 text-sm">{app.Mobile}</p>
                          <p className="text-gray-600 mt-2">
                            {app.Description || "No description provided"}
                          </p>
                          <a
                            href={app.Resume}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#1A2B49] hover:underline flex items-center mt-2"
                          >
                            <FileText className="w-4 h-4 mr-1" /> View Resume
                          </a>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(app)}
                            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleReject(app)}
                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No pending applications
                  </p>
                )}
              </div>
            </div>

            {/* Accepted Applications */}
            <div className="mb-8">
              <h4 className="text-lg font-medium text-[#1A2B49] mb-4">
                Accepted
              </h4>
              <div className="space-y-4">
                {acceptedApplications.length > 0 ? (
                  acceptedApplications.map((app) => (
                    <div
                      key={app.id}
                      className="bg-green-50 rounded-lg p-4 shadow-md"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-semibold text-green-800">
                            {app.Name}
                          </h5>
                          <p className="text-green-700 text-sm">{app.Mobile}</p>
                          <p className="text-green-700 mt-2">
                            {app.Description || "No description provided"}
                          </p>
                          <a
                            href={app.Resume}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-700 hover:underline flex items-center mt-2"
                          >
                            <FileText className="w-4 h-4 mr-1" /> View Resume
                          </a>
                        </div>
                        <span className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm">
                          Accepted
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No accepted applications
                  </p>
                )}
              </div>
            </div>

            {/* Rejected Applications */}
            <div>
              <h4 className="text-lg font-medium text-[#1A2B49] mb-4">
                Rejected
              </h4>
              <div className="space-y-4">
                {rejectedApplications.length > 0 ? (
                  rejectedApplications.map((app) => (
                    <div
                      key={app.id}
                      className="bg-red-50 rounded-lg p-4 shadow-md"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-semibold text-red-800">
                            {app.Name}
                          </h5>
                          <p className="text-red-700 text-sm">{app.Mobile}</p>
                          <p className="text-red-700 mt-2">
                            {app.Description || "No description provided"}
                          </p>
                          <a
                            href={app.Resume}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-700 hover:underline flex items-center mt-2"
                          >
                            <FileText className="w-4 h-4 mr-1" /> View Resume
                          </a>
                        </div>
                        <span className="bg-red-200 text-red-800 px-3 py-1 rounded-full text-sm">
                          Rejected
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No rejected applications
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        <style jsx>{`
          @keyframes slide-in {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          .animate-slide-in {
            animation: slide-in 0.5s ease-out;
          }
        `}</style>
      </div>
    )
  );
};

const Jobcreationmember = ({ setActivePage }) => {
  const [activeTab, setActiveTab] = useState("open");
  const [jobs, setJobs] = useState([]);
  const [completedJobs, setCompletedJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [pendingApplications, setPendingApplications] = useState([]);
  const [acceptedApplications, setAcceptedApplications] = useState([]);
  const [rejectedApplications, setRejectedApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const [newJob, setNewJob] = useState({
    Company_Name: "",
    Job_Title: "",
    Job_Description: "",
    website: "",
    Location: "",
    City: "",
    State: "",
  });

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const commId = user.Comm_Id;
  const uId = user.U_Id;

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://parivaar.app/public/api/jobs");
      if (!response.ok) throw new Error("Failed to fetch jobs");
      const data = await response.json();
      const allJobs = data.data || [];
      const filteredJobs = allJobs.filter((job) => job.user.Comm_Id == commId);
      setJobs(filteredJobs.filter((job) => job.Status == "open"));
      setCompletedJobs(filteredJobs.filter((job) => job.Status == "close"));
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Fetch Error",
        text: err.message,
        confirmButtonColor: "#1A2B49",
      });
      setError(err.message);
      setJobs([]);
      setCompletedJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async (jobId) => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://parivaar.app/public/api/job-applications"
      );
      if (!response.ok) throw new Error("Failed to fetch applications");
      const data = await response.json();
      const allApplications = data.data || [];

      if (allApplications.length == 0) {
        Swal.fire({
          icon: "info",
          title: "No Applications",
          text: "No applications found for this job.",
          confirmButtonColor: "#1A2B49",
        });
      }

      const filteredApplications = allApplications.filter(
        (app) =>
          String(app.Job_Id) == String(jobId) && app.user?.Comm_Id == commId
      );
      setPendingApplications(
        filteredApplications.filter((app) => app.status == "pending")
      );
      setAcceptedApplications(
        filteredApplications.filter((app) => app.status == "accepted")
      );
      setRejectedApplications(
        filteredApplications.filter((app) => app.status == "rejected")
      );
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Fetch Error",
        text: err.message,
        confirmButtonColor: "#1A2B49",
      });
      setError(err.message);
      setPendingApplications([]);
      setAcceptedApplications([]);
      setRejectedApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleJobClick = (job) => {
    setSelectedJob(job);
    fetchApplications(job.id);
    setIsCreating(false);
  };

  const handleApprove = async (application) => {
    Swal.fire({
      title: "Confirm Approval",
      text: `Approve ${application.Name}'s application?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#1A2B49",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, approve it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setLoading(true);
          const response = await fetch(
            `https://parivaar.app/public/api/job-applications/${application.id}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: "accepted" }),
            }
          );
          if (!response.ok) throw new Error("Failed to approve application");
          Swal.fire({
            icon: "success",
            title: "Application Approved",
            text: `${application.Name}'s application has been approved!`,
            confirmButtonColor: "#1A2B49",
          });
          fetchApplications(selectedJob.id);
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Approval Error",
            text: err.message,
            confirmButtonColor: "#1A2B49",
          });
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleReject = async (application) => {
    Swal.fire({
      title: "Confirm Rejection",
      text: `Reject ${application.Name}'s application?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1A2B49",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, reject it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setLoading(true);
          const response = await fetch(
            `https://parivaar.app/public/api/job-applications/${application.id}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: "rejected" }),
            }
          );
          if (!response.ok) throw new Error("Failed to reject application");
          Swal.fire({
            icon: "success",
            title: "Application Rejected",
            text: `${application.Name}'s application has been rejected!`,
            confirmButtonColor: "#1A2B49",
          });
          fetchApplications(selectedJob.id);
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Rejection Error",
            text: err.message,
            confirmButtonColor: "#1A2B49",
          });
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleCreateJob = async () => {
    if (!newJob.Company_Name || !newJob.Job_Title) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Company Name and Job Title are required!",
        confirmButtonColor: "#1A2B49",
      });
      return;
    }

    const payload = { ...newJob, U_Id: uId };

    try {
      setLoading(true);
      const response = await fetch("https://parivaar.app/public/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to create job");
      Swal.fire({
        icon: "success",
        title: "Job Created",
        text: "The job has been created successfully!",
        confirmButtonColor: "#1A2B49",
      });
      setNewJob({
        Company_Name: "",
        Job_Title: "",
        Job_Description: "",
        website: "",
        Location: "",
        City: "",
        State: "",
      });
      setIsCreating(false);
      fetchJobs();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Creation Error",
        text: err.message,
        confirmButtonColor: "#1A2B49",
      });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFulfillJob = async () => {
    Swal.fire({
      title: "Confirm Fulfillment",
      text: `Mark ${selectedJob.Job_Title} as fulfilled?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#1A2B49",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, mark it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setLoading(true);
          const response = await fetch(
            `https://parivaar.app/public/api/jobs/${selectedJob.id}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ Status: "close" }),
            }
          );
          if (!response.ok) throw new Error("Failed to update job status");
          Swal.fire({
            icon: "success",
            title: "Job Fulfilled",
            text: `${selectedJob.Job_Title} has been marked as fulfilled!`,
            confirmButtonColor: "#1A2B49",
          });
          await fetchJobs();
          setSelectedJob(null);
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Fulfillment Error",
            text: err.message,
            confirmButtonColor: "#1A2B49",
          });
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleDeleteJob = async (job) => {
    Swal.fire({
      title: "Confirm Deletion",
      text: `Are you sure you want to delete ${job.Job_Title}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1A2B49",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setLoading(true);
          const response = await fetch(
            `https://parivaar.app/public/api/jobs/${job.id}`,
            {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
            }
          );
          if (!response.ok) throw new Error("Failed to delete job");
          Swal.fire({
            icon: "success",
            title: "Job Deleted",
            text: `${job.Job_Title} has been deleted successfully!`,
            confirmButtonColor: "#1A2B49",
          });
          await fetchJobs();
          if (selectedJob?.id == job.id) {
            setSelectedJob(null);
          }
          setIsCreating(false);
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Deletion Error",
            text: err.message,
            confirmButtonColor: "#1A2B49",
          });
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdf9f7] to-[#f0f4ff]">
      {loading && <CustomLoader />}
      <div className="bg-[#1A2B49] p-4 rounded-xl flex items-center justify-between">
        <button
          className="flex items-center text-white"
          onClick={() => setActivePage("dashboardmember")}
        >
          <CircleChevronLeft size={30} className="mr-2" />
        </button>
        <h1 className="text-xl font-bold text-white text-center">
          Job Management
        </h1>
        <button
          className="bg-white text-[#1A2B49] py-2 px-4 rounded-md text-sm font-medium flex items-center"
          onClick={() => {
            setIsCreating(true);
            setSelectedJob(null);
          }}
        >
          <Plus size={18} className="mr-1" />
          Post New Job
        </button>
      </div>

      <div className="container mx-auto p-4">
        <div className="flex gap-8 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("open")}
            className={`pb-4 px-4 relative text-lg font-medium transition-colors ${
              activeTab == "open"
                ? "text-[#1A2B49]"
                : "text-gray-500 hover:text-[#1A2B49]"
            }`}
          >
            Open Jobs
            {activeTab == "open" && (
              <span className="absolute bottom-0 left-0 w-full h-1 bg-[#1A2B49] rounded-t-lg"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`pb-4 px-4 relative text-lg font-medium transition-colors ${
              activeTab == "completed"
                ? "text-[#1A2B49]"
                : "text-gray-500 hover:text-[#1A2B49]"
            }`}
          >
            Close Jobs
            {activeTab == "completed" && (
              <span className="absolute bottom-0 left-0 w-full h-1 bg-[#1A2B49] rounded-t-lg"></span>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {(activeTab == "open" ? jobs : completedJobs).map((job) => (
            <div
              key={job.id}
              onClick={() => handleJobClick(job)}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="p-4 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-[#1A2B49] text-lg">
                    {job.Company_Name}
                  </h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteJob(job);
                    }}
                    className="p-1.5 rounded-full bg-red-100 hover:bg-red-200"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-1">{job.Job_Title}</p>
              </div>
              <div className="p-4">
                <div className="flex items-center text-gray-600 text-sm mb-2">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>{new Date(job.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div
                className={`p-2 text-center text-sm font-medium ${
                  job.Status == "open"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {job.Status == "open" ? "Open" : "Close"}
              </div>
            </div>
          ))}
          {(activeTab == "open" ? jobs : completedJobs).length == 0 && (
            <div className="col-span-full text-center py-10 text-gray-500">
              <p className="text-lg">
                No {activeTab == "open" ? "open" : "completed"} jobs found.
              </p>
              {activeTab == "open" && (
                <button
                  onClick={() => {
                    setIsCreating(true);
                    setSelectedJob(null);
                  }}
                  className="mt-4 bg-[#1A2B49] text-white py-2 px-4 rounded-md text-sm font-medium inline-flex items-center"
                >
                  <Plus size={18} className="mr-1" />
                  Post New Job
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <CreateJobModal
        isCreating={isCreating}
        setIsCreating={setIsCreating}
        newJob={newJob}
        setNewJob={setNewJob}
        handleCreateJob={handleCreateJob}
      />

      <JobDetailsModal
        selectedJob={selectedJob}
        setSelectedJob={setSelectedJob}
        pendingApplications={pendingApplications}
        acceptedApplications={acceptedApplications}
        rejectedApplications={rejectedApplications}
        handleApprove={handleApprove}
        handleReject={handleReject}
        handleFulfillJob={handleFulfillJob}
        handleDeleteJob={handleDeleteJob}
      />
    </div>
  );
};

export default Jobcreationmember;
