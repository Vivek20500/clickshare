import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import { useNavigate } from "react-router-dom";


function Camera() {
  const webcamRef = useRef(null);
  const navigate = useNavigate();

  const [image, setImage] = useState(null);
  const [facingMode, setFacingMode] = useState("environment");

  const [loading, setLoading] = useState(false);

  const capture = () => {
    if (!webcamRef.current) return;
    const img = webcamRef.current.getScreenshot();
    if (img) setImage(img);
  };

  const flipCamera = () => {
    setFacingMode((prev) =>
      prev === "user" ? "environment" : "user"
    );
  };

  useEffect(() => {
    return () => {
      if (webcamRef.current?.video?.srcObject) {
        webcamRef.current.video.srcObject
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, []);

  const uploadImage = async () => {
  try {
    setLoading(true);

    const res = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image,
        eventId: "event123",
        userId: "user123",
      }),
    });

    const data = await res.json();

    // console.log(data);
    navigate("/");

  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden">

      {/* CAMERA */}
      {!image ? (
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={{ facingMode }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <img
          src={image}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* OVERLAY (makes it feel premium) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />

      {/* TOP BAR */}
      <div className="absolute top-0 w-full flex justify-between items-center px-4 py-4 text-white">
        <button onClick={() => navigate("/")}>✕</button>
        <span className="text-sm opacity-80">EVENT CAMERA</span>
        <button>⚙️</button>
      </div>

      {/* CENTER TEXT */}
      {!image && (
        <div className="absolute inset-0 flex items-center justify-center text-white/60 text-sm">
          Tap to capture
        </div>
      )}

      {/* BOTTOM CONTROLS */}
      <div className="absolute bottom-10 w-full flex items-center justify-between px-6">

        {/* Flip */}
        <button
          onClick={flipCamera}
          className="text-white text-xl"
        >
          🔄
        </button>

        {/* SHUTTER */}
        {!image ? (
          <button
            onClick={capture}
            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center"
          >
            <div className="w-14 h-14 bg-white rounded-full active:scale-90 transition" />
          </button>
        ) : (
          <div className="flex gap-4">
            <button
              onClick={() => setImage(null)}
              className="bg-red-500 px-4 py-2 rounded text-white"
            >
              Retake
            </button>
            <button
              onClick={uploadImage}
              disabled={loading}
              className={`px-4 py-2 rounded text-white ${
                loading ? "bg-gray-500" : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Uploading...
                </div>
              ) : (
                "Upload"
              )}
            </button>
          </div>
        )}

        {/* Gallery placeholder */}
        <div className="w-8 h-8 bg-white/30 rounded" />
      </div>
    </div>
  );
}

export default Camera;