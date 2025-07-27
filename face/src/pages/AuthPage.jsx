import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { isTokenValid } from "../authutils.js";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState(""); // Used for NameOfStudent or NameOfInstitution
  const [userType, setUserType] = useState("Student");

  // OTP specific states
  const [showOtpInput, setShowOtpInput] = useState(false); // Controls OTP input visibility
  const [otp, setOtp] = useState(""); // Stores the entered OTP
  const [otpSent, setOtpSent] = useState(false); // True if OTP has been sent
  const [timer, setTimer] = useState(0); // OTP resend timer in seconds
  const OTP_RESEND_TIME = 60; // 60 seconds for OTP resend

  // Message states for custom alerts
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'

  // Loading states for buttons
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false); // For login and institution register

  const navigate = useNavigate();
  const base_url = "http://localhost:5000/services"; // Define base_url once

  // Effect to check token validity on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && isTokenValid(token)) {
      navigate("/");
    } else {
      localStorage.removeItem("token");
    }
  }, [navigate]);

  // Effect for the OTP timer countdown
  useEffect(() => {
    let interval;
    if (otpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0 && otpSent) {
      // Timer ran out, allow resend
      setOtpSent(false);
    }
    return () => clearInterval(interval); // Cleanup on unmount or dependency change
  }, [otpSent, timer]);

  // Function to display custom messages
  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000); // Clear message after 5 seconds
  };

  // Handles sending the OTP for student registration
  const handleSendOtpStudent = async () => {
    setIsSendingOtp(true);
    try {
      const payload = {
        NameOfStudent: userName,
        StudentEmail: email,
        StudentPassword: password,
      };
      const response = await axios.post(`${base_url}/student/send-otp`, payload);
      showMessage(response.data.message, "success");
      setOtpSent(true);
      setTimer(OTP_RESEND_TIME); // Start timer
      setShowOtpInput(true); // Show OTP input field
    } catch (error) {
      console.error(`Send OTP Error (Student):`, error.response?.data?.error || error.message);
      showMessage(error.response?.data?.error || "Failed to send OTP for student registration.", "error");
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Handles verifying the OTP and completing student registration
  const handleVerifyOtpStudent = async () => {
    setIsVerifyingOtp(true);
    try {
      const payload = {
        StudentEmail: email,
        otp: otp, // The OTP entered by the user
      };
      const response = await axios.post(`${base_url}/student/register`, payload);
      showMessage("Student registration successful! You can now log in.", "success");
      setIsLogin(true); // Switch to login after successful registration
      setShowOtpInput(false); // Hide OTP input
      setOtp(""); // Clear OTP field
      setOtpSent(false); // Reset OTP sent status
      setTimer(0); // Reset timer
    } catch (error) {
      console.error(`Verify OTP Error (Student):`, error.response?.data?.error || error.message);
      showMessage(error.response?.data?.error || "Student OTP verification failed.", "error");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Handles sending the OTP for institution registration
  const handleSendOtpInstitution = async () => {
    setIsSendingOtp(true);
    try {
      const payload = {
        NameOfInstitution: userName, // Reusing userName for institution name
        InstitutionEmail: email,
        InstitutionPassword: password,
      };
      const response = await axios.post(`${base_url}/institution/send-otp`, payload);
      showMessage(response.data.message, "success");
      setOtpSent(true);
      setTimer(OTP_RESEND_TIME); // Start timer
      setShowOtpInput(true); // Show OTP input field
    } catch (error) {
      console.error(`Send OTP Error (Institution):`, error.response?.data?.error || error.message);
      showMessage(error.response?.data?.error || "Failed to send OTP for institution registration.", "error");
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Handles verifying the OTP and completing institution registration
  const handleVerifyOtpInstitution = async () => {
    setIsVerifyingOtp(true);
    try {
      const payload = {
        InstitutionEmail: email,
        otp: otp, // The OTP entered by the user
      };
      const response = await axios.post(`${base_url}/institution/register`, payload);
      showMessage("Institution registration successful! You can now log in.", "success");
      setIsLogin(true); // Switch to login after successful registration
      setShowOtpInput(false); // Hide OTP input
      setOtp(""); // Clear OTP field
      setOtpSent(false); // Reset OTP sent status
      setTimer(0); // Reset timer
    } catch (error) {
      console.error(`Verify OTP Error (Institution):`, error.response?.data?.error || error.message);
      showMessage(error.response?.data?.error || "Institution OTP verification failed.", "error");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Main form submission handler for both login and registration
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLogin) { // If it's a registration attempt
      if (userType === "Student") {
        if (!showOtpInput) {
          // First step of student registration: send OTP
          await handleSendOtpStudent();
          return;
        } else {
          // Second step of student registration: verify OTP
          await handleVerifyOtpStudent();
          return;
        }
      } else if (userType === "Institution") {
        if (!showOtpInput) {
          // First step of institution registration: send OTP
          await handleSendOtpInstitution();
          return;
        } else {
          // Second step of institution registration: verify OTP
          await handleVerifyOtpInstitution();
          return;
        }
      }
    }

    // This block is for Login (Student/Institution)
    // and will only be reached if isLogin is true
    setIsSubmittingAuth(true);
    const endpoint = userType === "Student"
      ? "/student/login"
      : "/institution/login";

    const payload = userType === "Student"
      ? { StudentEmail: email, StudentPassword: password }
      : { InstitutionEmail: email, InstitutionPassword: password };

    try {
      const response = await axios.post(`${base_url}${endpoint}`, payload);

      const token = response.data.token;
      localStorage.setItem("token", token);
      localStorage.setItem("userType", userType);
      navigate("/");
    } catch (error) {
      console.error(`Auth Error:`, error.response?.data?.error || error.message);
      showMessage(error.response?.data?.error || "Login failed.", "error");
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  // Function to reset all relevant states when switching between tabs or user types
  const resetFormAndOtpStates = () => {
    setEmail("");
    setPassword("");
    setUserName("");
    setOtp("");
    setShowOtpInput(false);
    setOtpSent(false);
    setTimer(0);
    setMessage("");
    setMessageType("");
    setIsSendingOtp(false);
    setIsVerifyingOtp(false);
    setIsSubmittingAuth(false);
  };

  return (
    <>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen bg-[#f9f2f4] px-4">
        <div className="bg-white border border-[#f2dede] p-8 sm:p-10 rounded-2xl shadow-md w-full max-w-md">
          {/* Toggle Tabs */}
          <div className="flex justify-center mb-8">
            <button
              onClick={() => {
                setIsLogin(true);
                resetFormAndOtpStates();
              }}
              className={`px-4 py-2 rounded-l-lg text-sm font-medium transition-all ${
                isLogin ? "bg-[#c7254e] text-white" : "bg-[#f2dede] text-[#c7254e]"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                resetFormAndOtpStates();
              }}
              className={`px-4 py-2 rounded-r-lg text-sm font-medium transition-all ${
                !isLogin ? "bg-[#c7254e] text-white" : "bg-[#f2dede] text-[#c7254e]"
              }`}
            >
              Register
            </button>
          </div>

          <h2 className="text-3xl text-center text-[#c7254e] mb-6 shadows-into-light-regular">
            {isLogin ? "Login" : "Register"}
          </h2>

          {/* Custom Message Box */}
          {message && (
            <div
              className={`p-3 mb-4 rounded-lg text-sm ${
                messageType === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="username"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-[#e4b9b9] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#c7254e] text-gray-900 placeholder-gray-400"
                  disabled={showOtpInput} // Disable name input once OTP is sent
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-[#e4b9b9] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#c7254e] text-gray-900 placeholder-gray-400"
                disabled={showOtpInput} // Disable email input once OTP is sent
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-[#e4b9b9] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#c7254e] text-gray-900 placeholder-gray-400"
                disabled={showOtpInput} // Disable password input once OTP is sent
              />
            </div>

            {/* OTP Input Field (conditionally rendered for both Student and Institution) */}
            {!isLogin && showOtpInput && ( // showOtpInput is true for both student and institution if OTP sent
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                  OTP
                </label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-[#e4b9b9] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#c7254e] text-gray-900 placeholder-gray-400"
                  placeholder="Enter OTP"
                />
                <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
                  {timer > 0 ? (
                    <span>Resend OTP in {timer}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={userType === "Student" ? handleSendOtpStudent : handleSendOtpInstitution}
                      disabled={isSendingOtp}
                      className="text-[#c7254e] hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSendingOtp ? "Sending..." : "Resend OTP"}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Radio Selector */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center">
                <input
                  id="student-radio"
                  type="radio"
                  value="Student"
                  name="user-type"
                  checked={userType === "Student"}
                  onChange={() => {
                    setUserType("Student");
                    resetFormAndOtpStates(); // Reset all states when changing user type
                  }}
                  className="accent-[#c7254e] w-4 h-4"
                  disabled={showOtpInput} // Disable user type selection once OTP is sent
                />
                <label htmlFor="student-radio" className="ml-2 text-sm text-gray-700">
                  Student
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="institution-radio"
                  type="radio"
                  value="Institution"
                  name="user-type"
                  checked={userType === "Institution"}
                  onChange={() => {
                    setUserType("Institution");
                    resetFormAndOtpStates(); // Reset all states when changing user type
                  }}
                  className="accent-[#c7254e] w-4 h-4"
                  disabled={showOtpInput} // Disable user type selection once OTP is sent
                />
                <label htmlFor="institution-radio" className="ml-2 text-sm text-gray-700">
                  Institution
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#c7254e] text-white py-2 px-4 rounded-lg hover:bg-[#a91e3b] transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#c7254e] disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSendingOtp || isVerifyingOtp || isSubmittingAuth}
            >
              {isLogin
                ? isSubmittingAuth ? "Logging In..." : "Login"
                : showOtpInput // If OTP input is shown for either user type
                  ? isVerifyingOtp ? "Verifying OTP..." : "Verify OTP & Register"
                  : isSendingOtp ? "Sending OTP..." : "Register & Send OTP"
              }
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}
