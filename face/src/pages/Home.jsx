import { useState, useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { isTokenValid } from "../authutils.js";
import { jwtDecode } from "jwt-decode";
import Footer from "../components/Footer"

function Home() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const usertype = localStorage.getItem("userType");
  const base_url = "http://localhost:5000/services";
  function studentIdFromToken() {
    const token = localStorage.getItem("token");
    try {
      const decoded = jwtDecode(token);
      return decoded.studentid;
    } catch (err) {
      return null;
    }
  }
  function fetchevents() {
    axios
      .get(base_url)
      .then((res) => {
        setEvents(res.data);
        console.log(res.data);
      })
      .catch((error) => {
        console.error("error in fetching event details : ", error.message);
      });
  }
  useEffect(() => {
    fetchevents();
  }, []);
  function handleJoin(eid) {
    const token = localStorage.getItem("token");
    if (token && isTokenValid(token)) {
      axios
        .patch(
          `${base_url}/student/enroll/${eid}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then(() => {
          console.log("joined the event.");
          fetchevents();
        })
        .catch((err) => {
          console.error("error in joining event: ", err.message);
        });
    } else {
      localStorage.removeItem("token");
      navigate("/auth");
    }
  }
  return (
    <>
  <Navbar />
  <div className="min-h-screen bg-[#f9f2f4] px-4 sm:px-6 lg:px-12 py-10">
    <h1 className="text-4xl font-bold text-[#c7254e] mb-10 shadows-into-light-regular">
      Upcoming Events
    </h1>

    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      {events.map((event) => {
        const userId = studentIdFromToken();
        const isJoined = event.ParticipantId.includes(userId);

        return (
          <div
            key={event._id}
            className="bg-white border border-[#f2dede] rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6 flex flex-col justify-between"
          >
            <div className="flex flex-col gap-4">
              <h2
                className="text-2xl font-semibold text-[#c7254e]"
                style={{
                  fontFamily: '"Shadows Into Light", cursive',
                  fontWeight: 400,
                }}
              >
                {event.NameOfEvent}
              </h2>

              <p className="text-gray-700 text-sm leading-relaxed">
                {event.EventDescription}
              </p>

              <div className="text-sm text-gray-600 space-y-2">
                <div className="flex items-center gap-2">
                  <span>🏫</span>
                  <span className="break-all">
                    {event.HostInstitutionEmail}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📅</span>
                  <span>
                    {new Date(event.StartDateOfEvent).toLocaleDateString()} –{" "}
                    {new Date(event.EndDateOfEvent).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span>👥</span>
                  <span>
                    Participants: {event.NumberOfParticipantsTillNow}
                  </span>
                </div>
              </div>
            </div>

            {usertype !== "Institution" && (
              <button
                onClick={() => handleJoin(event._id)}
                disabled={isJoined}
                className={`mt-6 text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200 shadow-sm ${
                  isJoined
                    ? "bg-gray-300 text-white cursor-not-allowed"
                    : "bg-[#c7254e] hover:bg-[#a91e3b] text-white"
                }`}
              >
                {isJoined ? "Joined" : "Join Event"}
              </button>
            )}
          </div>
        );
      })}
    </div>
  </div>
  <Footer/>
</>

  );
}

export default Home;
