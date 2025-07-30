import { React, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isTokenValid } from "../authutils.js";

function Navbar() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && isTokenValid) {
      setLoggedIn(true);
    } else {
      setLoggedIn(false);
    }
  }, []);

  function handleSignOut() {
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    setLoggedIn(false);
    navigate("/auth");
  }
  return (
    <nav className="sticky top-0 z-50 w-full bg-[#c7254e] bg-opacity-95 shadow-lg border-b border-white/10">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-2 md:py-3">
        {/* Logo and Brand */}
        <div className="flex items-center gap-2">
          <span className="bg-white rounded-full p-1 shadow-md flex items-center justify-center">
            {/* Bold calendar icon */}
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#c7254e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{display:'block'}}>
              <rect x="3" y="4" width="18" height="17" rx="4" fill="#fff" stroke="#c7254e" strokeWidth="2.5"/>
              <line x1="16" y1="2.5" x2="16" y2="6.5" stroke="#c7254e" strokeWidth="2.5"/>
              <line x1="8" y1="2.5" x2="8" y2="6.5" stroke="#c7254e" strokeWidth="2.5"/>
              <line x1="3" y1="10" x2="21" y2="10" stroke="#c7254e" strokeWidth="2.5"/>
            </svg>
          </span>
          <Link 
            className="text-2xl font-bold tracking-tight text-white drop-shadow-md hover:text-white/90 transition-colors shadows-into-light-regular select-none" 
            to="/"
            style={{letterSpacing: '0.5px'}}
          >
            EventInn
          </Link>
        </div>

        {/* Desktop Nav */}
        <ul className="hidden lg:flex gap-2 items-center ml-8">
          <li>
            <Link 
              to="/"
              className="px-4 py-2 rounded-lg font-medium text-white/90 hover:bg-white hover:text-[#c7254e] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              Events
            </Link>
          </li>
          <li>
            <Link 
              to="/dashboard"
              className="px-4 py-2 rounded-lg font-medium text-white/90 hover:bg-white hover:text-[#c7254e] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              Dashboard
            </Link>
          </li>
        </ul>

        {/* Mobile Hamburger */}
        <div className="lg:hidden flex items-center">
          <div className="dropdown relative">
            <button tabIndex={0} className="btn btn-ghost btn-sm p-2 text-white border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/40">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <ul tabIndex={0} className="dropdown-content absolute right-0 mt-2 bg-[#c7254e] bg-opacity-95 rounded-xl shadow-lg border border-white/10 min-w-[160px] py-2 z-50">
              <li>
                <Link to="/" className="block px-4 py-2 text-white hover:bg-white/90 hover:text-[#c7254e] rounded-lg transition-all">Events</Link>
              </li>
              <li>
                <Link to="/dashboard" className="block px-4 py-2 text-white hover:bg-white/90 hover:text-[#c7254e] rounded-lg transition-all">Dashboard</Link>
              </li>
              <li className="block lg:hidden border-t border-white/10 my-2"></li>
              {loggedIn ? (
                <li>
                  <button onClick={handleSignOut} className="w-full text-left px-4 py-2 text-[#c7254e] bg-white rounded-lg font-semibold hover:bg-[#f2dede] transition-all">Sign Out</button>
                </li>
              ) : (
                <li>
                  <Link to="/auth" className="block px-4 py-2 text-white hover:bg-white/90 hover:text-[#c7254e] rounded-lg transition-all">Login/Register</Link>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Desktop Auth/User Section */}
        <div className="hidden lg:flex items-center gap-3">
          {loggedIn ? (
            <button 
              onClick={handleSignOut} 
              className="bg-white text-[#c7254e] border border-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-[#f2dede] transition-all focus:outline-none focus:ring-2 focus:ring-[#c7254e]/30"
            >
              Sign Out
            </button>
          ) : (
            <Link 
              to="/auth"
              className="bg-transparent text-white border border-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-white hover:text-[#c7254e] transition-all focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              Login/Register
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
