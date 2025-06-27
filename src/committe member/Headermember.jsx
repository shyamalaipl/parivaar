import { useState, useEffect } from "react"
import { Bell, Home, User } from "lucide-react"
import Logo from "../img/parivarlogo1.png"

const Headermember = ({ setActivePage, activePage }) => {
  // ... existing state and effects ...
  const [userData, setUserData] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    // Get user data from localStorage
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUserData(JSON.parse(storedUser))
    }

    // Mock notifications - replace with actual API call
    setNotifications([
      { id: 1, message: "New user request", time: "5 min ago" },
      { id: 2, message: "New event created", time: "1 hour ago" },
    ])
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 bg-[#1A2B49] shadow-lg z-30 border-b border-[#1A2B49]/80">
      <div className="px-4 md:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={Logo || "/placeholder.svg"} alt="Logo" className="h-10 w-auto drop-shadow-md cursor-pointer"  onClick={() => setActivePage("dashboardmember")} />
          <h1 className="text-white text-lg font-bold hidden md:block tracking-tight">Parivaar</h1>
        </div>

        <div className="flex items-center gap-3">
          {activePage !== "dashboardmember" && (
            <button
              onClick={() => setActivePage("dashboardmember")}
              className="p-2.5 text-white hover:bg-white/10 rounded-full transition-all duration-200 group"
              title="Back to Dashboard"
            >
              <Home size={20} className="group-hover:scale-105 transition-transform" />
            </button>
          )}
{/* 
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 text-white hover:bg-white/10 rounded-full relative transition-all duration-200 group"
            >
              <Bell size={20} className="group-hover:scale-105 transition-transform" />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 h-5 w-5 bg-white text-[#1A2B49] rounded-full text-xs font-bold flex items-center justify-center shadow-sm">
                  {notifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-[#1A2B49]/20 z-50 animate-fade-in">
                <div className="p-3 border-b border-[#1A2B49]/10">
                  <h3 className="font-semibold text-[#1A2B49]">Notifications</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div key={notification.id} className="p-3 border-b border-[#1A2B49]/5 hover:bg-[#1A2B49]/5">
                        <p className="text-sm text-[#1A2B49] font-medium">{notification.message}</p>
                        <p className="text-xs text-[#1A2B49]/70 mt-1">{notification.time}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-[#1A2B49]/70 text-sm">No new notifications</div>
                  )}
                </div>
                <div className="p-2 text-center border-t border-[#1A2B49]/10">
                  <button className="text-sm text-[#1A2B49] font-medium hover:text-[#1A2B49]/80 transition">
                    View all
                  </button>
                </div>
              </div>
            )}
          </div> */}

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-full transition-all duration-200 hover:bg-white/10 group"
            >
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white shadow-inner group-hover:bg-white/20">
                <User size={18} className="group-hover:scale-105 transition-transform" />
              </div>
              <span className="text-sm font-semibold text-white hidden md:block tracking-tight">
                {userData?.U_Name || "User"}
              </span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-[#1A2B49]/20 z-50 animate-fade-in">
                <div className="p-4 border-b border-[#1A2B49]/10">
                  <p className="font-bold text-[#1A2B49] truncate">{userData?.U_Name || "User"}</p>
                  <p className="text-xs text-[#1A2B49]/70 mt-0.5 truncate">
                    {userData?.U_Email || "user@example.com"}
                  </p>
                </div>
                <div>
                  <button
                    onClick={() => {
                      setActivePage("memberprofile")
                      setShowUserMenu(false)
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-[#1A2B49] hover:bg-[#1A2B49]/5 transition font-medium"
                  >
                    👤 My Profile
                  </button>
                  <button
                    onClick={() => {
                      localStorage.clear()
                      window.location.href = "/"
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-[#1A2B49] hover:bg-[#1A2B49]/5 border-t border-[#1A2B49]/10 transition font-medium"
                  >
                    🚪 Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Headermember