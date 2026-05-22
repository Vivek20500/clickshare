import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Home() {
  const navigate = useNavigate();
  const { user, token, logout } = useContext(AuthContext);
  const [selectedImage, setSelectedImage] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalImages, setTotalImages] = useState(0);
  const [myEvents, setMyEvents] = useState([]);
  const [showEventsList, setShowEventsList] = useState(false);
  const imagesPerPage = 18;

  const fetchMyEvents = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/my-events`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMyEvents(data.events);
      }
    } catch (err) {
      console.error("Failed to fetch events:", err);
    }
  };

  const fetchImages = async (page = 1) => {
    try {
      setLoading(true);

      // If not authenticated, don't fetch
      if (!token) {
        setImages([]);
        setLoading(false);
        return;
      }

      const skip = (page - 1) * imagesPerPage;

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/images?limit=${imagesPerPage}&skip=${skip}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();

      setImages(data.images);
      setTotalImages(data.total);
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Error fetching images:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages(1);
    fetchMyEvents();
  }, [token]);

  const totalPages = Math.ceil(totalImages / imagesPerPage);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden flex">
      {/* SIDEBAR - EVENTS LIST */}
      {user && (
        <>
          <div
            className={`fixed sm:static inset-y-0 left-0 z-50 w-72 bg-black/95 border-r border-white/10 transform transition-transform duration-300 ${
              showEventsList ? "translate-x-0" : "-translate-x-full sm:translate-x-0"
            } overflow-y-auto`}
          >
            <div className="sticky top-0 z-10 backdrop-blur-xl bg-black/70 border-b border-white/10 p-4 flex items-center justify-between">
              <h2 className="font-bold text-lg">My Events</h2>
              <button
                onClick={() => setShowEventsList(false)}
                className="sm:hidden text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-2">
              {myEvents.length === 0 ? (
                <p className="text-gray-400 text-sm">No events yet</p>
              ) : (
                myEvents.map((evt) => {
                  const isAdminOfEvent =
                    evt.admin._id === user?.id || evt.admin === user?.id;

                  return (
                    <button
                      key={evt._id}
                      onClick={() => {
                        navigate(`/event/${evt._id}`);
                        setShowEventsList(false);
                      }}
                      className="w-full text-left p-3 rounded-lg transition bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{evt.name}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {evt.members.length} member{evt.members.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                        {isAdminOfEvent && (
                          <span className="text-lg">👑</span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* CREATE & JOIN BUTTONS */}
            <div className="p-4 space-y-2 border-t border-white/10">
              <button
                onClick={() => {
                  navigate("/create-event");
                  setShowEventsList(false);
                }}
                className="w-full px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 transition font-medium text-sm"
              >
                + Create Event
              </button>
              <button
                onClick={() => {
                  navigate("/join-event");
                  setShowEventsList(false);
                }}
                className="w-full px-4 py-2 rounded-lg border border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/20 transition font-medium text-sm"
              >
                Join Event
              </button>
            </div>
          </div>

          {/* OVERLAY - Mobile */}
          {showEventsList && (
            <div
              className="fixed inset-0 z-40 bg-black/50 sm:hidden"
              onClick={() => setShowEventsList(false)}
            ></div>
          )}
        </>
      )}

      {/* MAIN CONTENT */}
      <div className="flex-1 w-full">
        {/* NAVBAR */}
        <div className="sticky top-0 z-40 backdrop-blur-xl bg-black/70 border-b border-white/10">
          <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* HAMBURGER - Mobile & Authenticated */}
              {user && (
                <button
                  onClick={() => setShowEventsList(!showEventsList)}
                  className="sm:hidden text-gray-400 hover:text-white text-xl"
                >
                  ☰
                </button>
              )}

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Click<span className="text-blue-400">Share</span>
                </h1>

                <p className="text-xs sm:text-sm text-gray-400">
                  {user ? `Welcome, ${user.name || "User"}` : "Capture & share memories"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <button
                    onClick={() => logout()}
                    className="hidden sm:flex px-4 py-2 rounded-xl border border-white/10 hover:bg-white/10 transition font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate("/login")}
                    className="hidden sm:flex px-4 py-2 rounded-xl border border-white/10 hover:bg-white/10 transition font-medium"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => navigate("/register")}
                    className="hidden sm:flex px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 transition font-medium"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* HERO SECTION */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-gray-900 to-black p-6 sm:p-10">
          {/* GLOW */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-purple-500/10 blur-3xl"></div>

          <div className="relative z-10 flex flex-col gap-8">
            {/* TEXT */}
            <div className="text-center sm:text-left">
              <h2 className="text-3xl sm:text-5xl font-bold leading-tight">
                Capture.
                <br />
                Share.
                <br />
                Relive.
              </h2>

              <p className="text-gray-300 mt-4 text-sm sm:text-lg max-w-xl mx-auto sm:mx-0">
                Instantly click photos and create a beautiful live gallery experience for your events and memories.
              </p>

              {/* BUTTONS */}
              <div className="mt-7 flex flex-col sm:flex-row gap-4 justify-center sm:justify-start">
                {user ? (
                  <>
                    <button
                      onClick={() => navigate("/create-event")}
                      className="group relative flex items-center justify-center px-6 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white font-semibold text-base transition-all duration-300 shadow-[0_0_25px_rgba(59,130,246,0.7)] active:scale-95 overflow-hidden"
                    >
                      <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition duration-1000"></span>

                      <span className="relative z-10 flex items-center gap-2">
                        ✨ Create Event
                      </span>
                    </button>

                    <button
                      onClick={() => navigate("/join-event")}
                      className="px-6 py-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 active:scale-95 transition"
                    >
                      Join Event
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => navigate("/register")}
                      className="group relative flex items-center justify-center px-6 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white font-semibold text-base transition-all duration-300 shadow-[0_0_25px_rgba(59,130,246,0.7)] active:scale-95 overflow-hidden"
                    >
                      <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition duration-1000"></span>

                      <span className="relative z-10 flex items-center gap-2">
                        📸 Get Started
                      </span>
                    </button>

                    <button
                      onClick={() => navigate("/login")}
                      className="px-6 py-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 active:scale-95 transition"
                    >
                      Login
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* GALLERY */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold">Recent Images</h2>

          <p className="text-gray-400 mt-1 text-sm">
            {totalImages > 0 ? `Page ${currentPage} of ${totalPages} • ${totalImages} photos total` : "No photos yet"}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-52 rounded-3xl border border-dashed border-white/10 bg-white/5">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-400">Loading images...</p>
            </div>
          </div>
        ) : !user ? (
          <div className="flex items-center justify-center h-52 rounded-3xl border border-dashed border-white/10 bg-white/5">
            <div className="text-center">
              <p className="text-gray-400 mb-4">Login or sign up to see your event gallery 📸</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => navigate("/login")}
                  className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 transition font-medium"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="px-4 py-2 rounded-lg border border-blue-500 hover:bg-blue-500/10 transition font-medium"
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        ) : images.length === 0 ? (
          <div className="flex items-center justify-center h-52 rounded-3xl border border-dashed border-white/10 bg-white/5">
            <div className="text-center">
              <p className="text-gray-400 mb-4">No images in your events yet 📂</p>
              <button
                onClick={() => navigate("/create-event")}
                className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 transition font-medium"
              >
                Create an Event
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* MOBILE GRID */}
            <div className="grid grid-cols-2 gap-3 sm:hidden">
              {images.map((img) => (
                <div
                  key={img._id}
                  onClick={() => setSelectedImage(img.imageUrl)}
                  className="relative overflow-hidden rounded-2xl active:scale-95 transition"
                >
                  <img src={img.imageUrl} className="w-full h-44 object-cover" />
                </div>
              ))}
            </div>

            {/* DESKTOP GRID */}
            <div className="hidden sm:grid grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((img) => (
                <div
                  key={img._id}
                  className="group relative overflow-hidden rounded-2xl cursor-pointer"
                  onClick={() => setSelectedImage(img.imageUrl)}
                >
                  <img
                    src={img.imageUrl}
                    className="w-full h-48 object-cover rounded-2xl transition duration-500 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition duration-300"></div>
                </div>
              ))}
            </div>

            {/* PAGINATION BUTTONS */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12">
                <button
                  onClick={() => fetchImages(currentPage - 1)}
                  disabled={!hasPrevPage}
                  className="px-6 py-3 rounded-2xl border border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/20 disabled:opacity-30 disabled:cursor-not-allowed text-blue-400 font-semibold transition flex items-center gap-2"
                >
                  ← Previous
                </button>

                <span className="text-gray-400 font-medium px-4">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => fetchImages(currentPage + 1)}
                  disabled={!hasNextPage}
                  className="px-6 py-3 rounded-2xl border border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/20 disabled:opacity-30 disabled:cursor-not-allowed text-blue-400 font-semibold transition flex items-center gap-2"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
        </div>
      </div>

      {/* FLOATING CAMERA BUTTON FOR MOBILE */}
      {user && (
        <a
          href="/camera"
          className="sm:hidden fixed bottom-6 right-5 z-50 w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center text-2xl shadow-[0_0_30px_rgba(59,130,246,0.8)] active:scale-90 transition"
        >
          📸
        </a>
      )}

      {/* MODAL */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative w-full flex justify-center">
            <img src={selectedImage} className="max-w-full max-h-[85vh] rounded-2xl" />

            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-3 right-3 w-11 h-11 rounded-full bg-black/50 border border-white/20 text-white text-lg"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      </div>
  );
}

export default Home;