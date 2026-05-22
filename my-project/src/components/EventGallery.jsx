import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function EventGallery() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useContext(AuthContext);
  const [event, setEvent] = useState(null);
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalImages, setTotalImages] = useState(0);
  const [deletingId, setDeletingId] = useState(null);
  const [myEvents, setMyEvents] = useState([]);
  const [showEventsList, setShowEventsList] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = React.useRef(null);
  const imagesPerPage = 18;

  useEffect(() => {
    fetchEventDetails();
    fetchEventImages(1);
    fetchMyEvents();
  }, [eventId, token]);

  const fetchMyEvents = async () => {
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

  const fetchEventDetails = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch event");
      const data = await res.json();
      setEvent(data.event);
    } catch (err) {
      console.error(err);
      navigate("/");
    }
  };

  const fetchEventImages = async (page = 1) => {
    try {
      setLoading(true);
      const skip = (page - 1) * imagesPerPage;

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/events/${eventId}/images?limit=${imagesPerPage}&skip=${skip}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) throw new Error("Failed to fetch images");
      const data = await res.json();

      setImages(data.images);
      setTotalImages(data.total);
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = async (imageId) => {
    if (!confirm("Delete this image?")) return;

    try {
      setDeletingId(imageId);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/images/${imageId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete image");

      setImages((prev) => prev.filter((img) => img._id !== imageId));
      setTotalImages((prev) => prev - 1);
      setSelectedImage(null);
    } catch (err) {
      alert("Failed to delete image. Only admins can delete images.");
    } finally {
      setDeletingId(null);
    }
  };

  const deleteEvent = async () => {
    if (!confirm("Are you sure you want to delete this event? All images will be deleted too.")) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/events/${eventId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete event");

      alert("Event deleted successfully!");
      navigate("/");
    } catch (err) {
      alert("Failed to delete event: " + err.message);
    }
  };

  const leaveEvent = async () => {
    if (!confirm("Are you sure you want to leave this event?")) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/events/${eventId}/leave`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to leave event");
      }

      alert("You left the event successfully!");
      navigate("/");
    } catch (err) {
      alert("Failed to leave event: " + err.message);
    }
  };

  const uploadImage = async (file) => {
    if (!file) return;

    try {
      setUploadLoading(true);
      setUploadError("");

      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = async () => {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              image: reader.result,
              eventId: eventId,
            }),
          });

          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Upload failed");
          }

          alert("Image uploaded successfully!");
          setShowUploadModal(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          fetchEventImages(1);
        } catch (err) {
          setUploadError(err.message);
        } finally {
          setUploadLoading(false);
        }
      };
    } catch (err) {
      setUploadError(err.message);
      setUploadLoading(false);
    }
  };

  const isAdmin = event && user && (event.admin._id === user.id || event.admin === user.id);
  const totalPages = Math.ceil(totalImages / imagesPerPage);

  if (!event) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent animate-spin mx-auto mb-4"></div>
          <p>Loading event...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* SIDEBAR - EVENTS LIST */}
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
              const isCurrentEvent = evt._id === eventId;
              const isAdminOfEvent =
                evt.admin._id === user?.id || evt.admin === user?.id;

              return (
                <button
                  key={evt._id}
                  onClick={() => {
                    navigate(`/event/${evt._id}`);
                    setShowEventsList(false);
                  }}
                  className={`w-full text-left p-3 transition ${
                    isCurrentEvent
                      ? "bg-blue-500/30 border border-blue-500 text-white"
                      : "bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{evt.name}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {evt.members.length} member{evt.members.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    {isAdminOfEvent && (
                      <span className="text-sm text-orange-400">Admin</span>
                    )}
                  </div>
                  {isCurrentEvent && (
                    <p className="text-xs text-blue-300 mt-2">
                      Current Event
                    </p>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* CREATE & JOIN BUTTONS */}
        <div className="p-4 space-y-2 border-t border-white/10">
          <button
            onClick={() => navigate("/create-event")}
            className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 transition font-medium text-sm"
          >
            + Create Event
          </button>
          <button
            onClick={() => navigate("/join-event")}
            className="w-full px-4 py-2 border border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/20 transition font-medium text-sm"
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

      {/* MAIN CONTENT */}
      <div className="flex-1 w-full">
        {/* HEADER */}
        <div className="sticky top-0 z-40 backdrop-blur-xl bg-black/70 border-b border-white/10">
          <div className="px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* MENU BUTTON - Mobile */}
                <button
                  onClick={() => setShowEventsList(!showEventsList)}
                  className="sm:hidden text-gray-400 hover:text-white text-xl"
                >
                  ☰
                </button>

                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold">{event?.name}</h1>
                  <p className="text-orange-400 text-sm mt-1">
                    {isAdmin && "Admin "}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                     {event?.members.length} members
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                {isAdmin && (
                  <div className="hidden sm:block text-center px-4 py-2 bg-blue-500/10 border border-blue-500/50">
                    <p className="text-xs text-gray-400 mb-1">Event Code</p>
                    <p className="text-lg font-bold text-blue-400">
                      {event?.code}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-4 py-2 bg-green-500/20 border border-green-500/50 hover:bg-green-500/30 transition text-sm text-green-400 font-medium"
                >
                  📸 Upload
                </button>

                {isAdmin && (
                  <button
                    onClick={deleteEvent}
                    className="px-4 py-2 bg-red-500/20 border border-red-500/50 hover:bg-red-500/30 transition text-sm text-red-400 font-medium"
                  >
                    Delete Event
                  </button>
                )}

                <button
                  onClick={isAdmin ? () => navigate("/") : leaveEvent}
                  className="px-4 py-2 border border-white/10 hover:bg-white/10 transition text-sm"
                >
                  {isAdmin ? "Close" : "Leave"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="px-4 sm:px-6 py-10">
          {loading ? (
            <div className="flex items-center justify-center h-52 border border-white/10 bg-white/5">
              <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent animate-spin"></div>
                <p className="text-gray-400">Loading images...</p>
              </div>
            </div>
          ) : images.length === 0 ? (
            <div className="flex items-center justify-center h-52 border border-dashed border-white/10 bg-white/5">
              <div className="text-center">
                <p className="text-gray-400 mb-4">No images yet 📸</p>
                <button
                  onClick={() => navigate(`/camera?eventId=${eventId}`)}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 transition"
                >
                  Add First Photo
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* GALLERY */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((img) => (
                  <div
                    key={img._id}
                    className="group relative overflow-hidden cursor-pointer"
                    onClick={() => setSelectedImage(img)}
                  >
                    <img
                      src={img.imageUrl}
                      className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition duration-300"></div>

                    {/* UPLOADER INFO */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <p className="text-xs text-gray-300">{img.userId.name}</p>
                    </div>

                    {/* DELETE BUTTON (ADMIN ONLY) */}
                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteImage(img._id);
                        }}
                        disabled={deletingId === img._id}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition disabled:opacity-50"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-12">
                  <button
                    onClick={() => fetchEventImages(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-6 py-3 border border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/20 disabled:opacity-30 text-blue-400 font-semibold transition"
                  >
                    ← Previous
                  </button>

                  <span className="text-gray-400">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() => fetchEventImages(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-6 py-3 border border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/20 disabled:opacity-30 text-blue-400 font-semibold transition"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* MODAL */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative w-full flex flex-col items-center">
            <img
              src={selectedImage.imageUrl}
              className="max-w-full max-h-[80vh]"
            />

            {/* UPLOADER INFO */}
            <div className="mt-4 text-center">
              <p className="text-gray-400">Uploaded by</p>
              <p className="text-lg font-semibold">{selectedImage.userId.name}</p>
            </div>

            {/* DELETE BUTTON */}
            {isAdmin && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteImage(selectedImage._id);
                }}
                className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 transition"
              >
                Delete Image
              </button>
            )}

            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-3 right-3 w-11 h-11 bg-black/50 border border-white/20 text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* UPLOAD MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-black border border-white/10 p-6">
            <button
              onClick={() => {
                setShowUploadModal(false);
                setUploadError("");
              }}
              className="absolute top-3 right-3 w-8 h-8 bg-black/50 border border-white/20 text-white"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold mb-4">Upload Photo</h2>

            {uploadError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
                {uploadError}
              </div>
            )}

            <div className="space-y-4">
              {/* CAMERA CAPTURE */}
              <button
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.setAttribute("capture", "environment");
                    fileInputRef.current.click();
                  }
                }}
                disabled={uploadLoading}
                className="w-full py-3 bg-blue-900 hover:bg-cyan-600 disabled:opacity-50 text-white font-medium transition"
              >
                Take Photo
              </button>

              {/* GALLERY PICKER */}
              <button
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.removeAttribute("capture");
                    fileInputRef.current.click();
                  }
                }}
                disabled={uploadLoading}
                className="w-full py-3 bg-blue-900 hover:bg-cyan-600 disabled:opacity-50 text-white font-medium transition"
              >
                Choose from Gallery
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    uploadImage(e.target.files[0]);
                  }
                }}
              />

              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadError("");
                }}
                className="w-full py-3 border border-white/10 hover:bg-white/10 text-white font-medium transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
