import { useState, useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { isTokenValid } from "../authutils.js";
import { jwtDecode } from "jwt-decode";
import Footer from "../components/Footer";

function Home() {
  const navigate = useNavigate();
  // State for the master list of all events fetched from the API
  const [allEvents, setAllEvents] = useState([]);
  // State for the events that are actually displayed after filtering
  const [events, setEvents] = useState([]);
  const usertype = localStorage.getItem("userType");
  const base_url = "http://localhost:5000/services";

  // --- Filter States ---
  const [dateFilter, setDateFilter] = useState("upcoming"); // 'upcoming', 'ongoing', 'past', 'all'
  const [searchTerm, setSearchTerm] = useState("");
  const [showJoinedOnly, setShowJoinedOnly] = useState(false);

  // Check login status once on render
  const token = localStorage.getItem("token");
  const isLoggedIn = token && isTokenValid(token);

  function studentIdFromToken() {
    // Use the token variable that's already defined in the component scope
    if (token) {
        try {
          const decoded = jwtDecode(token);
          return decoded.studentid;
        } catch (err) {
          return null;
        }
    }
    return null;
  }

  function fetchevents() {
    axios
      .get(base_url)
      .then((res) => {
        // Set the master list of events. The filtering logic will use this.
        setAllEvents(res.data);
      })
      .catch((error) => {
        console.error("error in fetching event details : ", error.message);
      });
  }

  // Initial fetch of events
  useEffect(() => {
    fetchevents();
  }, []);

  // --- Filtering Logic ---
  // This effect runs whenever the filters or the master list of events change
  useEffect(() => {
    let filtered = [...allEvents];
    const now = new Date();
    const userId = studentIdFromToken();

    // 1. Filter by search term (name or host)
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.NameOfEvent.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.HostInstitutionEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 2. Filter by date status
    if (dateFilter !== 'all') {
        filtered = filtered.filter(event => {
            const startDate = new Date(event.StartDateOfEvent);
            const endDate = new Date(event.EndDateOfEvent);
            switch (dateFilter) {
                case 'upcoming':
                    return startDate > now;
                case 'ongoing':
                    return startDate <= now && endDate >= now;
                case 'past':
                    return endDate < now;
                default:
                    return true;
            }
        });
    }

    // 3. Filter by joined events (for logged-in students only)
    if (isLoggedIn && usertype !== "Institution" && showJoinedOnly) {
        if (userId) {
            filtered = filtered.filter(event => event.ParticipantId.includes(userId));
        }
    }

    setEvents(filtered);
  }, [dateFilter, searchTerm, showJoinedOnly, allEvents, usertype, isLoggedIn]);


  function handleJoin(eid) {
    // The isLoggedIn check is implicitly handled by checking for a valid token
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
          // Refetch events to get the updated participant list
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

  const filterButtons = ['upcoming', 'ongoing', 'past', 'all'];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#f9f2f4] px-4 sm:px-6 lg:px-12 py-10">
        {/* <h1 className="text-4xl font-bold text-[#c7254e] mb-6 shadows-into-light-regular">
        Events
        </h1> */}

        {/* --- Filter Section --- */}
        <div className="bg-white border border-[#f2dede] rounded-2xl shadow-sm p-4 md:p-6 mb-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-center">
                {/* Search Input */}
                <div className="lg:col-span-1">
                    <input
                        type="text"
                        placeholder="Search by event or host..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full text-black px-4 py-2 border border-[#f2dede] rounded-xl focus:ring-2 focus:ring-[#c7254e] focus:outline-none transition-shadow"
                    />
                </div>

                {/* Date Filters */}
                <div className="flex flex-wrap justify-center gap-2 lg:col-span-1">
                    {filterButtons.map(filter => (
                        <button
                            key={filter}
                            onClick={() => setDateFilter(filter)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 capitalize ${
                                dateFilter === filter
                                ? "bg-[#c7254e] text-white shadow"
                                : "bg-white text-[#c7254e] hover:bg-rose-50"
                            }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                {/* Joined Events Toggle - Visible only to logged-in, non-institution users */}
                {isLoggedIn && usertype !== "Institution" && (
                    <div className="flex items-center justify-end lg:col-span-1">
                        <label htmlFor="joined-toggle" className="flex items-center cursor-pointer">
                            <span className="mr-3 text-sm font-medium text-gray-700">My Joined Events</span>
                            <div className="relative">
                                <input type="checkbox" id="joined-toggle" className="sr-only" checked={showJoinedOnly} onChange={() => setShowJoinedOnly(!showJoinedOnly)} />
                                <div className={`block w-10 h-6 rounded-full ${showJoinedOnly ? 'bg-[#c7254e]' : 'bg-gray-300'}`}></div>
                                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${showJoinedOnly ? 'transform translate-x-full' : ''}`}></div>
                            </div>
                        </label>
                    </div>
                )}
            </div>
        </div>


        {/* --- Events Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {events.length > 0 ? (
            events.map((event) => {
              const userId = studentIdFromToken();
              const isJoined = userId ? event.ParticipantId.includes(userId) : false;

              return (
                <div
                  key={event._id}
                  className="bg-white border border-[#f2dede] rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 flex flex-col justify-between"
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

                    <div className="text-sm text-gray-600 space-y-2 mt-2">
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

                  {/* Join Button - Visible only to logged-in, non-institution users */}
                  {isLoggedIn && usertype !== "Institution" && (
                    <button
                      onClick={() => handleJoin(event._id)}
                      disabled={isJoined}
                      className={`mt-6 text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200 shadow-sm w-full ${
                        isJoined
                          ? "bg-red-200 text-gray-500 cursor-not-allowed"
                          : "bg-[#c7254e] hover:bg-[#a91e3b] text-white"
                      }`}
                    >
                      {isJoined ? "Joined" : "Join Event"}
                    </button>
                  )}
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-10">
                <p className="text-gray-500">No events match the current filters.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Home;
