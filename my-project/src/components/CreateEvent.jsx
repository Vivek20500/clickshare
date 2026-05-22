import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function CreateEvent() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [eventCode, setEventCode] = useState("");

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Event name is required");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/events/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create event");
      }

      setEventCode(data.code);
      setTimeout(() => {
        navigate(`/event/${data.event._id}`);
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (eventCode) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className=" border border-white/10 bg-gradient-to-br from-gray-900 to-black p-8">
            <div className="text-6xl mb-4">✨</div>
            <h2 className="text-2xl font-bold mb-2">Event Created!</h2>
            <p className="text-gray-400 mb-6">Share this code with others to let them join</p>

            <div className="bg-blue-500/20 border border-blue-500/50 p-4 mb-6">
              <p className="text-sm text-gray-400 mb-2">Event Code</p>
              <p className="text-4xl font-bold text-blue-400">{eventCode}</p>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(eventCode);
                alert("Code copied to clipboard!");
              }}
              className="w-full py-3  bg-blue-500 hover:bg-blue-600 text-white font-semibold transition mb-2"
            >
              Copy Code
            </button>

            <p className="text-gray-500 text-sm">Redirecting to event...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className=" border border-white/10 bg-gradient-to-br from-gray-900 to-black p-8">
          <h1 className="text-3xl font-bold mb-2">Create Event</h1>
          <p className="text-gray-400 mb-8">Create a new event for your photos</p>

          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50  text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Event Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-gray-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3  hover:bg-blue-500 bg-blue-700 text-white font-semibold transition disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Event"}
            </button>
          </form>

          <button
            onClick={() => navigate("/")}
            className="w-full mt-4 py-3 border border-white/10 text-gray-400 hover:text-white transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
