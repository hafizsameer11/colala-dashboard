import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { Outlet, useLocation } from "react-router-dom";
import Profile from "./components/Profile";

const Layout: React.FC = () => {
  // const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const location = useLocation();
  
  // Use location.pathname directly as key - React Router will handle updates
  // No need for separate state that could cause issues

  return (
    <div className="flex bg-theme-light">
      {/* Sidebar */}
      <div
        className={`fixed lg:static top-0 left-0 z-20 transition-transform transform ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:w-fit`}
      >
        <Sidebar setMobileOpen={setMobileOpen} />
      </div>
      {/* Main Content */}
      <div className="w-full h-screen overflow-auto transition-all duration-300 bg-gray-100">
        <div>
          <div
            className="
            min-h-[72px] sticky top-0 z-[100]
            flex justify-between items-center
              px-4 md:px-8 py-2
             border-[#093826]
             bg-white
              "
          >
            <div className="flex items-center gap-2">
              <button
                className="block lg:hidden p-2 hover:bg-gray-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle sidebar"
              >
                <svg
                  className="w-8 h-8 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              {/* <Agents agents={TopbarProfileLeft} /> */}
            </div>
            <div>
              <Profile />
            </div>
          </div>
          <div className="bg-gray-100">
            <Outlet key={location.pathname} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
