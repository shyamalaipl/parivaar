"use client"

import { useState } from "react"
import { FaCheckCircle } from "react-icons/fa"

const JobPostForm = ({ onClose, onSubmit, formSubmitting, error, successMessage }) => {
  const [postJobFormData, setPostJobFormData] = useState({
    Company_Name: "",
    Job_Title: "",
    Job_Description: "",
    website: "",
    Location: "",
    City: "",
    State: "",
  })

  const handlePostJobFormChange = (e) => {
    const { name, value } = e.target
    setPostJobFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(postJobFormData)
  }

  return (
    <div className="fixed inset-0 pt-15 bg-[#0000005d] bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b relative">
          <button onClick={onClose} className="absolute right-6 top-6 text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-2xl font-bold text-gray-800">Post a New Job</h2>
        </div>
        <div className="p-6">
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
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Company Name</label>
              <input
                type="text"
                name="Company_Name"
                value={postJobFormData.Company_Name}
                onChange={handlePostJobFormChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                required
                placeholder="Enter company name"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Job Title</label>
              <input
                type="text"
                name="Job_Title"
                value={postJobFormData.Job_Title}
                onChange={handlePostJobFormChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                required
                placeholder="Enter job title"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Job Description</label>
              <textarea
                name="Job_Description"
                value={postJobFormData.Job_Description}
                onChange={handlePostJobFormChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition min-h-[120px]"
                required
                placeholder="Describe the job..."
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Website (Optional)</label>
              <input
                type="url"
                name="website"
                value={postJobFormData.website}
                onChange={handlePostJobFormChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                placeholder="Enter company website"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Location</label>
              <input
                type="text"
                name="Location"
                value={postJobFormData.Location}
                onChange={handlePostJobFormChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                required
                placeholder="Enter job location"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">City</label>
              <input
                type="text"
                name="City"
                value={postJobFormData.City}
                onChange={handlePostJobFormChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                required
                placeholder="Enter city"
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">State</label>
              <input
                type="text"
                name="State"
                value={postJobFormData.State}
                onChange={handlePostJobFormChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                required
                placeholder="Enter state"
              />
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-6 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-red-500 text-white py-3 px-6 rounded-lg hover:bg-red-600 transition font-medium disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                disabled={formSubmitting}
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
                    Posting...
                  </>
                ) : (
                  "Post Job"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default JobPostForm
