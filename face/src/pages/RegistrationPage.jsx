import { useState,useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {isTokenValid} from "../authutils.js";
import Navbar from "../components/Navbar"


function RegistrationPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("Student");
  const [userName, setUserName] = useState("");
  

  useEffect(()=>{
    const token = localStorage.getItem("token");
    if(token &&  isTokenValid(token)){
      navigate("/");
    }else{
      localStorage.removeItem("token");
      // navigate("/login");
    }
  },[]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const base_url = "http://localhost:5000/services";
    const endpoint =( userType == "Student") ? "/student/reg" : "/institution/reg";
    const payload = ( userType == "Student") ? {NameOfStudent:userName,StudentEmail : email,StudentPassword : password} : {NameOfInstitution:userName,InstitutionEmail : email,InstitutionPassword : password}

    try {
        await axios.post(`${base_url}${endpoint}`,payload);
        console.log("Registration successful.");
        navigate("/auth");
    } catch (error) {
        console.error(`error in registering ${userType} : `,error.message);
        alert("Registration failed.");
    }
  };

  return (
    <>
  <Navbar />
  <div className="flex items-center justify-center min-h-screen bg-white px-4">
    <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-md w-full max-w-md border border-[#f2dede]">
      <h2
        className="text-3xl text-center text-[#c7254e] mb-8 shadows-into-light-regular"
      >
        Register
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Name
          </label>
          <input
            type="text"
            id="username"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
            className="w-full px-4 py-2 border border-[#e4b9b9] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#c7254e]"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-[#e4b9b9] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#c7254e]"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-[#e4b9b9] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#c7254e]"
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center">
            <input
              id="student-radio"
              type="radio"
              value="Student"
              name="user-type"
              checked={userType === "Student"}
              onChange={() => setUserType("Student")}
              className="accent-[#c7254e] w-4 h-4"
            />
            <label
              htmlFor="student-radio"
              className="ml-2 text-sm text-gray-700"
            >
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
              onChange={() => setUserType("Institution")}
              className="accent-[#c7254e] w-4 h-4"
            />
            <label
              htmlFor="institution-radio"
              className="ml-2 text-sm text-gray-700"
            >
              Institution
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-[#c7254e] text-white py-2 px-4 rounded-lg hover:bg-[#a91e3b] transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#c7254e]"
        >
          Register
        </button>
      </form>
    </div>
  </div>
</>

  );
}

export default RegistrationPage;
