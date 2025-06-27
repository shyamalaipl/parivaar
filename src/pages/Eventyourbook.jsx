import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logoImage from "../../src/img/parivarlogo1.png";

const CustomLogoLoader = () => {
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
    <div className="fixed inset-0 bg-[#172841] bg-opacity-90 flex justify-center items-center z-50">
      <img
        src={logoImage}
        alt="Rotating Logo"
        className="w-12 h-12 animate-spin filter drop-shadow-md"
      />
    </div>
  );
};

const Eventyourbook = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        const userId = userData?.U_Id;

        if (!userId) {
          setError('User not found in local storage');
          setLoading(false);
          return;
        }

        const response = await fetch('https://parivaar.app/public/api/book-events');
        const result = await response.json();

        if (result.status === 'success') {
          const userBookings = result.data.filter(booking => 
            booking.user.U_Id === userId
          );
          setBookings(userBookings);
        } else {
          setError('Failed to fetch bookings');
        }
      } catch (err) {
        setError('Error fetching data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleCardClick = (booking) => {
    setSelectedBooking(booking);
  };

  const closeDetails = () => {
    setSelectedBooking(null);
  };

  if (loading) return <CustomLogoLoader />;
  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-[#f8fafc]">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center border border-[#e2e8f0]">
        <div className="text-[#ef4444] text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-[#172841] mb-2">Error</h2>
        <p className="text-[#64748b] mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-[#172841] hover:bg-[#1e3a8a] text-white font-medium py-2 px-4 rounded transition duration-200"
        >
          Try Again
        </button>
      </div>
    </div>
  );
  
  if (bookings.length === 0) return (
    <div className="flex items-center justify-center min-h-screen bg-[#f8fafc]">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center border border-[#e2e8f0]">
        <div className="text-[#3b82f6] text-4xl mb-4">📅</div>
        <h2 className="text-xl font-semibold text-[#172841] mb-2">No Bookings Found</h2>
        <p className="text-[#64748b] mb-6">You haven't booked any events yet.</p>
        <Link 
          to="/event" 
          className="inline-block bg-[#172841] hover:bg-[#1e3a8a] text-white font-medium py-2 px-4 rounded transition duration-200"
        >
          Browse Events
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            <li>
              <div>
                <Link to="/home" className="text-[#94a3b8] hover:text-[#172841]">
                  <svg className="flex-shrink-0 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                  <span className="sr-only">Home</span>
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="flex-shrink-0 h-5 w-5 text-[#cbd5e1]" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                </svg>
                <Link to="/event" className="ml-4 text-sm font-medium text-[#94a3b8] hover:text-[#172841]">Events</Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="flex-shrink-0 h-5 w-5 text-[#cbd5e1]" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                </svg>
                <span className="ml-4 text-sm font-medium text-[#172841]">Your Bookings</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-[#172841] sm:text-4xl">
            Your Booked Events
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-[#64748b] sm:mt-4">
            All your upcoming and past event bookings in one place
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {bookings.map(booking => (
            <div 
              key={booking.BE_Id} 
              className="bg-white overflow-hidden shadow rounded-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer border border-[#e2e8f0]"
              onClick={() => handleCardClick(booking)}
            >
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-[#172841] rounded-md p-3">
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <h3 className="text-lg font-medium text-[#172841] truncate">{booking.event.E_Name}</h3>
                    <p className="text-sm text-[#64748b] truncate">{booking.event.E_Place}, {booking.event.E_City}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="border-t border-[#e2e8f0] pt-4">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-4">
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-[#64748b]">Date</dt>
                        <dd className="mt-1 text-sm text-[#172841]">{booking.event.E_StartDate}</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-[#64748b]">Time</dt>
                        <dd className="mt-1 text-sm text-[#172841]">{booking.event.E_StartTime} - {booking.event.E_EndTime}</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-[#64748b]">Booking Code</dt>
                        <dd className="mt-1 text-sm font-medium text-[#3b82f6]">{booking.BE_Code}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-[#172841] opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-[#e0e7ff] sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-[#172841]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-[#172841]">
                      Booking Details
                    </h3>
                    <div className="mt-4">
                      <div className="bg-[#f8fafc] p-4 rounded-lg border border-[#e2e8f0]">
                        <h4 className="text-md font-medium text-[#172841] mb-2">Event Information</h4>
                        <div className="grid grid-cols-1 gap-y-2 gap-x-4 sm:grid-cols-2">
                          <div>
                            <p className="text-sm text-[#64748b]">Event Name</p>
                            <p className="text-sm font-medium text-[#172841]">{selectedBooking.event.E_Name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-[#64748b]">Date</p>
                            <p className="text-sm font-medium text-[#172841]">{selectedBooking.event.E_StartDate}</p>
                          </div>
                          <div>
                            <p className="text-sm text-[#64748b]">Time</p>
                            <p className="text-sm font-medium text-[#172841]">{selectedBooking.event.E_StartTime} - {selectedBooking.event.E_EndTime}</p>
                          </div>
                          <div>
                            <p className="text-sm text-[#64748b]">Fees</p>
                            <p className="text-sm font-medium text-[#172841]">${selectedBooking.event.E_Fees}</p>
                          </div>
                          <div className="sm:col-span-2">
                            <p className="text-sm text-[#64748b]">Description</p>
                            <p className="text-sm font-medium text-[#172841]">{selectedBooking.event.E_Description}</p>
                          </div>
                          <div className="sm:col-span-2">
                            <p className="text-sm text-[#64748b]">Location</p>
                            <p className="text-sm font-medium text-[#172841]">
                              {selectedBooking.event.E_Address}, {selectedBooking.event.E_City}, {selectedBooking.event.E_State} {selectedBooking.event.E_Zipcode}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#f8fafc] p-4 rounded-lg mt-4 border border-[#e2e8f0]">
                        <h4 className="text-md font-medium text-[#172841] mb-2">Booking Information</h4>
                        <div className="grid grid-cols-1 gap-y-2 gap-x-4 sm:grid-cols-2">
                          <div>
                            <p className="text-sm text-[#64748b]">Booking Code</p>
                            <p className="text-sm font-medium text-[#172841]">{selectedBooking.BE_Code}</p>
                          </div>
                          <div>
                            <p className="text-sm text-[#64748b]">Booked On</p>
                            <p className="text-sm font-medium text-[#172841]">{new Date(selectedBooking.created_at).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-[#64748b]">Booked By</p>
                            <p className="text-sm font-medium text-[#172841]">{selectedBooking.BE_Name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-[#64748b]">Contact</p>
                            <p className="text-sm font-medium text-[#172841]">{selectedBooking.BE_Mobile}</p>
                          </div>
                          <div className="sm:col-span-2">
                            <p className="text-sm text-[#64748b]">Email</p>
                            <p className="text-sm font-medium text-[#172841]">{selectedBooking.BE_Email}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-[#f8fafc] px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-[#e2e8f0]">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#172841] text-base font-medium text-white hover:bg-[#1e293b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#172841] sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={closeDetails}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Eventyourbook;