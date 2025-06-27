"use client"

import { FaMapMarkerAlt } from "react-icons/fa"

const JobsList = ({ jobs, onJobClick }) => {
  if (jobs.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <div className="text-gray-400 text-5xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
        <p className="text-gray-600">There are no open positions available at the moment</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {jobs.map((job) => (
        <div
          key={job.id}
          onClick={() => onJobClick(job)}
          className="bg-white shadow-md rounded-xl p-6 hover:shadow-lg transition cursor-pointer border-l-4 border-red-500"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold mb-2 text-gray-800">{job.Job_Title}</h3>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onJobClick(job)
              }}
              className="bg-[#1A2B49] hover:bg-white border-2 rounded-md hover:text-[#1A2B49] hover:border-[#1A2B49] text-white py-2 text-sm px-6 transition flex items-center justify-center"
            >
              Apply Now
            </button>
          </div>
          <div className="flex md:flex-row md:items-center justify-between">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-700 font-medium mb-2">{job.Company_Name}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="inline-flex items-center text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  <FaMapMarkerAlt className="mr-1" /> {job.Location}, {job.City}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-gray-600 line-clamp-2">{job.Job_Description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default JobsList
