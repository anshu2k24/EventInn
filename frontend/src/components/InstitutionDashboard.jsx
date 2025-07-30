import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { isTokenValid } from "../authutils";

function InstitutionDashboard() {
  const [institution, setInstitution] = useState(null);
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ name: "", desc: "", start: "", end: "" });
  const [editEventId, setEditEventId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const navigate = useNavigate();
  // const base_url = "http://localhost:5000/services";
  const base_url = "https://eventinn.onrender.com/services";
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token || !isTokenValid(token)) {
      localStorage.clear();
      navigate("/auth");
      return;
    }

    axios
      .get(`${base_url}/institution/mypage`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setInstitution(res.data))
      .catch((err) => {
        console.error("Error fetching institution data:", err.message);
        navigate("/auth");
      });
  }, []);

  useEffect(() => {
    if (!institution) return;
    axios
      .get(`${base_url}`)
      .then((res) => {
        const allEvents = res.data;
        const hosted = allEvents.filter((e) =>
          institution.HostedEventId.includes(e._id)
        );
        setEvents(hosted);
      })
      .catch((err) =>
        console.error("Error fetching institution events:", err.message)
      );
  }, [institution]);

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

  const handleAddEvent = async (e) => {
    e.preventDefault();
    const payload = {
      NameOfEvent: form.name,
      EventDescription: form.desc,
      StartDateOfEvent: form.start,
      EndDateOfEvent: form.end,
    };
    try {
      await axios.post(`${base_url}/institution/addevent`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm({ name: "", desc: "", start: "", end: "" });
      window.location.reload(); // or refetch
    } catch (err) {
      alert(err?.response?.data?.error || "Add event failed");
    }
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    const payload = {
      ...(editForm.name && { NameOfEvent: editForm.name }),
      ...(editForm.desc && { EventDescription: editForm.desc }),
      ...(editForm.start && { StartDateOfEvent: editForm.start }),
      ...(editForm.end && { EndDateOfEvent: editForm.end }),
    };
    try {
      await axios.patch(
        `${base_url}/institution/updateevent/${editEventId}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEditEventId(null);
      setEditForm({});
      window.location.reload();
    } catch (err) {
      alert(err?.response?.data?.error || "Update event failed");
    }
  };

  if (!institution) return <p className="p-6">Loading institution data...</p>;

  return (
    <div 
  className="min-h-screen p-4 md:p-8" 
  style={{ 
    backgroundColor: '#f9f2f4',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  }}
>
  <h1 
    className="text-3xl font-bold mb-6 shadows-into-light-regular" 
    style={{ 
      color: '#c7254e',
      fontSize: 'clamp(2rem, 5vw, 3rem)',
      textAlign: 'center',
      marginBottom: 'clamp(1.5rem, 4vw, 3rem)'
    }}
  >
    Institution Dashboard
  </h1>

  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8 max-w-6xl mx-auto">
    {/* Institution Info */}
    <div 
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        padding: 'clamp(1.5rem, 4vw, 2rem)',
        boxShadow: '0 8px 32px rgba(199, 37, 78, 0.1)',
        border: '2px solid #f2dede'
      }}
    >
      <h2 
        className="text-2xl font-bold mb-4"
        style={{ 
          color: '#c7254e',
          fontSize: 'clamp(1.5rem, 4vw, 2rem)',
          marginBottom: '1.5rem'
        }}
      >
        🏫 {institution.NameOfInstitution}
      </h2>
      <div style={{ color: '#666', lineHeight: '1.8' }}>
        <p style={{ marginBottom: '0.75rem', fontSize: 'clamp(0.9rem, 2.5vw, 1rem)' }}>
          📧 {institution.InstitutionEmail}
        </p>
        <p style={{ marginBottom: '0.75rem', fontSize: 'clamp(0.9rem, 2.5vw, 1rem)' }}>
          🧾 Events Hosted: <span style={{ color: '#c7254e', fontWeight: '600' }}>{institution.NumberOfEventsHosted}</span>
        </p>
        <p style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1rem)' }}>
          🗓️ Registered: <span style={{ color: '#c7254e', fontWeight: '600' }}>
            {new Date(institution.RegisterationDate).toLocaleDateString()}
          </span>
        </p>
      </div>
    </div>

    {/* Add Event Form */}
    <div 
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        padding: 'clamp(1.5rem, 4vw, 2rem)',
        boxShadow: '0 8px 32px rgba(199, 37, 78, 0.1)',
        border: '2px solid #f2dede'
      }}
    >
      <h2 
        className="text-xl font-bold mb-4"
        style={{ 
          color: '#c7254e',
          fontSize: 'clamp(1.25rem, 3.5vw, 1.5rem)',
          marginBottom: '1.5rem'
        }}
      >
        ➕ Add Event
      </h2>
      <form onSubmit={handleAddEvent} className="space-y-4">
        <input
          className="w-full rounded p-3"
          placeholder="Event Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          style={{
            color: "#000000",
            border: '2px solid #e4b9b9',
            borderRadius: '12px',
            padding: 'clamp(0.75rem, 2vw, 1rem)',
            fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
            transition: 'all 0.3s ease',
            backgroundColor: '#ffffff'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#c7254e';
            e.target.style.boxShadow = '0 0 0 3px rgba(199, 37, 78, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e4b9b9';
            e.target.style.boxShadow = 'none';
          }}
        />
        <textarea
          className="w-full rounded p-3"
          placeholder="Event Description"
          value={form.desc}
          onChange={(e) => setForm({ ...form, desc: e.target.value })}
          required
          rows="3"
          style={{
            color: "#000000",
            border: '2px solid #e4b9b9',
            borderRadius: '12px',
            padding: 'clamp(0.75rem, 2vw, 1rem)',
            fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
            transition: 'all 0.3s ease',
            backgroundColor: '#ffffff',
            resize: 'vertical',
            minHeight: '80px'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#c7254e';
            e.target.style.boxShadow = '0 0 0 3px rgba(199, 37, 78, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e4b9b9';
            e.target.style.boxShadow = 'none';
          }}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="date"
            className="w-full rounded p-3"
            value={form.start}
            onChange={(e) => setForm({ ...form, start: e.target.value })}
            required
            style={{
              color: "#808080",
              border: '2px solid #e4b9b9',
              borderRadius: '12px',
              padding: 'clamp(0.75rem, 2vw, 1rem)',
              fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
              transition: 'all 0.3s ease',
              backgroundColor: '#ffffff'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#c7254e';
              e.target.style.boxShadow = '0 0 0 3px rgba(199, 37, 78, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e4b9b9';
              e.target.style.boxShadow = 'none';
            }}
          />
          <input
            type="date"
            className="w-full rounded p-3"
            value={form.end}
            onChange={(e) => setForm({ ...form, end: e.target.value })}
            required
            style={{
              color: "#808080",
              border: '2px solid #e4b9b9',
              borderRadius: '12px',
              padding: 'clamp(0.75rem, 2vw, 1rem)',
              fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
              transition: 'all 0.3s ease',
              backgroundColor: '#ffffff'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#c7254e';
              e.target.style.boxShadow = '0 0 0 3px rgba(199, 37, 78, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e4b9b9';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
        <button
          type="submit"
          className="w-full rounded p-3"
          style={{
            backgroundColor: '#c7254e',
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            padding: 'clamp(0.75rem, 2vw, 1rem)',
            fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(199, 37, 78, 0.2)'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#a91e42';
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(199, 37, 78, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#c7254e';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(199, 37, 78, 0.2)';
          }}
        >
          Host Event
        </button>
      </form>
    </div>
  </div>

  {/* Events List */}
  <div 
    className="max-w-6xl mx-auto"
    style={{
      backgroundColor: '#ffffff',
      borderRadius: '20px',
      padding: 'clamp(1.5rem, 4vw, 2rem)',
      boxShadow: '0 8px 32px rgba(199, 37, 78, 0.1)',
      border: '2px solid #f2dede'
    }}
  >
    <h2 
      className="text-2xl font-bold mb-6"
      style={{ 
        color: '#c7254e',
        fontSize: 'clamp(1.5rem, 4vw, 2rem)',
        marginBottom: '2rem'
      }}
    >
      🎉 Hosted Events
    </h2>
    {events.length === 0 ? (
      <p style={{ 
        color: '#999', 
        textAlign: 'center', 
        fontSize: 'clamp(1rem, 2.5vw, 1.1rem)',
        padding: '3rem 1rem'
      }}>
        No events hosted yet.
      </p>
    ) : (
      <div className="space-y-4">
        {events.map((event) => {
          const status = getEventStatus(
            event.StartDateOfEvent,
            event.EndDateOfEvent
          );
          const color = getStatusColor(status);
          return (
            <div
              key={event._id}
              style={{
                borderLeft: `6px solid ${status === 'Upcoming' ? '#c7254e' : status === 'Active' ? '#28a745' : '#6c757d'}`,
                padding: 'clamp(1rem, 3vw, 1.5rem)',
                borderRadius: '12px',
                backgroundColor: status === 'Upcoming' ? '#f9f2f4' : status === 'Active' ? '#f8fff9' : '#f8f9fa',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                border: '1px solid #f2dede',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 16px rgba(199, 37, 78, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
              }}
            >
              {editEventId === event._id ? (
                <form onSubmit={handleUpdateEvent} className="space-y-3">
                  <input
                    className="w-full border p-3 rounded"
                    placeholder="Event Name"
                    value={editForm.name || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    style={{
                      color: '#000',
                      border: '2px solid #e4b9b9',
                      borderRadius: '8px',
                      fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                      backgroundColor: '#fff',
                      WebkitTextFillColor: '#000',
                    }}
                  />
                  <textarea
                    className="w-full border p-3 rounded"
                    placeholder="Event Description"
                    value={editForm.desc || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, desc: e.target.value })
                    }
                    rows="2"
                    style={{
                      color: '#000',
                      border: '2px solid #e4b9b9',
                      borderRadius: '8px',
                      fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                      backgroundColor: '#fff',
                      WebkitTextFillColor: '#000',
                    }}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="date"
                      className="w-full border p-3 rounded"
                      value={editForm.start || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, start: e.target.value })
                      }
                      style={{
                        color: '#000',
                        border: '2px solid #e4b9b9',
                        borderRadius: '8px',
                        fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                        backgroundColor: '#fff',
                        WebkitTextFillColor: '#000',
                      }}
                    />
                    <input
                      type="date"
                      className="w-full border p-3 rounded"
                      value={editForm.end || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, end: e.target.value })
                      }
                      style={{
                        color: '#000',
                        border: '2px solid #e4b9b9',
                        borderRadius: '8px',
                        fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                        backgroundColor: '#fff',
                        WebkitTextFillColor: '#000',
                      }}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="submit"
                      style={{
                        backgroundColor: '#28a745',
                        color: '#ffffff',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                        fontWeight: '600'
                      }}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditEventId(null)}
                      style={{
                        backgroundColor: '#6c757d',
                        color: '#ffffff',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                        fontWeight: '600'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <h3 
                    className="text-lg font-semibold"
                    style={{ 
                      color: '#c7254e',
                      fontSize: 'clamp(1.1rem, 3vw, 1.25rem)',
                      marginBottom: '0.5rem'
                    }}
                  >
                    {event.NameOfEvent} 
                    <span style={{ 
                      color: status === 'Upcoming' ? '#c7254e' : status === 'Active' ? '#28a745' : '#6c757d',
                      fontSize: '0.9em',
                      fontWeight: '500'
                    }}>
                      ({status})
                    </span>
                  </h3>
                  <p 
                    className="text-sm"
                    style={{ 
                      color: '#666',
                      fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                      marginBottom: '0.5rem',
                      lineHeight: '1.5'
                    }}
                  >
                    {event.EventDescription}
                  </p>
                  <p 
                    className="text-xs mt-1"
                    style={{ 
                      color: '#999',
                      fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                      marginBottom: '1rem'
                    }}
                  >
                    {new Date(event.StartDateOfEvent).toLocaleDateString()} – {new Date(event.EndDateOfEvent).toLocaleDateString()}
                  </p>
                  <button
                    onClick={() => {
                      setEditEventId(event._id);
                      setEditForm({
                        name: event.NameOfEvent,
                        desc: event.EventDescription,
                        start: event.StartDateOfEvent.slice(0, 10),
                        end: event.EndDateOfEvent.slice(0, 10),
                      });
                    }}
                    style={{
                      color: '#c7254e',
                      textDecoration: 'underline',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                      fontWeight: '500',
                      padding: '0.25rem 0'
                    }}
                  >
                    ✏️ Edit
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
    )}
  </div>
</div>
  );
}

export default InstitutionDashboard;
