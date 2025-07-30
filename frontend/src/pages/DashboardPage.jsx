import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import InstitutionDashboard from "../components/InstitutionDashboard";
import StudentDashboard from "../components/StudentDashboard";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer"

function DashboardPage() {
  const navigate = useNavigate();
  const [usertype, setUsertype] = useState(null);

  useEffect(() => {
    const type = localStorage.getItem("userType");
    if (type === "Student" || type === "Institution") {
      setUsertype(type);
    } else {
      navigate("/auth");
    }
  }, [navigate]);

  return (
    <div>
      <Navbar />
      {usertype === "Student" && <StudentDashboard />}
      {usertype === "Institution" && <InstitutionDashboard />}
      <Footer/>
    </div>
  );
}

export default DashboardPage;
