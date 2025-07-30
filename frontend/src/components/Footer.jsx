import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="w-full bg-[#c7254e] bg-opacity-95 text-white shadow-t-lg border-t border-white/10 ">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between px-4 py-6 gap-4 md:gap-0">
        {/* Brand and Icon */}
        <div className="flex flex-col items-center md:items-start gap-2 mb-2 md:mb-0 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="bg-white rounded-full p-1 shadow-md flex items-center justify-center">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#c7254e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{display:'block'}}>
                <rect x="3" y="4" width="18" height="17" rx="4" fill="#fff" stroke="#c7254e" strokeWidth="2.2"/>
                <line x1="16" y1="2.5" x2="16" y2="6.5" stroke="#c7254e" strokeWidth="2.2"/>
                <line x1="8" y1="2.5" x2="8" y2="6.5" stroke="#c7254e" strokeWidth="2.2"/>
                <line x1="3" y1="10" x2="21" y2="10" stroke="#c7254e" strokeWidth="2.2"/>
              </svg>
            </span>
            <span className="text-lg font-bold tracking-tight select-none">EventInn</span>
          </div>
          {/* Company Description */}
          <p className="text-white/80 text-xs max-w-xs mt-1 text-center md:text-left">
            EventInn is your one-stop platform for discovering, managing, and participating in the best campus events. We connect students and institutions for a vibrant, engaging experience.
          </p>
        </div>
        {/* Footer Links */}
        <nav className="flex flex-wrap gap-4 text-white/90 text-sm font-medium justify-center md:justify-start">
          <Link to="/" className="hover:text-white underline-offset-4 hover:underline transition">Home</Link>
          <Link to="/" className="hover:text-white underline-offset-4 hover:underline transition">Events</Link>
          <Link to="/dashboard" className="hover:text-white underline-offset-4 hover:underline transition">Dashboard</Link>
          <Link to="/auth" className="hover:text-white underline-offset-4 hover:underline transition">Login/Register</Link>
        </nav>
        {/* Copyright */}
        <div className="text-xs text-white/70 mt-2 md:mt-0 text-center md:text-right w-full md:w-auto">
          &copy; {new Date().getFullYear()} EventInn. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
