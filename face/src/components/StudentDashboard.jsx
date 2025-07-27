import { useState, useEffect } from "react";
import axios from "axios";
import { isTokenValid } from "../authutils";
import { useNavigate } from "react-router-dom";

function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();
  const base_url = "http://localhost:5000/services";

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token || !isTokenValid(token)) {
      localStorage.removeItem("token");
      localStorage.removeItem("userType");
      navigate("/auth");
      return;
    }

    axios
      .get(`${base_url}/student/mypage`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setStudent(res.data);
        console.log(res.data)
      })
      .catch((err) => {
        console.error("Error fetching student data:", err.message);
        // navigate("/login");
      });
  }, []);

  useEffect(() => {
    if (!student) return;
    axios
      .get(`${base_url}`)
      .then((res) => {
        const allEvents = res.data;
        const filtered = allEvents.filter((e) =>
          student.EventsParticipatedInId.includes(e._id)
        );
        setEvents(filtered);
      })
      .catch((err) => console.error("Error fetching events:", err.message));
  }, [student]);

  const getEventStatus = (start, end) => {
    const now = new Date();
    const s = new Date(start);
    const e = new Date(end);
    if (now < s) return "upcoming";
    if (now > e) return "over";
    return "ongoing";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "upcoming":
        return "bg-yellow-100 border-yellow-400 text-yellow-800";
      case "ongoing":
        return "bg-green-100 border-green-400 text-green-800";
      case "over":
        return "bg-red-100 border-red-400 text-red-800";
      default:
        return "";
    }
  };

  if (!student) return <p className="p-6">Loading student data...</p>;

  return (
    <div 
  className="min-h-screen p-4 md:p-8" 
  style={{ 
    backgroundColor: '#f9f2f4',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  }}
>
  <h1 
    className="text-3xl font-bold mb-8 shadows-into-light-regular" 
    style={{ 
      color: '#c7254e',
      fontSize: 'clamp(2rem, 5vw, 3rem)',
      textAlign: 'center',
      marginBottom: 'clamp(2rem, 5vw, 4rem)'
    }}
  >
    Student Dashboard
  </h1>

  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 max-w-6xl mx-auto">
    {/* Student Info Card */}
    <div 
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        padding: 'clamp(1.5rem, 4vw, 2.5rem)',
        boxShadow: '0 8px 32px rgba(199, 37, 78, 0.1)',
        border: '2px solid #f2dede',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = 'translateY(-4px)';
        e.target.style.boxShadow = '0 12px 40px rgba(199, 37, 78, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = '0 8px 32px rgba(199, 37, 78, 0.1)';
      }}
    >
      <h2 
        className="text-2xl font-bold mb-4"
        style={{ 
          color: '#c7254e',
          fontSize: 'clamp(1.5rem, 4vw, 2rem)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap'
        }}
      >
        <span style={{ fontSize: '1.2em' }}>👤</span> 
        <span style={{ wordBreak: 'break-word' }}>{student.NameOfStudent}</span>
      </h2>
      
      <div style={{ color: '#666', lineHeight: '1.8', space: '1rem' }}>
        <div 
          style={{ 
            marginBottom: '1rem', 
            fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            flexWrap: 'wrap'
          }}
        >
          <span>📧</span>
          <span style={{ wordBreak: 'break-all' }}>{student.StudentEmail}</span>
        </div>
        
        <div 
          style={{ 
            marginBottom: '1rem', 
            fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span>🎯</span>
          <span>Events Participated: </span>
          <span 
            style={{ 
              color: '#c7254e', 
              fontWeight: '700',
              backgroundColor: '#f9f2f4',
              padding: '0.25rem 0.75rem',
              borderRadius: '20px',
              fontSize: '1.1em'
            }}
          >
            {student.NumberOfEventsParticipatedIn}
          </span>
        </div>
        
        <div 
          style={{ 
            fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            flexWrap: 'wrap'
          }}
        >
          <span>🗓️</span>
          <span>Joined On: </span>
          <span style={{ color: '#c7254e', fontWeight: '600' }}>
            {new Date(student.AccountRegisterationDate).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>

    {/* My Events Card */}
    <div 
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        padding: 'clamp(1.5rem, 4vw, 2.5rem)',
        boxShadow: '0 8px 32px rgba(199, 37, 78, 0.1)',
        border: '2px solid #f2dede',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = 'translateY(-4px)';
        e.target.style.boxShadow = '0 12px 40px rgba(199, 37, 78, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = '0 8px 32px rgba(199, 37, 78, 0.1)';
      }}
    >
      <h2 
        className="text-2xl font-bold mb-4"
        style={{ 
          color: '#c7254e',
          fontSize: 'clamp(1.5rem, 4vw, 2rem)',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        <span style={{ fontSize: '1.2em' }}>🎉</span> My Events
      </h2>
      
      {events.length === 0 ? (
        <div 
          style={{ 
            textAlign: 'center',
            padding: '3rem 1rem',
            color: '#999',
            fontSize: 'clamp(1rem, 2.5vw, 1.1rem)',
            backgroundColor: '#f9f2f4',
            borderRadius: '16px',
            border: '2px dashed #e4b9b9'
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
          <p>You're not part of any events yet.</p>
          <p style={{ fontSize: '0.9em', marginTop: '0.5rem', color: '#bbb' }}>
            Join some events to see them here!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => {
            const status = getEventStatus(
              event.StartDateOfEvent,
              event.EndDateOfEvent
            );
            
            // Custom status colors using your palette
            let statusColor, bgColor, borderColor;
            switch(status) {
              case 'Upcoming':
                statusColor = '#c7254e';
                bgColor = '#f9f2f4';
                borderColor = '#c7254e';
                break;
              case 'Active':
                statusColor = '#28a745';
                bgColor = '#f8fff9';
                borderColor = '#28a745';
                break;
              default:
                statusColor = '#6c757d';
                bgColor = '#f8f9fa';
                borderColor = '#6c757d';
                break;
            }
            
            return (
              <div
                key={event._id}
                style={{
                  borderLeft: `6px solid ${borderColor}`,
                  padding: 'clamp(1rem, 3vw, 1.5rem)',
                  borderRadius: '16px',
                  backgroundColor: bgColor,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  border: `1px solid ${borderColor}20`,
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateX(8px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(199, 37, 78, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateX(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                }}
              >
                {/* Status badge */}
                <div 
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    backgroundColor: statusColor,
                    color: '#ffffff',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: 'clamp(0.7rem, 2vw, 0.8rem)',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  {status}
                </div>
                
                <h3 
                  className="text-lg font-semibold"
                  style={{ 
                    color: '#c7254e',
                    fontSize: 'clamp(1.1rem, 3vw, 1.3rem)',
                    marginBottom: '0.75rem',
                    marginRight: '4rem',
                    fontWeight: '700',
                    lineHeight: '1.3'
                  }}
                >
                  {event.NameOfEvent}
                </h3>
                
                <p 
                  className="text-sm"
                  style={{ 
                    color: '#666',
                    fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                    marginBottom: '1rem',
                    lineHeight: '1.6'
                  }}
                >
                  {event.EventDescription}
                </p>
                
                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#999',
                    fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                    backgroundColor: 'rgba(255,255,255,0.7)',
                    padding: '0.5rem 1rem',
                    borderRadius: '10px',
                    marginTop: '1rem'
                  }}
                >
                  <span>📅</span>
                  <span>
                    {new Date(event.StartDateOfEvent).toLocaleDateString()} – {new Date(event.EndDateOfEvent).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  </div>
</div>
  );
}

export default StudentDashboard;
