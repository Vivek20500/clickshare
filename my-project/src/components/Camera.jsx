// import React, { useRef, useState, useEffect } from "react";
// import Webcam from "react-webcam";
// import { useNavigate } from "react-router-dom";


// function Camera() {
//   const webcamRef = useRef(null);
//   const navigate = useNavigate();

//   const [image, setImage] = useState(null);
//   const [facingMode, setFacingMode] = useState("environment");

//   const [loading, setLoading] = useState(false);

//   const capture = () => {
//     if (!webcamRef.current) return;
//     const img = webcamRef.current.getScreenshot();
//     if (img) setImage(img);
//   };

//   const flipCamera = () => {
//     setFacingMode((prev) =>
//       prev === "user" ? "environment" : "user"
//     );
//   };

//   useEffect(() => {
//     return () => {
//       if (webcamRef.current?.video?.srcObject) {
//         webcamRef.current.video.srcObject
//           .getTracks()
//           .forEach((track) => track.stop());
//       }
//     };
//   }, []);

//   const uploadImage = async () => {
//   try {
//     setLoading(true);

//     const res = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         image,
//         eventId: "event123",
//         userId: "user123",
//       }),
//     });

//     const data = await res.json();

//     // console.log(data);
//     navigate("/");

//   } catch (err) {
//     console.error(err);
//   } finally {
//     setLoading(false);
//   }
// };

//   return (
//     <div className="relative h-screen w-full bg-black overflow-hidden">

//       {/* CAMERA */}
//       {!image ? (
//         <Webcam
//           ref={webcamRef}
//           audio={false}
//           screenshotFormat="image/jpeg"
//           videoConstraints={{ facingMode }}
//           className="absolute inset-0 w-full h-full object-cover"
//         />
//       ) : (
//         <img
//           src={image}
//           className="absolute inset-0 w-full h-full object-cover"
//         />
//       )}

//       {/* OVERLAY (makes it feel premium) */}
//       <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />

//       {/* TOP BAR */}
//       <div className="absolute top-0 w-full flex justify-between items-center px-4 py-4 text-white">
//         <button onClick={() => navigate("/")}>✕</button>
//         <span className="text-sm opacity-80">EVENT CAMERA</span>
//         <button>⚙️</button>
//       </div>

//       {/* CENTER TEXT */}
//       {!image && (
//         <div className="absolute inset-0 flex items-center justify-center text-white/60 text-sm">
//           Tap to capture
//         </div>
//       )}

//       {/* BOTTOM CONTROLS */}
//       <div className="absolute bottom-10 w-full flex items-center justify-between px-6">

//         {/* Flip */}
//         <button
//           onClick={flipCamera}
//           className="text-white text-xl"
//         >
//           🔄
//         </button>

//         {/* SHUTTER */}
//         {!image ? (
//           <button
//             onClick={capture}
//             className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center"
//           >
//             <div className="w-14 h-14 bg-white rounded-full active:scale-90 transition" />
//           </button>
//         ) : (
//           <div className="flex gap-4">
//             <button
//               onClick={() => setImage(null)}
//               className="bg-red-500 px-4 py-2 rounded text-white"
//             >
//               Retake
//             </button>
//             <button
//               onClick={uploadImage}
//               disabled={loading}
//               className={`px-4 py-2 rounded text-white ${
//                 loading ? "bg-gray-500" : "bg-green-500 hover:bg-green-600"
//               }`}
//             >
//               {loading ? (
//                 <div className="flex items-center gap-2">
//                   <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                   Uploading...
//                 </div>
//               ) : (
//                 "Upload"
//               )}
//             </button>
//           </div>
//         )}

//         {/* Gallery placeholder */}
//         <div className="w-8 h-8 bg-white/30 rounded" />
//       </div>
//     </div>
//   );
// }

// export default Camera;

import React, { useRef, useState, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Camera() {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { token } = useContext(AuthContext);

  const eventId = searchParams.get("eventId");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Check if user is authenticated
  if (!token) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Login Required</h2>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // OPEN NATIVE CAMERA
  const openCamera = () => {
    fileInputRef.current.click();
  };

  // WHEN IMAGE SELECTED
  const handleImage = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setImage(reader.result);
    };

    reader.readAsDataURL(file);
  };

  // UPLOAD
  const uploadImage = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          image,
          eventId: eventId || "event123",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      if (eventId) {
        navigate(`/event/${eventId}`);
      } else {
        navigate("/");
      }
    } catch (err) {
      alert(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* TOP BAR */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-black/80 backdrop-blur-md">
        <button onClick={() => navigate(eventId ? `/event/${eventId}` : "/")} className="text-2xl">
          ✕
        </button>

        <h1 className="text-lg font-semibold tracking-wide">EVENT CAMERA</h1>

        <div className="w-6" />
      </div>

      {/* CONTENT */}
      <div className="flex-1 flex flex-col items-center justify-center px-5">
        {!image ? (
          <>
            {/* CAMERA PREVIEW CARD */}
            <div className="w-full max-w-sm aspect-[3/4] rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 border border-white/10 flex flex-col items-center justify-center shadow-2xl">
              <div className="text-7xl mb-6">📸</div>

              <h2 className="text-2xl font-bold mb-2">Capture Moment</h2>

              <p className="text-gray-400 text-center px-8">Open your phone camera and instantly upload memories.</p>

              <button
                onClick={openCamera}
                className="mt-8 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 transition font-semibold shadow-[0_0_25px_rgba(59,130,246,0.7)] active:scale-95"
              >
                Open Camera
              </button>
            </div>

            {/* HIDDEN INPUT */}
            <input ref={fileInputRef} type="file" accept="image/*" capture onChange={handleImage} className="hidden" />
          </>
        ) : (
          <>
            {/* IMAGE PREVIEW */}
            <div className="w-full max-w-md">
              <img src={image} alt="Captured" className="w-full rounded-2xl" />

              {/* BUTTONS */}
              <div className="flex gap-4 mt-5">
                
                <button
                  onClick={() => setImage(null)}
                  className="
                  flex-1
                  py-4
                  rounded-2xl
                  bg-red-500
                  hover:bg-red-600
                  transition
                  font-medium
                  "
                >
                  Retake
                </button>

                <button
                  onClick={uploadImage}
                  disabled={loading}
                  className={`
                  flex-1
                  py-4
                  rounded-2xl
                  font-medium
                  transition
                  ${
                    loading
                      ? "bg-gray-600"
                      : "bg-green-500 hover:bg-green-600"
                  }
                  `}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Uploading...
                    </div>
                  ) : (
                    "Upload"
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Camera;